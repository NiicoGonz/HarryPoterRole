const logger = require('../Utils/logger');

/**
 * Sistema de validación y sanitización de inputs de usuario
 */
class InputValidator {

    /**
     * Valida y sanitiza el nombre de un personaje
     * @param {string} name - Nombre a validar
     * @returns {{ valid: boolean, sanitized?: string, error?: string }}
     */
    validateCharacterName(name) {
        if (!name || typeof name !== 'string') {
            return { valid: false, error: 'El nombre es requerido' };
        }

        // Sanitizar: remover espacios extra, trim
        let sanitized = name.trim().replace(/\s+/g, ' ');

        // Validaciones
        if (sanitized.length < 2) {
            return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
        }

        if (sanitized.length > 30) {
            return { valid: false, error: 'El nombre no puede tener más de 30 caracteres' };
        }

        // Solo letras, espacios, guiones y apóstrofes
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
        if (!nameRegex.test(sanitized)) {
            return {
                valid: false,
                error: 'El nombre solo puede contener letras, espacios, guiones y apóstrofes'
            };
        }

        // Lista de nombres prohibidos/ofensivos
        const blockedWords = [
            'admin', 'moderator', 'bot', 'discord', 'system',
            'null', 'undefined', 'everyone', 'here'
        ];

        const lowerName = sanitized.toLowerCase();
        for (const blocked of blockedWords) {
            if (lowerName.includes(blocked)) {
                return {
                    valid: false,
                    error: 'Este nombre contiene palabras no permitidas'
                };
            }
        }

        return { valid: true, sanitized };
    }

    /**
     * Valida input numérico
     * @param {any} value - Valor a validar
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {{ valid: boolean, value?: number, error?: string }}
     */
    validateNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
        const num = Number(value);

        if (isNaN(num)) {
            return { valid: false, error: 'Debe ser un número válido' };
        }

        if (num < min) {
            return { valid: false, error: `El valor mínimo es ${min}` };
        }

        if (num > max) {
            return { valid: false, error: `El valor máximo es ${max}` };
        }

        if (!Number.isInteger(num)) {
            return { valid: false, error: 'Debe ser un número entero' };
        }

        return { valid: true, value: num };
    }

    /**
     * Valida selección de casa de Hogwarts
     * @param {string} house - Casa seleccionada
     * @returns {{ valid: boolean, sanitized?: string, error?: string }}
     */
    validateHouse(house) {
        const validHouses = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'];

        if (!house || typeof house !== 'string') {
            return { valid: false, error: 'Debes seleccionar una casa' };
        }

        // Capitalizar correctamente
        const sanitized = house.charAt(0).toUpperCase() + house.slice(1).toLowerCase();

        if (!validHouses.includes(sanitized)) {
            return {
                valid: false,
                error: `Casa inválida. Opciones: ${validHouses.join(', ')}`
            };
        }

        return { valid: true, sanitized };
    }

    /**
     * Valida ID de Discord
     * @param {string} discordId - ID a validar
     * @returns {{ valid: boolean, error?: string }}
     */
    validateDiscordId(discordId) {
        if (!discordId || typeof discordId !== 'string') {
            return { valid: false, error: 'ID de Discord inválido' };
        }

        // Discord IDs son snowflakes de 17-19 dígitos
        const idRegex = /^\d{17,19}$/;
        if (!idRegex.test(discordId)) {
            return { valid: false, error: 'Formato de ID de Discord inválido' };
        }

        return { valid: true };
    }

    /**
     * Sanitiza texto general (para mensajes, descripciones, etc.)
     * @param {string} text - Texto a sanitizar
     * @param {number} maxLength - Longitud máxima
     * @returns {string} Texto sanitizado
     */
    sanitizeText(text, maxLength = 2000) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        // Remover caracteres de control y espacios extra
        let sanitized = text
            .replace(/[\x00-\x1F\x7F]/g, '') // Remover caracteres de control
            .trim()
            .replace(/\s+/g, ' '); // Normalizar espacios

        // Limitar longitud
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        return sanitized;
    }

    /**
     * Valida permiso de usuario
     * @param {GuildMember} member - Miembro del servidor
     * @param {string} requiredPermission - Permiso requerido
     * @returns {{ allowed: boolean, error?: string }}
     */
    validatePermission(member, requiredPermission) {
        if (!member) {
            return { allowed: false, error: 'Miembro no encontrado' };
        }

        // Owner siempre tiene permiso
        if (member.guild.ownerId === member.id) {
            return { allowed: true };
        }

        // Verificar permiso específico
        if (requiredPermission && !member.permissions.has(requiredPermission)) {
            logger.security('PermissionDenied', member.id, requiredPermission, {
                guildId: member.guild.id
            });

            return {
                allowed: false,
                error: `Requiere permiso: ${requiredPermission}`
            };
        }

        return { allowed: true };
    }

    /**
     * Valida rol de moderador/admin
     * @param {GuildMember} member - Miembro del servidor
     * @returns {boolean}
     */
    isModerator(member) {
        if (!member) return false;

        // Owner
        if (member.guild.ownerId === member.id) return true;

        // Permisos de admin/moderador
        const modPermissions = [
            'Administrator',
            'ManageGuild',
            'ManageMessages',
            'KickMembers',
            'BanMembers'
        ];

        return modPermissions.some(perm => member.permissions.has(perm));
    }

    /**
     * Log de validación fallida
     */
    logValidationError(context, userId, error) {
        logger.warn('Validación fallida', {
            context,
            userId,
            error
        });
    }
}

// Singleton
module.exports = new InputValidator();
