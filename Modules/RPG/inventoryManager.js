const PlayerInventory = require('../../Database/models/PlayerInventory');
const Character = require('../../Database/models/Character');
const Item = require('../../Database/models/Item');

/**
 * Gestiona los inventarios de los jugadores
 */
class InventoryManager {
    
    /**
     * Obtiene el inventario de un usuario
     */
    async getInventory(discordId, options = {}) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) return [];
        
        return await PlayerInventory.getInventory(character._id, {
            populate: options.populate !== false,
            ...options
        });
    }
    
    /**
     * Cuenta los slots usados
     */
    async getSlotInfo(discordId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) return { used: 0, total: 20, available: 20 };
        
        const used = await PlayerInventory.countSlots(character._id);
        return {
            used,
            total: character.inventorySlots,
            available: character.inventorySlots - used
        };
    }
    
    /**
     * Verifica si tiene espacio en el inventario
     */
    async hasSpace(discordId, slotsNeeded = 1) {
        const slotInfo = await this.getSlotInfo(discordId);
        return slotInfo.available >= slotsNeeded;
    }
    
    /**
     * Añade un item al inventario
     */
    async addItem(discordId, itemId, quantity = 1, source = {}) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        // Buscar definición del item
        const item = await Item.findOne({ itemId });
        if (!item) {
            throw new Error(`Item "${itemId}" no encontrado.`);
        }
        
        // Verificar espacio (si no es stackeable o no tiene el item)
        const existingItem = await PlayerInventory.findOne({
            character: character._id,
            itemId,
            isEquipped: false
        });
        
        if (!existingItem || !item.stackable) {
            const hasSpace = await this.hasSpace(discordId);
            if (!hasSpace) {
                throw new Error('Tu inventario está lleno.');
            }
        }
        
        // Añadir item
        const inventoryItem = await PlayerInventory.addItem(character._id, item, quantity, source);
        
        // Actualizar estadísticas
        character.gameStats.itemsCollected += quantity;
        await character.save();
        
        return inventoryItem;
    }
    
    /**
     * Remueve un item del inventario
     */
    async removeItem(discordId, itemId, quantity = 1) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        return await PlayerInventory.removeItem(character._id, itemId, quantity);
    }
    
    /**
     * Obtiene un item específico del inventario
     */
    async getItem(discordId, itemId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) return null;
        
        return await PlayerInventory.findOne({
            character: character._id,
            itemId
        }).populate('item');
    }
    
    /**
     * Verifica si tiene un item
     */
    async hasItem(discordId, itemId, quantity = 1) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) return false;
        
        const item = await PlayerInventory.findOne({
            character: character._id,
            itemId
        });
        
        return item && item.quantity >= quantity;
    }
    
    /**
     * Equipa un item
     */
    async equipItem(discordId, inventoryItemId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        const inventoryItem = await PlayerInventory.findOne({
            _id: inventoryItemId,
            character: character._id
        }).populate('item');
        
        if (!inventoryItem) {
            throw new Error('Item no encontrado en tu inventario.');
        }
        
        const item = inventoryItem.item;
        if (!item.equipSlot) {
            throw new Error('Este item no se puede equipar.');
        }
        
        // Verificar requisitos
        if (item.requirements.level > character.level) {
            throw new Error(`Necesitas nivel ${item.requirements.level} para equipar este item.`);
        }
        
        if (item.requirements.house && item.requirements.house !== character.house) {
            throw new Error(`Solo los de ${item.requirements.house} pueden equipar este item.`);
        }
        
        // Equipar
        const equipped = await PlayerInventory.equipItem(
            character._id, 
            inventoryItemId, 
            item.equipSlot
        );
        
        // Actualizar referencia en character.equipment
        character.equipment[item.equipSlot] = equipped._id;
        await character.save();
        
        return equipped;
    }
    
    /**
     * Desequipa un item de un slot
     */
    async unequipSlot(discordId, slot) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        await PlayerInventory.unequipItem(character._id, slot);
        
        character.equipment[slot] = null;
        await character.save();
        
        return true;
    }
    
    /**
     * Obtiene items equipados
     */
    async getEquippedItems(discordId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) return [];
        
        return await PlayerInventory.getInventory(character._id, {
            onlyEquipped: true,
            populate: true
        });
    }
    
    /**
     * Usa un item consumible
     */
    async useItem(discordId, itemId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        const inventoryItem = await PlayerInventory.findOne({
            character: character._id,
            itemId,
            isEquipped: false
        }).populate('item');
        
        if (!inventoryItem) {
            throw new Error('No tienes este item.');
        }
        
        const item = inventoryItem.item;
        if (!item.consumeOnUse) {
            throw new Error('Este item no es consumible.');
        }
        
        // Aplicar efectos
        const effects = [];
        for (const effect of item.effects) {
            const result = await this.applyEffect(character, effect);
            effects.push(result);
        }
        
        // Consumir item
        await PlayerInventory.removeItem(character._id, itemId, 1);
        
        return { effects, item };
    }
    
    /**
     * Aplica un efecto de item
     */
    async applyEffect(character, effect) {
        let result = { type: effect.effectType, value: 0 };
        
        switch (effect.effectType) {
            case 'heal':
                const healAmount = Math.min(effect.value, character.stats.maxHp - character.stats.hp);
                character.stats.hp += healAmount;
                character.gameStats.totalHealing += healAmount;
                result.value = healAmount;
                break;
                
            case 'restore_mp':
                const mpAmount = Math.min(effect.value, character.stats.maxMp - character.stats.mp);
                character.stats.mp += mpAmount;
                result.value = mpAmount;
                break;
                
            case 'damage':
                // Para items que hacen daño a ti mismo (pociones raras)
                character.stats.hp = Math.max(1, character.stats.hp - effect.value);
                result.value = effect.value;
                break;
                
            // TODO: Más efectos (buff, debuff, etc.)
        }
        
        await character.save();
        return result;
    }
    
    // ========== SISTEMA DE COMERCIO ==========
    
    /**
     * Pone un item en venta
     */
    async listForSale(discordId, itemId, price) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        const inventoryItem = await PlayerInventory.findOne({
            character: character._id,
            itemId,
            isEquipped: false
        }).populate('item');
        
        if (!inventoryItem) {
            throw new Error('No tienes este item.');
        }
        
        if (!inventoryItem.item.tradeable) {
            throw new Error('Este item no se puede comerciar.');
        }
        
        if (inventoryItem.isLocked) {
            throw new Error('Este item está bloqueado.');
        }
        
        return await PlayerInventory.listForSale(inventoryItem._id, price);
    }
    
    /**
     * Cancela una venta
     */
    async cancelSale(discordId, itemId) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) {
            throw new Error('No tienes un personaje.');
        }
        
        const inventoryItem = await PlayerInventory.findOne({
            character: character._id,
            itemId,
            forSale: true
        });
        
        if (!inventoryItem) {
            throw new Error('No tienes este item en venta.');
        }
        
        return await PlayerInventory.cancelSale(inventoryItem._id);
    }
    
    /**
     * Obtiene items en el mercado
     */
    async getMarketItems(options = {}) {
        return await PlayerInventory.getMarketItems(options);
    }
    
    /**
     * Compra un item del mercado
     */
    async buyFromMarket(buyerDiscordId, inventoryItemId) {
        const buyer = await Character.findByDiscordId(buyerDiscordId);
        if (!buyer) {
            throw new Error('No tienes un personaje.');
        }
        
        const marketItem = await PlayerInventory.findById(inventoryItemId)
            .populate('character')
            .populate('item');
        
        if (!marketItem || !marketItem.forSale) {
            throw new Error('Este item ya no está en venta.');
        }
        
        if (marketItem.character._id.equals(buyer._id)) {
            throw new Error('No puedes comprar tu propio item.');
        }
        
        if (buyer.galleons < marketItem.salePrice) {
            throw new Error(`No tienes suficientes galeones. Necesitas ${marketItem.salePrice}.`);
        }
        
        // Verificar espacio
        const hasSpace = await this.hasSpace(buyerDiscordId);
        if (!hasSpace) {
            throw new Error('Tu inventario está lleno.');
        }
        
        const seller = marketItem.character;
        
        // Transferir galeones
        buyer.galleons -= marketItem.salePrice;
        seller.galleons += marketItem.salePrice;
        
        await buyer.save();
        await seller.save();
        
        // Transferir item
        await PlayerInventory.transferItem(
            seller._id,
            buyer._id,
            inventoryItemId,
            marketItem.quantity
        );
        
        return {
            item: marketItem.item,
            price: marketItem.salePrice,
            seller: seller.name
        };
    }
    
    /**
     * Transfiere un item directamente entre jugadores
     */
    async transferItem(fromDiscordId, toDiscordId, itemId, quantity = 1) {
        const fromChar = await Character.findByDiscordId(fromDiscordId);
        const toChar = await Character.findByDiscordId(toDiscordId);
        
        if (!fromChar) throw new Error('No tienes un personaje.');
        if (!toChar) throw new Error('El destinatario no tiene un personaje.');
        
        const inventoryItem = await PlayerInventory.findOne({
            character: fromChar._id,
            itemId,
            isEquipped: false
        });
        
        if (!inventoryItem) {
            throw new Error('No tienes este item.');
        }
        
        // Verificar espacio del destinatario
        const toSlotInfo = await this.getSlotInfo(toDiscordId);
        if (toSlotInfo.available < 1) {
            throw new Error('El destinatario no tiene espacio en su inventario.');
        }
        
        return await PlayerInventory.transferItem(
            fromChar._id,
            toChar._id,
            inventoryItem._id,
            quantity
        );
    }
    
    // ========== MÉTODOS ADMINISTRATIVOS ==========
    
    /**
     * Busca todos los jugadores que tienen un item
     */
    async findPlayersWithItem(itemId) {
        return await PlayerInventory.findPlayersWithItem(itemId);
    }
    
    /**
     * Obtiene estadísticas de un item
     */
    async getItemStats(itemId) {
        return await PlayerInventory.getItemStats(itemId);
    }
    
    /**
     * Obtiene los items más comunes
     */
    async getMostCommonItems(limit = 10) {
        return await PlayerInventory.getMostCommonItems(limit);
    }
    
    /**
     * Da un item a todos los jugadores (evento especial)
     */
    async grantItemToAll(itemId, quantity = 1) {
        const item = await Item.findOne({ itemId });
        if (!item) {
            throw new Error('Item no encontrado.');
        }
        
        const characters = await Character.find({});
        let granted = 0;
        
        for (const character of characters) {
            try {
                await PlayerInventory.addItem(character._id, item, quantity, {
                    type: 'gift',
                    source: 'event'
                });
                granted++;
            } catch (e) {
                // Inventario lleno, continuar
            }
        }
        
        return { granted, total: characters.length };
    }
    
    /**
     * Da un item a un jugador específico (admin)
     */
    async grantItem(discordId, itemId, quantity = 1) {
        const character = await Character.findByDiscordId(discordId);
        if (!character) {
            throw new Error('Usuario no tiene personaje.');
        }
        
        const item = await Item.findOne({ itemId });
        if (!item) {
            throw new Error('Item no encontrado.');
        }
        
        return await PlayerInventory.addItem(character._id, item, quantity, {
            type: 'gift',
            source: 'admin'
        });
    }
}

module.exports = new InventoryManager();
