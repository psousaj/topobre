import { FastifyRequest, FastifyReply } from 'fastify';

// Função para verificar se o usuário tem uma das roles necessárias
export const hasRole = (roles: string[]) => {
  return (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
    if (!request.user || !request.user.roles.some(role => roles.includes(role))) {
      return reply.status(403).send({ message: 'Acesso Negado: você não tem permissão para este recurso.' });
    }
    done();
  };
};

// Função para verificar se o usuário é o dono do recurso
export const isOwner = (paramName = 'userId') => {
  return (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
    if (!request.user || (request.params as any)[paramName] !== request.user.userId) {
      return reply.status(403).send({ message: 'Acesso Negado: você não é o proprietário deste recurso.' });
    }
    done();
  };
};