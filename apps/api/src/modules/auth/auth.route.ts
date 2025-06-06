import bcrypt from "bcrypt"
import { v4 as uuidv4 } from 'uuid';

import { loginSchema, loginResponseSchema, meResponseSchema, forgottenPasswordSchema } from "./auth.schema"
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

            // Verifica se existe uma sessão ativa para o IP e User-Agent que está logando
            const sessionRepo = app.db.getRepository(REPOSITORIES.SESSION);
            const existingSession = await sessionRepo.findOne({
                where: {
                    ip: req.ip,
                    userAgent: req.headers['user-agent'] || '',
                    isActive: true,
                    userId: user.id,
                },
            });

            let jti: string;
            let refreshToken: string;

            if (!existingSession || !existingSession.isActive) {
                jti = uuidv4();
                const refreshToken = uuidv4();

                const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

                await sessionRepo.save({
                    userId: user.id,
                    jti,
                    refreshToken: refreshToken,
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    isActive: true,
                    expiresAt,
                });

            } else {
                jti = existingSession.jti;
                refreshToken = existingSession.refreshToken;
            }

            const accessToken = app.jwt.sign(
                { userId: user.id, email: user.email, jti },
                { expiresIn: '24h' }
            );

            return reply
                .setCookie('refresh_token', refreshToken, {
                    httpOnly: true,
                    path: '/auth/refresh',
                    sameSite: 'strict',
                    secure: true,
                    maxAge: 7 * 24 * 60 * 60,
                })
                .send({
                    user: {
                        userId: user.id,
                        name: user.name,
                        email: user.email,
                    },
                    accessToken: accessToken,
                });
        }
    );

    app.delete('/logout', {
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
        const jti = req.user.jti

        // Marca a sessão como inativa
        const sessionRepo = app.db.getRepository(REPOSITORIES.SESSION);
        await sessionRepo.update({ jti }, { isActive: false });
        await app.db.dataSource.queryResultCache?.remove([`session:${jti}`]);

        return reply.send({ message: 'Logout realizado com sucesso' });
    });

    app.post('/auth/refresh', {
        schema: {
            tags: ['Auth'],
            description: 'Renova o token de acesso usando o refresh_token',
            summary: 'Gera novo accessToken e atualiza sessão',
            response: {
                200: loginResponseSchema,
                401: unauthorizedErrorResponseSchema
            }
        }
    }, async (req, reply) => {
        const refreshToken = req.cookies?.refresh_token;

        if (!refreshToken) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Refresh token ausente'
            });
        }

        const sessionRepo = app.db.getRepository(REPOSITORIES.SESSION);
        const session = await sessionRepo.findOne({
            where: { refreshToken, isActive: true },
            relations: ['user']
        });

        if (!session || !session.user || !session.user.isActive) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Sessão inválida ou usuário desativado'
            });
        }

        const now = new Date();
        if (session.expiresAt < now) {
            await sessionRepo.update({ id: session.id }, { isActive: false });
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Sessão expirada'
            });
        }

        // Atualiza sessão com novo jti e refreshToken
        const newJti = uuidv4();
        const newRefreshToken = uuidv4();
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        session.jti = newJti;
        session.refreshToken = newRefreshToken;
        session.expiresAt = newExpiresAt;
        await sessionRepo.save(session);

        const accessToken = app.jwt.sign({
            userId: session.user.id,
            email: session.user.email,
            jti: newJti
        }, { expiresIn: '24h' });

        return reply
            .setCookie('refresh_token', newRefreshToken, {
                httpOnly: true,
                path: '/auth/refresh',
                sameSite: 'strict',
                secure: true,
                maxAge: 7 * 24 * 60 * 60,
            })
            .send({
                user: {
                    userId: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                },
                accessToken
            });
    });

    app.post('/password/forgot', {
        schema: {
            tags: ['Auth'],
            description: 'Envia um link de redefinição de senha para o usuário',
            body: z.object({ email: z.string().email() }),
            response: {
                200: z.object({ message: z.string() }),
            }
        }
    }, async (req, reply) => {
        const { email } = req.body;

        const userRepo = app.db.getRepository(REPOSITORIES.USER);
        const resetTokenRepo = app.db.getRepository(REPOSITORIES.PASSWORD_RESET_TOKEN);

        const user = await userRepo.findOneBy({ email });

        if (user) {
            const token = uuidv4();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

            await resetTokenRepo.save({
                userId: user.id,
                token,
                expiresAt,
                used: false,
            });

            const resetLink = `https://topobre.crudbox.com.br/auth/reset-password?token=${token}&mail=${email}`;
            await app.mailer.sendPasswordResetEmail(email, resetLink);

            app.log.info(`Reset token for ${email}: ${token}`);
        }

        return reply.send({ message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.' });
    });

    app.post('/password/reset', {
        schema: {
            tags: ['Auth'],
            description: 'Redefinição de senha',
            summary: 'Redefine a senha do usuário usando um token de redefinição',
            body: forgottenPasswordSchema,
            // querystring: z.object({ token: z.string({ invalid_type_error: 'Token deve ser uma string', required_error: 'Token de reset obrigatório' }) }),
            response: {
                200: z.object({ message: z.string() }),
            }
        }
    }, async (req, reply) => {
        const { newPassword, token } = req.body;

        const resetTokenRepo = app.db.getRepository(REPOSITORIES.PASSWORD_RESET_TOKEN);
        const userRepo = app.db.getRepository(REPOSITORIES.USER);

        const resetToken = await resetTokenRepo.findOne({
            where: { token, used: false },
            relations: ['user'],
        });

        if (!resetToken || resetToken.expiresAt < new Date()) {
            return reply.status(400).send({ message: 'Token inválido ou expirado' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await userRepo.update({ id: resetToken.userId }, { password: hashedPassword });
        await resetTokenRepo.update({ token }, { used: true });

        return reply.send({ message: 'Senha redefinida com sucesso' });
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
        const userRepo = app.db.getRepository(REPOSITORIES.USER);
        const user = await userRepo.findOneBy({ id: req.user.userId });

        return reply.send({
            user: {
                userId: user.id,
                name: user.name,
                email: user.email
            }
        });
    });

    app.log.info('auth routes registered')
}