import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Category } from "./category.entity.";
import { User } from "./user.entity";

@Entity()
export class Transaction {

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

    @Column({ nullable: true, enum: TransactionStatus, default: TransactionStatus.PENDING })
    status: TransactionStatus;

    @Column({ enum: TransactionType })
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

    @OneToMany(() => User, (user) => user.transactions)
    user: User;

    @OneToMany(() => Category, (category) => category.transactions)
    category: Category;
}