import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AIService {
  private readonly apiUrl = 'https://api-inference.huggingface.co/models';
  private readonly apiKey = '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';

  constructor(private readonly httpService: HttpService) {}

  async analyzeResume(resumeText: string): Promise<any> {
    const model = 'your-model-id'; // Replace with Hugging Face model ID
    const url = `${this.apiUrl}/${model}`;

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          { inputs: resumeText },
          { headers },
        ),
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing resume:', error.message);
      throw new Error('Failed to analyze resume');
    }
  }
}
