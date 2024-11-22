type Transaction = {
    id: number
    valor: number
    dataVencimento: string
    descricao: string
    categoria: string
    repeteMensalmente: boolean
    tipo: 'payment' | 'receipt'
}

type Category = {
    name: string
    color: string
}

export type { Transaction, Category }