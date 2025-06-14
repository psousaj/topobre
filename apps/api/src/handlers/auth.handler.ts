import { supabaseServer } from '@topobre/supabase';
import { FastifyRequest, FastifyReply } from 'fastify';

interface AuthHandlerOptions {
    supabaseUrl: string;
    supabaseAnonKey: string;
    jwtSecret: string;
}

export class AuthHandler {
    private supabase: typeof supabaseServer;

    constructor(private options: AuthHandlerOptions) {
        this.supabase = createClient(options.supabaseUrl, options.supabaseAnonKey);
    }

    /**
     * Middleware de autenticação principal
     */
    authenticate = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            // 1. Extrair token do header Authorization
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'Missing or invalid authorization header'
                });
            }

            const token = authHeader.substring(7); // Remove 'Bearer '

            // 2. Verificar token com Supabase
            const { data: { user }, error } = await this.supabase.auth.getUser(token);

            if (error || !user) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'Invalid or expired token'
                });
            }

            // 3. Buscar ou criar profile no seu banco
            const profile = await this.getOrCreateProfile(request, user);

            if (!profile || !profile.isActive) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'User account is inactive'
                });
            }

            // 4. Criar ou atualizar sessão
            await this.createOrUpdateSession(request, profile, token);

            // 5. Adicionar dados do usuário ao request
            request.user = {
                ...profile,
                supabaseId: user.id,
                session: {
                    access_token: token,
                    refresh_token: '', // Supabase gerencia isso
                    expires_in: 3600, // 1 hora
                    token_type: 'bearer',
                    user: {
                        id: user.id,
                        email: user.email,
                        user_metadata: user.user_metadata,
                        app_metadata: user.app_metadata
                    }
                } as SupabaseSession
            };

            // 6. Criar JWT interno (opcional, para compatibilidade)
            const jwtPayload = {
                userId: profile.id,
                supabaseId: user.id,
                email: profile.email,
                jti: `session_${Date.now()}`,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600
            };

            // Adicionar JWT ao request se necessário
            if (request.server.jwt) {
                const internalToken = request.server.jwt.sign(jwtPayload);
                request.headers['x-internal-jwt'] = internalToken;
            }

        } catch (error) {
            request.log.error('Authentication error:', error);
            return reply.code(500).send({
                error: 'Internal Server Error',
                message: 'Authentication failed'
            });
        }
    };

    /**
     * Busca ou cria um profile baseado no usuário do Supabase
     */
    private async getOrCreateProfile(request: FastifyRequest, supabaseUser: any): Promise<Profile | null> {
        try {
            const profileRepo = request.server.db.getRepository(Profile);

            // Tentar encontrar profile existente
            let profile = await profileRepo.findOne({
                where: { supabaseId: supabaseUser.id }
            });

            if (!profile) {
                // Verificar se existe profile com mesmo email
                const existingProfile = await profileRepo.findOne({
                    where: { email: supabaseUser.email }
                });

                if (existingProfile) {
                    // Atualizar profile existente com supabaseId
                    existingProfile.supabaseId = supabaseUser.id;
                    existingProfile.metadata = supabaseUser.user_metadata || {};
                    profile = await profileRepo.save(existingProfile);
                } else {
                    // Criar novo profile
                    profile = profileRepo.create({
                        supabaseId: supabaseUser.id,
                        email: supabaseUser.email,
                        name: supabaseUser.email?.split('@')[0] || 'User',
                        metadata: supabaseUser.user_metadata || {},
                        isActive: true
                    });
                    profile = await profileRepo.save(profile);
                }
            }

            return profile;
        } catch (error) {
            request.log.error('Error getting/creating profile:', error);
            return null;
        }
    }

    /**
     * Cria ou atualiza sessão do usuário
     */
    private async createOrUpdateSession(request: FastifyRequest, profile: Profile, token: string): Promise<void> {
        try {
            const sessionRepo = request.server.db.getRepository(Session);

            // Buscar sessão existente
            let session = await sessionRepo.findOne({
                where: {
                    user: { id: profile.id },
                    isActive: true
                }
            });

            if (session) {
                // Atualizar sessão existente
                session.accessToken = token;
                session.expiresAt = new Date(Date.now() + (3600 * 1000)); // 1 hora
                session.lastAccessedAt = new Date();
                await sessionRepo.save(session);
            } else {
                // Criar nova sessão
                session = sessionRepo.create({
                    user: profile,
                    accessToken: token,
                    expiresAt: new Date(Date.now() + (3600 * 1000)),
                    userAgent: request.headers['user-agent'] || '',
                    ipAddress: request.ip,
                    isActive: true,
                    lastAccessedAt: new Date()
                });
                await sessionRepo.save(session);
            }
        } catch (error) {
            request.log.error('Error creating/updating session:', error);
        }
    }

    /**
     * Middleware opcional para verificar permissões específicas
     */
    requirePermission = (resource: string, action: string) => {
        return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
            // Primeiro, garantir que o usuário está autenticado
            await this.authenticate(request, reply);

            if (!request.user) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }

            // Verificar permissão usando o RBAC
            if (request.server.rbac) {
                const hasPermission = await request.server.rbac.hasPermission(
                    request.user.id,
                    resource,
                    action
                );

                if (!hasPermission) {
                    return reply.code(403).send({
                        error: 'Forbidden',
                        message: `Insufficient permissions. Required: ${action} on ${resource}`
                    });
                }
            }
        };
    };

    /**
     * Middleware para verificar se usuário tem role específica
     */
    requireRole = (roleName: string) => {
        return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
            await this.authenticate(request, reply);

            if (!request.user) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }

            if (request.server.rbac) {
                const hasRole = await request.server.rbac.hasRole(request.user.id, roleName);

                if (!hasRole) {
                    return reply.code(403).send({
                        error: 'Forbidden',
                        message: `Required role: ${roleName}`
                    });
                }
            }
        };
    };

    /**
     * Logout - invalida sessão
     */
    logout = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        try {
            if (request.user) {
                const sessionRepo = request.server.db.getRepository(Session);
                await sessionRepo.update(
                    { user: { id: request.user.id }, isActive: true },
                    { isActive: false }
                );
            }

            // Opcional: invalidar token no Supabase
            const authHeader = request.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                await this.supabase.auth.signOut();
            }

            reply.code(200).send({ message: 'Logged out successfully' });
        } catch (error) {
            request.log.error('Logout error:', error);
            reply.code(500).send({ error: 'Logout failed' });
        }
    };
}

/**
 * Plugin para registrar o auth handler no Fastify
 */
export const authPlugin = async (fastify: any, options: AuthHandlerOptions) => {
    const authHandler = new AuthHandler(options);

    // Registrar o Supabase client
    fastify.decorate('supabase', authHandler['supabase']);

    // Registrar o middleware de autenticação
    fastify.decorate('authenticate', authHandler.authenticate);

    // Registrar middlewares de permissão
    fastify.decorate('requirePermission', authHandler.requirePermission);
    fastify.decorate('requireRole', authHandler.requireRole);

    // Registrar rota de logout
    fastify.post('/auth/logout', {
        preHandler: authHandler.authenticate,
        handler: authHandler.logout
    });
};