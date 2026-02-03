# 🗄️ Guía de Configuración de MongoDB

Esta guía te ayudará a configurar MongoDB para el sistema RPG del bot de Harry Potter.

## 📋 Opciones de Base de Datos

Tienes dos opciones para usar MongoDB:

### Opción 1: MongoDB Atlas (Recomendado - Gratis)

MongoDB Atlas es un servicio en la nube que ofrece un tier gratuito (M0 Sandbox) perfecto para este proyecto.

#### Pasos:

1. **Crear cuenta en MongoDB Atlas**
   - Ve a: https://www.mongodb.com/cloud/atlas/register
   - Regístrate con tu email o cuenta de Google

2. **Crear un Cluster gratuito**
   - Haz clic en "Build a Database"
   - Selecciona **FREE** (M0 Sandbox)
   - Elige el proveedor y región más cercana a ti
   - Nombre del cluster: `HogwartsRPG` (o el que prefieras)
   - Haz clic en "Create"

3. **Configurar acceso**
   - **Usuario de base de datos:**
     - Ve a "Database Access" en el menú lateral
     - Haz clic en "Add New Database User"
     - Método: Password
     - Username: `hogwarts_bot`
     - Password: LEjcREOn94aF4IGg
     - Role: "Read and write to any database"
     - Haz clic en "Add User"
   
   - **Acceso de red:**
     - Ve a "Network Access" en el menú lateral
     - Haz clic en "Add IP Address"
     - Selecciona "Allow Access from Anywhere" (0.0.0.0/0)
     - O añade tu IP específica si prefieres más seguridad
     - Haz clic en "Confirm"

4. **Obtener la cadena de conexión**
   - Ve a "Database" → "Connect" en tu cluster
   - Selecciona "Connect your application"
   - Driver: Node.js, Version: 4.1 or later
   - Copia la cadena de conexión
   
   Ejemplo:
   ```
   mongodb+srv://<hogwarts_bot>:<LEjcREOn94aF4IGg>@discordbotdb.wmr5mx1.mongodb.net/?appName=DiscordBotDB
   mongodb+srv://hogwarts_bot:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Configurar en tu proyecto**
   - Abre tu archivo `.env`
   - Añade la variable con tu password reemplazado:
   ```env
   MONGODB_URI=   mongodb+srv://hogwarts_bot:LEjcREOn94aF4IGg@discordbotdb.wmr5mx1.mongodb.net/?appName=DiscordBotDBq
   ```
   
   **Importante:** Añade `/hogwarts_rpg` antes de los parámetros para especificar el nombre de la base de datos.

---

### Opción 2: MongoDB Local

Si prefieres tener la base de datos en tu computadora.

#### Windows:

1. **Descargar MongoDB Community Server**
   - Ve a: https://www.mongodb.com/try/download/community
   - Descarga la versión MSI

2. **Instalar**
   - Ejecuta el instalador
   - Selecciona "Complete"
   - Marca "Install MongoDB as a Service"
   - Marca "Install MongoDB Compass" (opcional, interfaz gráfica)

3. **Verificar instalación**
   ```bash
   # Abre PowerShell o CMD
   mongod --version
   ```

4. **Configurar en tu proyecto**
   ```env
   MONGODB_URI=mongodb://localhost:27017/hogwarts_rpg
   ```

#### macOS (con Homebrew):

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

```env
MONGODB_URI=mongodb://localhost:27017/hogwarts_rpg
```

#### Linux (Ubuntu/Debian):

```bash
sudo apt-get install gnupg curl
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

```env
MONGODB_URI=mongodb://localhost:27017/hogwarts_rpg
```

---

## ✅ Verificar Conexión

Una vez configurado, inicia el bot:

```bash
npm start
```

Deberías ver:
```
🧙 Iniciando Bot de Harry Potter RPG...

✅ Conectado a MongoDB correctamente
✅ Bot conectado como [nombre del bot]
```

---

## 🔧 Solución de Problemas

### Error: "MONGODB_URI no está definido"
- Verifica que existe la variable `MONGODB_URI` en tu archivo `.env`
- Asegúrate de que `dotenv` está instalado: `npm install dotenv`

### Error: "ECONNREFUSED"
- **Local:** MongoDB no está corriendo. Inicia el servicio:
  - Windows: `net start MongoDB`
  - macOS: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`

- **Atlas:** Verifica tu conexión a internet y la cadena de conexión

### Error: "Authentication failed"
- Verifica que el usuario y contraseña en la URI son correctos
- En Atlas, asegúrate de que el usuario tiene permisos de lectura/escritura

### Error: "IP not whitelisted"
- En Atlas, ve a Network Access y añade tu IP
- O selecciona "Allow access from anywhere" para desarrollo

---

## 📊 Ver los Datos

### MongoDB Compass (Interfaz Gráfica)
1. Descarga: https://www.mongodb.com/try/download/compass
2. Conecta usando tu `MONGODB_URI`
3. Navega a la base de datos `hogwarts_rpg`

### Colecciones que verás:
- `characters` - Personajes de los usuarios
- `items` - Items del juego (cuando se añadan)

---

## 🔒 Seguridad

**Nunca compartas tu archivo `.env` ni tu cadena de conexión.**

El archivo `.env` debe estar en tu `.gitignore`:
```
.env
```

---

## 📝 Variables de Entorno Necesarias

Añade esto a tu `.env`:

```env
# Discord
TOKEN=tu_token_de_discord

# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/hogwarts_rpg

# Roles de casas
GRYFFINDOR_ROLE_ID=tu_id
HUFFLEPUFF_ROLE_ID=tu_id
RAVENCLAW_ROLE_ID=tu_id
SLYTHERIN_ROLE_ID=tu_id

# Otros roles
MEMBER_ROLE_ID=tu_id

# Canales
WELCOME_CHANNEL_ID=tu_id
VERIFY_CHANNEL_ID=tu_id
```

---

¡Listo! Con esto configurado, tu sistema RPG estará preparado para funcionar.
