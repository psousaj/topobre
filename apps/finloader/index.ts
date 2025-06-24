import { logger } from '@topobre/winston';
import { env } from '@topobre/env';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import currency from 'currency.js';

enum BankType {
    NUBANK = 'nubank',
    ITAU = 'itau',
    INTER = 'inter',
    BRADESCO = 'bradesco',
    BANCO_DO_BRASIL = 'banco_do_brasil',
    CAIXA = 'caixa',
    DESCONHECIDO = 'desconhecido',
}

interface Transaction {
    date: string;
    description: string;
    amount: number;
    balance?: number;
    bank: BankType;
    raw?: any;
}


/**
 * Mapeia locale para separadores usados
 */
function getSeparatorsFromLocale(locale: string) {
    const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
    const group = parts.find(p => p.type === 'group')?.value || ',';
    const decimal = parts.find(p => p.type === 'decimal')?.value || '.';
    return { group, decimal };
}

/**
 * Converte uma string monetária para centavos, baseado no locale
 */
function parseCurrencyToCents(value: string, locale: string = 'pt-BR'): number {
    const { group, decimal } = getSeparatorsFromLocale(locale);

    const cleaned = value.replace(/[^\d\-\.,]/g, '');

    const normalized = cleaned
        .replaceAll(group, '')
        .replace(decimal, '.');

    const amount = currency(normalized, { precision: 2 });
    return amount.intValue;
}

function parseSkipLinesByBank(bank: BankType) {
    switch (bank) {
        case BankType.NUBANK:
            return 4;
        case BankType.ITAU:
            return 4;
        case BankType.INTER:
            return 5;
        case BankType.BRADESCO:
            return 4;
        case BankType.BANCO_DO_BRASIL:
            return 4;
        case BankType.CAIXA:
            return 4;
        default:
            return 4;
    }
}

function parseStatement(filePath: string, bank: BankType): Transaction[] {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const skipedLines = parseSkipLinesByBank(bank)
    let data: any[] = [];

    if (ext === 'csv') {
        const file = fs.readFileSync(filePath, 'utf8');
        const parsed = Papa.parse(file, { header: false, skipEmptyLines: true, skipFirstNLines: skipedLines });
        data = parsed.data as any[];
    } else if (Array.from(['xlsx', 'xls']).includes(String(ext))) {
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
                date: row['Data Lançamento'] || row[0],
                description: row['Descrição'] || row[1],
                amount: parseCurrencyToCents(row['Valor'] || row[2]),
                balance: parseCurrencyToCents(row['Saldo'] || row[3]),
                bank,
                raw: row,
            };
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

export {
    BankType,
    Transaction,
    parseStatement,
};

const transactions = parseStatement('extrato.csv', BankType.INTER);
console.log(transactions)
// Exemplo de uso CLI: node index.js caminho/para/arquivo.csv nubank
// const [, , filePath, bankParam] = process.argv;
// if (!filePath || !bankParam) {
//     logger.error('Uso: node index.js <arquivo> <banco>');
//     process.exit(1);
// }
// const bank = BankType[bankParam.toUpperCase() as keyof typeof BankType] || BankType.DESCONHECIDO;
// const transactions = parseStatement(filePath, bank);
// logger.info(`Transações importadas: ${transactions.length}`);
// logger.debug(transactions);
