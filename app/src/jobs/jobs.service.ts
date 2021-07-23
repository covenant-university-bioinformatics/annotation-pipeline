import {
  ConflictException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AnnotationJob,
  AnnotationJobDocument,
} from './models/annotation.jobs.models';
import { Annotation, AnnotationDocument } from './models/annotation.model';
import { JobQueue } from '../jobqueue/queue';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(AnnotationJob.name)
    private annotJobModel: Model<AnnotationJobDocument>,
    @InjectModel(Annotation.name) private annotModel: Model<AnnotationDocument>,
    @Inject(JobQueue)
    private jobQueue: JobQueue,
  ) {}

  async create(createJobDto: CreateJobDto, jobUID: string, filename: string) {
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
        jobName: newJob.jobName,
        jobUID: newJob.jobUID,
      });

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
      throw new HttpException(e.message, 400);
    } finally {
      session.endSession();
      sessionTest.endSession();
    }
  }

  findAll() {
    return `This action returns all jobs`;
  }

  // async findOne(id: string) {
  //   return await this.jobsModel.findById(id).exec();
  // }

  // async getJobForUser(id: string) {
  //   return await this.jobsModel.findById(id).populate('test').exec();
  // }

  // update(id: number, updateJobDto: UpdateJobDto) {
  //   return `This action updates a #${id} job`;
  // }

  // async updateStatus(job: JobsDocument, status: JobStatus) {}

  // async removeById(id: string) {
  //   // delete job
  //   return await this.jobsModel
  //     .remove({
  //       _id: id,
  //     })
  //     .exec();
  // }

  // private getAnalysisTypes(createJobDto: CreateJobDto): AnaylsisTypes[] {
  //   const types = [];
  //   for (const jobDtoKey in createJobDto) {
  //     if (createJobDto.hasOwnProperty(jobDtoKey)) {
  //       switch (jobDtoKey) {
  //         case 'testjob':
  //           types.push(jobDtoKey);
  //           break;
  //         case 'imputation':
  //           types.push(jobDtoKey);
  //           break;
  //         case 'bayes-finemap':
  //           types.push(jobDtoKey);
  //           break;
  //         case 'ld-structure':
  //           types.push(jobDtoKey);
  //           break;
  //       }
  //     }
  //   }
  //   return types;
  // }

  // validateFile(filePath: string): true | string[] {
  //   //check file mime type and size
  //   //file correctness check
  //   return true;
  // }
}
