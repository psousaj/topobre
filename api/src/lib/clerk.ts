import { clerkClient, getAuth } from "@clerk/fastify"
import { FastifyReply, FastifyRequest } from "fastify"

export async function protectRoutes(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = getAuth(request)

    // Protect the route from unauthenticated users
    if (!userId) {
        return reply.code(403).send({ error: 'Unauthorized request.' })
    }

    const user = userId ? await clerkClient.users.getUser(userId) : null

    return {
        userId, user
    }
}