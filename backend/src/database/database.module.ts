import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { CourseModule } from '../modules/entities/module.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Quiz } from '../lessons/entities/quiz.entity';
import { QuizAttempt } from '../lessons/entities/quiz-attempt.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { LessonProgress } from '../progress/entities/lesson-progress.entity';
import { ContentVersion } from '../content-versioning/entities/content-version.entity';
import { AIRequest } from '../ai-agents/entities/ai-request.entity';
import { AIResponse } from '../ai-agents/entities/ai-response.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [
          User,
          Course,
          CourseModule,
          Lesson,
          Quiz,
          QuizAttempt,
          Enrollment,
          LessonProgress,
          ContentVersion,
          AIRequest,
          AIResponse,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}

