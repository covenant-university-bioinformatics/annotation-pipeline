import { Global, Module } from '@nestjs/common';
import { JobsAnnotService } from './services/jobs.annot.service';
import { JobsAnnotController } from './controllers/jobs.annot.controller';
import { QueueModule } from '../jobqueue/queue.module';
import { JobsDeletController } from './controllers/jobs.delet.controller';
import { JobsDeletService } from './services/jobs.delet.service';

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
  controllers: [JobsAnnotController, JobsDeletController],
  providers: [JobsAnnotService, JobsDeletService],
  exports: [
    // MongooseModule.forFeature([
    //   {
    //     name: AnnotationJob.name,
    //     schema: AnnotationJobSchema,
    //   },
    // ]),
  ],
})
export class JobsModule {}
