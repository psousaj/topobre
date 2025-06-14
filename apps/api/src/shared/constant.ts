import { Category, PasswordResetToken, Session, FinancialRecord, User, Profile, UserMapping } from "@topobre/typeorm/entities";

export const TAGS = {
    DB: 'DB',
};

export const REPOSITORIES = {
    USER: User,
    SESSION: Session,
    FINANCIALRECORD: FinancialRecord,
    CATEGORY: Category,
    PASSWORD_RESET_TOKEN: PasswordResetToken,
    PROFILE: Profile,
    USER_MAPPING: UserMapping
} as const;

export const SALT_ROUNDS = 10;