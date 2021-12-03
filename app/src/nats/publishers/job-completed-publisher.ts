import { Publisher } from './base-publisher';
import { Injectable } from '@nestjs/common';
import { JobCompletedEvent, Subjects } from '@cubrepgwas/pgwascommon';

@Injectable()
export class JobCompletedPublisher extends Publisher<JobCompletedEvent> {
  subject: Subjects.EmailNotify = Subjects.EmailNotify;
}
