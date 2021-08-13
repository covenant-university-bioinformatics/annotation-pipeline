import { Global, Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { QueueModule } from '../jobqueue/queue.module';

@Global()
@Module({
  imports: [
    // MongooseModule.forFeature([
    //   {
    //     name: AnnotationJob.name,
    //     schema: AnnotationJobSchema,
    //   },
    //   {
    //     name: Annotation.name,
    //     schema: AnnotationSchema,
    //   },
    // ]),
    QueueModule,
    // AuthModule,
    // NatsModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [
    // MongooseModule.forFeature([
    //   {
    //     name: AnnotationJob.name,
    //     schema: AnnotationJobSchema,
    //   },
    // ]),
  ],
})
export class JobsModule {
  // @InjectModel(AnnotationJob.name)
  // private annotJobsModel: Model<AnnotationJobDocument>;
  // @InjectModel(User.name) private userModel: Model<UserDocument>;
  //
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(
  //       authMiddleware(this.userModel),
  //       advancedResults(this.annotJobsModel, 'annot'),
  //     )
  //     .forRoutes({ path: 'api/annot/jobs', method: RequestMethod.GET });
  // }
}
