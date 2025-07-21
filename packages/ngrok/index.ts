import ngrok from '@ngrok/ngrok';
import { env } from '@topobre/env';

const listener = await ngrok.connect({ addr: 'localhost:3003', authtoken: env.NGROK_AUTH_TOKEN });
console.log(`Ingress established at: ${listener.url()}`);

// manter o processo vivo até interrupção
process.on('SIGINT', async () => {
    console.log('\n⛔ Finalizando túnel...');
    await listener.close();
    process.exit(0);
});
