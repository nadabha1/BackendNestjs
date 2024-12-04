import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Endpoint to create a notification
  @Post()
  async createNotification(
    @Body('projectId') projectId: string,
    @Body('entrepreneurId') entrepreneurId: string,
    @Body('freelancerId')  freelancerId: string,
    @Body('message') message: string
  ) {
    return this.notificationService.createNotification(projectId, entrepreneurId,freelancerId, message);
  }

  // Endpoint to get all notifications for a specific entrepreneur
  @Get('entrepreneur/:entrepreneurId')
  async getNotificationsForEntrepreneur(
    @Param('entrepreneurId') entrepreneurId: string
  ) {
    return this.notificationService.getNotificationsForEntrepreneur(entrepreneurId);
  }
 

  @Post('entrepreneur')
  async getNotificationsForEntrepreneurIOs(
    @Body('entrepreneurId') entrepreneurId: string
  ) {
    return this.notificationService.getNotificationsForEntrepreneur(entrepreneurId);
  }
  @Post('freelancer')
  async getNotificationsForFreelancerIOs(
    @Body('freelancerId') freelancerId: string
  ) {
    return this.notificationService.getfreelancer(freelancerId);
  }
  // Endpoint to mark a notification as read
  @Patch(':notificationId')
  async markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationService.markAsRead(notificationId);
  }


}
