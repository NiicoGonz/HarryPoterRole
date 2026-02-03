# 🎩 Configuración del Sistema de Bienvenida

## 📋 Flujo del Sistema

1. **Usuario entra al servidor** → Solo ve el canal de bienvenida
2. **Bot envía mensaje de bienvenida** → Con reglas y explicación del test
3. **Usuario hace clic en "Aceptar"** → Se le da acceso al canal de verificación
4. **Bot envía mensaje del test** → Automáticamente al canal de verificación
5. **Usuario hace el test** → Se le asigna su casa

---

## ⚙️ Configuración de Permisos en Discord

### Paso 1: Configurar Canal de Bienvenida

1. Ve a: **Configuración del Servidor → Roles**
2. Busca el rol **@everyone**
3. Ve al canal de bienvenida
4. **Editar Canal → Permisos**
5. Para **@everyone**:
   - ✅ **Ver Canal** (activado)
   - ❌ **Enviar Mensajes** (desactivado - solo el bot puede escribir)
   - ❌ Todos los demás permisos (desactivados)

### Paso 2: Configurar Canal de Verificación

1. Ve al canal de verificación
2. **Editar Canal → Permisos**
3. Para **@everyone**:
   - ❌ **Ver Canal** (desactivado - solo usuarios que aceptaron pueden verlo)
   - ❌ Todos los demás permisos (desactivados)

4. Para el **Rol del Bot**:
   - ✅ **Ver Canal** (activado)
   - ✅ **Enviar Mensajes** (activado)
   - ✅ **Gestionar Permisos** (activado - para dar acceso a usuarios)

### Paso 3: Verificar Variables de Entorno

Asegúrate de tener estas variables en tu `.env`:

```env
# Canales
WELCOME_CHANNEL_ID=id_canal_bienvenida
VERIFY_CHANNEL_ID=id_canal_verificacion

# Roles
MEMBER_ROLE_ID=id_rol_miembro
Gryffindor=id_rol_gryffindor
Hufflepuff=id_rol_hufflepuff
Ravenclaw=id_rol_ravenclaw
Slytherin=id_rol_slytherin
```

---

## 🔄 Cómo Funciona

### Cuando un Usuario Entra:

1. **Evento `guildMemberAdd` se dispara**
2. **Bot envía mensaje de bienvenida** en el canal de bienvenida
3. **Mensaje incluye:**
   - Bienvenida personalizada
   - Reglas del servidor
   - Explicación del test
   - Botón "✅ Aceptar y Comenzar"

### Cuando el Usuario Acepta:

1. **Usuario hace clic en "Aceptar"**
2. **Bot le da acceso al canal de verificación** (permiso individual)
3. **Bot asigna rol de miembro** (si está configurado)
4. **Bot envía mensaje del test** automáticamente al canal de verificación
5. **Usuario puede hacer clic en "Comenzar Test"** para iniciar

---

## 📝 Personalización

### Modificar Reglas

Edita el archivo `Events/Guild/guildMemberAdd.js` en la sección de reglas:

```javascript
{
    name: '📜 Reglas del Servidor',
    value: 
        '• Tu regla 1\n' +
        '• Tu regla 2\n' +
        '• Tu regla 3',
    inline: false
}
```

### Modificar Mensaje de Bienvenida

Edita el embed en `Events/Guild/guildMemberAdd.js` para personalizar el mensaje.

---

## ⚠️ Importante

1. **El rol del bot debe estar arriba** de todos los roles que gestiona
2. **El bot debe tener permiso "Gestionar Permisos"** en el canal de verificación
3. **Los nuevos miembros NO deben tener acceso** al canal de verificación por defecto
4. **Solo después de aceptar** se les da acceso individual

---

## ✅ Checklist de Configuración

- [ ] Canal de bienvenida configurado (solo lectura para @everyone)
- [ ] Canal de verificación configurado (oculto para @everyone)
- [ ] Bot tiene permiso "Gestionar Permisos" en canal de verificación
- [ ] Variables de entorno configuradas correctamente
- [ ] Rol del bot está arriba de otros roles
- [ ] Bot tiene permiso "Gestionar Roles"

---

**¡Con esta configuración, el sistema de bienvenida funcionará perfectamente!** 🎩✨

