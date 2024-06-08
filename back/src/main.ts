import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedirectMiddleware } from './middlewares/redirect.middleware';
import { auth } from 'express-openid-connect';
import { config as auth0Config } from './config/auth0'; 

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(auth(auth0Config))

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Consorcify Documentation')
    .setDescription("All Consorcify's API endpoint specifications")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  app.use(new RedirectMiddleware().use);
  app.use(morgan('dev'));
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
}
bootstrap();