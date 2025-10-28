import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import 'dotenv/config';

export interface SwaggerCustomOptions {
  customSiteTitle?: string;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // Configurar CORS correctamente para cookies
  app.enableCors({
    origin: [process.env.FRONTEND_URL_ADMIN, process.env.FRONTEND_URL_INFO], // URLs del frontend
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
    .build();

    const options: SwaggerDocumentOptions =  {
        autoTagControllers: true,

        operationIdFactory: (
          controllerKey: string,
          methodKey: string
        ) => methodKey
      };
  const documentFactory = () => SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      operationsSorter: (a: any, b: any) => {
        const order = { get: 1, post: 2, put: 3, patch: 4, delete: 5 };
        return order[a.get("method")] - order[b.get("method")];
      }
    }, 
  });

  await app.listen(process.env.PORT ?? 3000);

  console.log('Entorno actual:', process.env.NODE_ENV);
  console.log('Base de datos:', process.env.DB_DATABASE);
  if (process.env.NODE_ENV === 'development') {
    console.log('URL de backend:', process.env.BACKEND_URL);
    console.log('URL de frontend (info):', process.env.FRONTEND_URL_INFO);
    console.log('URL de frontend (admin):', process.env.FRONTEND_URL_ADMIN);
  } else {
    console.log('URL de backend:', process.env.BACKEND_URL_PROD);
    console.log('URL de frontend (info):', process.env.FRONTEND_URL_INFO_PROD);
    console.log('URL de frontend (admin):', process.env.FRONTEND_URL_ADMIN_PROD);
  }
}
bootstrap();
