const Character = require('../../Database/models/Character');
const PlayerSpell = require('../../Database/models/PlayerSpell');
const PlayerInventory = require('../../Database/models/PlayerInventory');
const { 
    generateRandomWand, 
    calculateWandBonuses, 
    getStarterSpells,
    getTitleByLevel,
    getHouseLevelGrowth,
    HOUSE_BONUSES,
    HOUSE_COLORS,
    HOUSE_EMOJIS
} = require('./gameData');

/**
 * Gestiona la creación y manipulación de personajes
 * Versión NORMALIZADA - usa colecciones separadas para spells e inventory
 */
class CharacterManager {
    
    /**
     * Verifica si un usuario ya tiene un personaje
     */
    async hasCharacter(discordId) {
        const character = await Character.findByDiscordId(discordId);
        return character !== null;
    }
    
    /**
     * Obtiene el personaje de un usuario (sin relaciones)
     */
    async getCharacter(discordId) {
        return await Character.findByDiscordId(discordId);
    }
    
    /**
     * Obtiene el personaje con sus hechizos e inventario
     */
    async getCharacterFull(discordId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) return null;
        
        const spells = await PlayerSpell.getByCharacter(character._id);
        const inventory = await PlayerInventory.getInventory(character._id, { populate: true });
        
        return {
            character,
            spells,
            inventory,
            spellCount: spells.length,
            inventoryCount: inventory.length
        };
    }
    
    /**
     * Crea un nuevo personaje
     */
    async createCharacter({ discordId, discordUsername, name, house }) {
        // Verificar si ya existe
        const existingCharacter = await this.hasCharacter(discordId);
        if (existingCharacter) {
            throw new Error('Ya tienes un personaje creado. Solo puedes tener uno por cuenta.');
        }
        
        // Validar casa
        if (!HOUSE_BONUSES[house]) {
            throw new Error(`Casa inválida: ${house}. Debe ser Gryffindor, Hufflepuff, Ravenclaw o Slytherin.`);
        }
        
        // Generar varita aleatoria
        const wand = generateRandomWand();
        const wandBonuses = calculateWandBonuses(wand);
        const houseBonuses = HOUSE_BONUSES[house];
        
        // Calcular stats iniciales con bonuses
        const baseStats = {
            hp: 100,
            maxHp: 100,
            mp: 80,
            maxMp: 80,
            strength: 10 + (houseBonuses.strength || 0) + (wandBonuses.strength || 0),
            intelligence: 10 + (houseBonuses.intelligence || 0) + (wandBonuses.intelligence || 0),
            dexterity: 10 + (houseBonuses.dexterity || 0) + (wandBonuses.dexterity || 0),
            constitution: 10 + (houseBonuses.constitution || 0) + (wandBonuses.constitution || 0),
            wisdom: 10 + (houseBonuses.wisdom || 0) + (wandBonuses.wisdom || 0),
            luck: 10 + (houseBonuses.luck || 0) + (wandBonuses.luck || 0)
        };
        
        // Crear personaje
        const character = new Character({
            discordId,
            discordUsername,
            name,
            house,
            title: 'Estudiante de Primer Año',
            wand: {
                wood: wand.wood,
                core: wand.core,
                length: wand.length,
                flexibility: wand.flexibility
            },
            stats: baseStats,
            galleons: 50,
            status: {
                isAlive: true,
                inCombat: false,
                currentLocation: 'Hogwarts - Gran Comedor'
            }
        });
        
        await character.save();
        
        // Crear hechizos iniciales en la colección separada
        const starterSpells = getStarterSpells();
        for (const spell of starterSpells) {
            await PlayerSpell.create({
                character: character._id,
                spellId: spell.spellId,
                name: spell.name,
                mastery: 1,
                timesUsed: 0
            });
        }
        
        return character;
    }
    
    /**
     * Elimina un personaje y todos sus datos relacionados
     */
    async deleteCharacter(discordId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) return false;
        
        // Eliminar hechizos del jugador
        await PlayerSpell.deleteMany({ character: character._id });
        
        // Eliminar inventario del jugador
        await PlayerInventory.deleteMany({ character: character._id });
        
        // Eliminar personaje
        await Character.deleteOne({ discordId });
        
        return true;
    }
    
    /**
     * Actualiza las estadísticas de un personaje
     */
    async updateCharacter(discordId, updates) {
        const character = await Character.findOneAndUpdate(
            { discordId },
            { $set: updates },
            { new: true }
        );
        return character;
    }
    
    /**
     * Añade experiencia a un personaje
     */
    async addExperience(discordId, amount) {
        const character = await this.getCharacter(discordId);
        if (!character) {
            throw new Error('No tienes un personaje. Usa /crear-personaje primero.');
        }
        
        const levelsGained = character.addExperience(amount);
        
        if (levelsGained > 0) {
            character.title = getTitleByLevel(character.level);
        }
        
        await character.save();
        return { character, levelsGained };
    }
    
    /**
     * Recalcula vida, magia y atributos del personaje como si hubiera subido
     * de nivel 1 hasta su nivel actual (útil si el nivel se editó manualmente en la BD).
     * Sobrescribe stats base, maxHp, maxMp, hp, mp y puntos de atributo.
     */
    async recalculateStatsToCurrentLevel(discordId) {
        const character = await this.getCharacter(discordId);
        if (!character) {
            throw new Error('No existe un personaje con ese discordId.');
        }
        
        const level = Math.max(1, character.level);
        const houseBonuses = HOUSE_BONUSES[character.house] || {};
        const wandBonuses = calculateWandBonuses(character.wand);
        
        const baseStats = {
            strength: 10 + (houseBonuses.strength || 0) + (wandBonuses.strength || 0),
            intelligence: 10 + (houseBonuses.intelligence || 0) + (wandBonuses.intelligence || 0),
            dexterity: 10 + (houseBonuses.dexterity || 0) + (wandBonuses.dexterity || 0),
            constitution: 10 + (houseBonuses.constitution || 0) + (wandBonuses.constitution || 0),
            wisdom: 10 + (houseBonuses.wisdom || 0) + (wandBonuses.wisdom || 0),
            luck: 10 + (houseBonuses.luck || 0) + (wandBonuses.luck || 0)
        };
        
        const growth = getHouseLevelGrowth(character.house);
        const levelsToApply = level - 1;
        for (const [stat, amount] of Object.entries(growth)) {
            if (baseStats[stat] !== undefined && typeof amount === 'number') {
                baseStats[stat] += levelsToApply * amount;
            }
        }
        
        const maxHp = 100 + (level - 1) * 10;
        const maxMp = 80 + (level - 1) * 8;
        
        character.stats = {
            ...baseStats,
            hp: maxHp,
            maxHp,
            mp: maxMp,
            maxMp
        };
        character.attributePoints = (level - 1) * 3;
        character.title = getTitleByLevel(level);
        
        await character.save();
        return character;
    }
    
    /**
     * Añade galeones a un personaje
     */
    async addGalleons(discordId, amount) {
        const character = await this.getCharacter(discordId);
        if (!character) {
            throw new Error('No tienes un personaje. Usa /crear-personaje primero.');
        }
        
        character.galleons += amount;
        if (amount > 0) {
            character.gameStats.goldEarned += amount;
        }
        
        await character.save();
        return character;
    }
    
    /**
     * Cura al personaje (descanso)
     */
    async restCharacter(discordId) {
        const character = await this.getCharacter(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        character.rest();
        await character.save();
        return character;
    }
    
    /**
     * Asigna puntos de atributo
     */
    async assignAttributePoints(discordId, stat, points) {
        const character = await this.getCharacter(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        const validStats = ['strength', 'intelligence', 'dexterity', 'constitution', 'wisdom', 'luck'];
        if (!validStats.includes(stat)) {
            throw new Error(`Estadística inválida. Usa: ${validStats.join(', ')}`);
        }
        
        if (character.attributePoints < points) {
            throw new Error(`No tienes suficientes puntos. Tienes ${character.attributePoints} puntos disponibles.`);
        }
        
        character.stats[stat] += points;
        character.attributePoints -= points;
        
        await character.save();
        return character;
    }
    
    /**
     * Inflige daño al personaje
     */
    async takeDamage(discordId, damage) {
        const character = await this.getCharacter(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        character.stats.hp -= damage;
        character.gameStats.totalDamageReceived += damage;
        
        let died = false;
        if (character.stats.hp <= 0) {
            character.stats.hp = 0;
            character.status.isAlive = false;
            died = true;
        }
        
        await character.save();
        return { character, died };
    }
    
    /**
     * Cura al personaje
     */
    async heal(discordId, amount) {
        const character = await this.getCharacter(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        character.stats.hp = Math.min(character.stats.hp + amount, character.stats.maxHp);
        character.gameStats.totalHealing += amount;
        
        await character.save();
        return character;
    }
    
    /**
     * Obtiene el leaderboard global
     */
    async getLeaderboard(limit = 10) {
        return await Character.getLeaderboard(limit);
    }
    
    /**
     * Obtiene el leaderboard por casa
     */
    async getHouseLeaderboard(house, limit = 10) {
        return await Character.getHouseLeaderboard(house, limit);
    }
    
    /**
     * Obtiene los hechizos de un personaje
     */
    async getSpells(discordId) {
        const character = await this.getCharacter(discordId);
        if (!character) return [];
        
        return await PlayerSpell.getByCharacter(character._id);
    }
    
    /**
     * Obtiene el inventario de un personaje
     */
    async getInventory(discordId) {
        const character = await this.getCharacter(discordId);
        if (!character) return [];
        
        return await PlayerInventory.getInventory(character._id, { populate: true });
    }
    
    /**
     * Cuenta los slots de inventario usados
     */
    async getInventorySlotCount(discordId) {
        const character = await this.getCharacter(discordId);
        if (!character) return { used: 0, total: 20 };
        
        const used = await PlayerInventory.countSlots(character._id);
        return { used, total: character.inventorySlots };
    }
    
    /**
     * Genera un embed de perfil para el personaje
     */
    generateProfileEmbed(character, spellCount = 0, inventoryCount = 0) {
        const houseEmoji = HOUSE_EMOJIS[character.house];
        const houseColor = HOUSE_COLORS[character.house];
        const expToNext = character.getExpToNextLevel();
        const expProgress = Math.floor((character.experience / expToNext) * 100);
        const progressBar = this.createProgressBar(expProgress, 10);
        
        return {
            color: parseInt(houseColor.replace('#', ''), 16),
            title: `${houseEmoji} ${character.name}`,
            description: `*${character.title}*\n${character.house}`,
            thumbnail: { url: `https://robohash.org/${character.discordId}?set=set4&size=150x150` },
            fields: [
                {
                    name: '📊 Nivel',
                    value: `**${character.level}**\n${progressBar}\n${character.experience}/${expToNext} XP`,
                    inline: true
                },
                {
                    name: '❤️ Vida',
                    value: `${character.stats.hp}/${character.stats.maxHp}`,
                    inline: true
                },
                {
                    name: '💙 Magia',
                    value: `${character.stats.mp}/${character.stats.maxMp}`,
                    inline: true
                },
                {
                    name: '⚔️ Estadísticas',
                    value: [
                        `💪 Fuerza: **${character.stats.strength}**`,
                        `🧠 Inteligencia: **${character.stats.intelligence}**`,
                        `🎯 Destreza: **${character.stats.dexterity}**`,
                        `🛡️ Constitución: **${character.stats.constitution}**`,
                        `📚 Sabiduría: **${character.stats.wisdom}**`,
                        `🍀 Suerte: **${character.stats.luck}**`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🪄 Varita',
                    value: `${character.wand.wood}, ${character.wand.core}\n${character.wand.length}" - ${character.wand.flexibility}`,
                    inline: true
                },
                {
                    name: '💰 Galeones',
                    value: `${character.galleons}`,
                    inline: true
                },
                {
                    name: '✨ Puntos Disponibles',
                    value: `${character.attributePoints}`,
                    inline: true
                },
                {
                    name: '📖 Hechizos',
                    value: `${spellCount} aprendidos`,
                    inline: true
                },
                {
                    name: '🎒 Inventario',
                    value: `${inventoryCount}/${character.inventorySlots}`,
                    inline: true
                },
                {
                    name: '📍 Ubicación',
                    value: character.status.currentLocation,
                    inline: true
                }
            ],
            footer: {
                text: `ID: ${character.discordId}`
            },
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Crea una barra de progreso visual
     */
    createProgressBar(percent, length = 10) {
        const filled = Math.floor((percent / 100) * length);
        const empty = length - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }
}

module.exports = new CharacterManager();
