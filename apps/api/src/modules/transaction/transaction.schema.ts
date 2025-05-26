import z from "zod";
import { categorySchema } from "../category/category.schema";
import { TransactionType } from "../../types";

export const transactionSchema = z.object({
    id: z.string().uuid(),
    transactionValue: z.number().positive('Valor deve ser positivo'),
    dueDate: z.string().refine(date => new Date(date) < new Date(), {
        message: 'Vencimento deve ser uma data futura',
    }).or(z.date()),
    description: z.string().min(3, 'Descrição deve ter ao menos 3 caracteres'),
    transactionType: z.nativeEnum(TransactionType, {
        errorMap: () => ({ message: 'Tipo deve ser payment ou receipt' }),
    }),
    userId: z.string().optional(),
    categoryId: z.string().cuid(),
    category: categorySchema.optional(),
})
