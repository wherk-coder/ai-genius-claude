import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(@Body() preferences: any) {
    // Implementation for updating preferences
    return { success: true };
  }

  @Post('test-email/:userId')
  @ApiOperation({ summary: 'Send test welcome email' })
  async sendTestEmail(@Param('userId') userId: string) {
    await this.notificationsService.sendWelcomeNotifications(userId);
    return { success: true };
  }
}