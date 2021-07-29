import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../auth/models/user.model';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
