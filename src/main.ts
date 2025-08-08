import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { AppModule } from './app.module';

export interface swaggerCustomOptions {
  customSiteTitle?: string;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');

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

  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

// Usar la URL 'http://localhost:3000/api' para abrir el Swagger UI