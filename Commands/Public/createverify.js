const {EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, CommandInteraction, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('createverify')
    .setDescription('Sombrero seleccionador')
    .setDefaultMemberPermissions(),
    async execute(interaction) {
        const channelId = process.env.VERIFY_CHANNEL_ID;
        
        if (!channelId) {
            return interaction.reply({
                content: 'El canal de verificación no está configurado. Por favor, contacta a un administrador.',
                ephemeral: true
            });
        }
        
        const channel = interaction.guild.channels.cache.get(channelId);
        
        if (!channel) {
            return interaction.reply({
                content: 'No se encontró el canal de verificación. Por favor, verifica la configuración.',
                ephemeral: true
            });
        }

        const testManager = require('../../Utils/testManager');
        const startEmbed = testManager.createStartEmbed();

        const verifyEmbed = new EmbedBuilder()
            .setTitle("🎩 El Sombrero Seleccionador te Espera")
            .setDescription(
                '**¡Bienvenido a Hogwarts!**\n\n' +
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
        
        try {
            await channel.send({
                embeds: [verifyEmbed],
                components: [
                    new ActionRowBuilder().setComponents(
                        new ButtonBuilder()
                            .setCustomId('verify')
                            .setLabel('🎩 Comenzar Test')
                            .setStyle(ButtonStyle.Success),
                    ),
                ],
            });
            
            return interaction.reply({
                content: '¡Canal de verificación configurado exitosamente!',
                ephemeral: true
            });
        } catch (error) {
            console.error('Error al enviar mensaje de verificación:', error);
            return interaction.reply({
                content: 'Hubo un error al configurar el canal de verificación. Intenta de nuevo más tarde.',
                ephemeral: true
            });
        }
    },
};