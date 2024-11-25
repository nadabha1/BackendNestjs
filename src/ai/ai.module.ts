import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AIService } from './ai.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [AiController],
  providers: [AIService],
  imports: [HttpModule],
  exports: [AIService],
})
export class AiModule {}
