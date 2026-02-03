const cron = require('node-cron');
const backupManager = require('../Utils/backupManager');
const logger = require('../Utils/logger');

/**
 * Configura tareas programadas (cron jobs)
 */
function setupScheduledTasks() {
    logger.info('Configurando tareas programadas...');

    // Backup diario a las 3:00 AM
    cron.schedule('0 3 * * *', async () => {
        logger.info('Ejecutando backup programado...');
        try {
            await backupManager.createBackup();
            logger.info('Backup programado completado exitosamente');
        } catch (error) {
            logger.error('Error en backup programado', {
                error: error.message,
                stack: error.stack
            });
        }
    }, {
        timezone: "America/Bogota" // Ajustar según tu zona horaria
    });

    logger.info('✅ Backup automático programado para las 3:00 AM (diario)');

    // Limpieza de rate limiter cada hora
    const rateLimiter = require('../Utils/rateLimiter');
    cron.schedule('0 * * * *', () => {
        logger.debug('Limpiando rate limiter...');
        rateLimiter.cleanup();
    });

    logger.info('✅ Limpieza de rate limiter programada (cada hora)');

    // Reporte de estadísticas semanal (Lunes a las 9:00 AM)
    cron.schedule('0 9 * * 1', async () => {
        logger.info('Generando reporte semanal...');
        try {
            const backupStats = backupManager.getStats();
            const rateLimiterStats = rateLimiter.getStats();

            logger.info('Reporte Semanal', {
                backups: backupStats,
                rateLimiter: rateLimiterStats
            });
        } catch (error) {
            logger.error('Error generando reporte semanal', { error: error.message });
        }
    }, {
        timezone: "America/Bogota"
    });

    logger.info('✅ Reporte semanal programado (Lunes 9:00 AM)');
}

module.exports = { setupScheduledTasks };
