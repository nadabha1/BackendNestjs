import { Injectable } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import * as pdf from 'pdf-parse';
import * as fs from 'fs';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { env } from 'process';

@Injectable()
export class CvService {
  constructor(private readonly httpService: HttpService) {}

  // Extract text from an image using Tesseract
  async extractTextFromImage(imagePath: string): Promise<string> {
    try {
      const result = await Tesseract.recognize(imagePath, 'eng');
      return result.data.text;
    } catch (error) {
      console.error('Error during image OCR:', error.message);
      throw new Error('Failed to extract text from the image');
    }
  }

  // Extract text from a PDF using pdf-parse

  async extractTextFromPdf(pdfPath: string): Promise<string> {
    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const data = await pdf(pdfBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF parsing failed:', error.message);
      throw new Error('Failed to parse the uploaded PDF');
    }
  }
  
  // Analyze text using Hugging Face API
  async analyzeText(text: string): Promise<any> {
    if (!text || text.trim().length === 0) {
      throw new Error('Extracted text is empty');
    }
  
    const apiKey = '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';
    const model = 'flair/ner-english-ontonotes-large'; // Replace with this or another model from Hugging Face
    const url = `https://api-inference.huggingface.co/models/${model}`;
  
    try {
      const maxLength = 512; // Adjust based on the model's input limit
      const truncatedText = text.length > maxLength ? text.slice(0, maxLength) : text;
      
// Send truncatedText instead of text
const response = await lastValueFrom(
    this.httpService.post(
        url,
        { inputs: truncatedText },
        {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        },
    ),
);console.log('Sending text for analysis:', truncatedText);


      console.log('Hugging Face API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Hugging Face API call failed:', error.message);
      throw new Error('Failed to analyze text with Hugging Face API');
    }
  }
  
  // Process uploaded CV (PDF or Image)
  async processCv(filePath: string, fileType: string): Promise<any> {
    console.log('Processing file:', { filePath, fileType });
  
    try {
      const fileStats = fs.statSync(filePath);
      console.log('File size (bytes):', fileStats.size);
  
      if (!fs.existsSync(filePath)) {
        throw new Error('Uploaded file does not exist');
      }
  
      let extractedText: string;
      if (fileType === 'pdf') {
        extractedText = await this.extractTextFromPdf(filePath);
      } else if (fileType === 'image') {
        extractedText = await this.extractTextFromImage(filePath);
      } else {
        throw new Error('Unsupported file type');
      }
  
      console.log('Extracted text:', extractedText);
  
      const analysis = await this.analyzeText(extractedText);
      console.log('Analysis result:', analysis);
  
      return analysis;
    } catch (error) {
      console.error('Error processing CV:', error.message);
      throw new Error('Failed to process CV. Please upload a valid file.');
    }
  }
  async analyzeSkills(text: string): Promise<any> {
    const apiKey = 'YOUR_HUGGING_FACE_API_KEY';
    const model = 'your-model-or-dslim/bert-base-NER'; // Replace with a skill extraction model
    const url = `https://api-inference.huggingface.co/models/${model}`;

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          url,
          { inputs: text },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing skills:', error.message);
      throw error;
    }
  }

  // Process the uploaded CV
  async processCv2(filePath: string, fileType: string): Promise<any> {
    let extractedText: string;

    if (fileType === 'pdf') {
      extractedText = await this.extractTextFromPdf(filePath);
    } else if (fileType === 'image') {
      extractedText = await this.extractTextFromImage(filePath);
    } else {
      throw new Error('Unsupported file type');
    }

    // Analyze the extracted text for skills
    const analysis = await this.analyzeSkills(extractedText);
    return analysis;
  }
  async extractText(filePath: string, fileType: string): Promise<string> {
    if (fileType === 'pdf') {
      return this.extractTextFromPdf(filePath);
    } else if (fileType === 'image') {
      return this.extractTextFromImage(filePath);
    } else {
      throw new Error('Unsupported file type');
    }
  }

  async analyzeWithGPT(text: string) {
    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions'; // Updated endpoint for chat models
    
    console.log('Sending request to OpenAI with payload:');
    console.log({
      model: 'gpt-3.5-turbo', // Use gpt-3.5-turbo or gpt-4
      messages: [
        {
          role: 'system',
          content: 'You are an expert in extracting technical skills from resumes.',
        },
        {
          role: 'user',
          content: `Extract technical skills from this resume:\n${text}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });
  
    try {
      const response = await this.httpService
        .post(
          url,
          {
            model: 'gpt-3.5-turbo', // Updated model
            messages: [
              {
                role: 'system',
                content: 'You are an expert in extracting technical skills from resumes.',
              },
              {
                role: 'user',
                content: `Extract technical skills from this resume:\n${text}`,
              },
            ],
            max_tokens: 100,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        )
        .pipe(map((res) => res.data.choices[0].message.content.trim()))
        .toPromise();
  
      console.log('OpenAI API response:', response);
      return response;
    } catch (error) {
      console.error('Error during OpenAI API request:', error.response?.data || error.message);
      throw new Error('Failed to analyze text with OpenAI API');
    }
  }
  
  
}
