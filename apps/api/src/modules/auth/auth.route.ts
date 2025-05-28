import bcrypt from "bcrypt"
import { v4 as uuidv4 } from 'uuid';

import { loginSchema, loginResponseSchema, meResponseSchema } from "./auth.schema"
import { FastifyZodApp } from "../../types"
import { forbiddenErrorResponseSchema, unauthorizedErrorResponseSchema } from "../../shared/schemas"
import { REPOSITORIES } from "../../shared/constant"
import { z } from "zod";

export async function authRoutes(app: FastifyZodApp) {
    app.post(
        '/login',
        {
            schema: {
                tags: ['Auth'],
                description: 'Login do usuário',
                summary: 'Realiza o login do usuário e retorna um token de acesso',
                body: loginSchema,
                response: {
                    200: loginResponseSchema,
                    401: unauthorizedErrorResponseSchema,
                    403: forbiddenErrorResponseSchema
                },
            },
        },
        async (req, reply) => {
            const { email, password } = req.body;

            // Busca o usuário por email
            const userRepo = app.db.getRepository(REPOSITORIES.USER);
            const user = await userRepo.findOneBy({ email });

            if (!user) {
                return reply.status(401).send({
                    error: 'Unauthorized',
                    message: "Email ou senha inválidos"
                });
            }

            // Verifica a senha
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return reply.status(401).send({
                    error: 'Unauthorized',
                    message: "Email ou senha inválidos"
                });
            }

            // Verifica se o usuário está ativo
            if (!user.isActive) {
                return reply.code(403).send({
                    error: 'Forbidden',
                    message: 'Usuário desativado'
                });
            }

            // Gera um JTI único
            const jti = uuidv4();
            const expiresIn = 24 * 60 * 60; // 24 horas em segundos
            const expiresAt = new Date(Date.now() + expiresIn * 1000);

            // Salva a sessão no banco
            const sessionRepo = app.db.getRepository(REPOSITORIES.SESSION);
            await sessionRepo.save({
                jti,
                userId: user.id,
                user,
                ip: req.ip,
                userAgent: req.headers['user-agent'] || '',
                expiresAt,
                isActive: true
            });

            // Gera o token JWT
            const token = app.jwt.sign({
                userId: user.id,
                email: user.email,
                jti
            }, {
                expiresIn: '24h'
            });

            return reply.status(200).send({
                user: {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                },
                accessToken: token,
            });
        }
    );

    app.post('/logout', {
        preHandler: [app.authenticate],
        schema: {
            tags: ['Auth'],
            description: 'Logout do usuário',
            summary: 'Realiza o logout do usuário e invalida o token de acesso',
            response: {
                200: z.object({}),
                401: unauthorizedErrorResponseSchema
            }
        }
    }, async (req, reply) => {
        try {
            const jti = req.jwt!.payload.jti;

            // Marca a sessão como inativa
            const sessionRepo = app.db.getRepository(REPOSITORIES.SESSION);
            await sessionRepo.update({ jti }, { isActive: false });

            return reply.send({ message: 'Logout realizado com sucesso' });
        } catch (error) {
            app.log.error('Erro no logout:', error);
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'Erro interno do servidor'
            });
        }
    });

    // Rota para verificar token
    app.get('/me', {
        preHandler: [app.authenticate],
        schema: {
            tags: ['Auth'],
            description: 'Informações do usuário logado',
            summary: 'Retorna as informações do usuário autenticado',
            response: {
                200: meResponseSchema,
                401: unauthorizedErrorResponseSchema
            }
        }
    }, async (req, reply) => {
        return reply.send({
            user: {
                userId: req.user!.id,
                name: req.user!.name,
                email: req.user!.email
            }
        });
    });

    // 
    app.log.info('user routes registered')
}