// @ts-nocheck

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
@Index('IDX_SESSIONS_JTI', ['jti'], { unique: true })
@Index('IDX_SESSIONS_USER_IP_UA_ACTIVE', ['userId', 'ip', 'userAgent', 'isActive'])
@Index('IDX_SESSIONS_EXPIRES_AT', ['expiresAt'])
export class Session {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    jti: string;

    @Column()
    refreshToken: string;

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