# 🏗️ Arquitectura del Proyecto - Bot RPG/D&D con IA

## 🎯 Visión del Proyecto

Bot de Discord con las siguientes capacidades:
- ✅ Gestión de permisos y moderación
- ✅ Sistema de mensajes avanzado
- ✅ Creación y gestión de eventos
- ✅ Sistema RPG/D&D completo
- ✅ Integración con canales de voz
- ✅ Integraciones con APIs externas (OpenAI, etc.)
- ✅ IA autónoma que toma decisiones
- ✅ Desarrollo modular y escalable

---

## 📦 Estructura Modular del Proyecto

```
HarryPoterRole/
├── Commands/                    # Comandos del bot
│   ├── Public/                  # Comandos públicos
│   ├── Moderation/             # Comandos de moderación
│   ├── RPG/                     # Comandos RPG/D&D
│   ├── Events/                  # Comandos de eventos
│   └── Admin/                   # Comandos de administración
│
├── Events/                      # Eventos de Discord
│   ├── Client/                  # Eventos del cliente
│   ├── Guild/                   # Eventos del servidor
│   ├── Interaction/             # Eventos de interacciones
│   └── Voice/                   # Eventos de voz
│
├── Handlers/                    # Manejadores
│   ├── commandHandler.js
│   ├── eventHandler.js
│   └── moduleHandler.js         # Nuevo: Carga módulos dinámicamente
│
├── Modules/                     # Módulos del sistema (NUEVO)
│   ├── RPG/                     # Sistema RPG/D&D
│   │   ├── combat.js            # Sistema de combate
│   │   ├── inventory.js         # Sistema de inventario
│   │   ├── quests.js            # Sistema de misiones
│   │   ├── characters.js        # Sistema de personajes
│   │   ├── enemies.js          # Generación de enemigos
│   │   └── loot.js             # Sistema de loot
│   │
│   ├── AI/                      # Sistema de IA
│   │   ├── openai.js           # Integración OpenAI
│   │   ├── decisionEngine.js   # Motor de decisiones
│   │   ├── eventPlanner.js     # Planificador de eventos
│   │   └── conversation.js     # Sistema de conversación
│   │
│   ├── Events/                  # Sistema de eventos
│   │   ├── scheduler.js         # Programador de eventos
│   │   ├── creator.js           # Creador de eventos
│   │   └── manager.js           # Gestor de eventos
│   │
│   ├── Voice/                   # Sistema de voz
│   │   ├── connection.js       # Conexión a voz
│   │   ├── audioPlayer.js       # Reproductor de audio
│   │   └── tts.js              # Text-to-Speech
│   │
│   └── Integration/              # Integraciones externas
│       ├── apiManager.js        # Gestor de APIs
│       └── webhooks.js          # Webhooks
│
├── Utils/                        # Utilidades
│   ├── testQuestions.js
│   ├── testManager.js
│   ├── database.js              # Nuevo: Base de datos
│   ├── logger.js                # Nuevo: Sistema de logs
│   └── config.js                # Nuevo: Configuración
│
├── Database/                     # Base de datos (NUEVO)
│   ├── models/                  # Modelos de datos
│   │   ├── User.js
│   │   ├── Character.js
│   │   ├── Quest.js
│   │   └── Event.js
│   └── migrations/              # Migraciones
│
├── Services/                     # Servicios externos (NUEVO)
│   ├── openai.js                # Servicio OpenAI
│   ├── voiceService.js          # Servicio de voz
│   └── eventService.js          # Servicio de eventos
│
├── Config/                       # Configuraciones (NUEVO)
│   ├── modules.json             # Configuración de módulos
│   └── ai.json                  # Configuración de IA
│
└── index.js                      # Archivo principal
```

---

## 🔧 Permisos y Scopes Necesarios

### Scopes (Alcances)
```
✅ bot (OBLIGATORIO)
✅ applications.commands (OBLIGATORIO)
⚠️ applications.commands.permissions.update (Para gestión avanzada)
```

### Permisos Completos Necesarios

#### Text Permissions
```
✅ Send Messages
✅ Send Messages in Threads
✅ Embed Links
✅ Attach Files
✅ Read Message History
✅ Use External Emojis
✅ Add Reactions
✅ Use External Stickers
✅ Manage Messages
✅ Mention Everyone (con cuidado)
```

