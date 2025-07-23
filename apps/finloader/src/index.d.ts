export declare enum BankType {
    NUBANK = "nubank",
    ITAU = "itau",
    INTER = "inter",
    BRADESCO = "bradesco",
    BANCO_DO_BRASIL = "banco_do_brasil",
    CAIXA = "caixa",
    WILLBANK = "willbank",
    MERCADOPAGO = "mercado_pago",
    DESCONHECIDO = "desconhecido"
}
export interface Transaction {
    date: string;
    description: string;
    amount: number;
    balance?: number;
    bank: BankType;
    raw?: any;
}
export declare function processTransactionFile(fileContent: string, bank: BankType): Transaction[];
//# sourceMappingURL=index.d.ts.map