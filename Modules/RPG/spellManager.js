const PlayerSpell = require('../../Database/models/PlayerSpell');
const Character = require('../../Database/models/Character');

/**
 * Gestiona los hechizos de los jugadores
 */
class SpellManager {
    
    /**
     * Obtiene todos los hechizos de un usuario por Discord ID
     */
    async getSpellsByDiscordId(discordId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) return [];
        
        return await PlayerSpell.getByCharacter(character._id);
    }
    
    /**
     * Obtiene todos los hechizos de un personaje por Character ID
     */
    async getSpells(characterId) {
        return await PlayerSpell.getByCharacter(characterId);
    }
    
    /**
     * Verifica si un usuario conoce un hechizo
     */
    async hasSpell(discordId, spellId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) return false;
        
        return await PlayerSpell.hasSpell(character._id, spellId);
    }
    
    /**
     * Obtiene un hechizo específico
     */
    async getSpell(discordId, spellId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) return null;
        
        return await PlayerSpell.getSpell(character._id, spellId);
    }
    
    /**
     * Aprende un nuevo hechizo
     */
    async learnSpell(discordId, spellId, spellName) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        const exists = await PlayerSpell.hasSpell(character._id, spellId);
        if (exists) {
            return { success: false, message: 'Ya conoces este hechizo.' };
        }
        
        const spell = await PlayerSpell.learnSpell(character._id, spellId, spellName);
        return { success: true, spell };
    }
    
    /**
     * Usa un hechizo (incrementa contador y maestría)
     */
    async useSpell(discordId, spellId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        const spell = await PlayerSpell.useSpell(character._id, spellId);
        if (!spell) {
            throw new Error('No conoces este hechizo.');
        }
        
        // Incrementar contador de hechizos lanzados
        character.gameStats.spellsCast += 1;
        await character.save();
        
        return spell;
    }
    
    /**
     * Cuenta los hechizos de un usuario
     */
    async getSpellCount(discordId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) return 0;
        
        const spells = await PlayerSpell.getByCharacter(character._id);
        return spells.length;
    }
    
    /**
     * Obtiene los hechizos de acceso rápido
     */
    async getQuickSlotSpells(discordId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) return [];
        
        return await PlayerSpell.find({ 
            character: character._id, 
            isQuickSlot: true 
        }).sort({ quickSlotPosition: 1 });
    }
    
    /**
     * Asigna un hechizo a un slot rápido
     */
    async setQuickSlot(discordId, spellId, position) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        // Quitar cualquier hechizo de esa posición
        await PlayerSpell.updateMany(
            { character: character._id, quickSlotPosition: position },
            { $set: { isQuickSlot: false, quickSlotPosition: null } }
        );
        
        // Asignar nuevo hechizo
        const spell = await PlayerSpell.findOneAndUpdate(
            { character: character._id, spellId },
            { $set: { isQuickSlot: true, quickSlotPosition: position } },
            { new: true }
        );
        
        return spell;
    }
    
    // ========== MÉTODOS ADMINISTRATIVOS ==========
    
    /**
     * Obtiene estadísticas de un hechizo en el servidor
     */
    async getSpellStats(spellId) {
        return {
            playersWithSpell: await PlayerSpell.countPlayersWithSpell(spellId),
            topMastery: await PlayerSpell.getTopMastery(spellId, 5)
        };
    }
    
    /**
     * Obtiene los hechizos más populares
     */
    async getMostPopularSpells(limit = 10) {
        return await PlayerSpell.getMostPopularSpells(limit);
    }
    
    /**
     * Da un hechizo a todos los jugadores (evento especial)
     */
    async grantSpellToAll(spellId, spellName) {
        const characters = await Character.find({});
        let granted = 0;
        
        for (const character of characters) {
            const exists = await PlayerSpell.hasSpell(character._id, spellId);
            if (!exists) {
                await PlayerSpell.learnSpell(character._id, spellId, spellName);
                granted++;
            }
        }
        
        return { granted, total: characters.length };
    }
}

module.exports = new SpellManager();
