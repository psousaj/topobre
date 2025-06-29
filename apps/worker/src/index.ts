import { initTelemetry } from '@topobre/telemetry';
// Inicializa a telemetria ANTES de qualquer outra coisa
initTelemetry('worker');

import { Worker } from 'bullmq';
import { TopobreDataSource } from '@topobre/typeorm';
import { FinancialRecord, Category } from '@topobre/typeorm/entities';
import { processTransactionFile, BankType } from '@topobre/finloader';
import { FINLOADER_QUEUE_NAME, redisConnection } from '@topobre/bullmq';
import { logger } from '@topobre/winston';
import { gemini } from '@topobre/gemini';

async function getCategoryFromIA(transactionDescription: string, userCategories: Category[]): Promise<string | null> {
    if (!userCategories || userCategories.length === 0) {
        logger.warn('User has no categories, skipping IA categorization.');
        return null;
    }

    const categoryList = userCategories.map(c => `ID: "${c.id}", Nome: "${c.displayName}"`).join('\n');

    const prompt = `
        Você é um assistente de finanças pessoais. Sua tarefa é categorizar uma transação bancária com base em sua descrição.
        Analise a seguinte descrição de transação:
        "${transactionDescription}"

        Agora, escolha a categoria MAIS apropriada da lista abaixo e retorne APENAS o ID da categoria escolhida.
        Não retorne nada além do ID.

        Categorias disponíveis:
        ${categoryList}

        ID da Categoria:
    `;

    try {
        const result = await gemini.generateContent(prompt);
        const response = await result.response;
        const categoryId = response.text().trim().replace(/"/g, '');
        
        // Valida se o ID retornado pela IA realmente existe na lista
        if (userCategories.some(c => c.id === categoryId)) {
            return categoryId;
        }
        logger.warn(`IA returned an invalid category ID: ${categoryId}`);
        return null;
    } catch (error) {
        logger.error('Error calling Gemini API:', error);
        return null;
    }
}


logger.info('Worker starting...');

TopobreDataSource.initialize()
  .then(() => {
    logger.info('Database connection established.');

    const worker = new Worker(
      FINLOADER_QUEUE_NAME,
      async (job) => {
        const { fileContent, userId, bank } = job.data;
        logger.info(`[JOB ${job.id}] Starting processing for user ${userId}`);

        try {
          // 1. Buscar as categorias do usuário
          const categoryRepository = TopobreDataSource.getRepository(Category);
          const userCategories = await categoryRepository.find({ where: { profileId: userId } }); // ou userId, dependendo do seu modelo

          // 2. Processar o arquivo
          const transactions = processTransactionFile(fileContent, bank as BankType);
          const recordRepository = TopobreDataSource.getRepository(FinancialRecord);

          // 3. Processar cada transação com a IA
          for (const tx of transactions) {
            const categoryId = await getCategoryFromIA(tx.description, userCategories);

            const newRecord = recordRepository.create({
              description: tx.description,
              valueInCents: tx.amount,
              dueDate: new Date(tx.date),
              user: { id: userId },
              categoryId: categoryId, // Pode ser null se a IA falhar ou não encontrar
              // Outros campos...
            });
            await recordRepository.save(newRecord);
          }

          logger.info(`[JOB ${job.id}] Processing complete. ${transactions.length} transactions saved.`);
        } catch (error) {
          logger.error(`[JOB ${job.id}] Processing failed:`, error);
          throw error;
        }
      },
      { connection: redisConnection }
    );

    worker.on('completed', (job) => {
      logger.info(`Job ${job.id} has completed!`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} has failed with ${err.message}`);
    });
  })
  .catch((error) => logger.error('Error initializing worker:', error));
