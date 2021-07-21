import {
  ConflictException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Jobs, JobsDocument, JobStatus } from './models/jobs.models';
// import { Test, TestDocument } from './models/test.model';
// import { NewJobPublisher } from '../nats/publishers/new-job-publisher';
// import { AnaylsisTypes } from '../nats/dto/new-job.dto';
// import { UserDocument } from '../auth/models/user.model';

@Injectable()
export class JobsService {
  // @Inject(NewJobPublisher)
  // private newJobPublisher: NewJobPublisher;

  constructor(
    // @InjectModel(Jobs.name) private jobsModel: Model<JobsDocument>,
    // @InjectModel(Test.name) private testModel: Model<TestDocument>,
  ) {}

  // async create(createJobDto: CreateJobDto) {
  //   const session = await this.jobsModel.startSession();
  //   const sessionTest = await this.testModel.startSession();
  //   session.startTransaction();
  //   sessionTest.startTransaction();
  //
  //   try {
  //     console.log('DTO: ', createJobDto);
  //     const opts = { session };
  //     const optsTest = { session: sessionTest };
  //     //save job parameters, folder path, filename in database
  //     const newJob = new this.jobsModel({
  //       jobUID: createJobDto.jobUID,
  //       user: user.id,
  //       jobName: createJobDto.jobName,
  //       inputFile: createJobDto.filename,
  //     });
  //
  //     //let the models be created per specific analysis
  //     const testJob = new this.testModel({
  //       ...createJobDto.testjob,
  //       job: newJob.id,
  //     });
  //
  //     await testJob.save(optsTest);
  //     await newJob.save(opts);
  //
  //     const analysisTypes = this.getAnalysisTypes(createJobDto);
  //     console.log(analysisTypes);
  //     //send job event
  //     await this.newJobPublisher.publish({
  //       jobId: String(newJob.id),
  //       jobUID: newJob.jobUID,
  //       jobName: newJob.jobName,
  //       analysisTypes,
  //       filename: createJobDto.filename,
  //       email: user.email,
  //       username: user.username,
  //     });
  //
  //     await session.commitTransaction();
  //     await sessionTest.commitTransaction();
  //     return {
  //       success: true,
  //       jobId: newJob.id,
  //     };
  //   } catch (e) {
  //     if (e.code === 11000) {
  //       throw new ConflictException('Duplicate job not allowed: ' + e.message);
  //     }
  //     await session.abortTransaction();
  //     await sessionTest.abortTransaction();
  //     throw new HttpException(e.message, 400);
  //   } finally {
  //     session.endSession();
  //     sessionTest.endSession();
  //   }
  // }

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
