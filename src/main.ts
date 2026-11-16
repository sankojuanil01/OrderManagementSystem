import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingValidationPipe } from './common/pipes/validationPipe.logger.js';



async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  

  // applies dto validation to every incoming request with lifecycle logging
  app.useGlobalPipes(
    new LoggingValidationPipe({
      whitelist : true,
      forbidNonWhitelisted : true,
      transform : true,
    })
  )



  


   // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Order Management System API')
    .setDescription(
      'REST API for Authentication, Users, Products and Orders',
    )
    .setVersion('1.0')

    // adds JWt/Bearer authentication support to Swagger
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

    // generate the swagger document from controllers and DTO's
  const document = SwaggerModule.createDocument(
    app,
    config,
  );

  // swagger UI will be available at :
   // http://localhost:5000/api
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 5000);
}
await bootstrap();
