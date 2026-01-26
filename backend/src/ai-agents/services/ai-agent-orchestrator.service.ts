import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIRequest } from '../entities/ai-request.entity';
import { AIResponse } from '../entities/ai-response.entity';
import { CurriculumGeneratorAgent } from '../agents/curriculum-generator.agent';
import { QuizGeneratorAgent } from '../agents/quiz-generator.agent';
import { RecommendationAgent } from '../agents/recommendation.agent';
import { ContentVersioningService } from '../../content-versioning/content-versioning.service';
import { ModulesService } from '../../modules/modules.service';
import { LessonsService } from '../../lessons/lessons.service';
import {
  AgentType,
  AIRequestStatus,
  GenerateCurriculumDto,
  GenerateQuizDto,
  ApplyCurriculumDto,
  ApplyQuizDto,
  CurriculumOutput,
  QuizOutput,
  RecommendationOutput,
  ContentType,
} from '@edtech/shared';

@Injectable()
export class AIAgentOrchestratorService {
  constructor(
    @InjectRepository(AIRequest)
    private requestsRepository: Repository<AIRequest>,
    @InjectRepository(AIResponse)
    private responsesRepository: Repository<AIResponse>,
    private curriculumAgent: CurriculumGeneratorAgent,
    private quizAgent: QuizGeneratorAgent,
    private recommendationAgent: RecommendationAgent,
    private versioningService: ContentVersioningService,
    private modulesService: ModulesService,
    private lessonsService: LessonsService,
  ) {}

  async generateCurriculum(
    userId: string,
    input: GenerateCurriculumDto,
  ): Promise<{ request: AIRequest; response: AIResponse; curriculum: CurriculumOutput }> {
    // Create request record
    const request = await this.createRequest(userId, AgentType.CURRICULUM_GENERATOR, input);

    try {
      // Update status to processing
      request.status = AIRequestStatus.PROCESSING;
      await this.requestsRepository.save(request);

      // Generate curriculum
      const curriculum = await this.curriculumAgent.generate(input);

      // Create response record
      const response = await this.createResponse(
        request.id,
        curriculum,
        curriculum.reasoning,
        0.85,
      );

      // Update request as completed
      request.status = AIRequestStatus.COMPLETED;
      request.reasoning = curriculum.reasoning;
      request.completedAt = new Date();
      await this.requestsRepository.save(request);

      return { request, response, curriculum };
    } catch (error) {
      request.status = AIRequestStatus.FAILED;
      request.reasoning = error.message;
      await this.requestsRepository.save(request);
      throw error;
    }
  }

  async generateQuiz(
    userId: string,
    input: GenerateQuizDto,
  ): Promise<{ request: AIRequest; response: AIResponse; quiz: QuizOutput }> {
    // Fetch lesson title for context
    const lesson = await this.lessonsService.findOne(input.lessonId);
    input.lessonTitle = lesson.title;

    const request = await this.createRequest(userId, AgentType.QUIZ_GENERATOR, input);

    try {
      request.status = AIRequestStatus.PROCESSING;
      await this.requestsRepository.save(request);

      const quiz = await this.quizAgent.generate(input);

      const response = await this.createResponse(request.id, quiz, quiz.reasoning, 0.9);

      request.status = AIRequestStatus.COMPLETED;
      request.reasoning = quiz.reasoning;
      request.completedAt = new Date();
      await this.requestsRepository.save(request);

      return { request, response, quiz };
    } catch (error) {
      request.status = AIRequestStatus.FAILED;
      request.reasoning = error.message;
      await this.requestsRepository.save(request);
      throw error;
    }
  }

  async generateRecommendations(
    userId: string,
    enrollmentId: string,
  ): Promise<{ request: AIRequest; response: AIResponse; recommendations: RecommendationOutput }> {
    const request = await this.createRequest(userId, AgentType.RECOMMENDATION, {
      enrollmentId,
    });

    try {
      request.status = AIRequestStatus.PROCESSING;
      await this.requestsRepository.save(request);

      const recommendations = await this.recommendationAgent.generate(enrollmentId);

      const response = await this.createResponse(
        request.id,
        recommendations,
        recommendations.reasoning,
        0.8,
      );

      request.status = AIRequestStatus.COMPLETED;
      request.reasoning = recommendations.reasoning;
      request.completedAt = new Date();
      await this.requestsRepository.save(request);

      return { request, response, recommendations };
    } catch (error) {
      request.status = AIRequestStatus.FAILED;
      request.reasoning = error.message;
      await this.requestsRepository.save(request);
      throw error;
    }
  }

  async applyCurriculum(userId: string, dto: ApplyCurriculumDto): Promise<void> {
    const { courseId, curriculum } = dto;

    for (let i = 0; i < curriculum.modules.length; i++) {
      const moduleData = curriculum.modules[i];
      const module = await this.modulesService.create(courseId, userId, {
        title: moduleData.title,
        description: moduleData.description,
        orderIndex: i + 1,
      });

      for (let j = 0; j < moduleData.lessons.length; j++) {
        const lessonData = moduleData.lessons[j];
        await this.lessonsService.create(module.id, userId, {
          title: lessonData.title,
          content: lessonData.content,
          contentType: ContentType.MARKDOWN,
          orderIndex: j + 1,
          estimatedDurationMinutes: lessonData.estimatedDuration || 15,
        });
      }
    }
  }

  async applyQuiz(userId: string, dto: ApplyQuizDto): Promise<void> {
    const { lessonId, quiz } = dto;

    // Apply generated lesson content
    if (quiz.lessonContent) {
      await this.lessonsService.update(lessonId, userId, {
        content: quiz.lessonContent,
      });
    }

    await this.lessonsService.createQuiz(lessonId, userId, {
      title: 'Generated Quiz',
      questions: quiz.questions,
      passingScore: 80,
    });
  }

  async getRequestStatus(id: string): Promise<AIRequest | null> {
    return this.requestsRepository.findOne({
      where: { id },
      relations: ['responses'],
    });
  }

  private async createRequest(
    userId: string,
    agentType: AgentType,
    inputData: any,
  ): Promise<AIRequest> {
    const request = this.requestsRepository.create({
      userId,
      agentType,
      inputData,
      status: AIRequestStatus.PENDING,
    });

    return this.requestsRepository.save(request);
  }

  private async createResponse(
    requestId: string,
    outputData: any,
    explanation: string,
    confidenceScore: number,
  ): Promise<AIResponse> {
    const response = this.responsesRepository.create({
      requestId,
      outputData,
      explanation,
      confidenceScore,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

    return this.responsesRepository.save(response);
  }
}

