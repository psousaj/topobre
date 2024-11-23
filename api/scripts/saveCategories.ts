import { prisma } from "../src/lib/prisma";

const categories = [
    { name: "Empréstimo", color: "#FFCC00" },
    { name: "Cartoes", color: "#FF5733" },
    { name: "Terreno", color: "#33FF57" },
    { name: "Agua", color: "#3399FF" },
    { name: "Energia", color: "#FF33A1" },
    { name: "Moradia", color: "#FF33D4" },
    { name: "Outros", color: "#FF8C00" },
    { name: "Evento", color: "#8C00FF" },
    { name: "Eletronicos", color: "#00FF8C" },
    { name: "Viagem", color: "#00A1FF" },
    { name: "Roupas", color: "#FF00A1" },
    { name: "Streams", color: "#A100FF" },
    { name: "Educação", color: "#00FF00" },
    { name: "Saúde", color: "#00FF33" },
    { name: "Transporte", color: "#FF3300" },
];

async function saveCategories() {
    for (const category of categories) {
        await prisma.category.create({
            data: {
                name: category.name,
                color: category.color,
                isDefault: true,
            },
        });
    }
    console.log('Categorias salvas com sucesso!');
}

saveCategories()
    .catch(e => {
        console.error('Erro ao salvar categorias:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
