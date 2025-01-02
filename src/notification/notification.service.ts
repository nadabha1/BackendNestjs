import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './entities/notification.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private readonly userService: UserService, // Inject NotificationService
    private readonly apiInstance: SibApiV3Sdk.TransactionalEmailsApi

  ) {}

  async sendNotificationToEntrepreneur(projectId: string, entrepreneurId: string,freelancerId:string, message: string) {
    const freelancer = await this.getfreelancer(freelancerId);
    console.log(freelancer);
    await this.sendBanEmail(freelancer.email , freelancer.username,message);
    const notification = new this.notificationModel({
      projectId,
      entrepreneurId,
      freelancerId,
      message,
      status: 'unread', // Notification is unread by default
    });

    await notification.save();
    return notification;
  }
  // Create a notification and save it to the database
  async createNotification(
    projectId: string,
    entrepreneurId: string,
    freelancerId: string,
    message: string
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      projectId,
      entrepreneurId,
      message,
      status: 'unread',
    });

    return notification.save();
  }

  async sendBanEmail(to: string, userName: string, message : string): Promise<void> {
    console.log(to);
    const emailData = {
      sender: { email: 'nadabha135@gmail.com', name: 'Admin' },
      to: [{ email: to }],
      subject: 'Noveau Projet ',
      htmlContent: `<h1>Bonjour ${userName},</h1>
                    <p>Un nouveau projet a été créé : ${message}.</p>
                    <p>Pour toute question, contactez-nous à support@example.com.</p>`,
    };
  
    try {
      const response = await this.apiInstance.sendTransacEmail(emailData);
      console.log('Email envoyé avec succès :', response);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
      throw new Error('L\'envoi de l\'email a échoué.');
    }
  }

  // Get all notifications for a specific entrepreneur
  async getNotificationsForEntrepreneur(entrepreneurId: string): Promise<Notification[]> {
    return this.notificationModel.find({ entrepreneurId }).exec();
  }
  async getfreelancer(freelancerId: string): Promise<User> {
    return this.userService.findUserInfoById(freelancerId);
  }
  // Mark a notification as read
  async markAsRead(notificationId: string): Promise<Notification> {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { status: 'read' },
      { new: true }
    );
  }
}
