import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AIRequest } from './ai-request.entity';

@Entity('ai_responses')
export class AIResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'request_id' })
  requestId: string;

  @Column({ type: 'jsonb', name: 'output_data' })
  outputData: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'float', nullable: true, name: 'confidence_score' })
  confidenceScore: number;

  @Column('text')
  explanation: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => AIRequest, (request) => request.responses)
  @JoinColumn({ name: 'request_id' })
  request: AIRequest;
}

