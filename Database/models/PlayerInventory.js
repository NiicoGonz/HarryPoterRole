const mongoose = require('mongoose');

/**
 * Modelo de item en inventario de jugador (NORMALIZADO)
 * Permite consultas de inventario, comercio y administración
 */
const PlayerInventorySchema = new mongoose.Schema({
    // Referencia al personaje dueño
    character: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Character', 
        required: true,
        index: true
    },
    
    // Referencia al item base (definición del item)
    item: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Item',
        required: true,
        index: true
    },
    
    // ID del item para queries rápidas sin populate
    itemId: { 
        type: String, 
        required: true,
        index: true
    },
    
    // Nombre del item (denormalizado para queries rápidas)
    itemName: { type: String, required: true },
    
    // Cantidad
    quantity: { 
        type: Number, 
        default: 1, 
        min: 1 
    },
    
    // Estado del item
    isEquipped: { type: Boolean, default: false },
    equipSlot: { type: String, default: null }, // 'wand', 'robe', 'accessory', 'pet'
    
    // Para items con durabilidad
    durability: { type: Number, default: null },
    maxDurability: { type: Number, default: null },
    
    // Mejoras/Encantamientos aplicados al item
    enchantments: [{
        enchantmentId: String,
        name: String,
        bonus: mongoose.Schema.Types.Mixed
    }],
    
    // Origen del item (para tracking)
    obtainedFrom: {
        type: { type: String, enum: ['drop', 'quest', 'trade', 'shop', 'craft', 'gift', 'starter'] },
        source: String, // ID del enemigo, quest, jugador, etc.
        date: { type: Date, default: Date.now }
    },
    
    // Para items en venta
    forSale: { type: Boolean, default: false },
    salePrice: { type: Number, default: null },
    
    // Si está bloqueado (no se puede vender/tirar)
    isLocked: { type: Boolean, default: false },
    
    // Posición en inventario (para ordenamiento visual)
    slotPosition: { type: Number, default: null }
    
}, { timestamps: true });

// ========== ÍNDICES COMPUESTOS ==========

// Para buscar items de un jugador
PlayerInventorySchema.index({ character: 1, itemId: 1 });

// Para buscar todos los jugadores que tienen un item específico
PlayerInventorySchema.index({ itemId: 1 });

// Para el sistema de comercio (items en venta)
PlayerInventorySchema.index({ forSale: 1, salePrice: 1 });

// Para buscar items equipados
PlayerInventorySchema.index({ character: 1, isEquipped: 1 });

// ========== MÉTODOS ESTÁTICOS ==========

/**
 * Obtiene el inventario completo de un personaje
 */
PlayerInventorySchema.statics.getInventory = function(characterId, options = {}) {
    let query = this.find({ character: characterId });
    
    if (options.onlyEquipped) {
        query = query.where('isEquipped', true);
    }
    
    if (options.forSale) {
        query = query.where('forSale', true);
    }
    
    if (options.populate) {
        query = query.populate('item');
    }
    
    return query.sort({ slotPosition: 1, createdAt: -1 });
};

/**
 * Cuenta los slots usados
 */
PlayerInventorySchema.statics.countSlots = function(characterId) {
    return this.countDocuments({ character: characterId });
};

/**
 * Añade un item al inventario
 */
PlayerInventorySchema.statics.addItem = async function(characterId, itemData, quantity = 1, source = {}) {
    // Buscar si ya tiene este item (y es stackeable)
    const existing = await this.findOne({ 
        character: characterId, 
        itemId: itemData.itemId,
        isEquipped: false // No stackear con items equipados
    });
    
    if (existing && itemData.stackable) {
        existing.quantity += quantity;
        await existing.save();
        return existing;
    }
    
    // Crear nuevo registro
    return this.create({
        character: characterId,
        item: itemData._id,
        itemId: itemData.itemId,
        itemName: itemData.name,
        quantity,
        durability: itemData.maxDurability || null,
        maxDurability: itemData.maxDurability || null,
        obtainedFrom: {
            type: source.type || 'gift',
            source: source.source || 'unknown',
            date: new Date()
        }
    });
};

/**
 * Remueve cantidad de un item
 */
PlayerInventorySchema.statics.removeItem = async function(characterId, itemId, quantity = 1) {
    const inventoryItem = await this.findOne({ 
        character: characterId, 
        itemId,
        isEquipped: false
    });
    
    if (!inventoryItem) return { success: false, error: 'Item no encontrado' };
    if (inventoryItem.isLocked) return { success: false, error: 'Item bloqueado' };
    if (inventoryItem.quantity < quantity) return { success: false, error: 'Cantidad insuficiente' };
    
    if (inventoryItem.quantity === quantity) {
        await inventoryItem.deleteOne();
    } else {
        inventoryItem.quantity -= quantity;
        await inventoryItem.save();
    }
    
    return { success: true, remaining: inventoryItem.quantity - quantity };
};

