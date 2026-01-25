import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentVersion } from './entities/content-version.entity';
import { LessonsService } from '../lessons/lessons.service';
import { ContentVersionStatus } from '@edtech/shared';

@Injectable()
export class ContentVersioningService {
  constructor(
    @InjectRepository(ContentVersion)
    private versionsRepository: Repository<ContentVersion>,
    private lessonsService: LessonsService,
  ) {}

  async create(
    lessonId: string,
    authorId: string,
    content: string,
    changeDescription: string,
    aiMetadata?: any,
  ): Promise<ContentVersion> {
    const lesson = await this.lessonsService.findOne(lessonId);

    // Get the latest version number
    const latestVersion = await this.versionsRepository.findOne({
      where: { lessonId },
      order: { versionNumber: 'DESC' },
    });

    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    const version = this.versionsRepository.create({
      lessonId,
      authorId,
      content,
      changeDescription,
      versionNumber,
      status: ContentVersionStatus.PENDING,
      aiMetadata,
    });

    return this.versionsRepository.save(version);
  }

  async findByLesson(lessonId: string): Promise<ContentVersion[]> {
    return this.versionsRepository.find({
      where: { lessonId },
      order: { versionNumber: 'DESC' },
      relations: ['author'],
    });
  }

  async findOne(id: string): Promise<ContentVersion> {
    const version = await this.versionsRepository.findOne({
      where: { id },
      relations: ['author', 'lesson'],
    });

    if (!version) {
      throw new NotFoundException(`Content version with ID ${id} not found`);
    }

    return version;
  }

  async approve(id: string, approverId: string): Promise<ContentVersion> {
    const version = await this.findOne(id);

    version.status = ContentVersionStatus.APPROVED;
    version.approvedAt = new Date();
    version.approvedBy = approverId;

    await this.versionsRepository.save(version);

    // Update the lesson with the approved content
    await this.lessonsService.update(version.lessonId, approverId, {
      content: version.content,
      activeVersionId: version.id,
    });

    return version;
  }

  async reject(id: string): Promise<ContentVersion> {
    const version = await this.findOne(id);
    version.status = ContentVersionStatus.REJECTED;
    return this.versionsRepository.save(version);
  }
}

