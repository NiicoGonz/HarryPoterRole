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

            (await messages).filter((msg) =>{
                if(msg.author.id === target.id && amount > i) {
                    filtered.push(msg);
                    i++;
                }
            });

            await channel.bulkDelete(filtered).then(messages => {
                res.setDescription(`Succesfully deleted ${messages.size} messages from ${target}.`);
                interaction.reply({embeds: [res]}); // you can use ephemeral if you desire
            });
        } else {
            await channel.bulkDelete(amount, true).then(messages => {
                res.setDescription(`Succesfully deleted ${messages.size} messages from the channel.`);
                interaction.reply({embeds: [res]});
            });
        }
    }
}