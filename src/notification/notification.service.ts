import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>
  ) {}

  async sendNotificationToEntrepreneur(projectId: string, entrepreneurId: string, message: string) {
    const notification = new this.notificationModel({
      projectId,
      entrepreneurId,
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

  // Get all notifications for a specific entrepreneur
  async getNotificationsForEntrepreneur(entrepreneurId: string): Promise<Notification[]> {
    return this.notificationModel.find({ entrepreneurId }).exec();
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
