import { createUserResponseSchema, createUserSchema } from "./user.schema";
import { FastifyZodApp } from "../../types";
import { REPOSITORIES, SALT_ROUNDS } from "../../shared/constant";
import { badRequestResponseSchema, conflictErrorResponseSchema, notFoundErrorResponseSchema } from "../../shared/schemas";
import bcrypt from "bcrypt";
import { z } from "zod";

export async function userRoutes(app: FastifyZodApp) {
    app.get("/:id",
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['User'],
                description: 'Get user by ID',
                summary: 'Get user by ID',
                params: z.object({
                    id: z.string().uuid(),
                }),
                response: {
                    200: createUserResponseSchema,
                    404: notFoundErrorResponseSchema
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params
            const userRepository = app.db.getRepository(REPOSITORIES.USER);
            const user = await userRepository.findOneBy({ id });

            if (!user) {
                return reply.status(404).send({ message: "User not found" });
            }

            return reply.status(200).send(user);
        }
    );

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

    app.patch("/:id",
        {
            schema: {
                tags: ['User'],
                description: 'Update user by ID',
                summary: 'Update user by ID',
                body: createUserSchema.partial(),
                params: z.object({
                    id: z.string().uuid(),
                }),
                response: {
                    200: createUserResponseSchema,
                    404: notFoundErrorResponseSchema
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params as { id: string };
            const user = request.body;

            const userRepository = app.db.getRepository(REPOSITORIES.USER);
            const existingUser = await userRepository.findOneBy({ id });

            if (!existingUser) {
                return reply.status(404).send({ message: "User not found" });
            }

            await userRepository.update(id, user);

            return reply.status(200).send({
                ...existingUser,
            });
        });

    app.delete("/:id", {
        schema: {
            tags: ['User'],
            description: 'Delete user by ID',
            summary: 'Delete user by ID',
            response: {
                202: z.object({}),
                404: notFoundErrorResponseSchema
            },
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const userRepository = app.db.getRepository(REPOSITORIES.USER);
        const user = await userRepository.findOneBy({ id });

        if (!user) {
            return reply.status(404).send({ message: "User not found" });
        }

        await userRepository.delete(id);

        return reply.status(202).send(user);
    });

    app.log.info('user routes registered')
}