#### Voice Permissions
```
✅ Connect
✅ Speak
✅ Use Voice Activity
✅ Priority Speaker
✅ Mute Members (para moderación)
✅ Deafen Members (para moderación)
✅ Move Members (para eventos)
```

#### Role & Member Permissions
```
✅ Manage Roles
✅ Change Nickname
✅ Manage Nicknames
```

#### Channel Permissions
```
✅ View Channels
✅ Manage Channels
✅ Create Public Threads
✅ Create Private Threads
✅ Manage Threads
✅ Manage Webhooks
```

#### Event Permissions
```
✅ Create Events
✅ Manage Events
```

#### Advanced Permissions
```
✅ Manage Messages
✅ Manage Guild (para configuración avanzada)
```

---

## 📚 Dependencias Necesarias

### Dependencias Actuales
```json
{
  "discord.js": "^14.15.3",
  "dotenv": "^16.4.5",
  "ascii-table": "^0.0.9"
}
```

### Dependencias Adicionales Recomendadas

#### Base de Datos
```json
{
  "mongoose": "^8.0.0",           // MongoDB (recomendado para RPG)
  // O alternativamente:
  "sequelize": "^6.35.0",         // SQL (PostgreSQL, MySQL)
  "sqlite3": "^5.1.6"             // SQLite (más simple)
}
```

#### IA y APIs
```json
{
  "openai": "^4.20.0",            // OpenAI API
  "axios": "^1.6.0"               // Para otras APIs
}
```

#### Voz
```json
{
  "@discordjs/voice": "^0.16.0",  // Para voz
  "ffmpeg-static": "^5.2.0",      // Para procesamiento de audio
  "libsodium-wrappers": "^0.7.13"  // Para encriptación de voz
}
```

#### Utilidades
```json
{
  "winston": "^3.11.0",           // Sistema de logs
  "node-cron": "^3.0.3",           // Tareas programadas
  "uuid": "^9.0.1",                // Generación de IDs únicos
  "lodash": "^4.17.21"             // Utilidades de JavaScript
}
```

#### Testing (Opcional pero recomendado)
```json
{
  "jest": "^29.7.0",
  "discord.js-mock": "^0.3.0"
}
```

### package.json Completo Recomendado
```json
{
  "name": "harrypotterbot",
  "version": "2.0.0",
  "description": "Bot RPG/D&D con IA para Discord",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "discord.js": "^14.15.3",
    "dotenv": "^16.4.5",
    "ascii-table": "^0.0.9",
    "mongoose": "^8.0.0",
    "openai": "^4.20.0",
    "@discordjs/voice": "^0.16.0",
    "ffmpeg-static": "^5.2.0",
    "libsodium-wrappers": "^0.7.13",
    "axios": "^1.6.0",
    "winston": "^3.11.0",
    "node-cron": "^3.0.3",
    "uuid": "^9.0.1",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "nodemon": "^3.1.0",
    "jest": "^29.7.0"
  }
}
```

---

## 🗺️ Roadmap de Desarrollo

### Fase 1: Fundación (Actual - Completado ✅)
- [x] Migración a discord.js v14
- [x] Sistema de test del Sombrero Seleccionador
- [x] Estructura básica de comandos y eventos
- [x] Variables de entorno configuradas

### Fase 2: Base de Datos y Logging (Próximo)
- [ ] Implementar base de datos (MongoDB recomendado)
- [ ] Sistema de logs con Winston
- [ ] Modelos de datos básicos (User, Character)
- [ ] Sistema de configuración modular

### Fase 3: Sistema RPG Básico
- [ ] Sistema de personajes
- [ ] Sistema de inventario básico
- [ ] Sistema de combate simple
- [ ] Generación básica de enemigos
- [ ] Sistema de loot básico

### Fase 4: Sistema de Voz
- [ ] Integración con @discordjs/voice
- [ ] Reproducción de audio
- [ ] Text-to-Speech básico
- [ ] Comandos de voz para RPG

