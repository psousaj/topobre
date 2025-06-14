import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('users-mapping')
@Index('IDX_USERS_MAPPING_AUTH_ID', ['authId', 'email'], { unique: true })
export class UserMapping {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    authId: string;

    @Column({ nullable: false })
    email: string;
}