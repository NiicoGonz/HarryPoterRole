const mongoose = require('mongoose');

/**
 * Esquema de Item para el sistema de inventario
 * Define todos los tipos de objetos disponibles en el juego
 */
const ItemSchema = new mongoose.Schema({
    // Identificación
    itemId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    
    // Clasificación
    type: {
        type: String,
        enum: [
            'weapon',      // Varitas especiales, armas
            'armor',       // Túnicas, capas
            'accessory',   // Anillos, amuletos
            'consumable',  // Pociones, comida
            'material',    // Materiales de crafteo
            'quest',       // Items de misión
            'spell_book',  // Libros de hechizos
            'pet',         // Mascotas
            'key',         // Llaves, items especiales
            'treasure'     // Objetos valiosos
        ],
        required: true
    },
    
    // Rareza
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'],
        default: 'common'
    },
    
    // ========== ESTADÍSTICAS DEL ITEM ==========
    stats: {
        // Bonus a estadísticas cuando está equipado
        hp: { type: Number, default: 0 },
        mp: { type: Number, default: 0 },
        strength: { type: Number, default: 0 },
        intelligence: { type: Number, default: 0 },
        dexterity: { type: Number, default: 0 },
        constitution: { type: Number, default: 0 },
        wisdom: { type: Number, default: 0 },
        luck: { type: Number, default: 0 },
        
        // Stats especiales
        magicPower: { type: Number, default: 0 },      // Bonus poder mágico
        physicalPower: { type: Number, default: 0 },   // Bonus daño físico
        defense: { type: Number, default: 0 },         // Bonus defensa
        critChance: { type: Number, default: 0 },      // % crítico adicional
        dodge: { type: Number, default: 0 }            // % esquiva adicional
    },
    
    // ========== EFECTOS ESPECIALES ==========
    effects: [{
        effectType: { 
            type: String, 
            enum: ['heal', 'damage', 'buff', 'debuff', 'restore_mp', 'revive', 'teleport', 'unlock_spell']
        },
        value: { type: Number },           // Valor del efecto
        duration: { type: Number },        // Duración en turnos (si aplica)
        target: { type: String },          // 'self', 'enemy', 'ally', 'all'
        description: { type: String }
    }],
    
    // ========== REQUISITOS ==========
    requirements: {
        level: { type: Number, default: 1 },
        house: { type: String, default: null },        // Restricción por casa
        specialization: { type: String, default: null }, // Restricción por especialización
        quest: { type: String, default: null }         // Requiere completar quest
    },
    
    // ========== ECONOMÍA ==========
    price: {
        buy: { type: Number, default: 0 },    // Precio de compra
        sell: { type: Number, default: 0 }    // Precio de venta
    },
    
    // ========== PROPIEDADES ==========
    stackable: { type: Boolean, default: false },      // Se puede acumular
    maxStack: { type: Number, default: 1 },            // Máximo por stack
    equipSlot: { type: String, default: null },        // 'wand', 'robe', 'accessory', 'pet'
    consumeOnUse: { type: Boolean, default: false },   // Se consume al usar
    tradeable: { type: Boolean, default: true },       // Se puede comerciar
    droppable: { type: Boolean, default: true },       // Se puede tirar
    
    // ========== VISUALS ==========
    emoji: { type: String, default: '📦' },
    color: { type: String, default: '#808080' },       // Color hex
    image: { type: String, default: null },            // URL de imagen
    
    // ========== METADATA ==========
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// ========== ÍNDICES ==========
ItemSchema.index({ type: 1, rarity: 1 });
ItemSchema.index({ 'requirements.level': 1 });

// ========== MÉTODOS ESTÁTICOS ==========

/**
 * Obtiene items por tipo
 */
ItemSchema.statics.findByType = function(type) {
    return this.find({ type });
};

/**
 * Obtiene items por rareza
 */
ItemSchema.statics.findByRarity = function(rarity) {
    return this.find({ rarity });
};

/**
 * Obtiene items de tienda (comprables)
 */
ItemSchema.statics.getShopItems = function(maxLevel = 100) {
    return this.find({ 
        'price.buy': { $gt: 0 },
        'requirements.level': { $lte: maxLevel }
    }).sort({ 'requirements.level': 1, 'price.buy': 1 });
};

// ========== HELPERS DE RAREZA ==========

/**
 * Obtiene el color según rareza
 */
ItemSchema.methods.getRarityColor = function() {
    const colors = {
        common: '#9d9d9d',
        uncommon: '#1eff00',
        rare: '#0070dd',
        epic: '#a335ee',
        legendary: '#ff8000',
        mythic: '#e6cc80'
    };
    return colors[this.rarity] || colors.common;
};

/**
 * Obtiene el emoji de rareza
 */
ItemSchema.methods.getRarityEmoji = function() {
    const emojis = {
        common: '⚪',
        uncommon: '🟢',
        rare: '🔵',
        epic: '🟣',
        legendary: '🟠',
        mythic: '🌟'
    };
    return emojis[this.rarity] || emojis.common;
};

/**
 * Obtiene texto formateado con rareza
 */
ItemSchema.methods.getFormattedName = function() {
    return `${this.getRarityEmoji()} ${this.name}`;
};

module.exports = mongoose.model('Item', ItemSchema);
