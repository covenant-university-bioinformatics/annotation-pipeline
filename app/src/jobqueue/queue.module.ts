import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { createWorkers } from '../workers/main';
import { JobQueue } from './queue';
import { NatsModule } from '../nats/nats.module';
import { JobCompletedPublisher } from '../nats/publishers/job-completed-publisher';

@Module({
  imports: [NatsModule],
  providers: [JobQueue],
  exports: [JobQueue],
})
export class QueueModule implements OnModuleInit {
  @Inject(JobCompletedPublisher) jobCompletedPublisher: JobCompletedPublisher;
  async onModuleInit() {
    // createScheduler();
    await createWorkers(this.jobCompletedPublisher);
  }
}
