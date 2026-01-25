import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { User } from '../../users/entities/user.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quiz_id' })
  quizId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'jsonb' })
  answers: any;

  @Column()
  score: number;

  @Column({ name: 'total_questions' })
  totalQuestions: number;

  @CreateDateColumn({ name: 'attempted_at' })
  attemptedAt: Date;

  @ManyToOne(() => Quiz, (quiz) => quiz.attempts)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

