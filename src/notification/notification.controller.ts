import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService,
    private readonly apiInstance: SibApiV3Sdk.TransactionalEmailsApi
  ) {}

  // Endpoint to create a notification
  @Post()
  async createNotification(
    @Body('projectId') projectId: string,
    @Body('entrepreneurId') entrepreneurId: string,
    @Body('freelancerId')  freelancerId: string,
    @Body('message') message: string
  ) {
    const freelancer = await this.notificationService.getfreelancer(freelancerId);
    console.log(freelancer);
    await this.sendBanEmail(freelancer.email , freelancer.username,message);
    return this.notificationService.createNotification(projectId, entrepreneurId,freelancerId, message);
  }

  async sendBanEmail(to: string, userName: string, message : string): Promise<void> {
    console.log(to);
    const emailData = {
      sender: { email: 'nadabha135@gmail.com', name: 'Admin' },
      to: [{ email: to }],
      subject: 'Noveau Projet ',
      htmlContent: `<h1>Bonjour ${userName},</h1>
                    <p>${message}.</p>`,
    };
  
    try {
      const response = await this.apiInstance.sendTransacEmail(emailData);
      console.log('Email envoyé avec succès :', response);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
      throw new Error('L\'envoi de l\'email a échoué.');
    }
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
