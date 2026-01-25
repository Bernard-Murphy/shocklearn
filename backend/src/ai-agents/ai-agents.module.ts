import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AIAgentsController } from './ai-agents.controller';
import { AIAgentOrchestratorService } from './services/ai-agent-orchestrator.service';
import { LLMClientService } from './services/llm-client.service';
import { CurriculumGeneratorAgent } from './agents/curriculum-generator.agent';
import { QuizGeneratorAgent } from './agents/quiz-generator.agent';
import { RecommendationAgent } from './agents/recommendation.agent';
import { AIRequest } from './entities/ai-request.entity';
import { AIResponse } from './entities/ai-response.entity';
import { ContentVersioningModule } from '../content-versioning/content-versioning.module';
import { LessonsModule } from '../lessons/lessons.module';
import { ModulesModule } from '../modules/modules.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AIRequest, AIResponse]),
    ConfigModule,
    ContentVersioningModule,
    LessonsModule,
    ModulesModule,
    ProgressModule,
  ],
  controllers: [AIAgentsController],
  providers: [
    AIAgentOrchestratorService,
    LLMClientService,
    CurriculumGeneratorAgent,
    QuizGeneratorAgent,
    RecommendationAgent,
  ],
  exports: [AIAgentOrchestratorService],
})
export class AIAgentsModule {}

