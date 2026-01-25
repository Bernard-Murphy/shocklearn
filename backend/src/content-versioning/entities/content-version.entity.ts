import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContentVersionStatus } from '@edtech/shared';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { User } from '../../users/entities/user.entity';

@Entity('content_versions')
export class ContentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @Column({ name: 'version_number' })
  versionNumber: number;

  @Column('text')
  content: string;

  @Column('text', { name: 'change_description' })
  changeDescription: string;

  @Column({
    type: 'enum',
    enum: ContentVersionStatus,
    default: ContentVersionStatus.PENDING,
  })
  status: ContentVersionStatus;

  @Column({ type: 'jsonb', nullable: true, name: 'ai_metadata' })
  aiMetadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.versions)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  approver: User;
}

