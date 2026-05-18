import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import 'dotenv/config';
import { MetricsInterceptor } from './Common/interceptor/metrics.interceptor';


export interface SwaggerCustomOptions {
  customSiteTitle?: string;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // Configurar CORS correctamente para cookies
  app.enableCors({
    origin: true, // URLs del frontend
    credentials: true, //  IMPORTANTE: Permitir cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'cookie']
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  const config = new DocumentBuilder()
    .setTitle('API SAGA-JD')
    .setDescription('API documentation for the SAGA-JD project')
    .setVersion('1.0')
    .addServer('http://tu ip de radminvpn:3000')
    .build();

    const options: SwaggerDocumentOptions =  {
        autoTagControllers: true,

        operationIdFactory: (
          controllerKey: string,
          methodKey: string
        ) => methodKey
      };

  app.useGlobalInterceptors(new MetricsInterceptor());


  app.useGlobalInterceptors(new MetricsInterceptor());

  app.setGlobalPrefix('api', {
    exclude: ['metrics'],
  });

  await app.listen( 3000, '0.0.0.0');

  if (process.env.NODE_ENV === 'development') {
    console.log('Entorno actual:', process.env.NODE_ENV);
    console.log('Base de datos:', process.env.DB_DATABASE);
    console.log('URL de backend:', process.env.BACKEND_URL);
    console.log('URL de frontend (info):', process.env.FRONTEND_URL_INFO);
    console.log('URL de frontend (admin):', process.env.FRONTEND_URL_ADMIN);
  } 
}
bootstrap();