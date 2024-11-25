import { Injectable } from '@nestjs/common';
import * as gm from 'gm';

@Injectable()
export class GmService {
  async resizeImage(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      gm(inputPath)
        .resize(768, 512)
        .setFormat('jpeg')
        .write(outputPath, (err) => {
          if (err) {
            console.error('Error processing image:', err);
            reject(err);
          } else {
            console.log('Image successfully resized and saved to', outputPath);
            resolve();
          }
        });
    });
  }
}
