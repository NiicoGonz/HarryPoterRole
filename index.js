const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Channel } = Partials;
const { loadEvents } = require('./Handlers/eventHandler');
const { loadCommands } = require('./Handlers/commandHandler');
const { connectDatabase } = require('./Database/connection');
const logger = require('./Utils/logger');
const { setupScheduledTasks } = require('./Utils/scheduledTasks');
require('dotenv').config();

// Configuración de intents
const intents = [
    Guilds,
    GuildMembers,  // Habilitado en Developer Portal
    GuildMessages
];

const client = new Client({
    intents: intents,
    partials: [User, Message, GuildMember, ThreadMember],
});

client.commands = new Collection();

// Manejo de errores mejorado
client.on('error', (error) => {
    logger.error('Error del cliente:', { error: error.message, stack: error.stack });
});

client.on('warn', (warning) => {
    logger.warn('Advertencia del cliente:', { warning });
});

process.on('unhandledRejection', (error) => {
    logger.error('Error no manejado:', { error: error.message, stack: error.stack });
});

// Función principal de inicio
async function startBot() {
    logger.info('🧙 Iniciando Bot de Harry Potter RPG...');

    // 1. Conectar a MongoDB
    await connectDatabase();

    // 2. Cargar eventos y comandos
    loadEvents(client);
    loadCommands(client);

    // 3. Configurar tareas programadas (backups, limpieza, etc.)
    setupScheduledTasks();

    // 4. Login en Discord
    await client.login(process.env.TOKEN);
}

// Iniciar el bot
startBot().catch((error) => {
    logger.error('Error al iniciar el bot:', { error: error.message, stack: error.stack });

    if (error.message.includes('disallowed intents')) {
        logger.error('❌ ERROR: Intents no habilitados en Discord Developer Portal');
        logger.error('📝 SOLUCIÓN:');
        logger.error('1. Ve a: https://discord.com/developers/applications');
        logger.error('2. Selecciona tu aplicación');
        logger.error('3. Ve a: Bot → Privileged Gateway Intents');
        logger.error('4. Habilita: SERVER MEMBERS INTENT');
        logger.error('5. Guarda los cambios');
        logger.error('6. Reinicia el bot');
    }

    if (error.message.includes('MONGODB') || error.message.includes('ECONNREFUSED')) {
        logger.error('❌ ERROR: No se pudo conectar a MongoDB');
        logger.error('📝 SOLUCIÓN:');
        logger.error('1. Verifica que MONGODB_URI esté configurado en .env');
        logger.error('2. Si usas MongoDB local, asegúrate de que esté corriendo');
        logger.error('3. Si usas MongoDB Atlas, verifica tus credenciales');
    }

    process.exit(1);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    logger.info('🛑 Cerrando bot...');
    const { disconnectDatabase } = require('./Database/connection');
    await disconnectDatabase();
    client.destroy();
    process.exit(0);
});