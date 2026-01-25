import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Quiz } from './entities/quiz.entity';
import { ModulesService } from '../modules/modules.service';
import { CreateLessonDto } from '@edtech/shared';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonsRepository: Repository<Lesson>,
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
    private modulesService: ModulesService,
  ) {}

  async create(
    moduleId: string,
    userId: string,
    createLessonDto: CreateLessonDto,
  ): Promise<Lesson> {
    const module = await this.modulesService.findOne(moduleId);

    // Check ownership through the course
    const course = await this.modulesService['coursesService'].findOne(module.courseId);
    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only add lessons to your own courses');
    }

    const lesson = this.lessonsRepository.create({
      ...createLessonDto,
      moduleId,
    });

    return this.lessonsRepository.save(lesson);
  }

  async findByModule(moduleId: string): Promise<Lesson[]> {
    return this.lessonsRepository.find({
      where: { moduleId },
      order: { orderIndex: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findOne({
      where: { id },
      relations: ['quizzes'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async update(
    id: string,
    userId: string,
    updateData: Partial<Lesson>,
  ): Promise<Lesson> {
    const lesson = await this.findOne(id);
    const module = await this.modulesService.findOne(lesson.moduleId);
    const course = await this.modulesService['coursesService'].findOne(module.courseId);

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only update lessons in your own courses');
    }

    Object.assign(lesson, updateData);
    return this.lessonsRepository.save(lesson);
  }

  async remove(id: string, userId: string): Promise<void> {
    const lesson = await this.findOne(id);
    const module = await this.modulesService.findOne(lesson.moduleId);
    const course = await this.modulesService['coursesService'].findOne(module.courseId);

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only delete lessons from your own courses');
    }

    await this.lessonsRepository.delete(id);
  }

  async createQuiz(lessonId: string, quizData: Partial<Quiz>): Promise<Quiz> {
    const lesson = await this.findOne(lessonId);
    const quiz = this.quizzesRepository.create({
      ...quizData,
      lessonId: lesson.id,
    });

    return this.quizzesRepository.save(quiz);
  }

  async findQuizzesByLesson(lessonId: string): Promise<Quiz[]> {
    return this.quizzesRepository.find({
      where: { lessonId },
    });
  }
}

