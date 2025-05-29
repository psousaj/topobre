import { FastifyReply, FastifyRequest } from "fastify";
import fp from 'fastify-plugin';
import { REPOSITORIES } from "../shared/constant"
import { env } from "../shared/env";

async function authHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        // Verifica se o token JWT é válido
        await request.jwtVerify();

        const { jti, userId } = request.user

        // Busca a sessão no banco usando a instância do Fastify
        const sessionRepo = request.server.db.getRepository(REPOSITORIES.SESSION);

        const session = await sessionRepo.findOne({
            where: {
                jti,
                isActive: true
            },
            relations: ['user']
        });

        if (!session) {
            return reply.code(401).send({
                error: 'Unauthorized',
                message: 'Sessão não encontrada ou inválida'
            });
        }

        // Verifica se a sessão não expirou
        const now = new Date();
        if (session.expiresAt < now) {
            // Marca a sessão como inativa
            await sessionRepo.update({ id: session.id }, { isActive: false });
            return reply.code(401).send({
                error: 'Unauthorized',
                message: 'Sessão expirada'
            });
        }

        // Verifica se o usuário ainda está ativo
        if (!session.user || !session.user.isActive) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: 'Usuário desativado'
            });
        }

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';

        // Log apenas em desenvolvimento
        if (env.NODE_ENV === 'development') {
            console.error('❌ Erro na autenticação:', errorMessage);
        }

        return reply.code(401).send({
            status: 401,
            error: 'Unauthorized',
            message: 'Token inválido'
        });
    }
}

export default fp(async function (fastify) {
    fastify.decorate('authenticate', authHandler);
});