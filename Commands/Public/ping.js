const {SlashCommandBuilder, CommandInteraction, PermissionFlagsBits, EmbedBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pong")
    .setDefaultMemberPermissions(), // only allowed for admin users
  async  execute(interaction, client) {

        const message = await interaction.deferReply({
            fetchReply: true
        });

        const exampleEmbed = new EmbedBuilder()
        .setColor(10038562)
        .setAuthor({ name: `Lechuza de: ${interaction.member.user.username}` , iconURL: 'https://img.freepik.com/premium-vector/collection-vector-magic-fairy-tale-elements-icons-illustrations-book-glasses_71599-7229.jpg?w=2000' })
        .setDescription(`
        🏓 Pong!
        📨 Latencia usuario: ${client.ws.ping}ms
        🍡 Api latencia: ${message.createdTimestamp- interaction.createdTimestamp}ms`)
        .setTimestamp()

        await interaction.editReply({ content: ' ', ephemeral: true, embeds: [exampleEmbed ]}   )
    },
};