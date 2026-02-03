const mongoose = require('mongoose');
const { getHouseLevelGrowth } = require('../../Modules/RPG/gameData');

/**
 * Esquema de varita mágica (embebido - siempre 1 por personaje)
 */
const WandSchema = new mongoose.Schema({
    wood: { type: String, required: true },
    core: { type: String, required: true },
    length: { type: Number, required: true },
    flexibility: { type: String, required: true }
}, { _id: false });

/**
 * Esquema de estadísticas de combate (embebido - datos simples)
 */
const GameStatsSchema = new mongoose.Schema({
    battlesWon: { type: Number, default: 0 },
    battlesLost: { type: Number, default: 0 },
    enemiesDefeated: { type: Number, default: 0 },
    questsCompleted: { type: Number, default: 0 },
    spellsCast: { type: Number, default: 0 },
    criticalHits: { type: Number, default: 0 },
    totalDamageDealt: { type: Number, default: 0 },
    totalDamageReceived: { type: Number, default: 0 },
    totalHealing: { type: Number, default: 0 },
    goldEarned: { type: Number, default: 0 },
    itemsCollected: { type: Number, default: 0 }
}, { _id: false });

/**
 * Esquema principal del personaje (NORMALIZADO)
 * Los hechizos e inventario están en colecciones separadas
 */
const CharacterSchema = new mongoose.Schema({
    // Identificación - Vinculado a Discord
    discordId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    discordUsername: { type: String, required: true },
    
    // Información básica del personaje
    name: { type: String, required: true, maxlength: 32 },
    house: { 
        type: String, 
        enum: ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'],
        required: true 
    },
    title: { type: String, default: 'Estudiante de Primer Año' },
    
    // Varita mágica (siempre 1, siempre se lee con el personaje)
    wand: { type: WandSchema, required: true },
    
    // ========== ESTADÍSTICAS DE COMBATE ==========
    stats: {
        hp: { type: Number, default: 100 },
        maxHp: { type: Number, default: 100 },
        mp: { type: Number, default: 80 },
        maxMp: { type: Number, default: 80 },
        strength: { type: Number, default: 10 },
        intelligence: { type: Number, default: 10 },
        dexterity: { type: Number, default: 10 },
        constitution: { type: Number, default: 10 },
        wisdom: { type: Number, default: 10 },
        luck: { type: Number, default: 10 }
    },
    
    attributePoints: { type: Number, default: 0 },
    
    // ========== PROGRESIÓN ==========
    level: { type: Number, default: 1, min: 1, max: 100 },
    experience: { type: Number, default: 0 },
    totalExperience: { type: Number, default: 0 },
    
    // ========== ECONOMÍA ==========
    galleons: { type: Number, default: 50 },
    sickles: { type: Number, default: 0 },
    knuts: { type: Number, default: 0 },
    
    // ========== CONFIGURACIÓN DE INVENTARIO ==========
    inventorySlots: { type: Number, default: 20 },
    
    // ========== EQUIPAMIENTO (referencias a PlayerInventory) ==========
    equipment: {
        wand: { type: mongoose.Schema.Types.ObjectId, ref: 'PlayerInventory', default: null },
        robe: { type: mongoose.Schema.Types.ObjectId, ref: 'PlayerInventory', default: null },
        accessory: { type: mongoose.Schema.Types.ObjectId, ref: 'PlayerInventory', default: null },
        pet: { type: mongoose.Schema.Types.ObjectId, ref: 'PlayerInventory', default: null }
    },
    
    // Especialización mágica
    magicSpecialization: {
        type: String,
        enum: ['Encantamientos', 'Transformaciones', 'Defensa', 'Pociones', 'Herbología', 'Adivinación', 'Ninguna'],
        default: 'Ninguna'
    },
    
    // ========== ESTADÍSTICAS DE JUEGO ==========
    gameStats: { type: GameStatsSchema, default: () => ({}) },
    
    // ========== ESTADO ==========
    status: {
        isAlive: { type: Boolean, default: true },
        inCombat: { type: Boolean, default: false },
        currentLocation: { type: String, default: 'Hogwarts - Gran Comedor' },
        lastRest: { type: Date, default: Date.now }
    },
    
    // ========== TIMESTAMPS ==========
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
});

// ========== ÍNDICES ==========
CharacterSchema.index({ level: -1 });
CharacterSchema.index({ 'gameStats.battlesWon': -1 });
CharacterSchema.index({ house: 1 });

