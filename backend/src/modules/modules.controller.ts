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
import { ModulesService } from './modules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole, CreateModuleDto } from '@edtech/shared';
import { User } from '../users/entities/user.entity';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post('courses/:courseId/modules')
  create(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
    @Body() createModuleDto: CreateModuleDto,
  ) {
    return this.modulesService.create(courseId, user.id, createModuleDto);
  }

  @Get('courses/:courseId/modules')
  findByCourse(@Param('courseId') courseId: string) {
    return this.modulesService.findByCourse(courseId);
  }

  @Get('modules/:id')
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Put('modules/:id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateData: Partial<CreateModuleDto>,
  ) {
    return this.modulesService.update(id, user.id, updateData);
  }

  @Delete('modules/:id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.modulesService.remove(id, user.id);
    return { message: 'Module deleted successfully' };
  }
}

