"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv = __importStar(require("dotenv"));
const result = dotenv.config();
if (result.error) {
    console.error('❌ Erro ao carregar o arquivo .env:', result.error);
    throw new Error('Arquivo .env não encontrado ou inválido.');
}
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string(),
    CLERK_SECRET_KEY: zod_1.z.string(),
    CLERK_PUBLISHABLE_KEY: zod_1.z.string(),
    PORT: zod_1.z.string().transform(Number).default('3001'),
    HOST: zod_1.z.string().default('0.0.0.0'),
});
const _env = envSchema.safeParse(process.env);
// Verifica se as variáveis de ambiente são válidas
if (!_env.success) {
    console.error('❌ Variáveis de ambiente inválidas:', _env.error.format());
    throw new Error('Variáveis de ambiente inválidas.');
}
exports.env = _env.data;
