const mongoose = require('mongoose');

/**
 * Modelo de hechizo aprendido por un jugador (NORMALIZADO)
 * Permite consultas independientes y escalabilidad
 */
const PlayerSpellSchema = new mongoose.Schema({
    // Referencia al personaje dueño
    character: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Character', 
        required: true,
        index: true
    },
    
    // Identificador del hechizo (referencia a datos estáticos)
    spellId: { 
        type: String, 
        required: true,
        index: true
    },
    
    // Nombre del hechizo (para queries rápidas sin join)
    name: { type: String, required: true },
    
    // Nivel de maestría (1-100)
    mastery: { 
        type: Number, 
        default: 1, 
        min: 1, 
        max: 100 
    },
    
    // Veces que se ha usado
    timesUsed: { type: Number, default: 0 },
    
    // Fecha de aprendizaje
    unlockedAt: { type: Date, default: Date.now },
    
    // Si está en la barra de acceso rápido
    isQuickSlot: { type: Boolean, default: false },
    quickSlotPosition: { type: Number, default: null }
    
}, { timestamps: true });

// ========== ÍNDICES COMPUESTOS ==========
// Evita que un personaje tenga el mismo hechizo duplicado
PlayerSpellSchema.index({ character: 1, spellId: 1 }, { unique: true });

// Para buscar todos los jugadores que conocen un hechizo específico
PlayerSpellSchema.index({ spellId: 1 });

// Para ordenar por maestría
PlayerSpellSchema.index({ character: 1, mastery: -1 });

// ========== MÉTODOS ESTÁTICOS ==========

/**
 * Obtiene todos los hechizos de un personaje
 */
PlayerSpellSchema.statics.getByCharacter = function(characterId) {
    return this.find({ character: characterId }).sort({ mastery: -1 });
};

/**
 * Obtiene un hechizo específico de un personaje
 */
PlayerSpellSchema.statics.getSpell = function(characterId, spellId) {
    return this.findOne({ character: characterId, spellId });
};

/**
 * Verifica si un personaje conoce un hechizo
 */
PlayerSpellSchema.statics.hasSpell = function(characterId, spellId) {
    return this.exists({ character: characterId, spellId });
};

/**
 * Aprende un nuevo hechizo
 */
PlayerSpellSchema.statics.learnSpell = async function(characterId, spellId, spellName) {
    const exists = await this.hasSpell(characterId, spellId);
    if (exists) return null; // Ya lo conoce
    
    return this.create({
        character: characterId,
        spellId,
        name: spellName,
        mastery: 1,
        timesUsed: 0
    });
};

/**
 * Incrementa el uso de un hechizo (aumenta maestría)
 */
PlayerSpellSchema.statics.useSpell = async function(characterId, spellId) {
    const spell = await this.findOne({ character: characterId, spellId });
    if (!spell) return null;
    
    spell.timesUsed += 1;
    
    // Aumentar maestría basado en uso (cada 10 usos = +1 maestría, max 100)
    if (spell.timesUsed % 10 === 0 && spell.mastery < 100) {
        spell.mastery = Math.min(spell.mastery + 1, 100);
    }
    
    await spell.save();
    return spell;
};

/**
 * Cuenta cuántos jugadores conocen un hechizo
 */
PlayerSpellSchema.statics.countPlayersWithSpell = function(spellId) {
    return this.countDocuments({ spellId });
};

/**
 * Obtiene los hechizos más populares
 */
PlayerSpellSchema.statics.getMostPopularSpells = function(limit = 10) {
    return this.aggregate([
        { $group: { _id: '$spellId', count: { $sum: 1 }, avgMastery: { $avg: '$mastery' } } },
        { $sort: { count: -1 } },
        { $limit: limit }
    ]);
};

/**
 * Obtiene los jugadores con mayor maestría en un hechizo
 */
PlayerSpellSchema.statics.getTopMastery = function(spellId, limit = 10) {
    return this.find({ spellId })
        .sort({ mastery: -1 })
        .limit(limit)
        .populate('character', 'name house discordUsername');
};

module.exports = mongoose.model('PlayerSpell', PlayerSpellSchema);
