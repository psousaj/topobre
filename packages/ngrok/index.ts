import ngrok from '@ngrok/ngrok';
import { env } from '@topobre/env';

async function main() {
    const listener = await ngrok.connect({
        addr: 'localhost:3003',
        authtoken: env.NGROK_AUTH_TOKEN
    });

    console.log('🚀 ngrok tunnel started at:');
    console.dir(listener.url());

    // Manter processo ativo
    process.stdin.resume();

    process.on('SIGINT', async () => {
        console.log('\n⛔ Finalizando túnel...');
        await listener.close();
        console.log('✅ Túnel encerrado com sucesso.');
        process.exit(0);
    });
}

main().catch((err) => {
    console.error('❌ Erro ao iniciar o túnel ngrok:', err);
    process.exit(1);
});
