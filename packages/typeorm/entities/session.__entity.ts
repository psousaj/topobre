import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('sessions')
@Index('IDX_SESSIONS_JTI', ['jti'], { unique: true })
@Index('IDX_SESSIONS_USER_IP_UA_ACTIVE', ['profileId', 'ip', 'userAgent', 'isActive'])
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

    // @ManyToOne(() => Profile, profile => profile.sessions, { onDelete: 'CASCADE' })
    // @JoinColumn({ name: 'profileId' })
    // profile: Profile;

    @Column()
    userId: string;
}