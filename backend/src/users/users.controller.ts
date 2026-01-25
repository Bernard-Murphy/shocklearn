import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '@edtech/shared';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Put('me')
  async updateCurrentUser(
    @CurrentUser() user: User,
    @Body() updateData: { firstName?: string; lastName?: string },
  ) {
    return this.usersService.update(user.id, updateData);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('stats/overview')
  @Roles(UserRole.ADMIN)
  getUserStats() {
    return this.usersService.getUserStats();
  }
}

