const {EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder} = require("discord.js");

module.exports = {
    name: "guildMemberAdd",
    async execute(member) {
        const {user, guild} = member;
        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        
        if (!welcomeChannelId) {
            console.warn('Variable de entorno WELCOME_CHANNEL_ID no configurada.');
            return;
        }
        
        const welcomeChannel = guild.channels.cache.get(welcomeChannelId);
        
        if (!welcomeChannel) {
            console.error('No se encontró el canal de bienvenida.');
            return;
        }

        // Crear embed de bienvenida con reglas y explicación
        const welcomeEmbed = new EmbedBuilder()
            .setTitle("🎩 ¡Bienvenido a Hogwarts!")
            .setDescription(
                `¡Hola <@${member.id}>!\n\n` +
                `**Bienvenido a la Escuela de Magia y Hechicería de Hogwarts.**\n\n` +
                `El Sombrero Seleccionador te está esperando para descubrir a qué casa perteneces.`
            )
            .setColor(0x740001)
            .addFields(
                {
                    name: '📜 Reglas del Servidor',
                    value: 
                        '• Sé respetuoso con todos los miembros\n' +
                        '• No compartas contenido inapropiado\n' +
                        '• Respeta las decisiones de los moderadores\n' +
                        '• Disfruta de la magia y diviértete',
                    inline: false
                },
                {
                    name: '🎓 Sobre el Test del Sombrero Seleccionador',
                    value: 
                        'Al aceptar, se te habilitará el acceso al canal de verificación donde podrás realizar el test.\n\n' +
                        'El test consiste en **10 preguntas** que revelarán tu verdadera naturaleza y te asignarán a una de las cuatro casas:\n\n' +
                        '🦁 **Gryffindor** - La valentía y el coraje\n' +
                        '🦡 **Hufflepuff** - La lealtad y la justicia\n' +
                        '🦅 **Ravenclaw** - La sabiduría y la inteligencia\n' +
                        '🐍 **Slytherin** - La astucia y la ambición',
                    inline: false
                },
                {
                    name: '✨ ¿Listo para comenzar?',
                    value: 'Haz clic en el botón de abajo para aceptar las reglas y comenzar tu aventura en Hogwarts.',
                    inline: false
                }
            )
            .setThumbnail('https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/350?cb=20150516174751')
            .setImage('https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/500?cb=20150516174751')
            .setFooter({ 
                text: `Total de miembros: ${guild.memberCount} | Draco dormiens nunquam titillandus`,
                iconURL: 'https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/350?cb=20150516174751'
            })
            .setTimestamp();

        // Crear botón de aceptación
        const acceptButton = new ButtonBuilder()
            .setCustomId(`accept_welcome_${member.id}`)
            .setLabel('✅ Aceptar y Comenzar')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🎩');

        const row = new ActionRowBuilder().addComponents(acceptButton);

        try {
            // Verificar permisos antes de enviar
            const botMember = await guild.members.fetch(guild.client.user.id);
            const permissions = welcomeChannel.permissionsFor(botMember);
            
            if (!permissions.has('SendMessages')) {
                console.error('❌ Error: El bot no tiene permiso "Enviar Mensajes" en el canal de bienvenida');
                console.error('📝 Solución:');
                console.error('1. Ve al canal de bienvenida');
                console.error('2. Editar Canal → Permisos');
                console.error('3. Busca el rol del bot');
                console.error('4. Activa "Enviar Mensajes"');
                console.error(`5. ID del canal: ${welcomeChannelId}`);
                return;
            }

            if (!permissions.has('EmbedLinks')) {
                console.error('❌ Error: El bot no tiene permiso "Incrustar Enlaces" en el canal de bienvenida');
                console.error('📝 Solución: Activa "Incrustar Enlaces" en los permisos del canal');
                return;
            }

            await welcomeChannel.send({
                content: `<@${member.id}>`,
                embeds: [welcomeEmbed],
                components: [row]
            });
        } catch (error) {
            if (error.code === 50013) {
                console.error('❌ Error 50013: El bot no tiene permisos en el canal de bienvenida');
                console.error('📝 Solución:');
                console.error('1. Ve al canal de bienvenida (ID: ' + welcomeChannelId + ')');
                console.error('2. Editar Canal → Permisos');
                console.error('3. Busca el rol del bot');
                console.error('4. Activa estos permisos:');
                console.error('   ✅ Enviar Mensajes');
                console.error('   ✅ Incrustar Enlaces');
                console.error('   ✅ Usar Componentes Externos (para botones)');
            } else {
                console.error('Error al enviar mensaje de bienvenida:', error.message || error);
            }
        }
    }
}