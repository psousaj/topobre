import { FastifyRequest } from 'fastify';
import { REPOSITORIES } from '../shared/constant';
import { Session, User } from '@topobre/typeorm';

export const verifySession = async (request: FastifyRequest) => {
    try {
        await request.jwtVerify();
        const { jti, userId } = request.user;
        const sessionRepository = request.server.db.getRepository<Session>(REPOSITORIES.SESSION);
        const session = await sessionRepository.findOne({
            where: { jti, userId, isActive: true }
        });
        if (!session || session.expiresAt < new Date()) {
            if (session) {
                session.isActive = false;
                await sessionRepository.save(session);
            }
            throw new Error('Sessão inválida ou expirada.');
        }
    } catch (err: any) {
        throw new Error(err.message || 'Falha na autenticação.');
    }
};