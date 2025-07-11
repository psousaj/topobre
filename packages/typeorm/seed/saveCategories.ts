import { TopobreDataSource } from "../index";
import { Category } from "../entities/category.entity";
import { logger } from "@topobre/winston";

const categories = [
    { displayName: "Empréstimo", name: "Loan", color: "#FFCC00" },
    { displayName: "Cartoes", name: "Cards", color: "#FF5733" },
    { displayName: "Terreno", name: "Land", color: "#33FF57" },
    { displayName: "Agua", name: "Water", color: "#3399FF" },
    { displayName: "Energia", name: "Energy", color: "#FF33A1" },
    { displayName: "Moradia", name: "Housing", color: "#FF33D4" },
    { displayName: "Outros", name: "Others", color: "#FF8C00" },
    { displayName: "Evento", name: "Event", color: "#8C00FF" },
    { displayName: "Eletronicos", name: "Electronics", color: "#00FF8C" },
    { displayName: "Viagem", name: "Travel", color: "#00A1FF" },
    { displayName: "Roupas", name: "Clothing", color: "#FF00A1" },
    { displayName: "Streams", name: "Streaming", color: "#A100FF" },
    { displayName: "Educação", name: "Education", color: "#00FF00" },
    { displayName: "Saúde", name: "Health", color: "#00FF33" },
    { displayName: "Transporte", name: "Transport", color: "#FF3300" }
];

export async function saveCategories() {
    try {
        logger.info("[TYPEORM] Inicializando datasource...");
        const dataSource = await TopobreDataSource.initialize();
        const categoryRepo = dataSource.getRepository(Category);
        logger.info("[TYPEORM] Datasource conectado com sucesso.");

        // Buscar todas as categorias existentes de uma vez
        const existingCategories = await categoryRepo.find({
            select: ['name']
        });

        const existingNames = new Set(existingCategories.map(cat => cat.name));

        // Filtrar apenas as que não existem
        const newCategories = categories
            .filter(category => !existingNames.has(category.name))
            .map(category => ({
                ...category,
                displayName: category.displayName,
                isDefault: true
            }));

        if (newCategories.length === 0) {
            logger.info("[TYPEORM] Todas as categorias já existem. Nenhuma nova categoria para criar.");
            return;
        }

        // Bulk insert - muito mais rápido
        await categoryRepo
            .createQueryBuilder()
            .insert()
            .into(Category)
            .values(newCategories)
            .execute();

        logger.info(`[TYPEORM] ${newCategories.length} categorias criadas em bulk insert.`);

        // Log das categorias criadas
        newCategories.forEach(cat => {
            logger.debug(`[TYPEORM] Categoria '${cat.name}' criada.`);
        });

        logger.info("[TYPEORM] Seed finalizado.");
    } catch (error) {
        logger.error("[TYPEORM] Erro ao salvar categorias:", error);
        throw error;
    } finally {
        await TopobreDataSource.destroy();
        logger.info("[TYPEORM] Datasource encerrado.");
    }
}

if (process.env.RUN_SEED === 'true') {
    saveCategories().then()
}


if (require.main === module) {
    // Quando este arquivo é executado diretamente (e não importado)
    // executa a função saveCategories()
    saveCategories().then(() => process.exit(0)).catch(error => process.exit(1));
}
