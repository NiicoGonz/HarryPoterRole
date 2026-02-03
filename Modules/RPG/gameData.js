/**
 * Datos del juego RPG Harry Potter
 * Contiene varitas, hechizos, bonus por casa, etc.
 */

// ========== VARITAS ==========

const WAND_WOODS = [
    { id: 'acacia', name: 'Acacia', description: 'Madera rara, se niega a producir magia para cualquiera excepto su dueño.', bonus: { intelligence: 2 } },
    { id: 'alder', name: 'Aliso', description: 'Madera ideal para magia no verbal.', bonus: { wisdom: 2 } },
    { id: 'apple', name: 'Manzano', description: 'Para brujos con altos ideales.', bonus: { luck: 2 } },
    { id: 'ash', name: 'Fresno', description: 'Se aferra a su verdadero dueño.', bonus: { constitution: 1, wisdom: 1 } },
    { id: 'beech', name: 'Haya', description: 'Capaz de una sutileza y artesanía raras.', bonus: { intelligence: 1, dexterity: 1 } },
    { id: 'blackthorn', name: 'Endrino', description: 'Varita de guerrero.', bonus: { strength: 2 } },
    { id: 'cedar', name: 'Cedro', description: 'Para magos de lealtad y perspicacia.', bonus: { wisdom: 1, luck: 1 } },
    { id: 'cherry', name: 'Cerezo', description: 'Poderes letales y honor.', bonus: { strength: 1, intelligence: 1 } },
    { id: 'chestnut', name: 'Castaño', description: 'Atrae a domadores de criaturas mágicas.', bonus: { constitution: 2 } },
    { id: 'cypress', name: 'Ciprés', description: 'Asociada con nobleza.', bonus: { dexterity: 2 } },
    { id: 'elder', name: 'Saúco', description: 'La madera más rara, destino extraordinario.', bonus: { intelligence: 3, luck: -1 } },
    { id: 'elm', name: 'Olmo', description: 'Produce menos accidentes y errores.', bonus: { wisdom: 2 } },
    { id: 'fir', name: 'Abeto', description: 'Varita del superviviente.', bonus: { constitution: 1, dexterity: 1 } },
    { id: 'hawthorn', name: 'Espino', description: 'Para magos de naturaleza conflictiva.', bonus: { strength: 1, luck: 1 } },
    { id: 'hazel', name: 'Avellano', description: 'Refleja el estado emocional del dueño.', bonus: { intelligence: 1, wisdom: 1 } },
    { id: 'holly', name: 'Acebo', description: 'Protectora, buena contra la oscuridad.', bonus: { constitution: 1, wisdom: 1 } },
    { id: 'hornbeam', name: 'Carpe', description: 'Absorbe el código de honor de su dueño.', bonus: { strength: 1, constitution: 1 } },
    { id: 'larch', name: 'Alerce', description: 'Instila valor y confianza.', bonus: { strength: 1, dexterity: 1 } },
    { id: 'maple', name: 'Arce', description: 'Para viajeros y exploradores.', bonus: { dexterity: 1, luck: 1 } },
    { id: 'oak', name: 'Roble', description: 'Fuerza, valor y fidelidad.', bonus: { strength: 2 } },
    { id: 'pine', name: 'Pino', description: 'Disfruta siendo usada creativamente.', bonus: { intelligence: 2 } },
    { id: 'poplar', name: 'Álamo', description: 'Para magos de clara visión moral.', bonus: { wisdom: 2 } },
    { id: 'rowan', name: 'Serbal', description: 'Encantamientos protectores excepcionales.', bonus: { wisdom: 1, constitution: 1 } },
    { id: 'vine', name: 'Vid', description: 'Busca personalidades con profundidad oculta.', bonus: { intelligence: 1, luck: 1 } },
    { id: 'walnut', name: 'Nogal', description: 'Para innovadores mágicos.', bonus: { intelligence: 2 } },
    { id: 'willow', name: 'Sauce', description: 'Poderes curativos inusuales.', bonus: { wisdom: 2 } },
    { id: 'yew', name: 'Tejo', description: 'Poderes de vida y muerte.', bonus: { strength: 1, intelligence: 1 } }
];

const WAND_CORES = [
    { id: 'phoenix', name: 'Pluma de Fénix', description: 'El núcleo más raro, capaz de la mayor variedad de magia.', bonus: { intelligence: 2, wisdom: 1 } },
    { id: 'dragon', name: 'Fibra de Corazón de Dragón', description: 'Produce hechizos potentes y llamativos.', bonus: { strength: 2, intelligence: 1 } },
    { id: 'unicorn', name: 'Pelo de Unicornio', description: 'Magia consistente, fiel a su primer dueño.', bonus: { wisdom: 2, luck: 1 } },
    { id: 'veela', name: 'Cabello de Veela', description: 'Temperamental pero elegante.', bonus: { dexterity: 2, luck: 1 } },
    { id: 'thestral', name: 'Pelo de Thestral', description: 'Inestable pero poderoso.', bonus: { intelligence: 3 } },
    { id: 'basilisk', name: 'Cuerno de Basilisco', description: 'Extremadamente raro, asociado a las artes oscuras.', bonus: { strength: 3 } },
    { id: 'kelpie', name: 'Pelo de Kelpie', description: 'Temperamental pero leal.', bonus: { constitution: 2, dexterity: 1 } }
];

