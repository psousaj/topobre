// @ts-nocheck

import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Transaction } from "./transaction.entity";

@Entity()
@Unique(["displayName", "userId"])
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    name: string;

    @Column()
    displayName: string;

    @Column()
    color: string;

    @Column({ nullable: true })
    userId: string;

    @Column({ nullable: true, default: false })
    isDefault: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => Transaction, (transaction) => transaction.category)
    transactions: Transaction[];
}