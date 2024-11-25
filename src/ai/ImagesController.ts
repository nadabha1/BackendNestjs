import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { extname } from 'path';
import { GmService } from './GmService';
  
  @Controller('images')
  export class ImagesController {
    constructor(private readonly gmService: GmService) {}
  
    @Post('resize')
    @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            callback(null, `${uniqueSuffix}${ext}`);
          },
        }),
      }),
    )
    async resizeImage(@UploadedFile() file: Express.Multer.File) {
      const inputPath = file.path;
      const outputPath = `./uploads/resized-${file.filename}`;
      await this.gmService.resizeImage(inputPath, outputPath);
      return { message: 'Image resized successfully!', outputPath };
    }
  }
  