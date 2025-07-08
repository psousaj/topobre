import { Category, FinancialRecord, PasswordResetToken, Session, User } from "@topobre/typeorm";

export const TAGS = {
    DB: 'DB',
};

export const REPOSITORIES = {
    USER: User,
    SESSION: Session,
    FINANCIALRECORD: FinancialRecord,
    CATEGORY: Category,
    PASSWORD_RESET_TOKEN: PasswordResetToken,
} as const;

export const SALT_ROUNDS = 10;