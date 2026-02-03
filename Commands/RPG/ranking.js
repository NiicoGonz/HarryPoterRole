const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const characterManager = require('../../Modules/RPG/characterManager');
const { HOUSE_COLORS, HOUSE_EMOJIS } = require('../../Modules/RPG/gameData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('Muestra el ranking de magos')
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Tipo de ranking')
                .setRequired(false)
                .addChoices(
                    { name: '🌟 Global', value: 'global' },
                    { name: '🦁 Gryffindor', value: 'Gryffindor' },
                    { name: '🦡 Hufflepuff', value: 'Hufflepuff' },
                    { name: '🦅 Ravenclaw', value: 'Ravenclaw' },
                    { name: '🐍 Slytherin', value: 'Slytherin' }
                )
        ),
    
    async execute(interaction) {
        const rankingType = interaction.options.getString('tipo') || 'global';
        
        let leaderboard;
        let title;
        let color;
        let emoji;
        
        if (rankingType === 'global') {
            leaderboard = await characterManager.getLeaderboard(10);
            title = '🏆 Ranking Global de Hogwarts';
            color = '#FFD700'; // Dorado
            emoji = '🌟';
        } else {
            leaderboard = await characterManager.getHouseLeaderboard(rankingType, 10);
            title = `${HOUSE_EMOJIS[rankingType]} Ranking de ${rankingType}`;
            color = HOUSE_COLORS[rankingType];
            emoji = HOUSE_EMOJIS[rankingType];
        }
        
        if (!leaderboard || leaderboard.length === 0) {
            return interaction.reply({
                content: `❌ No hay magos registrados ${rankingType === 'global' ? 'todavía' : `en ${rankingType}`}.\nSé el primero en crear tu personaje con \`/crear-personaje\``,
                ephemeral: true
            });
        }
        
        // Crear lista de ranking
        const rankingList = leaderboard.map((char, index) => {
            const medal = getMedal(index);
            const houseEmoji = rankingType === 'global' ? HOUSE_EMOJIS[char.house] : '';
            return `${medal} **${char.name}** ${houseEmoji}\n   Nivel ${char.level} • ${char.totalExperience.toLocaleString()} XP`;
        }).join('\n\n');
        
        // Buscar la posición del usuario que ejecuta el comando
        const userCharacter = await characterManager.getCharacter(interaction.user.id);
        let userPosition = null;
        
        if (userCharacter) {
            const allPlayers = rankingType === 'global' 
                ? await characterManager.getLeaderboard(100)
                : await characterManager.getHouseLeaderboard(rankingType, 100);
            
            userPosition = allPlayers.findIndex(c => c.discordId === interaction.user.id) + 1;
        }
        
        // Crear embed
        const rankingEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(rankingList)
            .setColor(color)
            .setThumbnail('https://static.wikia.nocookie.net/harrypotter/images/a/ae/Hogwartscrest.png')
            .setTimestamp();
        
        // Añadir posición del usuario si tiene personaje
        if (userPosition) {
            const positionEmoji = userPosition <= 3 ? getMedal(userPosition - 1) : `#${userPosition}`;
            rankingEmbed.addFields({
                name: '📍 Tu Posición',
                value: `${positionEmoji} de ${leaderboard.length + (userPosition > 10 ? userPosition - 10 : 0)} magos`,
                inline: false
            });
        }
        
        // Footer con estadísticas
        rankingEmbed.setFooter({ 
            text: `${emoji} ${rankingType === 'global' ? 'Top 10 de todas las casas' : `Top 10 de ${rankingType}`}` 
        });
        
        await interaction.reply({ embeds: [rankingEmbed] });
    }
};

/**
 * Obtiene la medalla según posición
 */
function getMedal(index) {
    const medals = ['🥇', '🥈', '🥉'];
    if (index < 3) return medals[index];
    return `**#${index + 1}**`;
}
