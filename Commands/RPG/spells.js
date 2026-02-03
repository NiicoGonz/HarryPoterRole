const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const characterManager = require('../../Modules/RPG/characterManager');
const spellManager = require('../../Modules/RPG/spellManager');
const { HOUSE_COLORS, HOUSE_EMOJIS } = require('../../Modules/RPG/gameData');

// Datos completos de hechizos (para mostrar información detallada)
const SPELL_DATABASE = {
    lumos: {
        name: 'Lumos',
        description: 'Crea una luz brillante en la punta de la varita.',
        type: 'Utilidad',
        mpCost: 5,
        emoji: '💡'
    },
    nox: {
        name: 'Nox',
        description: 'Apaga la luz de Lumos.',
        type: 'Utilidad',
        mpCost: 2,
        emoji: '🌑'
    },
    flipendo: {
        name: 'Flipendo',
        description: 'Hechizo de empuje que causa daño menor.',
        type: 'Ataque',
        mpCost: 10,
        baseDamage: 15,
        emoji: '💨'
    },
    protego: {
        name: 'Protego',
        description: 'Crea un escudo mágico protector.',
        type: 'Defensa',
        mpCost: 15,
        duration: 2,
        emoji: '🛡️'
    },
    expelliarmus: {
        name: 'Expelliarmus',
        description: 'Desarma al oponente.',
        type: 'Ataque',
        mpCost: 20,
        baseDamage: 25,
        emoji: '⚡'
    },
    stupefy: {
        name: 'Stupefy',
        description: 'Aturde al objetivo.',
        type: 'Ataque',
        mpCost: 25,
        baseDamage: 30,
        emoji: '💫'
    },
    episkey: {
        name: 'Episkey',
        description: 'Cura heridas menores.',
        type: 'Curación',
        mpCost: 20,
        healing: 25,
        emoji: '💚'
    },
    incendio: {
        name: 'Incendio',
        description: 'Conjura fuego mágico.',
        type: 'Ataque',
        mpCost: 30,
        baseDamage: 40,
        emoji: '🔥'
    },
    aguamenti: {
        name: 'Aguamenti',
        description: 'Crea un chorro de agua.',
        type: 'Utilidad',
        mpCost: 15,
        emoji: '💧'
    },
    petrificus_totalus: {
        name: 'Petrificus Totalus',
        description: 'Paraliza completamente al objetivo.',
        type: 'Ataque',
        mpCost: 35,
        baseDamage: 20,
        emoji: '🗿'
    },
    riddikulus: {
        name: 'Riddikulus',
        description: 'Transforma un boggart en algo ridículo.',
        type: 'Defensa',
        mpCost: 20,
        emoji: '😂'
    },
    expecto_patronum: {
        name: 'Expecto Patronum',
        description: 'Invoca un patronus protector.',
        type: 'Defensa',
        mpCost: 50,
        emoji: '✨'
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spells')
        .setDescription('Muestra tus hechizos aprendidos')
        .addStringOption(option =>
            option.setName('spell')
                .setDescription('Ver detalles de un hechizo específico')
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
        const specificSpell = interaction.options.getString('spell');
        
        // Obtener hechizos del jugador desde la colección separada
        const playerSpells = await spellManager.getSpellsByDiscordId(interaction.user.id);
        
        // Si busca un hechizo específico
        if (specificSpell) {
            const spell = playerSpells.find(
                s => s.name.toLowerCase() === specificSpell.toLowerCase() ||
                     s.spellId.toLowerCase() === specificSpell.toLowerCase()
            );
            
            if (!spell) {
                return interaction.reply({
                    content: `❌ No conoces el hechizo "${specificSpell}".\nUsa \`/spells\` para ver los que conoces.`,
                    ephemeral: true
                });
            }
            
            const spellData = SPELL_DATABASE[spell.spellId] || {};
            const masteryBar = createMasteryBar(spell.mastery);
            
            const spellEmbed = new EmbedBuilder()
                .setTitle(`${spellData.emoji || '✨'} ${spell.name}`)
                .setDescription(spellData.description || 'Un hechizo mágico.')
                .setColor(houseColor)
                .addFields(
                    {
                        name: '📊 Tipo',
                        value: spellData.type || 'Desconocido',
                        inline: true
                    },
                    {
                        name: '💙 Costo MP',
                        value: `${spellData.mpCost || '?'}`,
                        inline: true
                    },
                    {
                        name: '🎯 Veces Usado',
                        value: `${spell.timesUsed}`,
                        inline: true
                    },
                    {
                        name: '⭐ Maestría',
                        value: `${masteryBar} **${spell.mastery}%**`,
                        inline: false
                    }
                );
            
            // Añadir campos específicos según tipo
            if (spellData.baseDamage) {
                const scaledDamage = Math.floor(spellData.baseDamage * (1 + character.stats.intelligence / 100));
                spellEmbed.addFields({
                    name: '💥 Daño',
                    value: `Base: ${spellData.baseDamage}\nCon tu INT: **${scaledDamage}**`,
                    inline: true
                });
            }
            
            if (spellData.healing) {
                const scaledHealing = Math.floor(spellData.healing * (1 + character.stats.wisdom / 100));
                spellEmbed.addFields({
                    name: '💚 Curación',
                    value: `Base: ${spellData.healing}\nCon tu SAB: **${scaledHealing}**`,
                    inline: true
                });
            }
            
            if (spellData.duration) {
                spellEmbed.addFields({
                    name: '⏱️ Duración',
                    value: `${spellData.duration} turnos`,
                    inline: true
                });
            }
            
            spellEmbed.setFooter({ 
                text: `Aprendido: ${formatDate(spell.unlockedAt)}` 
            });
            
            return interaction.reply({ embeds: [spellEmbed], ephemeral: true });
        }
        
        // Mostrar todos los hechizos
        const spellsByType = {};
        
        playerSpells.forEach(spell => {
            const spellId = spell.spellId;
            const spellName = spell.name;
            const spellMastery = spell.mastery;
            
            const data = SPELL_DATABASE[spellId] || { type: 'Otro', name: spellName };
            const type = data.type || 'Otro';
            
            if (!spellsByType[type]) {
                spellsByType[type] = [];
            }
            
            spellsByType[type].push({
                spellId: spellId,
                name: spellName || data.name || 'Desconocido',
                mastery: spellMastery,
                emoji: data.emoji || '✨',
                mpCost: data.mpCost || '?'
            });
        });
        
        // Crear embed
        const spellsEmbed = new EmbedBuilder()
            .setTitle(`${houseEmoji} Grimorio de ${character.name}`)
            .setDescription(`*${playerSpells.length} hechizos aprendidos*\n\n💙 **MP Actual:** ${character.stats.mp}/${character.stats.maxMp}`)
            .setColor(houseColor)
            .setThumbnail('https://static.wikia.nocookie.net/harrypotter/images/9/9c/Hpbook1_es.jpg');
        
        // Añadir cada tipo de hechizo
        const typeOrder = ['Ataque', 'Defensa', 'Curación', 'Utilidad', 'Otro'];
        const typeEmojis = {
            'Ataque': '⚔️',
            'Defensa': '🛡️',
            'Curación': '💚',
            'Utilidad': '🔧',
            'Otro': '✨'
        };
        
        typeOrder.forEach(type => {
            if (spellsByType[type] && spellsByType[type].length > 0) {
                const spellsList = spellsByType[type]
                    .map(s => `${s.emoji} **${s.name}** (${s.mpCost} MP) - ${s.mastery}%`)
                    .join('\n');
                
                spellsEmbed.addFields({
                    name: `${typeEmojis[type]} ${type}`,
                    value: spellsList,
                    inline: false
                });
            }
        });
        
        spellsEmbed.setFooter({ 
            text: 'Usa /spells [nombre] para ver detalles • La maestría aumenta con el uso' 
        });
        
        await interaction.reply({ embeds: [spellsEmbed], ephemeral: true });
    }
};

/**
 * Crea una barra de maestría visual
 */
function createMasteryBar(mastery, length = 10) {
    const filled = Math.floor((mastery / 100) * length);
    const empty = length - filled;
    return '⭐'.repeat(filled) + '☆'.repeat(empty);
}

/**
 * Formatea una fecha
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}
