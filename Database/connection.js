const mongoose = require('mongoose');
const logger = require('../Utils/logger');

/**
 * Conecta a MongoDB
 * @returns {Promise<void>}
 */
async function connectDatabase() {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        logger.error('❌ MONGODB_URI no está definido en las variables de entorno');
        logger.error('📝 Añade MONGODB_URI a tu archivo .env');
        logger.error('   Ejemplo: MONGODB_URI=mongodb://localhost:27017/harrypotter_rpg');
        logger.error('   O usa MongoDB Atlas: MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/harrypotter_rpg');
        process.exit(1);
    }

    try {
        mongoose.set('strictQuery', false);

        await mongoose.connect(mongoUri, {
            // Opciones de conexión recomendadas
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        logger.database('connect', 'MongoDB', { uri: mongoUri.split('@')[1] || 'local' });
        logger.info('✅ Conectado a MongoDB correctamente');

        // Eventos de conexión
        mongoose.connection.on('error', (err) => {
            logger.error('❌ Error de MongoDB:', { error: err.message });
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️ MongoDB desconectado');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('🔄 MongoDB reconectado');
        });

    } catch (error) {
        logger.error('❌ Error al conectar a MongoDB:', { error: error.message, stack: error.stack });

        if (error.message.includes('ECONNREFUSED')) {
            logger.error('📝 SOLUCIÓN:');
            logger.error('1. Asegúrate de que MongoDB está corriendo');
            logger.error('2. O usa MongoDB Atlas (cloud) si no tienes MongoDB local');
        }

        process.exit(1);
    }
}

/**
 * Desconecta de MongoDB
 * @returns {Promise<void>}
 */
async function disconnectDatabase() {
    try {
        await mongoose.disconnect();
        logger.info('📤 Desconectado de MongoDB');
    } catch (error) {
        logger.error('Error al desconectar de MongoDB:', { error: error.message });
    }
}

module.exports = { connectDatabase, disconnectDatabase };
