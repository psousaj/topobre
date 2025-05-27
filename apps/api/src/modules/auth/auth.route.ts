import { loginSchema, loginResponseSchema } from "./auth.schema"
import { FastifyZodApp } from "../../types"
import { forbiddenErrorResponseSchema, unauthorizedErrorResponseSchema } from "../../shared/schemas"
import bcrypt from "bcrypt"
import { REPOSITORIES } from "../../shared/constant"

export async function authRoutes(app: FastifyZodApp) {
    app.post(
        '/login',
        {
            schema: {
                body: loginSchema,
                response: {
                    201: loginResponseSchema,
                    401: unauthorizedErrorResponseSchema,
                    403: forbiddenErrorResponseSchema
                },
            },
        },
        async (req, rep) => {
            const { email, password } = req.body

            const user = await app.db.getRepository(REPOSITORIES.USER).findOneBy({ email })
            const isMatch = await bcrypt.compare(password, user.password)

            if (!user || !isMatch) {
                return rep.status(401).send({ message: "Invalid email or password" })
            }

            if (!user.isActive) {
                return rep.code(403).send({ message: 'Usuário desativado' });
            }

            const jti = `${user.id}:-:${Date.now()}`;
            const expiresIn = 60 * 60 * 24; // 1 dia

            await app.db.getRepository(REPOSITORIES.SESSION).save({
                user,
                jti,
                ip: req.ip,
                userAgent: req.headers['user-agent'] || '',
                expiresAt: new Date(Date.now() + expiresIn * 1000)
            });

            const token = app.jwt.sign(
                { userId: user.id, email: user.email, jti },
                { expiresIn }
            );

            return rep.status(201).send({
                user: {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                },
                accessToken: token,
            })
        },
    )

    app.post('/logout', { preHandler: [app.authenticate] }, async (req, reply) => {
        const jti = req.jwt.payload.jti;
        await app.db.getRepository(REPOSITORIES.SESSION).update({ id: jti }, { isActive: false });
        return reply.send({ message: 'Logout realizado' });
    });

    // 
    app.log.info('user routes registered')
}