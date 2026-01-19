import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Online Teaching Platform API')
    .setDescription(
      "O'qituvchilar va o'quvchilar uchun onlayn o'qitish platformasi",
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT token ni kiriting',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Autentifikatsiya endpointlari')
    .addTag('Teachers', "O'qituvchilar boshqaruvi")
    .addTag('Students', "O'quvchilar boshqaruvi")
    .addTag('Lessons', 'Darslar boshqaruvi')
    .addTag('Payments', "To'lovlar boshqaruvi")
    .addTag('Transactions', 'Tranzaksiyalar')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Online Teaching Platform API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('\n========================================');
  console.log(` Server ishga tushdi: http://localhost:${port}`);
  console.log(` Swagger UI: http://localhost:${port}/api`);
  console.log(` Auth Login: POST http://localhost:${port}/auth/login`);
  console.log('========================================\n');
}

bootstrap();
