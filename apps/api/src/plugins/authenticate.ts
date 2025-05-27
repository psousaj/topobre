import { FastifyReply, FastifyRequest } from "fastify";
import { AppDataSource } from '../db';
import { REPOSITORIES } from "../shared/constant";

export async function authHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        await req.jwtVerify();

        const jti = req.jwt.payload.jti;
        const session = await AppDataSource.getRepository(REPOSITORIES.SESSION).findOneBy({ id: jti, isActive: true });

        if (!session || session.expiresAt < new Date()) {
            return reply.code(401).send({ message: 'Sessão expirada ou inválida' });
        }

        const user = await AppDataSource.getRepository(REPOSITORIES.USER).findOneBy({ id: session.userId });
        if (!user || !user.isActive) {
            return reply.code(403).send({ message: 'Usuário desativado' });
        }

        req.user = user;
    } catch (err) {
        reply.send(err);
    }
}
