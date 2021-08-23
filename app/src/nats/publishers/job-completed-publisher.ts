import { Publisher } from './base-publisher';
import { Subjects } from '../events/subject';
import { JobCompletedEvent } from '../events/job-completed.event';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobCompletedPublisher extends Publisher<JobCompletedEvent> {
  subject: Subjects.EmailNotify = Subjects.EmailNotify;
}
