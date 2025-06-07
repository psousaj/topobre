import z from "zod";
import { TransactionType } from "../../types";

export const createTransactionSchema = z.object({
    valueInCents: z.number().positive('Valor deve ser positivo'),
    dueDate: z.string().refine(date => new Date(date) < new Date(), {
        message: 'Vencimento deve ser uma data futura',
    }).or(z.date()),
    description: z.string().min(3, 'Descrição deve ter ao menos 3 caracteres'),
    type: z.nativeEnum(TransactionType, {
        errorMap: () => ({ message: 'Tipo da transação deve ser [\'INCOME\', \'EXPENSE\', \'TRANSFER\', \'PAYMENT\', \'RECEIPT\']' }),
    }),
    categoryId: z.string().uuid(),
})

export const transactionSchema = z.object({
    id: z.string().uuid(),
    valueInCents: z.number().positive('Valor deve ser positivo'),
    dueDate: z.string().refine(date => new Date(date) < new Date(), {
        message: 'Vencimento deve ser uma data futura',
    }).or(z.date()),
    description: z.string().min(3, 'Descrição deve ter ao menos 3 caracteres'),
    type: z.nativeEnum(TransactionType, {
        errorMap: () => ({ message: 'Tipo da transação deve ser [\'INCOME\', \'EXPENSE\', \'TRANSFER\', \'PAYMENT\', \'RECEIPT\']' }),
    }),
    userId: z.string(),
    categoryId: z.string().uuid(),
})
