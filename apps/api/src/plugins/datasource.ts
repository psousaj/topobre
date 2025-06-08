import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { DatabaseService } from '../types'
import { TopobreDataSource, EntityTarget, Repository, ObjectLiteral } from '@topobre/typeorm'

export default fp(async (app: FastifyInstance, opts) => {
    try {
        // Inicializa o DataSource
        if (!TopobreDataSource.isInitialized) {
            await TopobreDataSource.initialize();
            app.log.info("📦 Banco de dados conectado");
        }

        // Cria o serviço de banco com métodos utilitários
        const databaseService: DatabaseService = {
            dataSource: TopobreDataSource,

            // Método para pegar repositórios
            getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
                return TopobreDataSource.getRepository(entity);
            },

            // Verifica se está conectado
            isConnected(): boolean {
                return TopobreDataSource.isInitialized;
            },

            // Método para transações
            async transaction<T>(fn: (manager: any) => Promise<T>): Promise<T> {
                return await TopobreDataSource.transaction(fn);
            }
        };

        // Decora a instância do Fastify
        app.decorate('db', databaseService);

        // Hook para fechar a conexão
        app.addHook('onClose', async (instance) => {
            if (TopobreDataSource.isInitialized) {
                await TopobreDataSource.destroy();
                instance.log.info("🔌 Conexão com banco fechada");
            }
        });

    } catch (error) {
        app.log.error("❌ Erro ao conectar ao banco de dados:", error);
        throw error;
    }
});