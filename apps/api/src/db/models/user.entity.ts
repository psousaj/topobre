import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from './transaction.entity';

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
    phoneNumber: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => Transaction, (transaction) => transaction.user)
    transactions: Transaction[];
}