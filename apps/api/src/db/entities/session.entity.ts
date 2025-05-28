import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
@Index('IDX_SESSIONS_JTI', ['jti'], { unique: true })
export class Session {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    jti: string;

    @Column()
    ip: string;

    @Column()
    userAgent: string;

    @Column()
    expiresAt: Date;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.sessions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;
}