const logger = require('../Utils/logger');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * Sistema de backup automático de MongoDB
 */
class BackupManager {
    constructor() {
        this.backupDir = path.join(__dirname, '..', 'backups');
        this.maxBackups = 7; // Mantener últimos 7 backups

        // Crear directorio de backups si no existe
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            logger.info('Directorio de backups creado', { path: this.backupDir });
        }
    }

    /**
     * Crea un backup de la base de datos MongoDB
     * @returns {Promise<string>} Ruta del backup generado
     */
    async createBackup() {
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const backupName = `backup_${timestamp}`;
        const backupPath = path.join(this.backupDir, backupName);

        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI no configurado');
        }

        logger.info('Iniciando backup de MongoDB', { backupName });

        try {
            // Usar mongodump para crear backup
            const command = `mongodump --uri="${mongoUri}" --out="${backupPath}"`;

            const { stdout, stderr } = await execPromise(command);

            if (stderr && !stderr.includes('done')) {
                logger.warn('Advertencia durante backup', { stderr });
            }

            // Comprimir el backup
            const zipPath = `${backupPath}.zip`;
            await this.compressBackup(backupPath, zipPath);

            // Eliminar carpeta sin comprimir
            fs.rmSync(backupPath, { recursive: true, force: true });

            logger.info('Backup completado exitosamente', {
                backupName,
                path: zipPath,
                size: this.getFileSize(zipPath)
            });

            // Limpiar backups antiguos
            await this.cleanOldBackups();

            return zipPath;
        } catch (error) {
            logger.error('Error creando backup', {
                error: error.message,
                backupName
            });
            throw error;
        }
    }

    /**
     * Comprime un directorio en un archivo zip
     */
    async compressBackup(sourcePath, zipPath) {
        const AdmZip = require('adm-zip');
        const zip = new AdmZip();

        zip.addLocalFolder(sourcePath);
        zip.writeZip(zipPath);

        logger.debug('Backup comprimido', { zipPath });
    }

    /**
     * Elimina backups antiguos para mantener solo los últimos N
     */
    async cleanOldBackups() {
        try {
            const files = fs.readdirSync(this.backupDir)
                .filter(file => file.startsWith('backup_') && file.endsWith('.zip'))
                .map(file => ({
                    name: file,
                    path: path.join(this.backupDir, file),
                    time: fs.statSync(path.join(this.backupDir, file)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time); // Más reciente primero

            // Eliminar backups viejos
            const toDelete = files.slice(this.maxBackups);
            for (const file of toDelete) {
                fs.unlinkSync(file.path);
                logger.info('Backup antiguo eliminado', { filename: file.name });
            }

            if (toDelete.length > 0) {
                logger.info(`Limpiados ${toDelete.length} backups antiguos`);
            }
        } catch (error) {
            logger.error('Error limpiando backups antiguos', { error: error.message });
        }
    }

    /**
     * Lista todos los backups disponibles
     */
    listBackups() {
        try {
            const files = fs.readdirSync(this.backupDir)
                .filter(file => file.startsWith('backup_') && file.endsWith('.zip'))
                .map(file => {
                    const fullPath = path.join(this.backupDir, file);
                    const stats = fs.statSync(fullPath);

                    return {
                        filename: file,
                        path: fullPath,
                        size: this.formatBytes(stats.size),
                        date: stats.mtime,
                        timestamp: stats.mtime.getTime()
                    };
                })
                .sort((a, b) => b.timestamp - a.timestamp);

            return files;
        } catch (error) {
            logger.error('Error listando backups', { error: error.message });
            return [];
        }
    }

    /**
     * Restaura un backup específico
     * ADVERTENCIA: Esto sobrescribirá la base de datos actual
     */
    async restoreBackup(backupPath) {
        logger.warn('Iniciando restauración de backup', { backupPath });

        if (!fs.existsSync(backupPath)) {
            throw new Error('Archivo de backup no encontrado');
        }

        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI no configurado');
        }

        try {
            // Descomprimir backup
            const tempDir = path.join(this.backupDir, 'temp_restore');
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
            fs.mkdirSync(tempDir, { recursive: true });

            const AdmZip = require('adm-zip');
            const zip = new AdmZip(backupPath);
            zip.extractAllTo(tempDir, true);

            // Restaurar con mongorestore
            const command = `mongorestore --uri="${mongoUri}" --drop "${tempDir}"`;
            const { stdout, stderr } = await execPromise(command);

            // Limpiar temp
            fs.rmSync(tempDir, { recursive: true, force: true });

            logger.info('Backup restaurado exitosamente', { backupPath });

            return true;
        } catch (error) {
            logger.error('Error restaurando backup', {
                error: error.message,
                backupPath
            });
            throw error;
        }
    }

    /**
     * Obtiene el tamaño de un archivo
     */
    getFileSize(filePath) {
        const stats = fs.statSync(filePath);
        return this.formatBytes(stats.size);
    }

    /**
     * Formatea bytes a formato legible
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Obtiene estadísticas de los backups
     */
    getStats() {
        const backups = this.listBackups();
        const totalSize = backups.reduce((sum, backup) => {
            const stats = fs.statSync(backup.path);
            return sum + stats.size;
        }, 0);

        return {
            count: backups.length,
            totalSize: this.formatBytes(totalSize),
            oldestBackup: backups.length > 0 ? backups[backups.length - 1].date : null,
            newestBackup: backups.length > 0 ? backups[0].date : null
        };
    }
}

module.exports = new BackupManager();
