import { Controller, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LessonProgressStatus } from '@edtech/shared';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Put('lessons/:id/progress')
  updateProgress(
    @Param('id') lessonId: string,
    @Body('enrollmentId') enrollmentId: string,
    @Body('status') status: LessonProgressStatus,
    @Body('timeSpentSeconds') timeSpentSeconds?: number,
  ) {
    return this.progressService.updateLessonProgress(
      enrollmentId,
      lessonId,
      status,
      timeSpentSeconds,
    );
  }
}

