import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { spawn } from 'child_process';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CvAnalysisService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async analyzeCv(filePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(filePath)) {
        return reject(new Error('File does not exist.'));
      }

      const pythonProcess = spawn('python', ['src/python_scripts/process_cv.py']);
      pythonProcess.stdin.write(JSON.stringify({ filePath }));
      pythonProcess.stdin.end();

      let resultData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python script error output:', errorData);
          reject(new Error(`Python script error: ${errorData}`));
        } else {
          try {
            const parsedData = JSON.parse(resultData);
            resolve(parsedData.skills || []);
          } catch (err) {
            reject(new Error('Failed to parse Python script output.'));
          }
        }
      });
    });
  }

  async saveSkillsToUser(userId: string, skills: string[]): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    user.skills = [...new Set([...(user.skills || []), ...skills])];
    await user.save();
    return user;
  }
}
