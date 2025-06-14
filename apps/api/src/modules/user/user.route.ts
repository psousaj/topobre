import { createUserResponseSchema, createUserSchema } from "./user.schema";
import { FastifyZodApp } from "../../types";
import { REPOSITORIES } from "../../shared/constant";
import { badRequestResponseSchema, conflictErrorResponseSchema, notFoundErrorResponseSchema } from "../../shared/schemas";
import { z } from "zod";
import { supabaseServer } from "@topobre/supabase";

export async function userRoutes(app: FastifyZodApp) {
    app.get('/list',
        {
            // preHandler: app.authenticate,
            // onRequest: app.authorize(['admin']),
            schema: {
                tags: ['User'],
                description: 'List all users',
                summary: 'List all users',
                response: {
                    200: z.array(createUserResponseSchema),
                    401: badRequestResponseSchema,
                }
            },
        },
        async (request, reply) => {
            const { data: usersData, error } = await supabaseServer.auth.admin.listUsers();
            return reply.status(200).send(usersData.users.map(user => createUserResponseSchema.parse(user)));
            // return reply.status(200).send(usersData.users);
        }
    );

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
            const { name, email, password, phoneNumber } = request.body;
            const profileRepository = app.db.getRepository(REPOSITORIES.PROFILE);
            const userMappingRepository = app.db.getRepository(REPOSITORIES.USER_MAPPING);
            const existingProfile = await userMappingRepository.findOneBy({ email });

            if (existingProfile) {
                app.log.warn({ msg: '[API] Usuário já existe', email });
                return reply.status(409).send({ message: 'User already exists' });
            }

            const { data: authUser, error: authError } = await supabaseServer.auth.signUp({
                email,
                password,
                phone: phoneNumber,
                options: {
                    data: { name },
                },
            });

            if (authError || !authUser?.user) {
                app.log.error({ msg: `[SUPABASE] ${authError?.message}`, error: authError });
                return reply.status(500).send({ message: 'Internal Server Error' });
            }

            const newProfile = profileRepository.create({
                userId: authUser.user.id,
            });
            const userMapping = userMappingRepository.create({
                authId: authUser.user?.id,
                email,
            });
            await userMappingRepository.save(userMapping);
            await profileRepository.save(newProfile);

            return reply.status(201).send(createUserResponseSchema.parse(authUser.user));
        }
    );


    app.patch("/:id",
        {
            preHandler: app.authenticate,
            schema: {
                tags: ['User'],
                description: 'Update user by ID',
                summary: 'Update user by ID',
                body: createUserSchema.partial(),
                response: {
                    200: createUserResponseSchema,
                    500: badRequestResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const requestUser = request.body;

            const { data, error } = await supabaseServer.auth.updateUser({
                ...requestUser,
            })

            if (error) {
                app.log.error({ msg: `[SUPABASE] ${error.message}`, error });
                return reply.status(500).send({ message: 'Internal Server Error' });
            }

            return reply.status(200).send(createUserResponseSchema.parse(data.user));
        });

    app.delete("/:userId", {
        preHandler: app.authenticate,
        schema: {
            tags: ['User'],
            description: 'Delete user by ID',
            summary: 'Delete user by ID',
            params: z.object({
                userId: z.string().uuid(),
            }),
            response: {
                202: z.object({}),
            },
        }
    }, async (request, reply) => {
        const { data } = await supabaseServer.auth.getUser();
        const userId = data.user?.id!;

        const userMapRepository = app.db.getRepository(REPOSITORIES.USER_MAPPING);
        const userMapping = await userMapRepository.findOneBy({ authId: userId });
        if (!userMapping) {
            return reply.status(404).send({ message: 'User not found' });
        }

        const { error } = await supabaseServer.auth.admin.deleteUser(userId);
        if (error) {
            app.log.error({ msg: `[SUPABASE] ${error.message}`, error });
            return reply.status(500).send({ message: 'Internal Server Error' });
        }
        await userMapRepository.delete(userMapping.id);
        app.log.info({ msg: `[API] User deleted userId: ${userId}`, userId: userId });

        return reply.status(202).send({});

    });

    app.log.info('user routes registered')
}