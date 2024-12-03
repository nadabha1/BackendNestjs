import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Notification {
  @Prop({ type: String, required: true })
  projectId: string;

  @Prop({ type: String, required: true })
  entrepreneurId: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, enum: ['unread', 'read'], default: 'unread' })
  status: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

export type NotificationDocument = Notification & Document;
