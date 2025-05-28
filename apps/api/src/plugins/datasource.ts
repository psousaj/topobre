import 'reflect-metadata';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { Repository, EntityTarget } from 'typeorm';
import { AppDataSource } from '../db';
import { DatabaseService } from '../types'

export default fp(async (app: FastifyInstance, opts) => {
    try {
        // Inicializa o DataSource
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            app.log.info("📦 Banco de dados conectado");
        }

        // Cria o serviço de banco com métodos utilitários
        const databaseService: DatabaseService = {
            dataSource: AppDataSource,

            // Método para pegar repositórios
            getRepository<T>(entity: EntityTarget<T>): Repository<T> {
                return AppDataSource.getRepository(entity);
            },

            // Verifica se está conectado
            isConnected(): boolean {
                return AppDataSource.isInitialized;
            },

            // Método para transações
            async transaction<T>(fn: (manager: any) => Promise<T>): Promise<T> {
                return await AppDataSource.transaction(fn);
            }
        };

        // Decora a instância do Fastify
        app.decorate('db', databaseService);

        // Hook para fechar a conexão
        app.addHook('onClose', async (instance) => {
            if (AppDataSource.isInitialized) {
                await AppDataSource.destroy();
                instance.log.info("🔌 Conexão com banco fechada");
            }
        });

    } catch (error) {
        app.log.error("❌ Erro ao conectar ao banco de dados:", error);
        throw error;
    }
});