const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const characterManager = require('../../Modules/RPG/characterManager');
const inventoryManager = require('../../Modules/RPG/inventoryManager');
const { HOUSE_COLORS, HOUSE_EMOJIS } = require('../../Modules/RPG/gameData');

// Emojis por tipo de item
const ITEM_TYPE_EMOJIS = {
    weapon: '⚔️',
    armor: '🛡️',
    accessory: '💍',
    consumable: '🧪',
    material: '📦',
    quest: '📜',
    spell_book: '📖',
    pet: '🐾',
    key: '🔑',
    treasure: '💎'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventario')
        .setDescription('Muestra tu inventario de objetos'),
    
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
        
        // Obtener inventario desde la colección separada
        const inventory = await inventoryManager.getInventory(interaction.user.id);
        const slotInfo = await inventoryManager.getSlotInfo(interaction.user.id);
        
        const slotsUsed = slotInfo.used;
        const slotsTotal = slotInfo.total;
        const slotsPercent = Math.floor((slotsUsed / slotsTotal) * 100);
        
        // Crear barra de capacidad
        const capacityBar = createCapacityBar(slotsPercent, 15);
        
        // Si el inventario está vacío
        if (inventory.length === 0) {
            const emptyEmbed = new EmbedBuilder()
                .setTitle(`${houseEmoji} Inventario de ${character.name}`)
                .setDescription('*Tu mochila está vacía...*\n\nExplora Hogwarts y sus alrededores para encontrar objetos mágicos.')
                .setColor(houseColor)
                .addFields(
                    {
                        name: '🎒 Capacidad',
                        value: `${capacityBar}\n**${slotsUsed}/${slotsTotal}** espacios`,
                        inline: false
                    },
                    {
                        name: '💰 Galeones',
                        value: `**${character.galleons}**`,
                        inline: true
                    }
                )
                .setFooter({ text: 'Usa /explorar para buscar objetos' })
                .setTimestamp();
            
            return interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
        }
        
        // Crear lista de items
        const itemsList = inventory.map((item, index) => {
            const equipped = item.isEquipped ? ' 🔹' : '';
            return `${index + 1}. **${item.itemName}**${equipped} x${item.quantity}`;
        }).join('\n');
        
        // Embed principal
        const inventoryEmbed = new EmbedBuilder()
            .setTitle(`${houseEmoji} Inventario de ${character.name}`)
            .setDescription(`*${character.title}*`)
            .setColor(houseColor)
            .addFields(
                {
                    name: '🎒 Capacidad',
                    value: `${capacityBar}\n**${slotsUsed}/${slotsTotal}** espacios usados`,
                    inline: false
                },
                {
                    name: '📦 Objetos',
                    value: itemsList || '*Vacío*',
                    inline: false
                },
                {
                    name: '💰 Galeones',
                    value: `**${character.galleons}**`,
                    inline: true
                },
                {
                    name: '🔹 Equipado',
                    value: getEquipmentSummary(inventory),
                    inline: true
                }
            )
            .setFooter({ text: 'Usa /usar [item] para usar un objeto' })
            .setTimestamp();
        
        // Botones de navegación (para futuras páginas)
        const navigationRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('inv_sort_name')
                    .setLabel('Ordenar A-Z')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔤'),
                new ButtonBuilder()
                    .setCustomId('inv_sort_type')
                    .setLabel('Por Tipo')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📑'),
                new ButtonBuilder()
                    .setCustomId('inv_refresh')
                    .setLabel('Actualizar')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔄')
            );
        
        await interaction.reply({ 
            embeds: [inventoryEmbed], 
            components: [navigationRow],
            ephemeral: true 
        });
    }
};

/**
 * Crea una barra de capacidad visual
 */
function createCapacityBar(percent, length = 15) {
    const filled = Math.floor((percent / 100) * length);
    const empty = length - filled;
    
    // Cambiar color según porcentaje
    let filledChar = '🟩';
    if (percent >= 90) filledChar = '🟥';
    else if (percent >= 70) filledChar = '🟨';
    
    return filledChar.repeat(filled) + '⬜'.repeat(empty);
}

/**
 * Obtiene un resumen del equipamiento desde el inventario
 */
function getEquipmentSummary(inventory) {
    const equipped = inventory.filter(i => i.isEquipped);
    
    if (equipped.length === 0) return '*Sin equipar*';
    
    const slotEmojis = {
        wand: '🪄',
        robe: '👘',
        accessory: '💍',
        pet: '🐾'
    };
    
    return equipped.map(item => {
        const emoji = slotEmojis[item.equipSlot] || '🔹';
        return `${emoji} ${item.itemName}`;
    }).join('\n');
}
