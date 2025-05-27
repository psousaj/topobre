import { Category } from "../db/entities/category.entity."
import { Session } from "../db/entities/session.entity"
import { Transaction } from "../db/entities/transaction.entity"
import { User } from "../db/entities/user.entity"

export const TAGS = {
    DB: 'DB',
}

export const REPOSITORIES = {
    USER: User,
    CATEGORY: Category,
    TRANSACTION: Transaction,
    SESSION: Session
}

export const SALT_ROUNDS = 10