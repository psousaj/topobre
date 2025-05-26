import { createUserResponseSchema, createUserSchema } from "./user.schema";
import { FastifyZodApp } from "../../types";
import { REPOSITORIES } from "../../shared/constant";
import { badRequestResponseSchema, conflictErrorResponseSchema } from "../../shared/schemas";


export async function userRoutes(app: FastifyZodApp) {
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
                    409: conflictErrorResponseSchema,
                    400: badRequestResponseSchema
                },
            },
        },
        async (request, reply) => {
            const { name, email, password, phoneNumber } = request.body
            const userRepository = app.db.getRepository(REPOSITORIES.USER)
            const user = userRepository.findBy({ email })

            if (user) {
                return reply.status(409).send({ message: "User already exists" });
            }

            const newUser = await userRepository.create({
                name,
                email,
                password,
                phoneNumber,
            });

            await userRepository.save(newUser);
            return reply.status(201).send(newUser);

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