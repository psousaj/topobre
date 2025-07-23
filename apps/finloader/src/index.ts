import { logger } from '@topobre/winston';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import currency from 'currency.js';

export enum BankType {
    NUBANK = 'nubank',
    ITAU = 'itau',
    INTER = 'inter',
    BRADESCO = 'bradesco',
    BANCO_DO_BRASIL = 'banco_do_brasil',
    CAIXA = 'caixa',
    WILLBANK = 'willbank',
    MERCADOPAGO = 'mercado_pago',
    DESCONHECIDO = 'desconhecido',
}

export interface Transaction {
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

function detectDecimalSeparator(value: string): { decimal: string, group: string } {
    const lastComma = value.lastIndexOf(',');
    const lastDot = value.lastIndexOf('.');

    if (lastComma > lastDot) {
        return { decimal: ',', group: '.' }; // Ex: "1.234,56"
    } else if (lastDot > lastComma) {
        return { decimal: '.', group: ',' }; // Ex: "1,234.56"
    } else {
        // Fallback: assume padrão do locale
        return getSeparatorsFromLocale('pt-BR');
    }
}

/**
 * Converte uma string monetária para centavos, baseado no locale
 */
function parseCurrencyToCents(value: string): number {
    if (!value) throw new Error('Valor vazio');

    const cleanedInput = value.replace(/[^\d.,\-]/g, '');

    const { decimal, group } = detectDecimalSeparator(cleanedInput);

    const normalized = cleanedInput
        .replaceAll(group, '')
        .replace(decimal, '.');

    const amount = currency(normalized, { precision: 2 });
    return amount.intValue;
}

function parseSkipLinesByBank(bank: BankType) {
    switch (bank) {
        case BankType.NUBANK:
            return 0;
        case BankType.ITAU:
            return 4;
        case BankType.INTER:
            return 4;
        case BankType.BRADESCO:
            return 4;
        case BankType.BANCO_DO_BRASIL:
            return 4;
        case BankType.CAIXA:
            return 4;
        case BankType.WILLBANK:
            return 4;
        default:
            return 4;
    }
}

export function processTransactionFile(fileContent: string, bank: BankType): Transaction[] {
    const skipedLines = parseSkipLinesByBank(bank)
    let data: any[] = [];

    const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true, skipFirstNLines: skipedLines });
    data = parsed.data as any[];
    
    return data.map(row => parseRowByBank(row, bank));
}

function parseRowByBank(row: any, bank: BankType): Transaction {
    switch (bank) {
        case BankType.NUBANK:
            return {
                date: row['Data'] || row[0],
                description: row['Descrição'] || row[3],
                amount: parseCurrencyToCents(row['Valor'] || row[1]),
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
