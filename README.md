# HarryPoterRole
Un bot de Discord que asigna roles basados en las casas de Hogwarts (Gryffindor, Hufflepuff, Ravenclaw, Slytherin).

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/NiicoGonz/HarryPoterRole.git
cd HarryPoterRole
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   - Copia el archivo `.env.example` y renómbralo a `.env`
   - Completa todas las variables con tus valores:

```env
# Token del bot de Discord
TOKEN=tu_token_aqui

# IDs de los roles de las casas de Hogwarts
Gryffindor=id_rol_gryffindor
Hufflepuff=id_rol_hufflepuff
Ravenclaw=id_rol_ravenclaw
Slytherin=id_rol_slytherin

# Himnos de las casas
HimmnoGryffindor=himno_de_gryffindor
HimmnoHufflepuff=himno_de_hufflepuff
HimmnoRavenclaw=himno_de_ravenclaw
HimnoSlytherin=himno_de_slytherin

# IDs de canales
VERIFY_CHANNEL_ID=id_canal_verificacion
WELCOME_CHANNEL_ID=id_canal_bienvenida

# ID del rol de miembro por defecto
MEMBER_ROLE_ID=id_rol_miembro
```

## 📝 Cómo obtener los IDs

### Token del Bot
1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación
3. Ve a "Bot" y copia el token

### IDs de Roles
1. Activa el "Modo Desarrollador" en Discord (Configuración > Avanzado > Modo Desarrollador)
2. Haz clic derecho en el rol > "Copiar ID"

### IDs de Canales
1. Con el Modo Desarrollador activado
2. Haz clic derecho en el canal > "Copiar ID"

## 🎮 Uso

### Iniciar el bot:
```bash
npm start
```

### Modo desarrollo (con auto-reload):
```bash
npm run dev
```

## ⚙️ Comandos

- `/ping` - Muestra la latencia del bot
- `/createverify` - Crea el mensaje de verificación con el botón del Sombrero Seleccionador
- `/clear [cantidad] [usuario]` - Elimina mensajes (solo administradores)

## 🏰 Funcionalidades

- **Sistema de Verificación**: Los usuarios pueden hacer clic en un botón para ser asignados aleatoriamente a una casa de Hogwarts
- **Bienvenida Automática**: Mensaje de bienvenida cuando un nuevo miembro se une al servidor
- **Asignación de Roles**: Asignación automática de rol de miembro y rol de casa

## 📦 Tecnologías

- Node.js
- discord.js v14.15.3
- dotenv

## 📄 Licencia

MIT License