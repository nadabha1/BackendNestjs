import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import * as pdf from 'pdf-parse';
import * as fs from 'fs';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { env } from 'process';

@Injectable()
export class CvService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger(CvService.name);

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
  

  async analyzeWithHuggingFace(text: string): Promise<any> {
    const apiKey = "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"; // Remplace par ta clé API Hugging Face
    const model = 'dslim/bert-base-NER';
    const url = `https://api-inference.huggingface.co/models/${model}`;
  
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await lastValueFrom(
          this.httpService.post(
            url,
            {
              inputs: text,
            },
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
            },
          ),
        );
  
        console.log('Réponse de NER:', response.data);
        return response.data;
      } catch (error) {
        const estimatedTime = error.response?.data?.estimated_time;
        if (error.response?.data?.error.includes('currently loading') && estimatedTime) {
          console.log(`Le modèle est en cours de chargement. Réessayer dans ${estimatedTime} secondes.`);
          await new Promise((resolve) => setTimeout(resolve, estimatedTime * 1000)); // Attendre avant de réessayer
        } else {
          console.error('Erreur avec l’API Hugging Face:', error.response?.data || error.message);
          throw new Error('Impossible d’analyser le texte avec Hugging Face');
        }
      }
    }
  
    throw new Error('Le modèle n’est toujours pas prêt après plusieurs tentatives.');
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
    const analysis = await this.analyzeWithHuggingFace(extractedText);
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
  async analyzeWithGPT(text: string): Promise<any> {
    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';
  
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          url,
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are an expert in analyzing resumes.' },
              { role: 'user', content: `Extract skills from this resume:\n${text}` },
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
        ),
      );
  
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      if (error.response?.data?.code === 'insufficient_quota') {
        throw new Error('You have exceeded your OpenAI API quota. Please check your plan or add credits.');
      } else {
        throw new Error(`Error with OpenAI API: ${error.message}`);
      }
    }
  }
  


// Utilisation dans le code

  
}
