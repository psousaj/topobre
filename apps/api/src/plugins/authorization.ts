import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

const isOwner = (paramName: string = 'userId') => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user || (request.params as any)[paramName] !== request.user.userId) {
      reply.status(403).send({ message: 'Acesso Negado: você não é o proprietário deste recurso.' });
    }
  };
};

const hasRole = (roles: string[] | string) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!request.user || !request.user.roles?.some((role: string) => allowedRoles.includes(role))) {
      reply.status(403).send({
        message: 'Acesso Negado: você não tem permissão para este recurso.',
      });
    }
  };
};

async function authorizationPlugin(app: FastifyInstance) {
  app.decorate('hasRole', hasRole);
  app.decorate('isOwner', isOwner);
}

export default fp(authorizationPlugin, {
  name: 'authorization',
});
