import { Subjects } from './subject';

export interface JobCompletedEvent {
  subject: Subjects.EmailNotify;
  data: {
    type: string;
    recipient: {
      email: string;
    };
    payload: {
      comments: string;
      jobID: string;
      jobName: string;
      status: string;
      username: string;
      link?: string;
    };
  };
}
