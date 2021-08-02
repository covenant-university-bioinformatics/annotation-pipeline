import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AnnotationJob,
  AnnotationJobDocument,
  AnnotationJobSchema,
  JobStatus,
} from './models/annotation.jobs.models';
import { Annotation, AnnotationDocument } from './models/annotation.model';
import { JobQueue } from '../jobqueue/queue';
import { UserDocument } from '../auth/models/user.model';
import { deleteFileorFolder } from '../utils/utilityfunctions';
import { GetJobsDto } from './dto/getjobs.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(AnnotationJob.name)
    private annotJobModel: Model<AnnotationJobDocument>,
    @InjectModel(Annotation.name) private annotModel: Model<AnnotationDocument>,
    @Inject(JobQueue)
    private jobQueue: JobQueue,
  ) {}

  async create(
    createJobDto: CreateJobDto,
    jobUID: string,
    filename: string,
    user: UserDocument,
  ) {
    const session = await this.annotJobModel.startSession();
    const sessionTest = await this.annotModel.startSession();
    session.startTransaction();
    sessionTest.startTransaction();

    try {
      console.log('DTO: ', createJobDto);
      const opts = { session };
      const optsTest = { session: sessionTest };

      //save job parameters, folder path, filename in database
      const newJob = new this.annotJobModel({
        ...createJobDto,
        jobUID,
        inputFile: filename,
        jobStatus: JobStatus.QUEUED,
        user: user.id,
      });

      //let the models be created per specific analysis
      const annotJob = new this.annotModel({
        ...createJobDto,
        job: newJob.id,
      });

      await annotJob.save(optsTest);
      await newJob.save(opts);

      //add job to queue
      await this.jobQueue.addJob({
        jobId: newJob.id,
        jobName: newJob.job_name,
        jobUID: newJob.jobUID,
      });

      console.log('Job added ');

      await session.commitTransaction();
      await sessionTest.commitTransaction();
      return {
        success: true,
        jobId: newJob.id,
      };
    } catch (e) {
      if (e.code === 11000) {
        throw new ConflictException('Duplicate job not allowed: ' + e.message);
      }
      await session.abortTransaction();
      await sessionTest.abortTransaction();
      deleteFileorFolder(`/pv/analysis/${jobUID}`).then(() => {
        // console.log('deleted');
      });
      throw new BadRequestException(e.message);
    } finally {
      session.endSession();
      sessionTest.endSession();
    }
  }

  async findAll(getJobsDto: GetJobsDto, user: UserDocument) {
    await sleep(1000);
    const sortVariable = getJobsDto.sort ? getJobsDto.sort : 'createdAt';
    const limit = getJobsDto.limit ? parseInt(getJobsDto.limit, 10) : 2;
    const page =
      getJobsDto.page || getJobsDto.page === '0'
        ? parseInt(getJobsDto.page, 10)
        : 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result = await this.annotJobModel.aggregate([
      { $match: { user: user._id } },
      { $sort: { [sortVariable]: -1 } },
      {
        $lookup: {
          from: 'annotations',
          localField: '_id',
          foreignField: 'job',
          as: 'annot',
        },
      },
      {
        $facet: {
          count: [{ $group: { _id: null, count: { $sum: 1 } } }],
          sample: [{ $skip: startIndex }, { $limit: limit }],
        },
      },
      { $unwind: '$count' },
      {
        $project: {
          count: '$count.count',
          data: '$sample',
        },
      },
    ]);

    if (result[0]) {
      const { count, data } = result[0];

      const pagination: any = {};

      if (endIndex < count) {
        pagination.next = { page: page + 1, limit };
      }

      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit,
        };
      }
      //
      return {
        success: true,
        count: data.length,
        total: count,
        pagination,
        data,
      };
    }
    return {
      success: true,
      count: 0,
      total: 0,
      data: [],
    };
  }

  // async findOne(id: string) {
  //   return await this.jobsModel.findById(id).exec();
  // }

  async getJobByID(id: string) {
    return await this.annotJobModel
      .findById(id)
      .populate('user')
      .populate('annot')
      .exec();
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