### Fase 5: Sistema de Eventos
- [ ] Programador de eventos (node-cron)
- [ ] Creador automático de eventos
- [ ] Gestión de eventos del servidor
- [ ] Notificaciones de eventos

### Fase 6: Integración con IA
- [ ] Integración con OpenAI
- [ ] Sistema de conversación
- [ ] Motor de decisiones básico
- [ ] Análisis de contexto del servidor

### Fase 7: IA Autónoma
- [ ] Planificador de eventos con IA
- [ ] Toma de decisiones autónoma
- [ ] Análisis de actividad del servidor
- [ ] Generación automática de contenido

### Fase 8: Sistema RPG Avanzado
- [ ] Sistema de misiones complejas
- [ ] Sistema de habilidades
- [ ] Sistema de niveles y experiencia
- [ ] Sistema de clases y razas (D&D)

### Fase 9: Optimización y Escalabilidad
- [ ] Caché de datos
- [ ] Optimización de consultas
- [ ] Sistema de plugins
- [ ] Documentación completa

---

## 🧩 Módulos Principales

### 1. Módulo RPG/D&D
**Responsabilidades:**
- Gestión de personajes
- Sistema de combate
- Inventario y loot
- Misiones y quests
- Progresión de niveles

**Archivos:**
- `Modules/RPG/characters.js`
- `Modules/RPG/combat.js`
- `Modules/RPG/inventory.js`
- `Modules/RPG/quests.js`
- `Modules/RPG/enemies.js`
- `Modules/RPG/loot.js`

### 2. Módulo de IA
**Responsabilidades:**
- Integración con OpenAI
- Toma de decisiones
- Planificación de eventos
- Análisis de contexto
- Generación de contenido

**Archivos:**
- `Modules/AI/openai.js`
- `Modules/AI/decisionEngine.js`
- `Modules/AI/eventPlanner.js`
- `Modules/AI/conversation.js`

### 3. Módulo de Eventos
**Responsabilidades:**
- Programación de eventos
- Creación automática
- Gestión de eventos
- Notificaciones

**Archivos:**
- `Modules/Events/scheduler.js`
- `Modules/Events/creator.js`
- `Modules/Events/manager.js`

### 4. Módulo de Voz
**Responsabilidades:**
- Conexión a canales de voz
- Reproducción de audio
- Text-to-Speech
- Efectos de sonido

**Archivos:**
- `Modules/Voice/connection.js`
- `Modules/Voice/audioPlayer.js`
- `Modules/Voice/tts.js`

### 5. Módulo de Integraciones
**Responsabilidades:**
- Gestión de APIs externas
- Webhooks
- Sincronización de datos

**Archivos:**
- `Modules/Integration/apiManager.js`
- `Modules/Integration/webhooks.js`

---

## 🗄️ Modelos de Base de Datos

