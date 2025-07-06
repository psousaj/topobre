// @ts-nocheck

import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Session } from './session.entity';
import { FinancialRecord } from './financial-record.entity';

export enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

@Entity('users')
@Index('idx_user_email', ['email'], { unique: true })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    phone: string;

    @Column({
        type: 'enum',
        enum: Role,
        array: true,
        default: [Role.USER],
    })
    roles: Role[];

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => FinancialRecord, (financialRecord) => financialRecord.user)
    financialRecords: FinancialRecord[];

    @OneToMany(() => Session, (session) => session.user)
    sessions: Session[];
}