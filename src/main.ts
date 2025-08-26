import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

export interface SwaggerCustomOptions {
  customSiteTitle?: string;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Configurar cookie parser
  app.use(cookieParser());
  
  // Configurar CORS correctamente para cookies
  app.enableCors({
    origin: ['http://localhost:5173'], // URLs del frontend
    credentials: true, //  IMPORTANTE: Permitir cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'cookie']
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
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
        const order = { get: 1, post: 2, put: 3, delete: 4, patch: 5 };
        return order[a.get("method")] - order[b.get("method")];
      }
    }, 
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


// Usar la URL 'http://localhost:3000/api' para abrir el Swagger UI

// Si los proyectos dan error 500, cambien el synchronize del app.module a true
// y eliminen la base de datos para que se vuelva a crear con las nuevas entidades