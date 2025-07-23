"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankType = void 0;
exports.processTransactionFile = processTransactionFile;
const papaparse_1 = __importDefault(require("papaparse"));
const currency_js_1 = __importDefault(require("currency.js"));
var BankType;
(function (BankType) {
    BankType["NUBANK"] = "nubank";
    BankType["ITAU"] = "itau";
    BankType["INTER"] = "inter";
    BankType["BRADESCO"] = "bradesco";
    BankType["BANCO_DO_BRASIL"] = "banco_do_brasil";
    BankType["CAIXA"] = "caixa";
    BankType["WILLBANK"] = "willbank";
    BankType["MERCADOPAGO"] = "mercado_pago";
    BankType["DESCONHECIDO"] = "desconhecido";
})(BankType || (exports.BankType = BankType = {}));
/**
 * Mapeia locale para separadores usados
 */
function getSeparatorsFromLocale(locale) {
    const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
    const group = parts.find(p => p.type === 'group')?.value || ',';
    const decimal = parts.find(p => p.type === 'decimal')?.value || '.';
    return { group, decimal };
}
function detectDecimalSeparator(value) {
    const lastComma = value.lastIndexOf(',');
    const lastDot = value.lastIndexOf('.');
    if (lastComma > lastDot) {
        return { decimal: ',', group: '.' }; // Ex: "1.234,56"
    }
    else if (lastDot > lastComma) {
        return { decimal: '.', group: ',' }; // Ex: "1,234.56"
    }
    else {
        // Fallback: assume padrão do locale
        return getSeparatorsFromLocale('pt-BR');
    }
}
/**
 * Converte uma string monetária para centavos, baseado no locale
 */
function parseCurrencyToCents(value) {
    if (!value)
        throw new Error('Valor vazio');
    const cleanedInput = value.replace(/[^\d.,\-]/g, '');
    const { decimal, group } = detectDecimalSeparator(cleanedInput);
    const normalized = cleanedInput
        .replaceAll(group, '')
        .replace(decimal, '.');
    const amount = (0, currency_js_1.default)(normalized, { precision: 2 });
    return amount.intValue;
}
function parseSkipLinesByBank(bank) {
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
function processTransactionFile(fileContent, bank) {
    const skipedLines = parseSkipLinesByBank(bank);
    let data = [];
    const parsed = papaparse_1.default.parse(fileContent, { header: true, skipEmptyLines: true, skipFirstNLines: skipedLines });
    data = parsed.data;
    return data.map(row => parseRowByBank(row, bank));
}
function parseRowByBank(row, bank) {
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
//# sourceMappingURL=index.js.map