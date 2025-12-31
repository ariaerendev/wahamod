import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  SessionApiParam,
  WorkingSessionParam,
} from '@waha/nestjs/params/SessionApiParam';

import { SessionManager } from '../core/abc/manager.abc';
import { WhatsappSession } from '../core/abc/session.abc';
import { RejectCallRequest } from '../structures/calls.dto';

@ApiSecurity('api_key')
@Controller('api/:session/calls')
@ApiTags('📞 Calls')
export class CallsController {
  constructor(private manager: SessionManager) {}

  @Post('reject')
  @SessionApiParam
  @ApiOperation({ summary: 'Reject incoming call' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  rejectCall(
    @WorkingSessionParam session: WhatsappSession,
    @Body() request: RejectCallRequest,
  ) {
    return session.rejectCall(request.from, request.id);
  }
}
