import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ContentVersioningService } from './content-versioning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '@edtech/shared';
import { User } from '../users/entities/user.entity';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentVersioningController {
  constructor(private readonly versioningService: ContentVersioningService) {}

  @Get('lessons/:id/versions')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  findByLesson(@Param('id') lessonId: string) {
    return this.versioningService.findByLesson(lessonId);
  }

  @Post('content-versions/:id/approve')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  approve(@Param('id') id: string, @CurrentUser() user: User) {
    return this.versioningService.approve(id, user.id);
  }

  @Post('content-versions/:id/reject')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  reject(@Param('id') id: string) {
    return this.versioningService.reject(id);
  }
}

