"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clerkPreHandler = clerkPreHandler;
const fastify_1 = require("@clerk/fastify");
async function clerkPreHandler(req, reply) {
    const { sessionId } = (0, fastify_1.getAuth)(req);
    if (!sessionId) {
        reply.status(401);
        reply.send({ error: "User could not be verified" });
    }
}
