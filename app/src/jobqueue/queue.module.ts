import { Module, OnModuleInit } from '@nestjs/common';
import { createWorkers } from '../workers';
import { InjectModel } from '@nestjs/mongoose';
import {
  AnnotationJob,
  AnnotationJobDocument,
} from '../jobs/models/annotation.jobs.models';
import { Model } from 'mongoose';
import { JobQueue } from './queue';

@Module({
  imports: [],
  providers: [JobQueue],
  exports: [JobQueue],
})
export class QueueModule implements OnModuleInit {
  @InjectModel(AnnotationJob.name)
  private annotJobModel: Model<AnnotationJobDocument>;

  async onModuleInit() {
    await createWorkers(this.annotJobModel);
  }
}
