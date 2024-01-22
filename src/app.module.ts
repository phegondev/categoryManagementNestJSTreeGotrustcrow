import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryController } from './category/category.controller';
import { CategoryService } from './category/category.service';
import { Category } from './category/category.entity';
const databaseConfig = require('../src/db/databaseConfig.ts');



@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...databaseConfig,
      entities: [Category],
      synchronize: true,// Set to false in production
    }),
    TypeOrmModule.forFeature([Category]),
  ],
  controllers: [AppController, CategoryController],
  providers: [AppService, CategoryService],
})
export class AppModule {}