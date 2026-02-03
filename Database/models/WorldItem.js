const mongoose = require('mongoose');

/**
 * Modelo para items únicos en el mundo
 * Estos items solo pueden existir una vez (ej: Varita de Saúco, Capa de Invisibilidad)
 */
const WorldItemSchema = new mongoose.Schema({
    // Referencia al item base
    item: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Item',
        required: true,
        unique: true // Solo 1 registro por item único
    },
    
    // ID del item para queries rápidas
    itemId: { 
        type: String, 
        required: true,
        unique: true,
        index: true
    },
    
    // Nombre del item
    name: { type: String, required: true },
    
    // Dueño actual (null si está sin reclamar o en el mundo)
    currentOwner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Character',
        default: null,
        index: true
    },
    
    // Estado del item en el mundo
    status: {
        type: String,
        enum: ['unclaimed', 'owned', 'lost', 'hidden', 'boss_drop'],
        default: 'unclaimed'
    },
    
    // Ubicación si no tiene dueño
    location: {
        area: { type: String, default: null }, // 'Bosque Prohibido', 'Cámara de los Secretos'
        description: { type: String, default: null }
    },
    
    // Historia del item
    history: [{
        event: { 
            type: String, 
            enum: ['created', 'claimed', 'transferred', 'lost', 'found', 'stolen', 'dropped']
        },
        fromOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
        toOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
        date: { type: Date, default: Date.now },
        notes: String
    }],
    
    // Requisitos para reclamar (si está sin dueño)
    claimRequirements: {
        minLevel: { type: Number, default: 1 },
        house: { type: String, default: null }, // Solo cierta casa puede reclamarlo
        questRequired: { type: String, default: null }, // ID de quest necesaria
        bossDefeated: { type: String, default: null } // ID de boss a derrotar
    },
    
    // Estadísticas especiales (pueden ser más potentes que items normales)
    specialStats: {
        bonusHp: { type: Number, default: 0 },
        bonusMp: { type: Number, default: 0 },
        bonusStrength: { type: Number, default: 0 },
        bonusIntelligence: { type: Number, default: 0 },
        bonusDexterity: { type: Number, default: 0 },
        bonusConstitution: { type: Number, default: 0 },
        bonusWisdom: { type: Number, default: 0 },
        bonusLuck: { type: Number, default: 0 }
    },
    
    // Habilidad especial del item
    specialAbility: {
        name: { type: String, default: null },
        description: { type: String, default: null },
        effect: { type: mongoose.Schema.Types.Mixed, default: null }
    },
    
    // Lore/Historia del item
    lore: { type: String, default: null },
    
    // Si es transferible entre jugadores
    isTransferable: { type: Boolean, default: false },
    
    // Si puede ser robado en PvP
    canBeStolen: { type: Boolean, default: false }
    
}, { timestamps: true });

// ========== MÉTODOS ESTÁTICOS ==========

/**
 * Obtiene todos los items únicos del mundo
 */
WorldItemSchema.statics.getAllWorldItems = function() {
    return this.find()
        .populate('item')
        .populate('currentOwner', 'name discordUsername house');
};

/**
 * Obtiene items sin dueño
 */
WorldItemSchema.statics.getUnclaimedItems = function() {
    return this.find({ currentOwner: null, status: { $in: ['unclaimed', 'lost', 'hidden'] } })
        .populate('item');
};

/**
 * Obtiene items de un jugador
 */
WorldItemSchema.statics.getOwnedBy = function(characterId) {
    return this.find({ currentOwner: characterId })
        .populate('item');
};

/**
 * Intenta reclamar un item
 */
WorldItemSchema.statics.claimItem = async function(itemId, characterId, character) {
    const worldItem = await this.findOne({ itemId, currentOwner: null });
    
    if (!worldItem) {
        return { success: false, error: 'Item no disponible o ya tiene dueño' };
    }
    
    // Verificar requisitos
    const reqs = worldItem.claimRequirements;
    
    if (reqs.minLevel && character.level < reqs.minLevel) {
        return { success: false, error: `Necesitas nivel ${reqs.minLevel}` };
    }
    
    if (reqs.house && character.house !== reqs.house) {
        return { success: false, error: `Solo los de ${reqs.house} pueden reclamar este item` };
    }
    
    // TODO: Verificar quest y boss cuando se implementen
    
    // Asignar dueño
    worldItem.currentOwner = characterId;
    worldItem.status = 'owned';
    worldItem.history.push({
        event: 'claimed',
        toOwner: characterId,
        date: new Date()
    });
    
    await worldItem.save();
    
    return { success: true, item: worldItem };
};

/**
 * Transfiere item único entre jugadores
 */
WorldItemSchema.statics.transferItem = async function(itemId, fromCharacterId, toCharacterId) {
    const worldItem = await this.findOne({ 
        itemId, 
        currentOwner: fromCharacterId 
    });
    
    if (!worldItem) {
        return { success: false, error: 'No posees este item' };
    }
    
    if (!worldItem.isTransferable) {
        return { success: false, error: 'Este item no es transferible' };
    }
    
    worldItem.currentOwner = toCharacterId;
    worldItem.history.push({
        event: 'transferred',
        fromOwner: fromCharacterId,
        toOwner: toCharacterId,
        date: new Date()
    });
    
    await worldItem.save();
    
    return { success: true, item: worldItem };
};

/**
 * El jugador pierde el item (muerte, robo, etc.)
 */
WorldItemSchema.statics.loseItem = async function(itemId, characterId, reason = 'lost') {
    const worldItem = await this.findOne({ 
        itemId, 
        currentOwner: characterId 
    });
    
    if (!worldItem) {
        return { success: false, error: 'No posees este item' };
    }
    
    worldItem.history.push({
        event: reason,
        fromOwner: characterId,
        date: new Date()
    });
    
    worldItem.currentOwner = null;
    worldItem.status = 'lost';
    
    await worldItem.save();
    
    return { success: true, item: worldItem };
};

/**
 * Crea un nuevo item único en el mundo
 */
WorldItemSchema.statics.createWorldItem = async function(itemData) {
    // Verificar que el item base existe
    const Item = mongoose.model('Item');
    let item = await Item.findOne({ itemId: itemData.itemId });
    
    if (!item) {
        // Crear item base si no existe
        item = await Item.create({
            itemId: itemData.itemId,
            name: itemData.name,
            description: itemData.description || itemData.lore,
            type: itemData.type || 'treasure',
            rarity: 'mythic',
            tradeable: itemData.isTransferable || false,
            droppable: false
        });
    }
    
    return this.create({
        item: item._id,
        itemId: itemData.itemId,
        name: itemData.name,
        status: itemData.status || 'unclaimed',
        location: itemData.location,
        claimRequirements: itemData.claimRequirements,
        specialStats: itemData.specialStats,
        specialAbility: itemData.specialAbility,
        lore: itemData.lore,
        isTransferable: itemData.isTransferable || false,
        canBeStolen: itemData.canBeStolen || false,
        history: [{ event: 'created', date: new Date() }]
    });
};

module.exports = mongoose.model('WorldItem', WorldItemSchema);
