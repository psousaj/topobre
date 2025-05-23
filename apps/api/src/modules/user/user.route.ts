import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createUserResponseSchema, createUserSchema } from "./user.schema";


export async function userRoutes(app: FastifyInstance) {
    app.get("/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        return { message: `Hello from user route with ID: ${id}` };
    });

    app.post(
        '/register',
        {
            schema: {
                body: createUserSchema,
                response: {
                    201: createUserResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { } = req.body
        },
    )

    app.patch("/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        const user = request.body;
        return { message: `User with ID: ${id} updated successfully!`, user };
    });

    app.delete("/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        return { message: `User with ID: ${id} deleted successfully!` };
    });
}