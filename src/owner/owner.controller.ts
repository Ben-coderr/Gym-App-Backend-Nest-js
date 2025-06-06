import { Controller, Get,Body, Put, Param, UseGuards, Req } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Request } from 'express';
import { UpdateOwnerDto } from './dtos/update-owner.dto';

@Controller('owners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get('profile')
  getProfile(@Req() req) {
    return this.ownerService.getProfile(req.user.id);
  }

  @Put('profile')
  updateProfile(@Req() req, @Body() dto: UpdateOwnerDto) {
    return this.ownerService.updateProfile(req.user.id, dto);
  }

//   @Get('notifications')
//   getNotifications(@Req() req) {
//     return this.ownerService.getNotifications(req.user.id);
//   }

//   @Put('notifications/:id/read')
//   markNotificationAsRead(@Req() req, @Param('id') notificationId: string) {
//     return this.ownerService.markNotificationAsRead(
//       req.user.id,
//       parseInt(notificationId)
//     );
//   }
}