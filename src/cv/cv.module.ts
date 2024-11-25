import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [HttpModule, MulterModule.register({
    dest: './uploads',
  }),],
  controllers: [CvController],
  providers: [CvService],
   exports: [CvService], // Uncomment this line to make the CvService available for other modules
})
export class CvModule {}
