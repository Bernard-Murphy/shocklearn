import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentUser } from '../common/decorators';
import { User } from '../users/entities/user.entity';
import { UserRole } from '@edtech/shared';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  enroll(@CurrentUser() user: User, @Body('courseId') courseId: string) {
    return this.enrollmentsService.enroll(user.id, courseId);
  }

  @Get('my-courses')
  findMyEnrollments(@CurrentUser() user: User) {
    return this.enrollmentsService.findByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Get(':id/progress-details')
  getProgressDetails(@Param('id') id: string) {
    return this.enrollmentsService.getEnrollmentProgress(id);
  }

  @Get('courses/:courseId/list')
  getCourseEnrollments(@Param('courseId') courseId: string) {
    return this.enrollmentsService.findByCourse(courseId);
  }
}

