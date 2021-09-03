import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateDeletJobDto } from '../dto/create-delet-job.dto';
import {
  DeletJobsDoc,
  DeletJobsModel,
  JobStatus,
} from '../models/delet.jobs.model';
import { DeletJobQueue } from '../../jobqueue/queue/delet.queue';
import { UserDoc } from '../../auth/models/user.model';
import { deleteFileorFolder } from '../../utils/utilityfunctions';
import { GetJobsDto } from '../dto/getjobs.dto';

@Injectable()
export class JobsDeletService {
  constructor(
    @Inject(DeletJobQueue)
    private jobQueue: DeletJobQueue,
  ) {}

  async create(
    createJobDto: CreateDeletJobDto,
    jobUID: string,
    filename: string,
    user: UserDoc,
  ) {
    const session = await DeletJobsModel.startSession();
    session.startTransaction();

    try {
      // console.log('DTO: ', createJobDto);
      const opts = { session };

      //save job parameters, folder path, filename in database
      const newJob = await DeletJobsModel.build({
        job_name: createJobDto.job_name,
        jobUID,
        inputFile: filename,
        status: JobStatus.QUEUED,
        user: user.id,
        gene_db: createJobDto.gene_db,
      });

      await newJob.save(opts);

      //add job to queue
      await this.jobQueue.addJob({
        jobId: newJob.id,
        jobName: newJob.job_name,
        jobUID: newJob.jobUID,
        username: user.username,
        email: user.email,
      });

      await session.commitTransaction();
      return {
        success: true,
        jobId: newJob.id,
      };
    } catch (e) {
      if (e.code === 11000) {
        throw new ConflictException('Duplicate job name not allowed');
      }
      await session.abortTransaction();
      deleteFileorFolder(`/pv/analysis/${jobUID}`).then(() => {
        // console.log('deleted');
      });
      throw new BadRequestException(e.message);
    } finally {
      session.endSession();
    }
  }

  async findAll(getJobsDto: GetJobsDto, user: UserDoc) {
    const sortVariable = getJobsDto.sort ? getJobsDto.sort : 'createdAt';
    const limit = getJobsDto.limit ? parseInt(getJobsDto.limit, 10) : 2;
    const page =
      getJobsDto.page || getJobsDto.page === '0'
        ? parseInt(getJobsDto.page, 10)
        : 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result = await DeletJobsModel.aggregate([
      { $match: { user: user._id } },
      { $sort: { [sortVariable]: -1 } },
      {
        $project: {
          _id: 1,
          status: 1,
          job_name: 1,
          createdAt: 1,
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

  async getJobByID(id: string) {
    return await DeletJobsModel.findById(id).populate('user').exec();
  }

  async deleteManyJobs(user: UserDoc): Promise<DeletJobsDoc[]> {
    return await DeletJobsModel.find({ user: user._id }).exec();
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
