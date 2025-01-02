import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class NotificationsGateway {
    @WebSocketServer()
    server: Server;

    notifyAllUsers(newProjectName: string) {
        this.server.emit('new_project', { projectName: newProjectName });
    }
}
