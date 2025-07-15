// @ts-nocheck

import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { FinancialRecord } from './transaction.entity';

@Entity('profiles')
@Index('idx_profile_email', ['email'], { unique: true })
@Index('idx_profile_supabase_id', ['supabaseId'], { unique: true })
export class Profile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'supabase_id', unique: true })
    supabaseId: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>; // Para armazenar dados extras do Supabase

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => FinancialRecord, (financialRecord) => financialRecord.profile)
    financialRecords: FinancialRecord[];

    // @OneToMany(() => ProfileRole, (profileRole) => profileRole.profile)
    // profileRoles: ProfileRole[];
}