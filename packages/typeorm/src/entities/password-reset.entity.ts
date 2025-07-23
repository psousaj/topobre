// @ts-nocheck

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class PasswordResetToken {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    userId: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User;

    @Column({ unique: true })
    token: string;

    @Column()
    expiresAt: Date;

    @Column({ default: false })
    used: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
