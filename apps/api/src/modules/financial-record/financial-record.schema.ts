import z from "zod";
import { TransactionStatus, TransactionType } from "../../types";
import currency from "currency.js";

export const createTransactionSchema = z.object({
    amount: z.number()
        .positive('Valor deve ser positivo')
        .refine((val) => {
            const decimalPlaces = val.toString().split('.')[1]?.length || 0;
            return decimalPlaces <= 2;
        }, {
            message: 'Valor deve ter no máximo 2 casas decimais',
        })
        .transform((val) => Number(val.toFixed(2))), // Adiciona .00 se não houver decimais
    dueDate: z.date()
        .refine((date) => date > new Date(), {
            message: 'Vencimento deve ser uma data futura',
        }),
    description: z.string()
        .min(3, 'Descrição deve ter ao menos 3 caracteres'),
    type: z.nativeEnum(TransactionType, {
        errorMap: (issue, ctx) => {
            const allowedTypes = Object.keys(TransactionType).join(', ');
            return { message: `Tipo da transação deve ser um dos seguintes: [${allowedTypes}]` };
        },
    }),
    categoryId: z.string()
        .uuid('Categoria deve ser um UUID válido'),
    currency: z.string()
        .length(3, 'Moeda deve ser um código de 3 letras (ex.: BRL, USD)')
        .default('BRL'),
    status: z.nativeEnum(TransactionStatus)
        .optional(),
    paymentDate: z.date()
        .optional(),
});
export const transactionSchema = z.object({
    id: z.string().uuid(),
    amount: z.number().positive('Valor deve ser positivo'),
    dueDate: z.string().refine(date => new Date(date) < new Date(), {
        message: 'Vencimento deve ser uma data futura',
    }).or(z.date()),
    description: z.string().min(3, 'Descrição deve ter ao menos 3 caracteres'),
    type: z.nativeEnum(TransactionType, {
        errorMap: () => ({ message: 'Tipo da transação deve ser [\'INCOME\', \'EXPENSE\', \'TRANSFER\', \'PAYMENT\', \'RECEIPT\']' }),
    }),
    currency: z.string(),
    userId: z.string(),
    categoryId: z.string().uuid(),
})
