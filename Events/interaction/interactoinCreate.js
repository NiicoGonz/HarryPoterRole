const { CommandInteraction, EmbedBuilder, StringSelectMenuInteraction, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require("discord.js");
require("dotenv").config();
const testManager = require('../../Utils/testManager');
const testQuestions = require('../../Utils/testQuestions');
const logger = require('../../Utils/logger');
const rateLimiter = require('../../Utils/rateLimiter');

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    const { customId, values, guild, member } = interaction;

    // Manejo de comandos slash
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        logger.warn('Comando no encontrado', {
          commandName: interaction.commandName,
          userId: interaction.user.id
        });
        return interaction.reply({ content: "Comando no encontrado" });
      }

      // Rate limiting
      const rateLimit = rateLimiter.checkLimit(interaction.user.id, interaction.commandName);
      if (!rateLimit.allowed) {
        logger.security('RateLimitBlocked', interaction.user.id, `Comando: ${interaction.commandName}`, {
          retryAfter: rateLimit.retryAfter
        });

        return interaction.reply({
          content: `⏱️ **Demasiado rápido!**\n\nEstás ejecutando comandos muy rápido. Espera **${rateLimit.retryAfter} segundos** antes de volver a intentarlo.\n\n*Esto es para prevenir spam y mantener el servidor funcionando correctamente.*`,
          ephemeral: true
        });
      }

      // Log del comando ejecutado
      logger.command(
        interaction.commandName,
        interaction.user.id,
        interaction.guildId,
        {
          username: interaction.user.tag,
          channelId: interaction.channelId
        }
      );

      // Ejecutar comando con manejo de errores
      try {
        await command.execute(interaction, client);
      } catch (error) {
        logger.error(`Error ejecutando comando ${interaction.commandName}`, {
          error: error.message,
          stack: error.stack,
          userId: interaction.user.id,
          guildId: interaction.guildId
        });

        const errorMessage = {
          content: '❌ Hubo un error al ejecutar este comando. El equipo ha sido notificado.',
          ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      }

      return;
    }

    // Manejo del botón de aceptación de bienvenida
    if (interaction.isButton() && customId.startsWith('accept_welcome_')) {
      const memberId = customId.split('_')[2];

      // Verificar que el usuario que hace clic es el mismo que recibió el mensaje
      if (interaction.user.id !== memberId) {
        return interaction.reply({
          content: 'Este mensaje no es para ti. Espera tu mensaje de bienvenida.',
          ephemeral: true,
        });
      }

      const verifyChannelId = process.env.VERIFY_CHANNEL_ID;
      const memberRoleId = process.env.MEMBER_ROLE_ID;

      if (!verifyChannelId) {
        return interaction.reply({
          content: 'Error: El canal de verificación no está configurado. Contacta a un administrador.',
          ephemeral: true,
        });
      }

      const verifyChannel = interaction.guild.channels.cache.get(verifyChannelId);
      if (!verifyChannel) {
        return interaction.reply({
          content: 'Error: No se encontró el canal de verificación. Contacta a un administrador.',
          ephemeral: true,
        });
      }

      try {
        // Dar acceso al canal de verificación
        await verifyChannel.permissionOverwrites.edit(interaction.user.id, {
          ViewChannel: true,
          SendMessages: false, // Solo puede ver, no escribir
        });

        // Asignar rol de miembro si está configurado
        if (memberRoleId) {
          try {
            await interaction.member.roles.add(memberRoleId);
          } catch (error) {
            console.warn('No se pudo asignar el rol de miembro:', error.message);
          }
        }

        // Enviar mensaje de confirmación
        await interaction.reply({
          content: '✅ **¡Bienvenido a Hogwarts!**\n\nSe te ha dado acceso al canal de verificación. Revisa tus mensajes directos para comenzar el test del Sombrero Seleccionador.',
          ephemeral: true,
        });

        // Enviar mensaje del test por DM (mensaje directo privado)
        try {
          const testManager = require('../../Utils/testManager');
          const verifyEmbed = new EmbedBuilder()
            .setTitle("🎩 El Sombrero Seleccionador te Espera")
            .setDescription(
              `¡Hola <@${interaction.user.id}>!\n\n` +
              'El Sombrero Seleccionador está listo para conocerte y asignarte a tu casa.\n\n' +
              '✨ **Haz clic en el botón de abajo** para comenzar el test y descubrir si perteneces a:\n' +
              '🦁 **Gryffindor** - La valentía\n' +
              '🦡 **Hufflepuff** - La lealtad\n' +
              '🦅 **Ravenclaw** - La sabiduría\n' +
              '🐍 **Slytherin** - La astucia\n\n' +
              '🎯 *Tu destino te espera...*'
            )
            .setColor(0x740001)
            .setThumbnail('https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/350?cb=20150516174751')
            .setImage('https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/500?cb=20150516174751')
            .setFooter({
              text: 'Draco dormiens nunquam titillandus',
              iconURL: 'https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/350?cb=20150516174751'
            })
            .setTimestamp();

          const verifyButton = new ButtonBuilder()
            .setCustomId('verify')
            .setLabel('🎩 Comenzar Test')
            .setStyle(ButtonStyle.Success);

          const buttonRow = new ActionRowBuilder().addComponents(verifyButton);

          // Intentar enviar por DM
          const dmChannel = await interaction.user.createDM();
          await dmChannel.send({
            embeds: [verifyEmbed],
            components: [buttonRow]
          });
        } catch (dmError) {
          // Si no se puede enviar por DM (usuario tiene DMs deshabilitados), enviar al canal de verificación
          console.warn('No se pudo enviar DM, enviando al canal de verificación:', dmError.message);

          const testManager = require('../../Utils/testManager');
          const verifyEmbed = new EmbedBuilder()
            .setTitle("🎩 El Sombrero Seleccionador te Espera")
            .setDescription(
              `¡Hola <@${interaction.user.id}>!\n\n` +
              'El Sombrero Seleccionador está listo para conocerte y asignarte a tu casa.\n\n' +
              '✨ **Haz clic en el botón de abajo** para comenzar el test y descubrir si perteneces a:\n' +
              '🦁 **Gryffindor** - La valentía\n' +
              '🦡 **Hufflepuff** - La lealtad\n' +
              '🦅 **Ravenclaw** - La sabiduría\n' +
              '🐍 **Slytherin** - La astucia\n\n' +
              '🎯 *Tu destino te espera...*'
            )
            .setColor(0x740001)
            .setThumbnail('https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/350?cb=20150516174751')
            .setImage('https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/500?cb=20150516174751')
            .setFooter({
              text: 'Draco dormiens nunquam titillandus',
              iconURL: 'https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/350?cb=20150516174751'
            })
            .setTimestamp();

          const verifyButton = new ButtonBuilder()
            .setCustomId('verify')
            .setLabel('🎩 Comenzar Test')
            .setStyle(ButtonStyle.Success);

          const buttonRow = new ActionRowBuilder().addComponents(verifyButton);

          await verifyChannel.send({
            content: `<@${interaction.user.id}>`,
            embeds: [verifyEmbed],
            components: [buttonRow]
          });
        }

      } catch (error) {
        console.error('Error al procesar aceptación de bienvenida:', error);
        await interaction.reply({
          content: 'Hubo un error al procesar tu aceptación. Por favor, contacta a un administrador.',
          ephemeral: true,
        });
      }
      return;
    }

    // Manejo del botón de verificación (inicia el test)
    if (interaction.isButton() && customId === "verify") {
      const roleIds = [
        process.env.Gryffindor,
        process.env.Hufflepuff,
        process.env.Ravenclaw,
        process.env.Slytherin,
      ];

      // Verificar si ya tiene un rol de casa
      if (roleIds.some((id) => id && member.roles.cache.has(id))) {
        return interaction.reply({
          content: `Ya perteneces a una casa de Hogwarts.`,
          ephemeral: true,
        });
      }

      // Iniciar el test
      const userId = interaction.user.id;
      testManager.startTest(userId);
      const questionData = testManager.createQuestionEmbed(userId);

      if (!questionData) {
        return interaction.reply({
          content: 'Hubo un error al iniciar el test. Intenta de nuevo.',
          ephemeral: true,
        });
      }

      await interaction.reply({
        embeds: [questionData.embed],
        components: questionData.components,
        ephemeral: true,
      });
      return;
    }

    // Manejo de select menus (respuestas del test)
    if (interaction.isStringSelectMenu() && customId.startsWith('test_answer_')) {
      const userId = interaction.user.id;
      const state = testManager.getTestState(userId);

      if (!state) {
        return interaction.reply({
          content: 'No tienes un test activo. Usa el botón de verificación para comenzar.',
          ephemeral: true,
        });
      }

      // Procesar la respuesta
      const answerIndex = parseInt(interaction.values[0]);
      testManager.processAnswer(userId, answerIndex);

      // Verificar si el test está completo
      if (testManager.isTestComplete(userId)) {
        // Calcular la casa ganadora
        const finalScores = testManager.getFinalScores(userId);
        const winningHouse = testQuestions.calculateHouse(finalScores);
        const houseInfo = testQuestions.getHouseInfo(winningHouse);
        const roleId = process.env[winningHouse];

        if (!roleId) {
          testManager.clearTest(userId);
          return interaction.reply({
            content: `Error: El rol de ${winningHouse} no está configurado. Contacta a un administrador.`,
            ephemeral: true,
          });
        }

        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) {
          testManager.clearTest(userId);
          return interaction.reply({
            content: `Error: No se encontró el rol de ${winningHouse}. Contacta a un administrador.`,
            ephemeral: true,
          });
        }

        // Quitar todos los roles de casas antes de asignar el nuevo
        const allHouseRoleIds = [
          process.env.Gryffindor,
          process.env.Hufflepuff,
          process.env.Ravenclaw,
          process.env.Slytherin
        ].filter(id => id); // Filtrar IDs vacíos

        // Remover roles de casas existentes
        for (const houseRoleId of allHouseRoleIds) {
          if (interaction.member.roles.cache.has(houseRoleId)) {
            try {
              await interaction.member.roles.remove(houseRoleId);
            } catch (error) {
              console.warn(`No se pudo remover el rol ${houseRoleId}:`, error.message);
            }
          }
        }

        // Asignar el rol de la casa ganadora
        try {
          await interaction.member.roles.add(role);

          // Obtener emoji de la casa
          const houseEmojis = {
            'Gryffindor': '🦁',
            'Hufflepuff': '🦡',
            'Ravenclaw': '🦅',
            'Slytherin': '🐍'
          };

          const houseEmoji = houseEmojis[winningHouse] || '🏰';
          const himno = process.env[`Himmno${winningHouse}`] || process.env[`Himno${winningHouse}`] || 'No configurado';

          // Crear embed de resultado mejorado
          const resultEmbed = new EmbedBuilder()
            .setColor(houseInfo.color)
            .setTitle(`${houseEmoji} ¡Bienvenido a ${winningHouse}!`)
            .setDescription(
              `**El Sombrero Seleccionador ha hablado...**\n\n` +
              `*${houseInfo.message}*\n\n` +
              `🎉 **¡Felicidades!** Has sido seleccionado para ${winningHouse}.\n` +
              `Tu aventura en Hogwarts comienza ahora.`
            )
            .setThumbnail('https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/350?cb=20150516174751')
            .addFields(
              {
                name: '🎵 Himno de la Casa',
                value: `*${himno}*`,
                inline: false,
              },
              {
                name: '🏆 Tu Casa',
                value: `${houseEmoji} **${winningHouse}**`,
                inline: true,
              },
              {
                name: '🎓 Hogwarts',
                value: '✨ Bienvenido a la magia',
                inline: true,
              }
            )
            .setImage(houseInfo.image)
            .setTimestamp()
            .setFooter({
              text: 'Draco dormiens nunquam titillandus',
              iconURL: 'https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/350?cb=20150516174751'
            });

          await interaction.update({
            content: `🎩 **¡El Sombrero Seleccionador ha decidido!**`,
            embeds: [resultEmbed],
            components: [],
          });

          // Limpiar el estado del test
          testManager.clearTest(userId);
        } catch (error) {
          console.error('Error al asignar rol:', error);
          testManager.clearTest(userId);

          let errorMessage = 'Hubo un error al asignar el rol. Por favor, contacta a un administrador.';

          if (error.code === 50013) {
            errorMessage = `❌ **Error de Permisos**\n\nEl bot no tiene permisos para asignar el rol de ${winningHouse}.\n\n**Solución:**\n1. Ve a Configuración del Servidor → Roles\n2. Arrastra el rol del bot **ARRIBA** del rol de ${winningHouse}\n3. Verifica que el bot tenga permiso "Gestionar Roles"`;
            console.error('❌ Error 50013: El bot no tiene permisos para asignar el rol');
            console.error(`📝 Rol objetivo: ${winningHouse} (ID: ${roleId})`);
            console.error('💡 Solución: Mover el rol del bot arriba del rol objetivo en Configuración → Roles');
          }

          await interaction.update({
            content: errorMessage,
            components: [],
          });
        }
      } else {
        // Mostrar siguiente pregunta
        const questionData = testManager.createQuestionEmbed(userId);
        if (questionData) {
          await interaction.update({
            embeds: [questionData.embed],
            components: questionData.components,
          });
        } else {
          await interaction.update({
            content: 'Hubo un error al cargar la siguiente pregunta.',
            components: [],
          });
        }
      }
      return;
    }
  },
};
