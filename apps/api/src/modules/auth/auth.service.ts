import { AppDataSource } from '../../db';
import { REPOSITORIES } from '../../shared/constant';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
    private sessionRepo = AppDataSource.getRepository(REPOSITORIES.SESSION);
    private userRepo = AppDataSource.getRepository(REPOSITORIES.USER);

    async createSession(userId: string, userAgent?: string) {
        const jti = uuidv4();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

        const session = this.sessionRepo.create({
            jti,
            userId,
            userAgent,
            expiresAt,
            isActive: true
        });

        return await this.sessionRepo.save(session);
    }

    async invalidateSession(jti: string) {
        await this.sessionRepo.update(
            { jti, isActive: true },
            { isActive: false }
        );
    }

    async invalidateAllUserSessions(userId: string) {
        await this.sessionRepo.update(
            { userId, isActive: true },
            { isActive: false }
        );
    }

    async cleanExpiredSessions() {
        const now = new Date();
        await this.sessionRepo.update(
            {
                expiresAt: now,
                isActive: true
            },
            { isActive: false }
        );
    }
}