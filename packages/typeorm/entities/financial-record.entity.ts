import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Category } from "./category.entity";
import { TransactionStatus, TransactionType } from "@topobre/typeorm/types";
import { Profile } from "./profile.entity";

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
    profileId: string;

    @Column({ type: 'uuid' })
    categoryId: string;

    @ManyToOne(() => Profile, (profile) => profile.financialRecords)
    @JoinColumn({ name: 'profileId' })
    profile: Profile;

    @ManyToOne(() => Category, (category) => category.financialRecords)
    @JoinColumn({ name: 'categoryId' })
    category: Category;
}