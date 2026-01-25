import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Quiz } from './entities/quiz.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { ModulesService } from '../modules/modules.service';
import { CreateLessonDto, CreateQuizDto, UpdateQuizDto, SubmitQuizDto, QuizResultDto, QuizQuestion } from '@edtech/shared';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonsRepository: Repository<Lesson>,
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
    @InjectRepository(QuizAttempt)
    private quizAttemptsRepository: Repository<QuizAttempt>,
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

  async createQuiz(lessonId: string, userId: string, quizData: CreateQuizDto): Promise<Quiz> {
    const lesson = await this.findOne(lessonId);
    const module = await this.modulesService.findOne(lesson.moduleId);
    const course = await this.modulesService['coursesService'].findOne(module.courseId);

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only create quizzes for your own courses');
    }

    const quiz = this.quizzesRepository.create({
      title: quizData.title,
      questions: quizData.questions,
      correctAnswers: this.extractCorrectAnswers(quizData.questions),
      passingScore: quizData.passingScore,
      lessonId: lesson.id,
    });

    return this.quizzesRepository.save(quiz);
  }

  async findQuizzesByLesson(lessonId: string): Promise<Quiz[]> {
    return this.quizzesRepository.find({
      where: { lessonId },
    });
  }

  async findQuizById(id: string): Promise<Quiz> {
    const quiz = await this.quizzesRepository.findOne({
      where: { id },
      relations: ['lesson'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async updateQuiz(id: string, userId: string, updateData: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findQuizById(id);
    const lesson = await this.findOne(quiz.lessonId);
    const module = await this.modulesService.findOne(lesson.moduleId);
    const course = await this.modulesService['coursesService'].findOne(module.courseId);

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only update quizzes in your own courses');
    }

    if (updateData.questions) {
      quiz.correctAnswers = this.extractCorrectAnswers(updateData.questions);
    }

    Object.assign(quiz, updateData);
    return this.quizzesRepository.save(quiz);
  }

  async deleteQuiz(id: string, userId: string): Promise<void> {
    const quiz = await this.findQuizById(id);
    const lesson = await this.findOne(quiz.lessonId);
    const module = await this.modulesService.findOne(lesson.moduleId);
    const course = await this.modulesService['coursesService'].findOne(module.courseId);

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only delete quizzes from your own courses');
    }

    await this.quizzesRepository.delete(id);
  }

  async submitQuizAttempt(quizId: string, userId: string, submitData: SubmitQuizDto): Promise<QuizResultDto> {
    const quiz = await this.findQuizById(quizId);
    const result = this.gradeQuiz(quiz, submitData.answers);

    const attempt = this.quizAttemptsRepository.create({
      quizId,
      userId,
      answers: submitData.answers,
      score: result.score,
      totalQuestions: result.totalQuestions,
    });

    const savedAttempt = await this.quizAttemptsRepository.save(attempt);

    return {
      ...result,
      attemptId: savedAttempt.id,
    };
  }

  async getQuizAttempts(quizId: string, userId: string): Promise<QuizAttempt[]> {
    return this.quizAttemptsRepository.find({
      where: { quizId, userId },
      order: { attemptedAt: 'DESC' },
    });
  }

  async getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return this.quizAttemptsRepository.find({
      where: { userId },
      relations: ['quiz', 'quiz.lesson'],
      order: { attemptedAt: 'DESC' },
    });
  }

  private extractCorrectAnswers(questions: QuizQuestion[]): Record<string, string | string[]> {
    const correctAnswers: Record<string, string | string[]> = {};
    questions.forEach((q) => {
      correctAnswers[q.id] = q.correctAnswer;
    });
    return correctAnswers;
  }

  private gradeQuiz(quiz: Quiz, answers: Record<string, string>): Omit<QuizResultDto, 'attemptId'> {
    const questions = quiz.questions as QuizQuestion[];
    const correctAnswers = quiz.correctAnswers as Record<string, string | string[]>;
    let correctCount = 0;

    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const correctAnswer = correctAnswers[question.id];

      if (Array.isArray(correctAnswer)) {
        // Multiple correct answers - check if user answer is in array
        if (correctAnswer.includes(userAnswer)) {
          correctCount++;
        }
      } else {
        // Single answer - normalize and compare
        if (userAnswer?.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
          correctCount++;
        }
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= quiz.passingScore;

    return {
      score,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      passed,
      answers,
      correctAnswersMap: correctAnswers,
    };
  }
}

