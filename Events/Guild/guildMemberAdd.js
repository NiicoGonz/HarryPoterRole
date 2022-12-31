const {EmbedBuilder} = require("@discordjs/builders");
const {GuildMember, Embed} = require("discord.js");

module.exports = {
    name: "guildMemberAdd",
    execute(member) {
        const {user, guild} = member;
        const welcomeChannel = member.guild.channels.cache.get('986775411000221747');
        const welcomeMessage = `Welcome <@${member.id}> to the guild!`;
        const memberRole = '1058502944091287713';

        const welcomeEmbed = new EmbedBuilder()
        .setTitle("**New member!**")
        .setDescription(welcomeMessage)
        .setColor(0x037821)
        .addFields({name:'Total members', value: `${guild.memberCount}`})
        .setTimestamp();

        welcomeChannel.send({embeds: [welcomeEmbed]});
        member.roles.add(memberRole);
    }
}