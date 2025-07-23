import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Category } from "./category.entity";
import { User } from "./user.entity";
import { TransactionStatus, TransactionType } from "../../types";
import { IsString, Length } from "class-validator";

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number; // Valor na unidade base da moeda, ex.: 10.50 para R$10,50

    @Column({ length: 3, default: 'BRL' })
    @IsString() // Isso devia etar no DTO mas to usando zod para validação
    @Length(3, 3) // Isso devia etar no DTO mas to usando zod para validação também
    currency: string; // Código ISO 4217, ex.: 'BRL', 'USD', 'EUR'

    @Column({ nullable: true })
    dueDate: Date;

    @Column({ nullable: true })
    paymentDate: Date;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
        nullable: true,
    })
    status: TransactionStatus;

    @Column({
        type: 'enum',
        enum: TransactionType
    })
    type: TransactionType;


    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'uuid', nullable: true })
    categoryId: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.transactions)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Category, (category) => category.transactions)
    @JoinColumn({ name: 'categoryId' })
    category: Category;
}