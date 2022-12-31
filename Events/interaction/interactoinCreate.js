const { CommandInteraction } = require("discord.js");

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    const { customId, values, guild, member } = interaction;
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({ content: "outdated command" });
      }
      command.execute(interaction, client);
    } else if (interaction.isButton()) {
      console.log(customId);
      if (customId == "verify") {
        const role = interaction.guild.roles.cache.get("986784813400870912");
        return interaction.member.roles.add(role).then((member) =>
          interaction.reply({
            content: `${role} has been assigned to you.`,
            ephemeral: true,
          })
        );
      }
    } else {
      return;
    }
  },
};
