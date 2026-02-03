const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const characterManager = require('../../Modules/RPG/characterManager');
const spellManager = require('../../Modules/RPG/spellManager');
const inventoryManager = require('../../Modules/RPG/inventoryManager');
const { HOUSE_COLORS, HOUSE_EMOJIS, HOUSE_BONUSES } = require('../../Modules/RPG/gameData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Muestra el perfil de un personaje')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario cuyo perfil quieres ver (opcional)')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        
        // Obtener personaje
        const character = await characterManager.getCharacter(targetUser.id);
        
        // Obtener conteos de colecciones relacionadas
        const spellCount = await spellManager.getSpellCount(targetUser.id);
        const slotInfo = await inventoryManager.getSlotInfo(targetUser.id);
        
        if (!character) {
            if (targetUser.id === interaction.user.id) {
                return interaction.reply({
                    content: '❌ No tienes un personaje creado.\nUsa `/crear-personaje` para comenzar tu aventura.',
                    ephemeral: true
                });
            } else {
                return interaction.reply({
                    content: `❌ ${targetUser.username} no tiene un personaje creado.`,
                    ephemeral: true
                });
            }
        }
        
        // Calcular datos derivados
        const houseEmoji = HOUSE_EMOJIS[character.house];
        const houseColor = HOUSE_COLORS[character.house];
        const houseBonus = HOUSE_BONUSES[character.house];
        
        const expToNext = character.getExpToNextLevel();
        const expProgress = Math.floor((character.experience / expToNext) * 100);
        const progressBar = createProgressBar(expProgress, 12);
        
        const hpPercent = Math.floor((character.stats.hp / character.stats.maxHp) * 100);
        const mpPercent = Math.floor((character.stats.mp / character.stats.maxMp) * 100);
        const hpBar = createProgressBar(hpPercent, 10, '🟩', '⬛');
        const mpBar = createProgressBar(mpPercent, 10, '🟦', '⬛');
        
        // Crear embed principal
        const profileEmbed = new EmbedBuilder()
            .setTitle(`${houseEmoji} ${character.name}`)
            .setDescription(`*${character.title}*\n**Casa ${character.house}**`)
            .setColor(houseColor)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                {
                    name: '📊 Nivel',
                    value: `**${character.level}**`,
                    inline: true
                },
                {
                    name: '✨ Experiencia',
                    value: `${character.experience}/${expToNext}\n${progressBar}`,
                    inline: true
                },
                {
                    name: '💰 Galeones',
                    value: `**${character.galleons}**`,
                    inline: true
                },
                {
                    name: '❤️ Vida',
                    value: `${character.stats.hp}/${character.stats.maxHp}\n${hpBar}`,
                    inline: true
                },
                {
                    name: '💙 Magia',
                    value: `${character.stats.mp}/${character.stats.maxMp}\n${mpBar}`,
                    inline: true
                },
                {
                    name: '🎯 Puntos Libres',
                    value: `**${character.attributePoints}**`,
                    inline: true
                },
                {
                    name: '⚔️ Atributos',
                    value: [
                        `💪 **Fuerza:** ${character.stats.strength}`,
                        `🧠 **Inteligencia:** ${character.stats.intelligence}`,
                        `🏃 **Destreza:** ${character.stats.dexterity}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🛡️ Defensa',
                    value: [
                        `🛡️ **Constitución:** ${character.stats.constitution}`,
                        `📚 **Sabiduría:** ${character.stats.wisdom}`,
                        `🍀 **Suerte:** ${character.stats.luck}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '⚡ Poder',
                    value: [
                        `🔮 **Mágico:** ${character.getMagicPower()}`,
                        `⚔️ **Físico:** ${character.getPhysicalPower()}`,
                        `🛡️ **Defensa:** ${character.getDefense()}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📖 Hechizos',
                    value: `${spellCount} aprendidos`,
                    inline: true
                },
                {
                    name: '🎒 Inventario',
                    value: `${slotInfo.used}/${slotInfo.total}`,
                    inline: true
                },
                {
                    name: '\u200b',
                    value: '\u200b',
                    inline: true
                },
                {
                    name: '🪄 Varita',
                    value: `${character.wand.wood}, ${character.wand.core}\n*${character.wand.length}" - ${character.wand.flexibility}*`,
                    inline: false
                },
                {
                    name: '⚡ Habilidad de Casa',
                    value: houseBonus.specialAbility,
                    inline: false
                }
            )
            .setFooter({ 
                text: `📍 ${character.status.currentLocation} • Último descanso: ${formatTimeSince(character.status.lastRest)}`
            })
            .setTimestamp();
        
        // Embed de estadísticas de juego (opcional, si tiene batallas)
        const hasGameStats = character.gameStats.battlesWon > 0 || character.gameStats.battlesLost > 0;
        
        const embeds = [profileEmbed];
        
        if (hasGameStats) {
            const statsEmbed = new EmbedBuilder()
                .setTitle('📈 Estadísticas de Combate')
                .setColor(houseColor)
                .addFields(
                    {
                        name: '⚔️ Batallas',
                        value: `✅ Ganadas: **${character.gameStats.battlesWon}**\n❌ Perdidas: **${character.gameStats.battlesLost}**`,
                        inline: true
                    },
                    {
                        name: '👹 Enemigos',
                        value: `Derrotados: **${character.gameStats.enemiesDefeated}**`,
                        inline: true
                    },
                    {
                        name: '🎯 Críticos',
                        value: `**${character.gameStats.criticalHits}** (${character.getCritChance().toFixed(1)}% prob.)`,
                        inline: true
                    },
                    {
                        name: '💥 Daño',
                        value: `Infligido: **${character.gameStats.totalDamageDealt}**\nRecibido: **${character.gameStats.totalDamageReceived}**`,
                        inline: true
                    },
                    {
                        name: '💚 Curación',
                        value: `Total: **${character.gameStats.totalHealing}**`,
                        inline: true
                    },
                    {
                        name: '📜 Misiones',
                        value: `Completadas: **${character.gameStats.questsCompleted}**`,
                        inline: true
                    }
                );
            embeds.push(statsEmbed);
        }
        
        await interaction.reply({ embeds });
    }
};

/**
 * Crea una barra de progreso visual
 */
function createProgressBar(percent, length = 10, filled = '█', empty = '░') {
    const filledCount = Math.floor((percent / 100) * length);
    const emptyCount = length - filledCount;
    return filled.repeat(filledCount) + empty.repeat(emptyCount);
}

/**
 * Formatea el tiempo transcurrido
 */
function formatTimeSince(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
}
