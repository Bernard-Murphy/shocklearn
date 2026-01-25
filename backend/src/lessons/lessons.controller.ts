import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole, CreateLessonDto, CreateQuizDto, UpdateQuizDto, SubmitQuizDto } from '@edtech/shared';
import { User } from '../users/entities/user.entity';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post('modules/:moduleId/lessons')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  create(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: User,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonsService.create(moduleId, user.id, createLessonDto);
  }

  @Get('modules/:moduleId/lessons')
  findByModule(@Param('moduleId') moduleId: string) {
    return this.lessonsService.findByModule(moduleId);
  }

  @Get('lessons/:id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Put('lessons/:id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateData: Partial<CreateLessonDto>,
  ) {
    return this.lessonsService.update(id, user.id, updateData);
  }

  @Delete('lessons/:id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.lessonsService.remove(id, user.id);
    return { message: 'Lesson deleted successfully' };
  }

  // Quiz endpoints
  @Post('lessons/:lessonId/quizzes')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  createQuiz(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: User,
    @Body() createQuizDto: CreateQuizDto,
  ) {
    return this.lessonsService.createQuiz(lessonId, user.id, createQuizDto);
  }

  @Get('lessons/:lessonId/quizzes')
  findQuizzesByLesson(@Param('lessonId') lessonId: string) {
    return this.lessonsService.findQuizzesByLesson(lessonId);
  }

  @Get('quizzes/:id')
  findQuiz(@Param('id') id: string) {
    return this.lessonsService.findQuizById(id);
  }

  @Put('quizzes/:id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  updateQuiz(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateQuizDto: UpdateQuizDto,
  ) {
    return this.lessonsService.updateQuiz(id, user.id, updateQuizDto);
  }

  @Delete('quizzes/:id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async deleteQuiz(@Param('id') id: string, @CurrentUser() user: User) {
    await this.lessonsService.deleteQuiz(id, user.id);
    return { message: 'Quiz deleted successfully' };
  }

  @Post('quizzes/:quizId/submit')
  submitQuiz(
    @Param('quizId') quizId: string,
    @CurrentUser() user: User,
    @Body() submitQuizDto: SubmitQuizDto,
  ) {
    return this.lessonsService.submitQuizAttempt(quizId, user.id, submitQuizDto);
  }

  @Get('quizzes/:quizId/attempts')
  getQuizAttempts(@Param('quizId') quizId: string, @CurrentUser() user: User) {
    return this.lessonsService.getQuizAttempts(quizId, user.id);
  }

  @Get('users/me/quiz-attempts')
  getMyQuizAttempts(@CurrentUser() user: User) {
    return this.lessonsService.getUserQuizAttempts(user.id);
  }
}

