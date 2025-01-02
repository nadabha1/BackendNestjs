import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { CvAnalysisService } from './cv-analysis.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('cv-analysis')
export class CvAnalysisController {
  constructor(private readonly analyse: CvAnalysisService) {}

  @Post('upload/:userId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(new Error('Only PDF files are allowed.'), false);
        }
      },
    }),
  )
  async uploadCv(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    try {
      const skills = await this.analyse.analyzeCv(file.path);
      const user = await this.analyse.saveSkillsToUser(userId, skills);

      return {
        message: 'Skills extracted and saved successfully.',
        skills,
        user,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
