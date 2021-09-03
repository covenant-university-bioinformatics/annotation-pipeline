import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { createWorkers } from '../workers/annot.main';
import { AnnotJobQueue } from './queue/annot.queue';
import { NatsModule } from '../nats/nats.module';
import { JobCompletedPublisher } from '../nats/publishers/job-completed-publisher';
import { DeletJobQueue } from './queue/delet.queue';
import { createDeletWorkers } from '../workers/delet.main';

@Module({
  imports: [NatsModule],
  providers: [AnnotJobQueue, DeletJobQueue],
  exports: [AnnotJobQueue, DeletJobQueue],
})
export class QueueModule implements OnModuleInit {
  @Inject(JobCompletedPublisher) jobCompletedPublisher: JobCompletedPublisher;
  async onModuleInit() {
    // createScheduler();
    await createWorkers(this.jobCompletedPublisher);
    await createDeletWorkers();
  }
}
