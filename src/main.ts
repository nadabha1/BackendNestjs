import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,         // Automatically strip non-whitelisted properties
    forbidNonWhitelisted: true,  // Throw an error if a non-whitelisted property is received
    transform: true,         // Automatically transform payloads to DTOs
  }));
  app.enableCors(); // Activez cette ligne si vous utilisez des appels API depuis l'application iOS
  await app.listen(3000, '0.0.0.0'); // Écoute sur toutes les interfaces
}
bootstrap();
