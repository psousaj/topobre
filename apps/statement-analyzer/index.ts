import { logger } from '@topobre/winston';
import { env } from '@topobre/env';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

export enum BankType {
    NUBANK = 'nubank',
    ITAU = 'itau',
    INTER = 'inter',
    BRADESCO = 'bradesco',
    BANCO_DO_BRASIL = 'banco_do_brasil',
    CAIXA = 'caixa',
    DESCONHECIDO = 'desconhecido',
}

export interface Transaction {
    date: string;
    description: string;
    amount: number;
    bank: BankType;
    raw?: any;
}

export function parseStatement(filePath: string, bank: BankType): Transaction[] {
    const ext = filePath.split('.').pop()?.toLowerCase();
    let data: any[] = [];

    if (ext === 'csv') {
        const file = fs.readFileSync(filePath, 'utf8');
        const parsed = Papa.parse(file, { header: true, skipEmptyLines: true });
        data = parsed.data as any[];
    } else if (ext === 'xlsx') {
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(sheet);
    } else {
        throw new Error('Formato de arquivo não suportado');
    }

    return data.map(row => parseRowByBank(row, bank));
}

function parseRowByBank(row: any, bank: BankType): Transaction {
    switch (bank) {
        case BankType.NUBANK:
            return {
                date: row['Data'] || row['data'],
                description: row['Descrição'] || row['descricao'],
                amount: Number(row['Valor'] || row['valor']),
                bank,
                raw: row,
            };
        case BankType.ITAU:
            return {
                date: row['Data Lançamento'] || row['data_lancamento'],
                description: row['Histórico'] || row['historico'],
                amount: Number(row['Valor'] || row['valor']),
                bank,
                raw: row,
            };
        case BankType.INTER:
            return {
                date: row['Data'] || row['data'],
                description: row['Tipo'] || row['tipo'],
                amount: Number(row['Valor'] || row['valor']),
                bank,
                raw: row,
            };
        // Adicione outros bancos aqui
        default:
            return {
                date: row['Data'] || row['data'] || '',
                description: row['Descrição'] || row['descricao'] || '',
                amount: Number(row['Valor'] || row['valor'] || 0),
                bank,
                raw: row,
            };
    }
}

// Exemplo de uso CLI: node index.js caminho/para/arquivo.csv nubank
const [, , filePath, bankParam] = process.argv;
if (!filePath || !bankParam) {
    logger.error('Uso: node index.js <arquivo> <banco>');
    process.exit(1);
}
const bank = BankType[bankParam.toUpperCase() as keyof typeof BankType] || BankType.DESCONHECIDO;
const transactions = parseStatement(filePath, bank);
logger.info(`Transações importadas: ${transactions.length}`);
logger.debug(transactions);
