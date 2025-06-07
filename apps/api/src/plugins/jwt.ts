import fp from 'fastify-plugin';
import fjwt from '@fastify/jwt';
import { env } from '../../../../libs/shared/env';

export default fp(async function (fastify) {
    await fastify.register(fjwt, { secret: env.JWT_SECRET, sign: { expiresIn: env.JWT_EXPIRES_IN } });
});