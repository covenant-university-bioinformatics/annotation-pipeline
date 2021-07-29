import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { Subjects } from '../events/subject';
import { Inject, Injectable } from '@nestjs/common';
import { UserApprovedEvent } from '../events/user-approved.event';
import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class UserApprovedListener extends Listener<UserApprovedEvent> {
  queueGroupName = 'jobs-service';
  readonly subject: Subjects.UserApproved = Subjects.UserApproved;

  @Inject(AuthService)
  private authService: AuthService;
  async onMessage(
    data: UserApprovedEvent['data'],
    msg: Message,
  ): Promise<void> {
    // console.log('Personnel Event data!', data);

    const result = await this.authService.register(data);
    if (result.success) {
      msg.ack();
    }
  }
}
