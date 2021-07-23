import {
  Global,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import {
  AnnotationJob,
  AnnotationJobDocument,
  AnnotationJobSchema,
} from './models/annotation.jobs.models';
import { Annotation, AnnotationSchema } from './models/annotation.model';
import { Model } from 'mongoose';
import advancedResults from 'src/middlewares/filterResponseResults.middleware';
import { QueueModule } from '../jobqueue/queue.module';
// import { AuthModule } from '../auth/auth.module';
// import { NatsModule } from '../nats/nats.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AnnotationJob.name,
        schema: AnnotationJobSchema,
      },
      {
        name: Annotation.name,
        schema: AnnotationSchema,
      },
    ]),
    QueueModule,
    // AuthModule,
    // NatsModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [
    MongooseModule.forFeature([
      {
        name: AnnotationJob.name,
        schema: AnnotationJobSchema,
      },
    ]),
  ],
})
export class JobsModule {
  @InjectModel(AnnotationJob.name)
  private annotJobsModel: Model<AnnotationJobDocument>;

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(advancedResults(this.annotJobsModel, 'annot'))
      .forRoutes({ path: 'api/annot/jobs', method: RequestMethod.GET });
  }
}