const WAND_FLEXIBILITIES = [
    { id: 'rigid', name: 'Rígida', description: 'Difícil de dominar pero consistente.', bonus: { strength: 1 } },
    { id: 'quite_rigid', name: 'Bastante rígida', description: 'Equilibrio entre poder y control.', bonus: { constitution: 1 } },
    { id: 'slightly_yielding', name: 'Ligeramente flexible', description: 'Buena para principiantes.', bonus: { luck: 1 } },
    { id: 'flexible', name: 'Flexible', description: 'Se adapta fácilmente a su dueño.', bonus: { dexterity: 1 } },
    { id: 'quite_flexible', name: 'Bastante flexible', description: 'Gran adaptabilidad.', bonus: { wisdom: 1 } },
    { id: 'supple', name: 'Dócil', description: 'Perfecta para encantamientos.', bonus: { intelligence: 1 } },
    { id: 'unyielding', name: 'Inflexible', description: 'Para magos de voluntad férrea.', bonus: { strength: 2, luck: -1 } },
    { id: 'springy', name: 'Elástica', description: 'Excelente para duelos.', bonus: { dexterity: 2, constitution: -1 } }
];

// ========== HECHIZOS INICIALES ==========

const STARTER_SPELLS = [
    {
        spellId: 'lumos',
        name: 'Lumos',
        description: 'Crea una luz brillante en la punta de la varita.',
        type: 'utility',
        mpCost: 5,
        effect: { type: 'utility', value: 'light' }
    },
    {
        spellId: 'nox',
        name: 'Nox',
        description: 'Apaga la luz de Lumos.',
        type: 'utility',
        mpCost: 2,
        effect: { type: 'utility', value: 'extinguish' }
    },
    {
        spellId: 'flipendo',
        name: 'Flipendo',
        description: 'Hechizo de empuje que causa daño menor.',
        type: 'attack',
        mpCost: 10,
        baseDamage: 15,
        scaling: 'intelligence',
        effect: { type: 'damage', target: 'enemy' }
    },
    {
        spellId: 'protego',
        name: 'Protego',
        description: 'Crea un escudo mágico protector.',
        type: 'defense',
        mpCost: 15,
        effect: { type: 'buff', target: 'self', stat: 'defense', value: 20, duration: 2 }
    }
];

// ========== BONUS POR CASA ==========

const HOUSE_BONUSES = {
    Gryffindor: {
        strength: 3,
        constitution: 2,
        dexterity: 0,
        intelligence: 0,
        wisdom: 0,
        luck: 0,
        description: 'Los valientes de corazón reciben bonus a Fuerza y Constitución.',
        specialAbility: 'Coraje del León - 10% más daño cuando HP < 30%'
    },
    Hufflepuff: {
        strength: 0,
        constitution: 3,
        dexterity: 0,
        intelligence: 0,
        wisdom: 2,
        luck: 0,
        description: 'Los leales y justos reciben bonus a Constitución y Sabiduría.',
        specialAbility: 'Determinación - Regenera 2% HP por turno'
    },
    Ravenclaw: {
        strength: 0,
        constitution: 0,
        dexterity: 1,
        intelligence: 3,
        wisdom: 1,
        luck: 0,
        description: 'Los sabios e ingeniosos reciben bonus a Inteligencia.',
        specialAbility: 'Mente Brillante - Hechizos cuestan 10% menos MP'
    },
    Slytherin: {
        strength: 1,
        constitution: 0,
        dexterity: 2,
        intelligence: 1,
        wisdom: 0,
        luck: 1,
        description: 'Los astutos y ambiciosos reciben bonus equilibrados.',
        specialAbility: 'Astucia - 15% más probabilidad de crítico'
    }
};

// ========== CRECIMIENTO AUTOMÁTICO POR NIVEL (por casa, estilo RPG) ==========
// Cada vez que subes de nivel, además de +10 maxHp, +8 maxMp y +3 puntos libres,
// tu casa te da un pequeño aumento automático en sus atributos característicos.
const HOUSE_LEVEL_GROWTH = {
    Gryffindor: { strength: 1, constitution: 1 },           // +1 Fuerza, +1 Constitución por nivel
    Hufflepuff: { constitution: 1, wisdom: 1 },            // +1 Constitución, +1 Sabiduría por nivel
    Ravenclaw:  { intelligence: 1, wisdom: 1 },            // +1 Inteligencia, +1 Sabiduría por nivel
    Slytherin:  { dexterity: 1, luck: 1 }                  // +1 Destreza, +1 Suerte por nivel
};

/**
 * Devuelve el objeto de crecimiento por nivel para una casa (para aplicar en levelUp).
 */
