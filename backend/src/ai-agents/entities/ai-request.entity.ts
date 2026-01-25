import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AgentType, AIRequestStatus } from '@edtech/shared';
import { User } from '../../users/entities/user.entity';
import { AIResponse } from './ai-response.entity';

@Entity('ai_requests')
export class AIRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: AgentType,
    name: 'agent_type',
  })
  agentType: AgentType;

  @Column({ type: 'jsonb', name: 'input_data' })
  inputData: any;

  @Column({
    type: 'enum',
    enum: AIRequestStatus,
    default: AIRequestStatus.PENDING,
  })
  status: AIRequestStatus;

  @Column('text', { nullable: true })
  reasoning: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => AIResponse, (response) => response.request)
  responses: AIResponse[];
}