// ========== VIRTUALS (para poblar relaciones) ==========

// Virtual para obtener hechizos del jugador
CharacterSchema.virtual('spells', {
    ref: 'PlayerSpell',
    localField: '_id',
    foreignField: 'character'
});

// Virtual para obtener inventario del jugador
CharacterSchema.virtual('inventory', {
    ref: 'PlayerInventory',
    localField: '_id',
    foreignField: 'character'
});

// Habilitar virtuals en JSON y Object
CharacterSchema.set('toObject', { virtuals: true });
CharacterSchema.set('toJSON', { virtuals: true });

// ========== MÉTODOS DE INSTANCIA ==========

CharacterSchema.methods.getExpToNextLevel = function() {
    return Math.floor(100 * Math.pow(this.level, 1.5));
};

CharacterSchema.methods.canLevelUp = function() {
    return this.experience >= this.getExpToNextLevel();
};

CharacterSchema.methods.levelUp = function() {
    if (!this.canLevelUp()) return false;
    
    this.experience -= this.getExpToNextLevel();
    this.level += 1;
    this.stats.maxHp += 10;
    this.stats.maxMp += 8;
    this.stats.hp = this.stats.maxHp;
    this.stats.mp = this.stats.maxMp;
    this.attributePoints += 3;
    
    // Crecimiento automático por casa (estilo RPG: cada casa sube sus stats base al subir nivel)
    const growth = getHouseLevelGrowth(this.house);
    for (const [stat, amount] of Object.entries(growth)) {
        if (this.stats[stat] !== undefined && typeof amount === 'number') {
            this.stats[stat] += amount;
        }
    }
    
    return true;
};

CharacterSchema.methods.addExperience = function(amount) {
    this.experience += amount;
    this.totalExperience += amount;
    
    let levelsGained = 0;
    while (this.canLevelUp()) {
        this.levelUp();
        levelsGained++;
    }
    
    return levelsGained;
};

CharacterSchema.methods.getMagicPower = function() {
    return Math.floor(this.stats.intelligence * 2 + this.stats.wisdom * 0.5 + this.level * 3);
};

CharacterSchema.methods.getPhysicalPower = function() {
    return Math.floor(this.stats.strength * 2 + this.stats.dexterity * 0.5 + this.level * 2);
};

CharacterSchema.methods.getDefense = function() {
    return Math.floor(this.stats.constitution * 1.5 + this.stats.wisdom * 0.5 + this.level);
};

CharacterSchema.methods.getSpeed = function() {
    return Math.floor(this.stats.dexterity * 1.5 + this.stats.luck * 0.3);
};

CharacterSchema.methods.getCritChance = function() {
    return Math.min(5 + this.stats.luck * 0.5 + this.stats.dexterity * 0.2, 50);
};

CharacterSchema.methods.getTotalGalleons = function() {
    const sicklesInGalleons = this.sickles / 17;
    const knutsInGalleons = this.knuts / (17 * 29);
    return this.galleons + sicklesInGalleons + knutsInGalleons;
};

CharacterSchema.methods.rest = function() {
    this.stats.hp = this.stats.maxHp;
    this.stats.mp = this.stats.maxMp;
    this.status.lastRest = new Date();
};

// ========== MIDDLEWARE ==========
CharacterSchema.pre('save', function() {
    this.updatedAt = new Date();
});

// ========== MÉTODOS ESTÁTICOS ==========

CharacterSchema.statics.findByDiscordId = function(discordId) {
    return this.findOne({ discordId });
};

CharacterSchema.statics.findByDiscordIdWithRelations = function(discordId) {
    return this.findOne({ discordId })
        .populate('spells')
        .populate({
            path: 'inventory',
            populate: { path: 'item' }
        });
};

CharacterSchema.statics.getLeaderboard = function(limit = 10) {
    return this.find({ 'status.isAlive': true })
        .sort({ level: -1, totalExperience: -1 })
        .limit(limit)
        .select('name house level totalExperience discordUsername');
};

CharacterSchema.statics.getHouseLeaderboard = function(house, limit = 10) {
    return this.find({ house, 'status.isAlive': true })
        .sort({ level: -1, totalExperience: -1 })
        .limit(limit)
        .select('name level totalExperience discordUsername');
};

module.exports = mongoose.model('Character', CharacterSchema);
