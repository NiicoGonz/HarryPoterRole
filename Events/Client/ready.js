const {Client} = require('discord.js');

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log(`${client.user.username} is now online.`);
        
        // Registrar comandos cuando el bot esté listo
        if (client.commandsArray && client.commandsArray.length > 0) {
            try {
                await client.application.commands.set(client.commandsArray);
                console.log(`✅ ${client.commandsArray.length} comandos registrados globalmente.`);
            } catch (error) {
                console.error('Error al registrar comandos:', error);
            }
        }
    },
};