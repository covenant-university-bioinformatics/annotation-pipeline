import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { CreateJobDto } from '../dto/create-job.dto';
import {
  AnnotationJobsDoc,
  AnnotationJobsModel,
  JobStatus,
} from '../models/annotation.jobs.model';
import { AnnotationModel } from '../models/annotation.model';
import { AnnotJobQueue } from '../../jobqueue/queue/annot.queue';
import { UserDoc } from '../../auth/models/user.model';
import { GetJobsDto } from '../dto/getjobs.dto';
import {
  deleteFileorFolder,
  fileOrPathExists,
  findAllJobs,
  removeManyUserJobs,
  removeUserJob,
  writeAnnotationFile,
} from '@cubrepgwas/pgwascommon';

@Injectable()
export class JobsAnnotService {
  constructor(
    @Inject(AnnotJobQueue)
    private jobQueue: AnnotJobQueue,
  ) {}

  async create(
    createJobDto: CreateJobDto,
    file: Express.Multer.File,
    user?: UserDoc,
  ) {
    if (!file) {
      throw new BadRequestException('Please upload a file');
    }

    if (file.mimetype !== 'text/plain') {
      throw new BadRequestException('Please upload a text file');
    }

    if (!user && !createJobDto.email) {
      throw new BadRequestException(
        'Job cannot be null, check job parameters, and try again',
      );
    }

    if (user && createJobDto.email) {
      throw new BadRequestException('User signed in, no need for email');
    }

    const numberColumns = [
      'marker_name',
      'chromosome',
      'position',
      'effect_allele',
      'alternate_allele',
    ];

    const columns = numberColumns.map((column) => {
      return parseInt(createJobDto[column], 10);
    });

    const wrongColumn = columns.some((value) => value < 1 || value > 15);

    if (wrongColumn) {
      throw new BadRequestException('Column numbers must be between 1 and 15');
    }

    const duplicates = new Set(columns).size !== columns.length;

    if (duplicates) {
      throw new BadRequestException('Column numbers must not have duplicates');
    }

    //create jobUID
    const jobUID = uuidv4();

    //create folder with job uid and create input folder in job uid folder
    const value = await fileOrPathExists(`/pv/analysis/${jobUID}`);

    if (!value) {
      fs.mkdirSync(`/pv/analysis/${jobUID}/input`, { recursive: true });
    } else {
      throw new InternalServerErrorException();
    }

    const filename = `/pv/analysis/${jobUID}/input/${file.filename}`;

    const session = await AnnotationJobsModel.startSession();
    const sessionTest = await AnnotationModel.startSession();
    session.startTransaction();
    sessionTest.startTransaction();

    try {
      // console.log('DTO: ', createJobDto);
      const opts = { session };
      const optsTest = { session: sessionTest };

      //write the exact columns needed by the analysis
      const totalLines = writeAnnotationFile(file.path, filename, {
        marker_name: parseInt(createJobDto.marker_name, 10) - 1,
        chr: parseInt(createJobDto.chromosome, 10) - 1,
        effect_allele: parseInt(createJobDto.effect_allele, 10) - 1,
        alternate_allele: parseInt(createJobDto.alternate_allele, 10) - 1,
        pos: parseInt(createJobDto.position, 10) - 1,
      });

      deleteFileorFolder(file.path).then(() => {
        // console.log('deleted');
      });

      const longJob = createJobDto.disgenet === 'true' && totalLines > 50000;

      //save job parameters, folder path, filename in database
      let newJob;
      if (user) {
        newJob = await AnnotationJobsModel.build({
          job_name: createJobDto.job_name,
          jobUID,
          inputFile: filename,
          status: JobStatus.QUEUED,
          user: user.id,
          longJob,
        });
      }

      if (createJobDto.email) {
        newJob = await AnnotationJobsModel.build({
          job_name: createJobDto.job_name,
          jobUID,
          inputFile: filename,
          status: JobStatus.QUEUED,
          email: createJobDto.email,
          longJob,
        });
      }

      if (!newJob) {
        throw new BadRequestException(
          'Job cannot be null, check job parameters',
        );
      }

      //let the models be created per specific analysis
      const annot = await AnnotationModel.build({
        ...createJobDto,
        job: newJob.id,
      });

      await annot.save(optsTest);
      await newJob.save(opts);

      //add job to queue
      if (user) {
        await this.jobQueue.addJob({
          jobId: newJob.id,
          jobName: newJob.job_name,
          jobUID: newJob.jobUID,
          username: user.username,
          email: user.email,
          noAuth: false,
        });
      }

      if (createJobDto.email) {
        await this.jobQueue.addJob({
          jobId: newJob.id,
          jobName: newJob.job_name,
          jobUID: newJob.jobUID,
          username: 'User',
          email: createJobDto.email,
          noAuth: true,
        });
      }

      await session.commitTransaction();
      await sessionTest.commitTransaction();
      return {
        success: true,
        jobId: newJob.id,
      };
    } catch (e) {
      if (e.code === 11000) {
        throw new ConflictException('Duplicate job name not allowed');
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

  // {
  //   $lookup: {
  //     from: 'annotations',
  //     localField: '_id',
  //     foreignField: 'job',
  //     as: 'annot',
  //   },
  // },

  async findAll(getJobsDto: GetJobsDto, user: UserDoc) {
    return await findAllJobs(getJobsDto, user, AnnotationJobsModel);
  }

  async getJobByID(id: string, user: UserDoc) {
    const job = await AnnotationJobsModel.findById(id)
      .populate('annot')
      .populate('user')
      .exec();

    if (!job) {
      throw new NotFoundException();
    }

    if (job?.user?.username !== user.username) {
      throw new ForbiddenException('Access not allowed');
    }

    return job;
  }

  async getJobByIDNoAuth(id: string) {
    const job = await AnnotationJobsModel.findById(id)
      .populate('annot')
      .populate('user')
      .exec();

    if (!job) {
      throw new NotFoundException();
    }

    if (job?.user?.username) {
      throw new ForbiddenException('Access not allowed');
    }

    return job;
  }

  async removeJob(id: string, user: UserDoc) {
    const job = await this.getJobByID(id, user);

    return await removeUserJob(id, job);
  }

  async removeJobNoAuth(id: string) {
    const job = await this.getJobByIDNoAuth(id);

    return await removeUserJob(id, job);
  }

  async deleteManyJobs(user: UserDoc) {
    return await removeManyUserJobs(user, AnnotationJobsModel);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
