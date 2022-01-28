import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateDeletJobDto } from '../dto/create-delet-job.dto';
import { DeletJobsModel, JobStatus } from '../models/delet.jobs.model';
import { DeletJobQueue } from '../../jobqueue/queue/delet.queue';
import { UserDoc } from '../../auth/models/user.model';
import { GetJobsDto } from '../dto/getjobs.dto';
import * as fs from 'fs';
import {
  deleteFileorFolder,
  fileOrPathExists,
  fileSizeMb,
  findAllJobs,
  removeManyUserJobs,
  removeUserJob,
  writeAnnotationFile,
} from '@cubrepgwas/pgwascommon';

//production
const testPath = '/local/datasets/pgwas_test_files/annot/ex1.txt';
//development
// const testPath = '/local/datasets/data/annot/ex1.txt';

@Injectable()
export class JobsDeletService {
  constructor(
    @Inject(DeletJobQueue)
    private jobQueue: DeletJobQueue,
  ) {}

  async create(
    createJobDto: CreateDeletJobDto,
    file: Express.Multer.File,
    user?: UserDoc,
  ) {
    if (createJobDto.useTest === 'false') {
      if (!file) {
        throw new BadRequestException('Please upload a file');
      }

      if (file.mimetype !== 'text/plain') {
        throw new BadRequestException('Please upload a text file');
      }
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

    const session = await DeletJobsModel.startSession();
    session.startTransaction();

    try {
      // console.log('DTO: ', createJobDto);
      const opts = { session };

      const filepath = createJobDto.useTest === 'true' ? testPath : file.path;

      const fileSize = await fileSizeMb(filepath);
      const longJob = fileSize > 0.5;

      let newJob;

      //save job parameters, folder path, filename in database
      if (user) {
        newJob = await DeletJobsModel.build({
          jobUID,
          inputFile: filepath,
          status: JobStatus.QUEUED,
          user: user.id,
          longJob,
          ...createJobDto,
        });
      }

      if (createJobDto.email) {
        newJob = await DeletJobsModel.build({
          jobUID,
          inputFile: filepath,
          status: JobStatus.QUEUED,
          email: createJobDto.email,
          longJob,
          ...createJobDto,
        });
      }

      if (!newJob) {
        throw new BadRequestException(
          'Job cannot be null, check job parameters',
        );
      }

      await newJob.save(opts);

      //add job to queue
      if (user) {
        await this.jobQueue.addJob({
          jobId: newJob.id,
          jobName: newJob.job_name,
          jobUID: newJob.jobUID,
          username: user.username,
          email: user.email,
        });
      }

      if (createJobDto.email) {
        await this.jobQueue.addJob({
          jobId: newJob.id,
          jobName: newJob.job_name,
          jobUID: newJob.jobUID,
          username: 'User',
          email: createJobDto.email,
        });
      }

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
    return await findAllJobs(getJobsDto, user, DeletJobsModel);
  }

  async getJobByID(id: string, user: UserDoc) {
    const job = await DeletJobsModel.findById(id).populate('user').exec();

    if (!job) {
      throw new NotFoundException();
    }

    if (job?.user?.username !== user.username) {
      throw new ForbiddenException('Access not allowed');
    }

    return job;
  }

  async getJobByIDNoAuth(id: string) {
    const job = await DeletJobsModel.findById(id).populate('user').exec();

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
    return await removeManyUserJobs(user, DeletJobsModel);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
