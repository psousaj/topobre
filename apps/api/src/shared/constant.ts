import { Category } from "../db/models/category.entity."
import { Transaction } from "../db/models/transaction.entity"
import { User } from "../db/models/user.entity"

export const TAGS = {
    DB: 'DB',
}

export const REPOSITORIES = {
    USER: User,
    CATEGORY: Category,
    TRANSACTION: Transaction,
}

export const SALT_ROUNDS = 10