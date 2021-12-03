import { Global, Module } from '@nestjs/common';
import { JobsAnnotService } from './services/jobs.annot.service';
import { JobsAnnotController } from './controllers/jobs.annot.controller';
import { QueueModule } from '../jobqueue/queue.module';
import { JobsDeletController } from './controllers/jobs.delet.controller';
import { JobsDeletService } from './services/jobs.delet.service';
import { JobsAnnotNoAuthController } from './controllers/jobs.annot.noauth.controller';
import { JobsDeletNoAuthController } from './controllers/jobs.delet.noauth.controller';

@Global()
@Module({
  imports: [
    QueueModule,
    // AuthModule,
    // NatsModule,
  ],
  controllers: [
    JobsAnnotController,
    JobsDeletController,
    JobsAnnotNoAuthController,
    JobsDeletNoAuthController,
  ],
  providers: [JobsAnnotService, JobsDeletService],
  exports: [],
})
export class JobsModule {}
