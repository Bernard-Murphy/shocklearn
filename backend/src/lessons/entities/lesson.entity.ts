import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ContentType } from '@edtech/shared';
import { CourseModule } from '../../modules/entities/module.entity';
import { Quiz } from './quiz.entity';
import { LessonProgress } from '../../progress/entities/lesson-progress.entity';
import { ContentVersion } from '../../content-versioning/entities/content-version.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'module_id' })
  moduleId: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: ContentType,
    name: 'content_type',
    default: ContentType.MARKDOWN,
  })
  contentType: ContentType;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ name: 'estimated_duration_minutes' })
  estimatedDurationMinutes: number;

  @Column({ name: 'active_version_id', nullable: true })
  activeVersionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CourseModule, (module) => module.lessons)
  @JoinColumn({ name: 'module_id' })
  module: CourseModule;

  @OneToMany(() => Quiz, (quiz) => quiz.lesson)
  quizzes: Quiz[];

  @OneToMany(() => LessonProgress, (progress) => progress.lesson)
  progress: LessonProgress[];

  @OneToMany(() => ContentVersion, (version) => version.lesson)
  versions: ContentVersion[];
}

