import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  AppModule.configureSwagger(app); // Call configureSwagger method
  await app.listen(4040);
}

bootstrap();