### User Model
```javascript
{
  userId: String,
  guildId: String,
  house: String, // Gryffindor, etc.
  character: ObjectId, // Referencia a Character
  stats: {
    level: Number,
    experience: Number,
    gold: Number
  },
  preferences: {
    notifications: Boolean,
    language: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Character Model
```javascript
{
  userId: String,
  guildId: String,
  name: String,
  class: String, // Warrior, Mage, etc.
  race: String, // Human, Elf, etc.
  stats: {
    strength: Number,
    dexterity: Number,
    constitution: Number,
    intelligence: Number,
    wisdom: Number,
    charisma: Number
  },
  inventory: [ObjectId], // Referencias a Items
  activeQuests: [ObjectId], // Referencias a Quests
  completedQuests: [ObjectId],
  level: Number,
  experience: Number,
  health: Number,
  maxHealth: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Quest Model
```javascript
{
  questId: String,
  name: String,
  description: String,
  type: String, // main, side, daily, etc.
  requirements: {
    level: Number,
    items: [String]
  },
  rewards: {
    experience: Number,
    gold: Number,
    items: [String]
  },
  status: String, // available, active, completed
  createdAt: Date
}
```

### Event Model
```javascript
{
  eventId: String,
  guildId: String,
  name: String,
  description: String,
  type: String, // raid, quest, social, etc.
  scheduledTime: Date,
  createdBy: String, // 'ai' o userId
  participants: [String], // userIds
  status: String, // scheduled, active, completed, cancelled
  aiGenerated: Boolean,
  createdAt: Date
}
```

---

## 🤖 Sistema de IA Autónoma

### Decision Engine
El motor de decisiones analizará:
- Actividad del servidor
- Patrones de uso
- Preferencias de usuarios
- Horarios óptimos
- Eventos pasados exitosos

### Event Planner
El planificador de eventos usará IA para:
- Decidir cuándo crear eventos
- Qué tipo de eventos crear
- A quién invitar
- Qué contenido incluir

### Conversation System
Sistema de conversación para:
- Responder preguntas de usuarios
- Generar contenido narrativo
- Crear diálogos para NPCs
- Asistir en sesiones de D&D

---

## 🔐 Variables de Entorno Adicionales

```env
# Discord
TOKEN=tu_token
Gryffindor=id_rol
Hufflepuff=id_rol
Ravenclaw=id_rol
Slytherin=id_rol
VERIFY_CHANNEL_ID=id_canal
WELCOME_CHANNEL_ID=id_canal
MEMBER_ROLE_ID=id_rol

# Base de Datos
MONGODB_URI=mongodb://localhost:27017/hogwarts
# O para producción:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hogwarts

# OpenAI
OPENAI_API_KEY=tu_api_key_openai

# Configuración de IA
AI_ENABLED=true
AI_AUTONOMOUS_MODE=false  # Activar cuando esté listo
AI_EVENT_PLANNING=true
AI_CONVERSATION=true

# Configuración de Voz
VOICE_ENABLED=true
TTS_ENABLED=true
TTS_VOICE=alloy  # Opciones: alloy, echo, fable, onyx, nova, shimmer

# Configuración de Eventos
EVENTS_ENABLED=true
AUTO_EVENTS_ENABLED=false  # Activar cuando IA esté lista
EVENT_NOTIFICATION_CHANNEL=id_canal

# Logging
LOG_LEVEL=info  # debug, info, warn, error
LOG_FILE=logs/bot.log
```

---

## 📝 Próximos Pasos Inmediatos

1. **Instalar dependencias base:**
   ```bash
   npm install mongoose openai @discordjs/voice winston node-cron
   ```

2. **Configurar base de datos:**
   - Instalar MongoDB localmente o usar MongoDB Atlas
   - Crear archivo de conexión

3. **Crear estructura de módulos:**
   - Crear carpetas de módulos
   - Implementar sistema de carga modular

4. **Implementar sistema de logs:**
   - Configurar Winston
   - Crear diferentes niveles de log

5. **Comenzar con módulo RPG básico:**
   - Sistema de personajes
   - Inventario simple

---

## 🎯 Objetivos a Largo Plazo

1. **Bot completamente autónomo** que:
   - Analiza el servidor
   - Crea eventos cuando detecta baja actividad
   - Genera contenido dinámicamente
   - Toma decisiones inteligentes

2. **Sistema RPG completo** con:
   - Combate por turnos
   - Sistema de clases y razas
   - Misiones complejas
   - Economía del juego

3. **Integración completa con IA** para:
   - Narrativa dinámica
   - NPCs inteligentes
   - Asistencia en sesiones de D&D
   - Generación de contenido

4. **Sistema modular** que permita:
   - Agregar funcionalidades fácilmente
   - Desactivar módulos sin afectar otros
   - Plugins de terceros

---

## ✅ Checklist de Implementación

### Fase Actual (Completada)
- [x] Estructura básica
- [x] Sistema de test
- [x] Comandos básicos

### Fase 2 (Próxima)
- [ ] Base de datos configurada
- [ ] Sistema de logs
- [ ] Modelos de datos básicos

### Fase 3
- [ ] Sistema RPG básico
- [ ] Personajes funcionales
- [ ] Combate simple

### Fase 4
- [ ] Integración de voz
- [ ] Reproducción de audio

### Fase 5
- [ ] Sistema de eventos
- [ ] Programación automática

### Fase 6
- [ ] Integración OpenAI
- [ ] Sistema de conversación

### Fase 7
- [ ] IA autónoma
- [ ] Toma de decisiones

---

**¡Este es un proyecto ambicioso pero totalmente alcanzable con desarrollo modular!** 🚀

