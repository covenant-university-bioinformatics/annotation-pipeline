import { applyDecorators, Body, ParseIntPipe } from '@nestjs/common';
import { UserParseIntPipe } from './UserParseIntPipe';

export function ValidateFileColumns() {
  // return applyDecorators(Body('marker_name', UserParseIntPipe));
}
