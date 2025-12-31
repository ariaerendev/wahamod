import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  UnprocessableEntityException,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SessionManager } from '@waha/core/abc/manager.abc';
import { WhatsappSession } from '@waha/core/abc/session.abc';
import {
  SessionApiParam,
  WorkingSessionParam,
} from '@waha/nestjs/params/SessionApiParam';
import { WAHAValidationPipe } from '@waha/nestjs/pipes/WAHAValidationPipe';
import { Result } from '@waha/structures/base.dto';
import {
  MyProfile,
  ProfileNameRequest,
  ProfilePictureRequest,
  ProfileStatusRequest,
} from '@waha/structures/profile.dto';

@ApiSecurity('api_key')
@Controller('api/:session/profile')
@ApiTags('🆔 Profile')
export class ProfileController {
  constructor(private manager: SessionManager) {}

  @Get('')
  @SessionApiParam
  @ApiOperation({ summary: 'Get my profile' })
  async getMyProfile(
    @WorkingSessionParam session: WhatsappSession,
  ): Promise<MyProfile> {
    const me = session.getSessionMeInfo();
    if (!me) {
      throw new UnprocessableEntityException('No profile found');
    }
    const picture = await session.getContactProfilePicture(me.id, false);
    return {
      id: me.id,
      name: me.pushName,
      picture: picture || null,
    };
  }

  @Put('/name')
  @SessionApiParam
  @UsePipes(new WAHAValidationPipe())
  @ApiOperation({ summary: 'Set my profile name' })
  async setProfileName(
    @WorkingSessionParam session: WhatsappSession,
    @Body() request: ProfileNameRequest,
  ): Promise<Result> {
    const success = await session.setProfileName(request.name);
    return { success: success ?? true };
  }

  @Put('/status')
  @SessionApiParam
  @UsePipes(new WAHAValidationPipe())
  @ApiOperation({ summary: 'Set profile status (About)' })
  async setProfileStatus(
    @WorkingSessionParam session: WhatsappSession,
    @Body() request: ProfileStatusRequest,
  ): Promise<Result> {
    const success = await session.setProfileStatus(request.status);
    return { success: success ?? true };
  }

  @Put('/picture')
  @SessionApiParam
  @ApiOperation({ summary: 'Set profile picture' })
  async setProfilePicture(
    @WorkingSessionParam session: WhatsappSession,
    @Body() request: ProfilePictureRequest,
  ): Promise<Result> {
    const success = await session.updateProfilePicture(request.file);
    return { success: success ?? true };
  }

  @Delete('/picture')
  @SessionApiParam
  @ApiOperation({ summary: 'Delete profile picture' })
  async deleteProfilePicture(
    @WorkingSessionParam session: WhatsappSession,
  ): Promise<Result> {
    const success = await session.updateProfilePicture(null);
    return { success: success || true };
  }
}
