import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AIAgentOrchestratorService } from './services/ai-agent-orchestrator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole, GenerateCurriculumDto, GenerateQuizDto } from '@edtech/shared';
import { User } from '../users/entities/user.entity';

@Controller('ai-agents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AIAgentsController {
  constructor(private readonly orchestrator: AIAgentOrchestratorService) {}

  @Post('generate-curriculum')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async generateCurriculum(
    @CurrentUser() user: User,
    @Body() input: GenerateCurriculumDto,
  ) {
    const result = await this.orchestrator.generateCurriculum(user.id, input);
    return {
      requestId: result.request.id,
      curriculum: result.curriculum,
      reasoning: result.curriculum.reasoning,
    };
  }

  @Post('generate-quiz')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async generateQuiz(@CurrentUser() user: User, @Body() input: GenerateQuizDto) {
    const result = await this.orchestrator.generateQuiz(user.id, input);
    return {
      requestId: result.request.id,
      quiz: result.quiz,
      reasoning: result.quiz.reasoning,
    };
  }

  @Get('recommendations')
  async getRecommendations(@CurrentUser() user: User, @Body('enrollmentId') enrollmentId: string) {
    const result = await this.orchestrator.generateRecommendations(user.id, enrollmentId);
    return {
      requestId: result.request.id,
      recommendations: result.recommendations,
      reasoning: result.recommendations.reasoning,
    };
  }

  @Get('requests/:id')
  getRequestStatus(@Param('id') id: string) {
    return this.orchestrator.getRequestStatus(id);
  }
}

