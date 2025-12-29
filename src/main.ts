// import crypto from 'crypto';
// (global as any).crypto = crypto;

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000', //
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Retorna erro se propriedades não permitidas forem enviadas
      transform: true, // Transforma automaticamente os tipos
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Portal ATI - API')
    .setDescription('Documentação oficial da API Portal ATI (Backend)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // SwaggerModule.setup('docs', app, document, {
  //   swaggerOptions: { persistAuthorization: true },
  // });

  const port = process.env.PORT || 4001;
  await app.listen(port, '0.0.0.0');
  console.log(`📚 API disponível em: http://localhost:${port}/api`);
}
bootstrap();
