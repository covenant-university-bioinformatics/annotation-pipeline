import {
  Inject,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
// import { InjectModel, MongooseModule } from '@nestjs/mongoose';
// import { AuthModule } from '../auth/auth.module';
// import { Test, TestSchema } from './models/test.model';
// import { Jobs, JobsDocument, JobsSchema } from './models/jobs.models';
// import { NatsModule } from '../nats/nats.module';
// import advancedResults from '../middlewares/filterResponseResults.middleware';
// import { Model } from 'mongoose';

@Module({
  imports: [
    // MongooseModule.forFeature([
    //   {
    //     name: Jobs.name,
    //     schema: JobsSchema,
    //   },
    //   {
    //     name: Test.name,
    //     schema: TestSchema,
    //   },
    // ]),
    // AuthModule,
    // NatsModule,
    // NestjsFormDataModule.config({ storage: FileSystemStoredFile }),
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {
  // @InjectModel(Jobs.name) private jobsModel: Model<JobsDocument>;
  //
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(advancedResults(this.jobsModel, 'test'))
  //     .forRoutes({ path: 'api/jobs', method: RequestMethod.GET });
  // }
}
