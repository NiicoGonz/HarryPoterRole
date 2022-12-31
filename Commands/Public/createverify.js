const {EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, CommandInteraction, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('createverify')
    .setDescription('Sombrero seleccionador')
    .setDefaultMemberPermissions(),
    async execute(interaction) {
        const channel = interaction.guild.channels.cache.get('1058512666408267878')
        const verifyEmbed = new EmbedBuilder()
        .setTitle("Verification")
        .setDescription('Click the button to verify your account and get access to the channels.')
        .setColor(0x5fb041)
        let sendChannel = channel.send({
            embeds: ([verifyEmbed]),
            components: [
                new ActionRowBuilder().setComponents(
                    new ButtonBuilder().setCustomId('verify').setLabel('Verify').setStyle(ButtonStyle.Success),
                ),
            ],
        });
        if (!sendChannel) {
            return interaction.reply({content: 'There was an error! Try again later.', ephemeral: true});
        } else {
            return interaction.reply({content: 'Verification channel was succesfully set!', ephemeral: true});
        }
    },
};