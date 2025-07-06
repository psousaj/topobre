import { FastifyRequest } from 'fastify';
import { REPOSITORIES } from '../shared/constant';
import { Session, User } from '@topobre/typeorm';

/**
 * Verifica o token JWT, valida a sessão no banco de dados e anexa o usuário à requisição.
 * Esta função é projetada para ser usada com @fastify/auth.
 */
export const verifySession = async (request: FastifyRequest) => {
    try {
        // 1. Extrai o token do header
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            throw new Error('Token não fornecido.');
        }

        // 2. Decodifica o token para obter o JTI (ID da Sessão) e o ID do usuário
        const decoded = request.server.jwt.verify(token);
        if (!decoded.valueOf || !decoded.userId) {
            throw new Error('Token inválido ou malformado.');
        }

        // 3. Valida a sessão no banco de dados
        const sessionRepository = request.server.db.getRepository<Session>(REPOSITORIES.SESSION);
        const session = await sessionRepository.findOne({
            where: {
                jti: decoded.jti,
                userId: decoded.userId,
                isActive: true,
            }
        });

        // Se não houver sessão ou se ela expirou, rejeita a requisição
        if (!session || session.expiresAt < new Date()) {
            if (session) {
                // Inativa a sessão se ela estiver expirada
                session.isActive = false;
                await sessionRepository.save(session);
            }
            throw new Error('Sessão inválida ou expirada.');
        }

        const userRepository = request.server.db.getRepository<User>(REPOSITORIES.USER);
        const user = await userRepository.findOne({ where: { id: decoded.userId } });

        if (!user) {
            throw new Error('Usuário não encontrado.');
        }

        // 4. Anexa o usuário à requisição para uso posterior nas rotas
        // 4. Anexa o usuário à requisição para uso posterior nas rotas
        request.user = { id: user.id, roles: user.roles };

    } catch (err: any) {
        // Lança um erro que o @fastify/auth irá capturar e transformar em uma resposta 401 Unauthorized.
        throw new Error(err.message || 'Falha na autenticação.');
    }
};
