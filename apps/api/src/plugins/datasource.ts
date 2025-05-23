import fp from 'fastify-plugin';
import { AppDataSource } from '../db';

export default fp(async (fastify, opts) => {
    try {
        await AppDataSource.initialize();
        fastify.log.info("📦 Banco de dados conectado");
    } catch (error) {
        fastify.log.error("Erro ao conectar ao banco de dados:", error);
        process.exit(1);
    }
})