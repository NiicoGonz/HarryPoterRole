const backupManager = require('../Utils/backupManager');
const logger = require('../Utils/logger');

/**
 * Script para ejecutar un backup manual de la base de datos
 * Uso: npm run backup
 */
async function runManualBackup() {
    console.log('🔄 Iniciando backup manual de MongoDB...\n');

    try {
        const backupPath = await backupManager.createBackup();

        console.log('✅ Backup completado exitosamente!');
        console.log(`📁 Ubicación: ${backupPath}\n`);

        // Mostrar estadísticas
        const stats = backupManager.getStats();
        console.log('📊 Estadísticas de Backups:');
        console.log(`   - Total de backups: ${stats.count}`);
        console.log(`   - Tamaño total: ${stats.totalSize}`);
        console.log(`   - Backup más reciente: ${stats.newestBackup}`);
        console.log(`   - Backup más antiguo: ${stats.oldestBackup}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creando backup:', error.message);
        logger.error('Error en backup manual', { error: error.message });
        process.exit(1);
    }
}

runManualBackup();
