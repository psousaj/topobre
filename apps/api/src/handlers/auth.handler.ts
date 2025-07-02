import { FastifyReply, FastifyRequest } from "fastify";
import { REPOSITORIES } from "../shared/constant"
import { env } from "@topobre/env";
import { logger } from "@topobre/winston";

export async function authHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify();

        const { jti, userId } = request.user

        const sessionRepo = request.server.db.getRepository(REPOSITORIES.SESSION);
        const session = await sessionRepo.findOne({
            where: {
                jti,
                isActive: true
            },
            relations: ['user'],
            cache: {
                id: `session:${jti}`,
                milliseconds: 1000 * 60 * 15 // 15 minutos
            }
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
            await sessionRepo.update({ id: session.id }, { isActive: false });
            await request.server.db.dataSource.queryResultCache?.remove([`session:${jti}`]);

            return reply.code(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Sessão expirada'
            });
        }

        if (!session.user || !session.user.isActive) {
            return reply.code(403).send({
                statusCode: 403,
                error: 'Forbidden',
                message: 'Usuário desativado'
            });
        }

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';

        if (env.NODE_ENV === 'development') {
            logger.error('Erro na autenticação:', errorMessage);
        }

        return reply.code(401).send({
            status: 401,
            error: 'Unauthorized',
            message: 'Token inválido'
        });
    }
}
