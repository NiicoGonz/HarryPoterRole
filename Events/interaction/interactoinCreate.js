const {CommandInteraction, InteractionCollector} = require('discord.js');

module.exports= {
    name: 'interactionCreate',
    execute(interaction, client) {
        if(interaction.isChatInputCommand()){
            const command = client.commands.get(interaction.commandName);
            if(!command){
                return interaction.reply({content: 'outdated commmand'});
            }
            command.execute(interaction, client);
        }
    },
};