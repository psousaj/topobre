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

async function getCategoriesFromIA(
  transactions: { description: string }[],
  userCategories: Category[]
): Promise<(string | null)[]> {
  if (!userCategories || userCategories.length === 0) {
    logger.warn('[CSV-WORKER] User has no categories, skipping IA categorization.');
    return Array(transactions.length).fill(null);
  }

  const categoryList = userCategories.map(c => `ID: "${c.id}", Nome: "${c.displayName}"`).join('\n');

  const txList = transactions
    .map((tx, index) => `${index + 1}. "${tx.description}"`)
    .join('\n');

  const prompt = `
Você é um assistente de finanças pessoais. Sua tarefa é categorizar múltiplas transações bancárias com base em suas descrições.
Use **apenas os IDs** das categorias abaixo para classificar.

Categorias disponíveis:
${categoryList}

Transações:
${txList}

Retorne uma lista com apenas os IDs das categorias, uma por linha, na ordem das transações acima.
Se não houver categoria apropriada, retorne "null" para aquela linha.

Exemplo de resposta:
categ-id-1
categ-id-2
null
...

Responda agora:
  `;

  try {
    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    const lines = response.text().trim().split('\n').map(l => l.trim().replace(/"/g, ''));

    return lines.map((id) =>
      userCategories.some(c => c.id === id) ? id : null
    );
  } catch (error) {
    logger.error('[CSV-WORKER] Error calling Gemini API:', error);
    return Array(transactions.length).fill(null);
  }
}

logger.info('[CSV-WORKER] Worker starting...');

TopobreDataSource.initialize()
  .then(() => {
    logger.info('[TYPEORM] Database connection established.');

    const worker = new Worker(
      FINLOADER_QUEUE_NAME,
      async (job) => {
        const { fileContent, userId, bank } = job.data;
        logger.info(`[CSV-WORKER]::[JOB ${job.id}] Starting processing for user ${userId}`);

        try {
          // 1. Buscar as categorias do usuário
          const categoryRepository = TopobreDataSource.getRepository(Category);
          const userCategories = await categoryRepository.find({ where: { userId } });

          // 2. Processar o arquivo
          const transactions = processTransactionFile(fileContent, bank as BankType);
          const recordRepository = TopobreDataSource.getRepository(FinancialRecord);

          // 3. Processar cada transação com a IA
          const categoryIds = await getCategoriesFromIA(transactions, userCategories);

          for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            const categoryId = categoryIds[i] ?? undefined;

            const newRecord = recordRepository.create({
              description: tx.description,
              valueInCents: tx.amount,
              dueDate: new Date(tx.date),
              user: { id: userId },
              category: { id: categoryId },
            });

            await recordRepository.save(newRecord);
          }

          logger.info(`[CSV-WORKER]::[JOB ${job.id}] Processing complete. ${transactions.length} transactions saved.`);
        } catch (error) {
          logger.error(`[CSV-WORKER]::[JOB ${job.id}] Processing failed:`, error);
          throw error;
        }
      },
      { connection: redisConnection }
    );

    worker.on('completed', (job) => {
      logger.info(`[CSV-WORKER] Job ${job.id} has completed!`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`[CSV-WORKER] Job ${job?.id} has failed with ${err.message}`);
    });
  })
  .catch((error) => logger.error('[CSV-WORKER] Error initializing worker:', error));
