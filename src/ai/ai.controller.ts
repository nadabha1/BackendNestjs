import { Controller, Post, Body } from '@nestjs/common';
import { AIService } from './ai.service';
@Controller('resume')
export class AiController {
  constructor(private readonly aiService: AIService) {}

  @Post('analyze')
  async analyzeResume(@Body('text') resumeText: string) {
    const analysis = await this.aiService.analyzeResume(resumeText);
    return { message: 'Analysis complete', analysis };
  }
}
