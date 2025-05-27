import { createUserResponseSchema, createUserSchema } from "./user.schema";
import { FastifyZodApp } from "../../types";
import { REPOSITORIES, SALT_ROUNDS } from "../../shared/constant";
import { badRequestResponseSchema, conflictErrorResponseSchema } from "../../shared/schemas";
import bcrypt from "bcrypt";

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

            const hash = await bcrypt.hash(password, SALT_ROUNDS);

            const newUser = userRepository.create({
                name,
                email,
                phoneNumber,
                password: hash,
            });

            await userRepository.save(newUser);
            return reply.status(201).send(newUser);

        },
    )

    app.patch("/:id",
        {
            schema: {
                body: createUserSchema,
                response: {
                    200: createUserResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            const user = request.body;
            return reply.status(200).send({});
        });

    app.delete("/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        return { message: `User with ID: ${id} deleted successfully!` };
    });
}