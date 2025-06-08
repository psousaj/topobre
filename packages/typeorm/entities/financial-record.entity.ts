import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Category } from "./category.entity";
import { User } from "./user.entity";
import { TransactionStatus, TransactionType } from "@topobre/typeorm/types";

@Entity()
export class FinancialRecord {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    valueInCents: number;

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

    // isRecurrent: boolean;

    // recurrence: {
    //     frequency: string;
    //     interval: number;
    //     endDate: Date;
    // };

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;


    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'uuid' })
    categoryId: string;

    @ManyToOne(() => User, (user) => user.transactions)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Category, (category) => category.transactions)
    @JoinColumn({ name: 'categoryId' })
    category: Category;
}