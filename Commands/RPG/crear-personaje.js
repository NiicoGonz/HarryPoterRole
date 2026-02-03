const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const characterManager = require('../../Modules/RPG/characterManager');
const { HOUSE_COLORS, HOUSE_EMOJIS, HOUSE_BONUSES, HOUSE_IMAGES, getStarterSpells } = require('../../Modules/RPG/gameData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crear-personaje')
        .setDescription('Crea tu personaje de mago en Hogwarts')
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('El nombre de tu personaje (máx. 32 caracteres)')
                .setRequired(true)
                .setMaxLength(32)
        ),
    
    async execute(interaction) {
        const { user, member, guild } = interaction;
        const characterName = interaction.options.getString('nombre');
        
        // Verificar si ya tiene personaje
        const existingCharacter = await characterManager.hasCharacter(user.id);
        if (existingCharacter) {
            return interaction.reply({
                content: '❌ Ya tienes un personaje creado. Solo puedes tener uno por cuenta de Discord.\nUsa `/perfil` para ver tu personaje.',
                ephemeral: true
            });
        }
        
        // Detectar la casa del usuario por sus roles
        const houseRoles = {
            Gryffindor: process.env.GRYFFINDOR_ROLE_ID,
            Hufflepuff: process.env.HUFFLEPUFF_ROLE_ID,
            Ravenclaw: process.env.RAVENCLAW_ROLE_ID,
            Slytherin: process.env.SLYTHERIN_ROLE_ID
        };
        
        let detectedHouse = null;
        for (const [house, roleId] of Object.entries(houseRoles)) {
            if (roleId && member.roles.cache.has(roleId)) {
                detectedHouse = house;
                break;
            }
        }
        
        if (!detectedHouse) {
            return interaction.reply({
                content: '❌ No tienes asignada una casa de Hogwarts.\nPrimero debes completar el test del Sombrero Seleccionador en el canal de verificación.',
                ephemeral: true
            });
        }
        
        // Validar nombre
        if (characterName.length < 2) {
            return interaction.reply({
                content: '❌ El nombre debe tener al menos 2 caracteres.',
                ephemeral: true
            });
        }
        
        // Mostrar vista previa y pedir confirmación
        const houseEmoji = HOUSE_EMOJIS[detectedHouse];
        const houseColor = HOUSE_COLORS[detectedHouse];
        const houseBonus = HOUSE_BONUSES[detectedHouse];
        
        const previewEmbed = new EmbedBuilder()
            .setTitle('🪄 Crear Personaje')
            .setDescription(`¿Deseas crear tu personaje con estos datos?`)
            .setColor(houseColor)
            .addFields(
                {
                    name: '📛 Nombre',
                    value: characterName,
                    inline: true
                },
                {
                    name: `${houseEmoji} Casa`,
                    value: detectedHouse,
                    inline: true
                },
                {
                    name: '\u200b',
                    value: '\u200b',
                    inline: true
                },
                {
                    name: '✨ Bonus de Casa',
                    value: houseBonus.description,
                    inline: false
                },
                {
                    name: '⚡ Habilidad Especial',
                    value: houseBonus.specialAbility,
                    inline: false
                },
                {
                    name: '📦 Recibirás',
                    value: [
                        '• 🪄 Varita mágica única (generada aleatoriamente)',
                        '• 📖 4 hechizos iniciales',
                        '• 💰 50 Galeones',
                        '• 🎒 20 espacios de inventario'
                    ].join('\n'),
                    inline: false
                }
            )
            .setThumbnail(HOUSE_IMAGES[detectedHouse])
            .setFooter({ text: '¡Esta acción no se puede deshacer!' })
            .setTimestamp();
        
        const confirmRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`create_char_confirm_${user.id}`)
                    .setLabel('✅ Crear Personaje')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`create_char_cancel_${user.id}`)
                    .setLabel('❌ Cancelar')
                    .setStyle(ButtonStyle.Danger)
            );
        
        const response = await interaction.reply({
            embeds: [previewEmbed],
            components: [confirmRow],
            ephemeral: true,
            fetchReply: true
        });
        
        // Collector para los botones
        const collector = response.createMessageComponentCollector({
            filter: i => i.user.id === user.id,
            time: 60000, // 1 minuto
            max: 1
        });
        
        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId === `create_char_cancel_${user.id}`) {
                const cancelEmbed = new EmbedBuilder()
                    .setTitle('❌ Creación Cancelada')
                    .setDescription('Has cancelado la creación de tu personaje.\nPuedes intentarlo de nuevo cuando quieras.')
                    .setColor('#FF0000');
                
                return buttonInteraction.update({
                    embeds: [cancelEmbed],
                    components: []
                });
            }
            
            // Crear el personaje
            try {
                await buttonInteraction.deferUpdate();
                
                const character = await characterManager.createCharacter({
                    discordId: user.id,
                    discordUsername: user.username,
                    name: characterName,
                    house: detectedHouse
                });
                
                // Embed de éxito con toda la información
                const successEmbed = new EmbedBuilder()
                    .setTitle(`${houseEmoji} ¡Bienvenido a Hogwarts, ${character.name}!`)
                    .setDescription(`Has sido seleccionado para **${detectedHouse}**.\nTu aventura mágica comienza ahora.`)
                    .setColor(houseColor)
                    .addFields(
                        {
                            name: '🪄 Tu Varita',
                            value: [
                                `**Madera:** ${character.wand.wood}`,
                                `**Núcleo:** ${character.wand.core}`,
                                `**Longitud:** ${character.wand.length} pulgadas`,
                                `**Flexibilidad:** ${character.wand.flexibility}`
                            ].join('\n'),
                            inline: true
                        },
                        {
                            name: '📊 Estadísticas Iniciales',
                            value: [
                                `💪 Fuerza: **${character.stats.strength}**`,
                                `🧠 Inteligencia: **${character.stats.intelligence}**`,
                                `🎯 Destreza: **${character.stats.dexterity}**`,
                                `🛡️ Constitución: **${character.stats.constitution}**`,
                                `📚 Sabiduría: **${character.stats.wisdom}**`,
                                `🍀 Suerte: **${character.stats.luck}**`
                            ].join('\n'),
                            inline: true
                        },
                        {
                            name: '📖 Hechizos Aprendidos',
                            value: getStarterSpells().map(s => `• ${s.name}`).join('\n'),
                            inline: false
                        },
                        {
                            name: '🎮 Comandos Útiles',
                            value: [
                                '`/perfil` - Ver tu perfil completo',
                                '`/inventario` - Ver tu inventario',
                                '`/spells` - Ver tus hechizos',
                                '`/stats` - Asignar puntos'
                            ].join('\n'),
                            inline: false
                        }
                    )
                    .setThumbnail(HOUSE_IMAGES[detectedHouse])
                    .setImage('https://media.giphy.com/media/FVfzCDzKQDNny/giphy.gif')
                    .setFooter({ text: '¡Que la magia te acompañe!' })
                    .setTimestamp();
                
                await buttonInteraction.editReply({
                    embeds: [successEmbed],
                    components: []
                });
                
            } catch (error) {
                console.error('Error al crear personaje:', error);
                
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Error')
                    .setDescription(`No se pudo crear el personaje: ${error.message}`)
                    .setColor('#FF0000');
                
                await buttonInteraction.editReply({
                    embeds: [errorEmbed],
                    components: []
                });
            }
        });
        
        collector.on('end', (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle('⏰ Tiempo Agotado')
                    .setDescription('La creación de personaje ha expirado.\nUsa `/crear-personaje` de nuevo.')
                    .setColor('#FF9900');
                
                interaction.editReply({
                    embeds: [timeoutEmbed],
                    components: []
                }).catch(() => {});
            }
        });
    }
};
