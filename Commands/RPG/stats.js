const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const characterManager = require('../../Modules/RPG/characterManager');
const { HOUSE_COLORS, HOUSE_EMOJIS } = require('../../Modules/RPG/gameData');

const STAT_INFO = {
    strength: {
        name: 'Fuerza',
        emoji: '💪',
        description: 'Aumenta el daño físico y la efectividad de ataques cuerpo a cuerpo.'
    },
    intelligence: {
        name: 'Inteligencia',
        emoji: '🧠',
        description: 'Aumenta el poder mágico y el daño de hechizos ofensivos.'
    },
    dexterity: {
        name: 'Destreza',
        emoji: '🏃',
        description: 'Aumenta la velocidad, precisión y probabilidad de esquiva.'
    },
    constitution: {
        name: 'Constitución',
        emoji: '🛡️',
        description: 'Aumenta la defensa física y los puntos de vida máximos.'
    },
    wisdom: {
        name: 'Sabiduría',
        emoji: '📚',
        description: 'Aumenta la defensa mágica y los puntos de magia máximos.'
    },
    luck: {
        name: 'Suerte',
        emoji: '🍀',
        description: 'Aumenta la probabilidad de crítico y mejora la calidad de los drops.'
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Gestiona tus puntos de estadísticas')
        .addStringOption(option =>
            option.setName('stat')
                .setDescription('Estadística a mejorar')
                .setRequired(false)
                .addChoices(
                    { name: '💪 Fuerza', value: 'strength' },
                    { name: '🧠 Inteligencia', value: 'intelligence' },
                    { name: '🏃 Destreza', value: 'dexterity' },
                    { name: '🛡️ Constitución', value: 'constitution' },
                    { name: '📚 Sabiduría', value: 'wisdom' },
                    { name: '🍀 Suerte', value: 'luck' }
                )
        )
        .addIntegerOption(option =>
            option.setName('points')
                .setDescription('Cantidad de puntos a asignar (1-10)')
                .setMinValue(1)
                .setMaxValue(10)
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const character = await characterManager.getCharacter(interaction.user.id);
        
        if (!character) {
            return interaction.reply({
                content: '❌ No tienes un personaje creado.\nUsa `/crear-personaje` para comenzar tu aventura.',
                ephemeral: true
            });
        }
        
        const houseColor = HOUSE_COLORS[character.house];
        const houseEmoji = HOUSE_EMOJIS[character.house];
        
        const statToUpgrade = interaction.options.getString('stat');
        const pointsToAdd = interaction.options.getInteger('points') || 1;
        
        // Si no especifica estadística, mostrar panel de stats
        if (!statToUpgrade) {
            const statsEmbed = new EmbedBuilder()
                .setTitle(`${houseEmoji} Estadísticas de ${character.name}`)
                .setDescription(`**Puntos disponibles:** ${character.attributePoints}\n\nUsa \`/stats [stat] [points]\` para asignar puntos.`)
                .setColor(houseColor);
            
            // Añadir cada estadística
            Object.entries(STAT_INFO).forEach(([key, info]) => {
                const currentValue = character.stats[key];
                const barLength = Math.min(Math.floor(currentValue / 5), 20);
                const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
                
                statsEmbed.addFields({
                    name: `${info.emoji} ${info.name}`,
                    value: `\`${bar}\` **${currentValue}**\n*${info.description}*`,
                    inline: false
                });
            });
            
            // Mostrar estadísticas derivadas
            statsEmbed.addFields(
                {
                    name: '📊 Poder Derivado',
                    value: [
                        `🔮 **Poder Mágico:** ${character.getMagicPower()}`,
                        `⚔️ **Poder Físico:** ${character.getPhysicalPower()}`,
                        `🛡️ **Defensa Total:** ${character.getDefense()}`,
                        `💨 **Velocidad:** ${character.getSpeed()}`,
                        `🎯 **Crítico:** ${character.getCritChance().toFixed(1)}%`
                    ].join('\n'),
                    inline: false
                }
            );
            
            // Menú de selección si tiene puntos disponibles
            if (character.attributePoints > 0) {
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`stat_select_${interaction.user.id}`)
                    .setPlaceholder('Selecciona una estadística para mejorar')
                    .addOptions(
                        Object.entries(STAT_INFO).map(([key, info]) => ({
                            label: info.name,
                            description: `Actual: ${character.stats[key]} | +1 punto`,
                            value: key,
                            emoji: info.emoji
                        }))
                    );
                
                const row = new ActionRowBuilder().addComponents(selectMenu);
                
                const response = await interaction.reply({ 
                    embeds: [statsEmbed], 
                    components: [row],
                    ephemeral: true
                });
                
                // Collector para el menú
                const collector = response.createMessageComponentCollector({
                    filter: i => i.user.id === interaction.user.id,
                    time: 60000
                });
                
                collector.on('collect', async (selectInteraction) => {
                    const selectedStat = selectInteraction.values[0];
                    
                    try {
                        const updatedCharacter = await characterManager.assignAttributePoints(
                            interaction.user.id,
                            selectedStat,
                            1
                        );
                        
                        const statInfo = STAT_INFO[selectedStat];
                        
                        const successEmbed = new EmbedBuilder()
                            .setTitle('✅ Estadística Mejorada')
                            .setDescription(`${statInfo.emoji} **${statInfo.name}** aumentada a **${updatedCharacter.stats[selectedStat]}**`)
                            .setColor('#00FF00')
                            .addFields({
                                name: 'Puntos Restantes',
                                value: `${updatedCharacter.attributePoints}`,
                                inline: true
                            });
                        
                        await selectInteraction.update({
                            embeds: [successEmbed],
                            components: []
                        });
                        
                    } catch (error) {
                        await selectInteraction.update({
                            content: `❌ Error: ${error.message}`,
                            embeds: [],
                            components: []
                        });
                    }
                });
                
                collector.on('end', (collected, reason) => {
                    if (reason === 'time' && collected.size === 0) {
                        interaction.editReply({
                            components: []
                        }).catch(() => {});
                    }
                });
                
            } else {
                statsEmbed.setFooter({ 
                    text: 'Sube de nivel para obtener más puntos de estadística' 
                });
                
                await interaction.reply({ embeds: [statsEmbed], ephemeral: true });
            }
            
            return;
        }
        
        // Asignar puntos a estadística específica
        if (character.attributePoints < pointsToAdd) {
            return interaction.reply({
                content: `❌ No tienes suficientes puntos.\n**Puntos disponibles:** ${character.attributePoints}\n**Puntos solicitados:** ${pointsToAdd}`,
                ephemeral: true
            });
        }
        
        try {
            const updatedCharacter = await characterManager.assignAttributePoints(
                interaction.user.id,
                statToUpgrade,
                pointsToAdd
            );
            
            const statInfo = STAT_INFO[statToUpgrade];
            
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Estadísticas Actualizadas')
                .setColor('#00FF00')
                .addFields(
                    {
                        name: `${statInfo.emoji} ${statInfo.name}`,
                        value: `**${updatedCharacter.stats[statToUpgrade]}** (+${pointsToAdd})`,
                        inline: true
                    },
                    {
                        name: '🎯 Puntos Restantes',
                        value: `${updatedCharacter.attributePoints}`,
                        inline: true
                    }
                )
                .setFooter({ text: 'Usa /perfil para ver tu perfil completo' });
            
            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
            
        } catch (error) {
            await interaction.reply({
                content: `❌ Error: ${error.message}`,
                ephemeral: true
            });
        }
    }
};
