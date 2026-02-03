/**
 * Script: Recalcular stats de un personaje al nivel actual
 *
 * Simula haber subido de nivel 1 hasta el nivel que tiene el personaje en la BD
 * y actualiza vida, magia y atributos (base + crecimiento por casa).
 *
 * Uso (desde la raíz del proyecto):
 *   node scripts/recalcular-stats-personaje.js <discordId>
 *
 * Ejemplo:
 *   node scripts/recalcular-stats-personaje.js 123456789012345678
 */

require('dotenv').config();
const path = require('path');

async function main() {
    const discordId = process.argv[2];
    if (!discordId) {
        console.error('Uso: node scripts/recalcular-stats-personaje.js <discordId>');
        console.error('Ejemplo: node scripts/recalcular-stats-personaje.js 123456789012345678');
        process.exit(1);
    }

    const { connectDatabase, disconnectDatabase } = require(path.join(__dirname, '..', 'Database', 'connection'));
    const characterManager = require(path.join(__dirname, '..', 'Modules', 'RPG', 'characterManager'));

    await connectDatabase();

    let failed = false;
    try {
        const character = await characterManager.recalculateStatsToCurrentLevel(discordId);
        console.log('✅ Personaje actualizado correctamente.');
        console.log(`   Nombre: ${character.name}`);
        console.log(`   Casa: ${character.house}`);
        console.log(`   Nivel: ${character.level}`);
        console.log(`   Vida: ${character.stats.hp}/${character.stats.maxHp}`);
        console.log(`   Magia: ${character.stats.mp}/${character.stats.maxMp}`);
        console.log(`   Atributos: Fuerza ${character.stats.strength}, Int ${character.stats.intelligence}, Destreza ${character.stats.dexterity}, Const ${character.stats.constitution}, Sabiduría ${character.stats.wisdom}, Suerte ${character.stats.luck}`);
        console.log(`   Puntos de atributo disponibles: ${character.attributePoints}`);
    } catch (err) {
        console.error('❌ Error:', err.message);
        failed = true;
    } finally {
        await disconnectDatabase();
        process.exit(failed ? 1 : 0);
    }
}

main();
