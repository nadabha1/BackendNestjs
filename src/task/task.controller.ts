import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    async createTask(@Body() createTaskDto: CreateTaskDto) {
        console.log('Task create method called');
        return this.taskService.createTask(createTaskDto);
    }

    
    @Get(':projectId')
    async getTasksByProject(@Param('projectId') projectId: string) {
        return this.taskService.getTasksByProject(projectId);
    }
    

    @Put(':taskId')
    async updateTask(@Param('taskId') taskId: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.taskService.updateTask(taskId, updateTaskDto);
    }

    @Delete(':taskId')
    async deleteTask(@Param('taskId') taskId: string) {
        return this.taskService.deleteTask(taskId);
    }
    @Get('application/:applicationId')
    async getTasksByApplication(@Param('applicationId') applicationId: string) {
        return this.taskService.getTasksByApplication(applicationId);
    }

  

    @Get()
    findAll() {
      return this.taskService.findAll();
    }
}