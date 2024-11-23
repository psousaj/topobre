type Transaction = {
    id: number
    dueDate: string
    description: string
    categoryId: string
    category: Category
    transactionValue: number
    transactionType: 'payment' | 'receipt'
}

type Category = {
    id: string
    name: string
    color: string
    isDefault: boolean
}

export type { Transaction, Category }