/**
 * Equipa un item
 */
PlayerInventorySchema.statics.equipItem = async function(characterId, inventoryItemId, slot) {
    // Desequipar item actual en ese slot
    await this.updateMany(
        { character: characterId, equipSlot: slot },
        { $set: { isEquipped: false, equipSlot: null } }
    );
    
    // Equipar nuevo item
    const item = await this.findOneAndUpdate(
        { _id: inventoryItemId, character: characterId },
        { $set: { isEquipped: true, equipSlot: slot } },
        { new: true }
    );
    
    return item;
};

/**
 * Desequipa un item
 */
PlayerInventorySchema.statics.unequipItem = async function(characterId, slot) {
    return this.updateMany(
        { character: characterId, equipSlot: slot },
        { $set: { isEquipped: false, equipSlot: null } }
    );
};

/**
 * Pone un item en venta
 */
PlayerInventorySchema.statics.listForSale = async function(inventoryItemId, price) {
    return this.findByIdAndUpdate(
        inventoryItemId,
        { $set: { forSale: true, salePrice: price } },
        { new: true }
    );
};

/**
 * Cancela venta de un item
 */
PlayerInventorySchema.statics.cancelSale = async function(inventoryItemId) {
    return this.findByIdAndUpdate(
        inventoryItemId,
        { $set: { forSale: false, salePrice: null } },
        { new: true }
    );
};

/**
 * Obtiene items en venta (mercado)
 */
PlayerInventorySchema.statics.getMarketItems = function(options = {}) {
    let query = this.find({ forSale: true })
        .populate('character', 'name discordUsername house')
        .populate('item');
    
    if (options.itemId) {
        query = query.where('itemId', options.itemId);
    }
    
    if (options.maxPrice) {
        query = query.where('salePrice').lte(options.maxPrice);
    }
    
    return query.sort({ salePrice: 1 }).limit(options.limit || 50);
};

/**
 * Transfiere un item entre jugadores
 */
PlayerInventorySchema.statics.transferItem = async function(fromCharacterId, toCharacterId, inventoryItemId, quantity = 1) {
    const item = await this.findOne({ 
        _id: inventoryItemId, 
        character: fromCharacterId,
        isEquipped: false
    }).populate('item');
    
    if (!item) return { success: false, error: 'Item no encontrado' };
    if (item.isLocked) return { success: false, error: 'Item bloqueado' };
    if (item.quantity < quantity) return { success: false, error: 'Cantidad insuficiente' };
    
    // Añadir al receptor
    await this.addItem(toCharacterId, item.item, quantity, {
        type: 'trade',
        source: fromCharacterId.toString()
    });
    
    // Remover del emisor
    if (item.quantity === quantity) {
        await item.deleteOne();
    } else {
        item.quantity -= quantity;
        await item.save();
    }
    
    return { success: true };
};

// ========== QUERIES ADMINISTRATIVAS ==========

/**
 * Busca todos los jugadores que tienen un item específico
 */
PlayerInventorySchema.statics.findPlayersWithItem = function(itemId) {
    return this.find({ itemId })
        .populate('character', 'name discordId discordUsername house level')
        .select('quantity isEquipped character');
};

/**
 * Obtiene estadísticas de un item en el servidor
 */
PlayerInventorySchema.statics.getItemStats = async function(itemId) {
    const stats = await this.aggregate([
        { $match: { itemId } },
        { $group: {
            _id: '$itemId',
            totalQuantity: { $sum: '$quantity' },
            uniqueOwners: { $sum: 1 },
            equipped: { $sum: { $cond: ['$isEquipped', 1, 0] } },
            forSale: { $sum: { $cond: ['$forSale', 1, 0] } },
            avgSalePrice: { $avg: { $cond: ['$forSale', '$salePrice', null] } }
        }}
    ]);
    
    return stats[0] || null;
};

/**
 * Obtiene los items más comunes
 */
PlayerInventorySchema.statics.getMostCommonItems = function(limit = 10) {
    return this.aggregate([
        { $group: { 
            _id: '$itemId', 
            itemName: { $first: '$itemName' },
            totalQuantity: { $sum: '$quantity' },
            owners: { $sum: 1 }
        }},
        { $sort: { totalQuantity: -1 } },
        { $limit: limit }
    ]);
};

module.exports = mongoose.model('PlayerInventory', PlayerInventorySchema);
