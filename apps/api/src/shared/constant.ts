import { PasswordResetToken } from "../db/entities/password-reset.entity";
import { Category } from "../db/entities/category.entity"
import { Session } from "../db/entities/session.entity"
import { Transaction } from "../db/entities/transaction.entity"
import { User } from "../db/entities/user.entity"

export const TAGS = {
    DB: 'DB',
};

export const REPOSITORIES = {
    USER: User,
    SESSION: Session,
    TRANSACTION: Transaction,
    CATEGORY: Category,
    PASSWORD_RESET_TOKEN: PasswordResetToken,
} as const;

export const SALT_ROUNDS = 10;