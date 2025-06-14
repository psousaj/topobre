import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { FinancialRecord } from "./financial-record.entity";

@Entity()
@Unique(["displayName", "profileId"])
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
    profileId: string;

    @Column({ nullable: true, default: false })
    isDefault: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => FinancialRecord, (financialRecord) => financialRecord.category)
    financialRecords: FinancialRecord[];
}