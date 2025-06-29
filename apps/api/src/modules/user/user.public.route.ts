import { createUserResponseSchema, createUserSchema } from "./user.schema";
import { FastifyZodApp } from "../../types";
import { REPOSITORIES, SALT_ROUNDS } from "../../shared/constant";
import { badRequestResponseSchema, conflictErrorResponseSchema } from "../../shared/schemas";
import bcrypt from "bcrypt";

export async function publicUserRoutes(app: FastifyZodApp) {
    app.post(
        '/register',
        {
            schema: {
                tags: ['User'],
                description: 'Create a new user',
                summary: 'Create a new user',
                body: createUserSchema,
                response: {
                    201: createUserResponseSchema,
                    409: conflictErrorResponseSchema,
                    400: badRequestResponseSchema
                },
            },
        },
        async (request, reply) => {
            const { name, email, password, phone } = request.body
            const userRepository = app.db.getRepository(REPOSITORIES.USER)
            const user = await userRepository.findOneBy({ email })

            if (user) {
                return reply.status(409).send({ message: "User already exists" });
            }

            const hash = await bcrypt.hash(password, SALT_ROUNDS);

            const newUser = userRepository.create({
                name,
                email,
                phone,
                password: hash,
            });

            await userRepository.save(newUser);
            return reply.status(201).send(newUser);

        },
    )
}