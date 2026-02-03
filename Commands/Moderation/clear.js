const {SlashCommandBuilder, CommandInteraction, PermissionFlagsBits, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Elimina una cantidad de mensajes no mayor a 14 días.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('La cantidad debe ser menor a 100.')
        .setRequired(true)
        )
    .addUserOption(option =>
        option.setName('target')
        .setDescription('.')
        .setRequired(false)
        ),

    async execute(interaction) {
        const {channel, options} = interaction;

        const amount = options.getInteger('amount');
        const target = options.getUser("target");

        const messages = await channel.messages.fetch({
            limit: amount +1,
        });

        const res = new EmbedBuilder()
            .setColor(2123412)

        if(target) {
            let i = 0;
            const filtered = [];

            messages.filter((msg) => {
                if(msg.author.id === target.id && amount > i) {
                    filtered.push(msg);
                    i++;
                }
            });

            if (filtered.length === 0) {
                return interaction.reply({ 
                    content: 'No se encontraron mensajes para eliminar.', 
                    ephemeral: true 
                });
            }

            await channel.bulkDelete(filtered, true).then(deletedMessages => {
                res.setDescription(`Se eliminaron exitosamente ${deletedMessages.size} mensajes de ${target}.`);
                interaction.reply({embeds: [res], ephemeral: true});
            }).catch(error => {
                console.error('Error al eliminar mensajes:', error);
                interaction.reply({ 
                    content: 'Hubo un error al eliminar los mensajes. Asegúrate de que los mensajes no tengan más de 14 días.', 
                    ephemeral: true 
                });
            });
        } else {
            if (amount < 1 || amount > 100) {
                return interaction.reply({ 
                    content: 'La cantidad debe estar entre 1 y 100.', 
                    ephemeral: true 
                });
            }

            await channel.bulkDelete(amount, true).then(deletedMessages => {
                res.setDescription(`Se eliminaron exitosamente ${deletedMessages.size} mensajes del canal.`);
                interaction.reply({embeds: [res], ephemeral: true});
            }).catch(error => {
                console.error('Error al eliminar mensajes:', error);
                interaction.reply({ 
                    content: 'Hubo un error al eliminar los mensajes. Asegúrate de que los mensajes no tengan más de 14 días.', 
                    ephemeral: true 
                });
            });
        }
    }
}