import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentVersioningService } from './content-versioning.service';
import { ContentVersioningController } from './content-versioning.controller';
import { ContentVersion } from './entities/content-version.entity';
import { LessonsModule } from '../lessons/lessons.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContentVersion]), LessonsModule],
  controllers: [ContentVersioningController],
  providers: [ContentVersioningService],
  exports: [ContentVersioningService],
})
export class ContentVersioningModule {}

