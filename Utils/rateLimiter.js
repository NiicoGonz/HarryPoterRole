const logger = require('../Utils/logger');

/**
 * Sistema de Rate Limiting para comandos de Discord
 * Previene abuso y spam de comandos
 */
class RateLimiter {
    constructor() {
        // Map de userId -> comando -> { count, resetTime }
        this.userLimits = new Map();

        // Configuración de límites por tipo de comando
        this.limits = {
            // Comandos RPG (3 comandos cada 10 segundos)
            rpg: {
                maxAttempts: 3,
                windowMs: 10000, // 10 segundos
                commands: ['crear-personaje', 'perfil', 'inventario', 'spells', 'stats', 'descansar', 'ranking']
            },

            // Comandos de moderación (5 comandos cada 30 segundos)
            moderation: {
                maxAttempts: 5,
                windowMs: 30000, // 30 segundos
                commands: ['clear', 'kick', 'ban', 'mute']
            },

            // Comandos públicos (10 comandos cada 30 segundos)
            public: {
                maxAttempts: 10,
                windowMs: 30000,
                commands: ['ping', 'help', 'rpg']
            }
        };
    }

    /**
     * Obtiene el tipo de límite para un comando
     */
    getLimitType(commandName) {
        for (const [type, config] of Object.entries(this.limits)) {
            if (config.commands.includes(commandName)) {
                return type;
            }
        }
        return 'public'; // Por defecto
    }

    /**
     * Verifica si un usuario puede ejecutar un comando
     * @returns {{ allowed: boolean, retryAfter?: number }}
     */
    checkLimit(userId, commandName) {
        const limitType = this.getLimitType(commandName);
        const config = this.limits[limitType];

        if (!this.userLimits.has(userId)) {
            this.userLimits.set(userId, new Map());
        }

        const userCommands = this.userLimits.get(userId);
        const now = Date.now();

        // Obtener o crear registro del comando
        if (!userCommands.has(commandName)) {
            userCommands.set(commandName, {
                count: 0,
                resetTime: now + config.windowMs
            });
        }

        const commandData = userCommands.get(commandName);

        // Reset si ya pasó el tiempo
        if (now >= commandData.resetTime) {
            commandData.count = 0;
            commandData.resetTime = now + config.windowMs;
        }

        // Verificar límite
        if (commandData.count >= config.maxAttempts) {
            const retryAfter = Math.ceil((commandData.resetTime - now) / 1000);

            logger.security('RateLimitExceeded', userId, `Comando: ${commandName}`, {
                limitType,
                retryAfter
            });

            return {
                allowed: false,
                retryAfter
            };
        }

        // Incrementar contador
        commandData.count++;

        return { allowed: true };
    }

    /**
     * Resetea los límites de un usuario (solo para admin)
     */
    resetUser(userId) {
        this.userLimits.delete(userId);
        logger.info(`Rate limits reseteados para usuario: ${userId}`);
    }

    /**
     * Limpia límites expirados (ejecutar periódicamente)
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        for (const [userId, commands] of this.userLimits.entries()) {
            for (const [commandName, data] of commands.entries()) {
                if (now >= data.resetTime && data.count === 0) {
                    commands.delete(commandName);
                    cleaned++;
                }
            }

            if (commands.size === 0) {
                this.userLimits.delete(userId);
            }
        }

        if (cleaned > 0) {
            logger.debug(`Limpiados ${cleaned} registros de rate limiting expirados`);
        }
    }

    /**
     * Obtiene estadísticas del rate limiter
     */
    getStats() {
        return {
            totalUsers: this.userLimits.size,
            totalCommands: Array.from(this.userLimits.values())
                .reduce((sum, commands) => sum + commands.size, 0)
        };
    }
}

// Singleton
const rateLimiter = new RateLimiter();

// Cleanup cada 5 minutos
setInterval(() => {
    rateLimiter.cleanup();
}, 5 * 60 * 1000);

module.exports = rateLimiter;
