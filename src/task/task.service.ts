import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Application, ApplicationDocument } from 'src/application/entities/application.entity';

@Injectable()
@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
  ) {}

    async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
        const task = new this.taskModel(createTaskDto);
        return task.save();
    }

    async getTasksByProject(projectId: string): Promise<Task[]> {
      return this.taskModel.find({ projet: projectId }).exec(); // Ensure `projet` is used as the field name
  }
  
    async updateTask(taskId: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
        const updatedTask = await this.taskModel.findByIdAndUpdate(taskId, updateTaskDto, { new: true });
        if (!updatedTask) {
            throw new NotFoundException(`Task with ID ${taskId} not found`);
        }
        return updatedTask;
    }

    async deleteTask(taskId: string): Promise<void> {
        const result = await this.taskModel.findByIdAndDelete(taskId);
        if (!result) {
            throw new NotFoundException(`Task with ID ${taskId} not found`);
        }
    }


    async getTasksByApplication(applicationId: string): Promise<Task[]> {
      // Find the application by ID
      const application = await this.applicationModel.findById(applicationId).exec();

      if (!application) {
          throw new Error('Application not found');
      }

      // Use the project ID from the application to find tasks
      return this.taskModel.find({ projet: application.project }).exec();
  }
}
