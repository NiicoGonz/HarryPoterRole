const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const characterManager = require('../../Modules/RPG/characterManager');
const { HOUSE_COLORS, HOUSE_EMOJIS } = require('../../Modules/RPG/gameData');

// Cooldown en milisegundos (5 minutos)
const COOLDOWN_MS = 5 * 60 * 1000;
const cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('descansar')
        .setDescription('Descansa para recuperar HP y MP completamente'),
    
    async execute(interaction) {
        const character = await characterManager.getCharacter(interaction.user.id);
        
        if (!character) {
            return interaction.reply({
                content: '❌ No tienes un personaje creado.\nUsa `/crear-personaje` para comenzar tu aventura.',
                ephemeral: true
            });
        }
        
        // Verificar si está en combate
        if (character.status.inCombat) {
            return interaction.reply({
                content: '⚔️ No puedes descansar mientras estás en combate.',
                ephemeral: true
            });
        }
        
        // Verificar cooldown
        const lastRest = cooldowns.get(interaction.user.id);
        if (lastRest) {
            const timeLeft = COOLDOWN_MS - (Date.now() - lastRest);
            if (timeLeft > 0) {
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                return interaction.reply({
                    content: `⏰ Debes esperar **${minutes}m ${seconds}s** antes de poder descansar de nuevo.`,
                    ephemeral: true
                });
            }
        }
        
        // Guardar valores anteriores
        const previousHp = character.stats.hp;
        const previousMp = character.stats.mp;
        
        // Verificar si ya está al máximo
        if (previousHp === character.stats.maxHp && previousMp === character.stats.maxMp) {
            return interaction.reply({
                content: '✨ Ya estás en perfectas condiciones. No necesitas descansar.',
                ephemeral: true
            });
        }
        
        // Descansar
        const updatedCharacter = await characterManager.restCharacter(interaction.user.id);
        
        // Calcular recuperación
        const hpRecovered = updatedCharacter.stats.hp - previousHp;
        const mpRecovered = updatedCharacter.stats.mp - previousMp;
        
        // Establecer cooldown
        cooldowns.set(interaction.user.id, Date.now());
        
        const houseColor = HOUSE_COLORS[character.house];
        const houseEmoji = HOUSE_EMOJIS[character.house];
        
        // Seleccionar ubicación de descanso aleatoria
        const restLocations = [
            { name: 'Sala Común', description: 'Te acurrucas en un cómodo sillón junto al fuego.' },
            { name: 'Enfermería', description: 'Madame Pomfrey te atiende con sus pociones curativas.' },
            { name: 'Gran Comedor', description: 'Disfrutas de un abundante festín que restaura tus fuerzas.' },
            { name: 'Lago Negro', description: 'Meditas junto a las tranquilas aguas del lago.' },
            { name: 'Biblioteca', description: 'El silencio de la biblioteca te ayuda a recuperar energías.' }
        ];
        
        const location = restLocations[Math.floor(Math.random() * restLocations.length)];
        
        const restEmbed = new EmbedBuilder()
            .setTitle(`${houseEmoji} ¡Has descansado!`)
            .setDescription(`*${location.description}*`)
            .setColor(houseColor)
            .addFields(
                {
                    name: '❤️ Vida Recuperada',
                    value: `+${hpRecovered} HP\n${previousHp} → **${updatedCharacter.stats.maxHp}**`,
                    inline: true
                },
                {
                    name: '💙 Magia Recuperada',
                    value: `+${mpRecovered} MP\n${previousMp} → **${updatedCharacter.stats.maxMp}**`,
                    inline: true
                },
                {
                    name: '📍 Ubicación',
                    value: location.name,
                    inline: true
                }
            )
            .setImage('https://media.giphy.com/media/3o7TKsQ8MgPt4AU3PG/giphy.gif')
            .setFooter({ text: 'Podrás descansar de nuevo en 5 minutos' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [restEmbed] });
    }
};
