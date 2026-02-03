# Progresión RPG – Nivel, Vida, Estadísticas

Este documento explica **cómo suben el nivel, la vida y las estadísticas** de los personajes (estilo RPG por casa).

---

## Cómo sube el nivel

- El **nivel** sube cuando ganas **experiencia (XP)**.
- La experiencia se obtiene mediante acciones del juego (misiones, combate, etc.). El módulo que otorga XP debe llamar a `characterManager.addExperience(discordId, cantidad)`.
- La XP necesaria para el siguiente nivel es: `100 * nivel^1.5` (por ejemplo: nivel 1→2 = 100 XP, nivel 10→11 ≈ 3162 XP).

---

## Qué pasa al subir de nivel

Cada vez que subes de nivel ocurre lo siguiente de forma **automática**:

| Concepto | Efecto por nivel |
|----------|-------------------|
| **Vida máxima (maxHp)** | +10 |
| **Magia máxima (maxMp)** | +8 |
| **Vida y magia actual** | Se rellenan al máximo |
| **Puntos de atributo** | +3 (para gastar en `/stats`) |
| **Crecimiento por casa** | Ver tabla más abajo |

Es decir: **la vida y la magia sí suben solas** cada nivel. Los **atributos base** (Fuerza, Inteligencia, etc.) suben de dos formas: con los **puntos libres** en `/stats` y con el **crecimiento automático por casa**.

---

## Cómo suben las estadísticas (atributos base)

1. **Puntos de atributo**  
   Cada nivel te da **3 puntos** que puedes gastar en `/stats` en: Fuerza, Inteligencia, Destreza, Constitución, Sabiduría o Suerte. Si no los gastas, se acumulan y las stats no suben hasta que los asignes.

2. **Crecimiento automático por casa (RPG)**  
   Además, cada casa tiene un **crecimiento fijo por nivel** en sus stats característicos. Aunque no gastes puntos, estos atributos suben solos al subir de nivel:

   | Casa        | Por cada nivel sube |
   |------------|----------------------|
   | Gryffindor | +1 Fuerza, +1 Constitución |
   | Hufflepuff | +1 Constitución, +1 Sabiduría |
   | Ravenclaw  | +1 Inteligencia, +1 Sabiduría |
   | Slytherin  | +1 Destreza, +1 Suerte |

Así, a nivel 99 un personaje habrá ganado **98 niveles** de crecimiento automático (desde nivel 2 hasta 99), más los puntos que haya asignado con `/stats`.

---

## Poder Mágico, Poder Físico y Defensa

Estos **no se guardan** en la base de datos; se **calculan** en cada consulta a partir del nivel y de los atributos base:

- **Poder Mágico** = `Inteligencia×2 + Sabiduría×0.5 + Nivel×3`
- **Poder Físico** = `Fuerza×2 + Destreza×0.5 + Nivel×2`
- **Defensa** = `Constitución×1.5 + Sabiduría×0.5 + Nivel`

Por tanto, suben **automáticamente** cuando:
- subes de **nivel**, o
- subes **Inteligencia / Fuerza / Constitución / Sabiduría / Destreza** (con puntos o con el crecimiento por casa).

---

## Resumen rápido

- **Nivel** → Sube con XP (misiones, combate, etc.).
- **Vida y magia máximas** → Suben solas cada nivel (+10 HP, +8 MP).
- **Atributos base** (Fuerza, Inteligencia, etc.) → Suben con **puntos en `/stats`** y con el **crecimiento automático por casa** cada nivel.
- **Poder Mágico / Físico / Defensa** → Se calculan con nivel + atributos; suben cuando sube el nivel o los atributos.

Si tu personaje es nivel 99 y no ves subir “las cosas”, revisa:
1. Si tienes **puntos de atributo sin gastar** en el perfil; si es así, usa `/stats` para asignarlos.
2. A partir de ahora, cada **nuevo** nivel que ganes aplicará también el **crecimiento por casa** (los niveles que ya tenías no se recalculan hacia atrás).

---

## Recalcular stats si cambiaste el nivel en la BD

Si editaste el nivel de un personaje directamente en la base de datos (p. ej. de 1 a 99), vida, magia y atributos no se actualizan solos. Para **simular** haber subido hasta ese nivel y actualizar todo en la BD, usa el script:

```bash
node scripts/recalcular-stats-personaje.js <discordId>
```

Ejemplo: `node scripts/recalcular-stats-personaje.js 123456789012345678`

El script recalcula y guarda: vida/magia máximas, HP/MP actuales, atributos base (con crecimiento por casa) y puntos de atributo disponibles. Requiere `MONGODB_URI` en tu `.env`.
