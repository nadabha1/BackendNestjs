import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { NotificationsGateway } from './NotificationsGateway';

@Module({
  providers: [ChatGateway,NotificationsGateway],
  exports: [NotificationsGateway], // Exporter la Gateway pour qu'elle soit disponible dans d'autres modules
})
export class WebsocketsModule {}
