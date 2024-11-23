"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectRoutes = protectRoutes;
const fastify_1 = require("@clerk/fastify");
async function protectRoutes(request, reply) {
    const { userId } = (0, fastify_1.getAuth)(request);
    // Protect the route from unauthenticated users
    if (!userId) {
        return reply.code(403).send({ error: 'Unauthorized request.' });
    }
    const user = userId ? await fastify_1.clerkClient.users.getUser(userId) : null;
    return {
        userId, user
    };
}
