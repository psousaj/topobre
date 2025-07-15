import { Category, FinancialTransaction, PasswordResetToken, Session, User } from "@topobre/typeorm";

export const TAGS = {
    DB: 'DB',
};

export const REPOSITORIES = {
    USER: User,
    SESSION: Session,
    FINANCIALTRANSACTION: FinancialTransaction,
    CATEGORY: Category,
    PASSWORD_RESET_TOKEN: PasswordResetToken,
} as const;

export const SALT_ROUNDS = 10;