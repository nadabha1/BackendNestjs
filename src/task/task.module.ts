
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task, TaskSchema } from './entities/task.entity';
import { ApplicationModule } from 'src/application/application.module';
import { Application, ApplicationSchema } from 'src/application/entities/application.entity';@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Application.name, schema: ApplicationSchema },
    ]),
    forwardRef(() => ApplicationModule), // Use forwardRef here
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService], // Export TaskService if needed
})
export class TaskModule {}