function getHouseLevelGrowth(house) {
    return HOUSE_LEVEL_GROWTH[house] || {};
}

// ========== TÍTULOS POR NIVEL ==========

const LEVEL_TITLES = [
    { minLevel: 1, maxLevel: 10, title: 'Estudiante de Primer Año' },
    { minLevel: 11, maxLevel: 20, title: 'Estudiante de Segundo Año' },
    { minLevel: 21, maxLevel: 30, title: 'Estudiante de Tercer Año' },
    { minLevel: 31, maxLevel: 40, title: 'Estudiante de Cuarto Año' },
    { minLevel: 41, maxLevel: 50, title: 'Estudiante de Quinto Año' },
    { minLevel: 51, maxLevel: 60, title: 'Estudiante de Sexto Año' },
    { minLevel: 61, maxLevel: 70, title: 'Estudiante de Séptimo Año' },
    { minLevel: 71, maxLevel: 80, title: 'Mago Graduado' },
    { minLevel: 81, maxLevel: 90, title: 'Mago Experimentado' },
    { minLevel: 91, maxLevel: 99, title: 'Mago Maestro' },
    { minLevel: 100, maxLevel: 100, title: 'Archimago Legendario' }
];

// ========== COLORES Y EMOJIS POR CASA ==========

const HOUSE_COLORS = {
    Gryffindor: '#740001',
    Hufflepuff: '#FFD800',
    Ravenclaw: '#0E1A40',
    Slytherin: '#1A472A'
};

const HOUSE_EMOJIS = {
    Gryffindor: '🦁',
    Hufflepuff: '🦡',
    Ravenclaw: '🦅',
    Slytherin: '🐍'
};

const HOUSE_IMAGES = {
    Gryffindor: 'https://static.wikia.nocookie.net/harrypotter/images/b/b1/Gryffindor_ClearBG.png',
    Hufflepuff: 'https://static.wikia.nocookie.net/harrypotter/images/0/06/Hufflepuff_ClearBG.png',
    Ravenclaw: 'https://static.wikia.nocookie.net/harrypotter/images/7/71/Ravenclaw_ClearBG.png',
    Slytherin: 'https://static.wikia.nocookie.net/harrypotter/images/0/00/Slytherin_ClearBG.png'
};

// ========== FUNCIONES HELPER ==========

/**
 * Genera una varita aleatoria
 */
function generateRandomWand() {
    const wood = WAND_WOODS[Math.floor(Math.random() * WAND_WOODS.length)];
    const core = WAND_CORES[Math.floor(Math.random() * WAND_CORES.length)];
    const flexibility = WAND_FLEXIBILITIES[Math.floor(Math.random() * WAND_FLEXIBILITIES.length)];
    const length = Math.floor(Math.random() * 6) + 9; // 9-14 pulgadas
    
    return {
        wood: wood.name,
        core: core.name,
        length,
        flexibility: flexibility.name,
        bonuses: {
            wood: wood.bonus,
            core: core.bonus,
            flexibility: flexibility.bonus
        }
    };
}

/**
 * Calcula bonus totales de varita
 */
function calculateWandBonuses(wand) {
    const woodData = WAND_WOODS.find(w => w.name === wand.wood);
    const coreData = WAND_CORES.find(c => c.name === wand.core);
    const flexData = WAND_FLEXIBILITIES.find(f => f.name === wand.flexibility);
    
    const bonuses = {
        strength: 0,
        intelligence: 0,
        dexterity: 0,
        constitution: 0,
        wisdom: 0,
        luck: 0
    };
    
    // Sumar bonus de cada parte
    [woodData?.bonus, coreData?.bonus, flexData?.bonus].forEach(bonus => {
        if (bonus) {
            Object.keys(bonus).forEach(stat => {
                bonuses[stat] = (bonuses[stat] || 0) + bonus[stat];
            });
        }
    });
    
    return bonuses;
}

/**
 * Obtiene el título por nivel
 */
function getTitleByLevel(level) {
    const titleData = LEVEL_TITLES.find(t => level >= t.minLevel && level <= t.maxLevel);
    return titleData ? titleData.title : 'Estudiante';
}

/**
 * Obtiene los hechizos iniciales
 */
function getStarterSpells() {
    return STARTER_SPELLS.map(spell => ({
        spellId: spell.spellId,
        name: spell.name,
        mastery: 1,
        timesUsed: 0,
        unlockedAt: new Date()
    }));
}

module.exports = {
    WAND_WOODS,
    WAND_CORES,
    WAND_FLEXIBILITIES,
    STARTER_SPELLS,
    HOUSE_BONUSES,
    HOUSE_LEVEL_GROWTH,
    LEVEL_TITLES,
    HOUSE_COLORS,
    HOUSE_EMOJIS,
    HOUSE_IMAGES,
    generateRandomWand,
    calculateWandBonuses,
    getTitleByLevel,
    getStarterSpells,
    getHouseLevelGrowth
};
