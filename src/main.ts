import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors();
  
  // Agregar prefijo global
  app.setGlobalPrefix('api');
  
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SECRET_KEY || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
    }),
  );

  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API NestJS')
    .setDescription('Documentación de la API del proyecto')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Endpoints de autenticación')
    .addTag('users', 'Endpoints de usuarios')
    .addTag('pets', 'Endpoints de mascotas')
    .addTag('products', 'Endpoints de productos')
    .addTag('carts', 'Endpoints de carritos')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000, '0.0.0.0');
  console.log(`La aplicación está corriendo en: http://localhost:3000/api`);
  console.log(`Documentación Swagger disponible en: http://localhost:3000/api/docs`);
}
bootstrap();
