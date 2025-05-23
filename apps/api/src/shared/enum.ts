enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    LATE = 'late',
    FAILED = 'failed',
}

enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
    TRANSFER = 'transfer',
    PAYMENT = 'payment',
    RECEIPT = 'receipt',
}

export { TransactionStatus, TransactionType }