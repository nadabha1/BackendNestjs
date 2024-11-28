import { Injectable } from '@nestjs/common';
import { PythonShell } from 'python-shell';
import * as path from 'path';
import { ProjetService } from 'src/projet/projet.service';
import { InjectModel } from '@nestjs/mongoose';
import { Projet, ProjetDocument } from 'src/projet/entities/projet.entity';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';


@Injectable()
export class ProjectFilterService {
  constructor(
    private readonly projetService: ProjetService,
    private readonly userService: UserService,
  ) { }

    async filterProjects(skills: string, projects: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
          const scriptPath = path.join(process.cwd(), 'src', 'python_scripts', 'filter_projects.py');
      
          // Prepare the input data
          const input = JSON.stringify({ skills, projects });
          console.log('Input sent to Python script:', input); // Log the input
      
          // Create PythonShell instance
          const pythonShell = new PythonShell(scriptPath, {
            mode: 'text',
            pythonOptions: ['-u'],
          });
      
          // Listen to script output
          pythonShell.on('message', (message) => {
            try {
              const parsedResults = JSON.parse(message);
              resolve(parsedResults);
            } catch (err) {
              console.error('Failed to parse Python script output:', err);
              reject(new Error('Failed to parse Python script output.'));
            }
          });
      
          // Handle errors
          pythonShell.on('error', (err) => {
            console.error('Python Error:', err);
            reject(err);
          });
      
          // Handle when the script finishes execution
          pythonShell.on('close', () => {
            console.log('Python script finished execution.');
          });
      
          // Send the input and execute the script
          pythonShell.send(input).end((err) => {
            if (err) {
              console.error('Failed to execute Python script:', err);
              reject(err);
            }
          });
        });
    }
  
    async filterProjectsPers(id: string): Promise<any> {
      return new Promise(async (resolve, reject) => {
        const scriptPath = path.join(process.cwd(), 'src', 'python_scripts', 'filter_projects.py');
        
        try {
          // Await the results of the asynchronous calls
          const projects = await this.projetService.findAll();
          const user = await this.userService.findUserById(id); // Ensure this returns user data with skills or relevant info
          const skills = user.skills;  // Assuming `skills` is a property of the user object returned
    
          console.log('Projects:', projects);
          console.log('Skills:', skills);
          console.log('id:', id);
    
          // Prepare the input data
          const input = JSON.stringify({ skills, projects });
          console.log('Input sent to Python script:', input); // Log the input
    
          // Create PythonShell instance
          const pythonShell = new PythonShell(scriptPath, {
            mode: 'text',
            pythonOptions: ['-u'],
          });
    
          // Listen to script output
          pythonShell.on('message', (message) => {
            try {
              const parsedResults = JSON.parse(message);
              resolve(parsedResults);
            } catch (err) {
              console.error('Failed to parse Python script output:', err);
              reject(new Error('Failed to parse Python script output.'));
            }
          });
    
          // Handle errors
          pythonShell.on('error', (err) => {
            console.error('Python Error:', err);
            reject(err);
          });
    
          // Handle when the script finishes execution
          pythonShell.on('close', () => {
            console.log('Python script finished execution.');
          });
    
          // Send the input and execute the script
          pythonShell.send(input).end((err) => {
            if (err) {
              console.error('Failed to execute Python script:', err);
              reject(err);
            }
          });
        } catch (err) {
          console.error('Error in filterProjectsPers:', err);
          reject(err);
        }
      });
    }
    
}
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
      