import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // Log database configuration for debugging
  console.log('===========================================');
  console.log('Database Configuration:');
  console.log(`Host: ${process.env.DATABASE_HOST || 'localhost'}`);
  console.log(`Port: ${process.env.DATABASE_PORT || '5433'}`);
  console.log(`User: ${process.env.DATABASE_USER || 'slotuser'}`);
  console.log(`Database: ${process.env.DATABASE_NAME || 'slot_observation'}`);
  console.log('===========================================');
  
  const app = await NestFactory.create(AppModule);
  
  // Security: Helmet adds various HTTP headers to protect against common attacks
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Security: Cookie parser for secure cookie handling
  app.use(cookieParser());
  
  // Security: CORS configuration with strict origin policy
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    maxAge: 3600,
  });
  
  // Security: Global validation pipe to validate all DTOs and prevent injection attacks
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
    transform: true, // Automatically transform payloads to DTO instances
    disableErrorMessages: false,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log('Security features enabled: Helmet, CORS, Rate Limiting, JWT Authentication, Input Validation');
}
bootstrap();
