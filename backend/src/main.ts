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
  
  // Security: CORS configuration - Allow connections from network
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://172.16.5.200:3000',
      `http://${process.env.SERVER_IP || '172.16.5.200'}:3000`,
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control', 'Pragma', 'Expires'],
    exposedHeaders: ['Authorization'],
    maxAge: 3600,
  });
  
  // Security: Global validation pipe to validate all DTOs and prevent injection attacks
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: false, // Allow extra properties (less strict for flexibility)
    transform: true, // Automatically transform payloads to DTO instances
    disableErrorMessages: false,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0'); // Listen on all network interfaces
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Network access: http://172.16.5.200:${port}`);
  console.log('Security features enabled: Helmet, CORS, Rate Limiting, JWT Authentication, Input Validation');
}
bootstrap();
