const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Formato personalizado para logs
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        // Agregar metadata si existe
        if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
        }

        return msg;
    })
);

// Configuración de transports
const transports = [
    // Consola - solo en desarrollo
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            customFormat
        ),
        level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
    }),

    // Archivo de todos los logs
    new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        format: customFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        level: 'info'
    }),

    // Archivo solo de errores
    new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        format: customFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        level: 'error'
    }),

    // Archivo de comandos ejecutados
    new winston.transports.File({
        filename: path.join(logsDir, 'commands.log'),
        format: customFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 3,
        level: 'info'
    })
];

// Crear logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports,
    exitOnError: false
});

// Métodos específicos para diferentes tipos de logs
logger.command = (commandName, userId, guildId, metadata = {}) => {
    logger.info(`Comando ejecutado: ${commandName}`, {
        userId,
        guildId,
        ...metadata
    });
};

logger.database = (operation, model, metadata = {}) => {
    logger.debug(`DB ${operation}:`, {
        model,
        ...metadata
    });
};

logger.event = (eventName, metadata = {}) => {
    logger.info(`Evento: ${eventName}`, metadata);
};

logger.security = (action, userId, reason, metadata = {}) => {
    logger.warn(`Seguridad: ${action}`, {
        userId,
        reason,
        ...metadata
    });
};

// Wrappers para usar con try-catch
logger.logError = (error, context = {}) => {
    logger.error(error.message, {
        stack: error.stack,
        ...context
    });
};

module.exports = logger;
