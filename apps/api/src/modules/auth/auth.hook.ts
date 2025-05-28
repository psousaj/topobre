import { FastifyRequest, FastifyReply } from 'fastify';

export async function authHook(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.server.authenticate(request, reply);
    } catch (error) {
        throw error;
    }
}