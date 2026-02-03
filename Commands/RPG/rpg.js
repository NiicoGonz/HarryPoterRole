const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rpg')
        .setDescription('Muestra información y comandos del sistema RPG'),
    
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setTitle('🧙 Sistema RPG de Hogwarts')
            .setDescription('Bienvenido al mundo mágico de Harry Potter RPG.\nAquí podrás crear tu personaje, aprender hechizos, luchar contra criaturas mágicas y mucho más.')
            .setColor('#740001')
            .setThumbnail('https://static.wikia.nocookie.net/harrypotter/images/a/ae/Hogwartscrest.png')
            .addFields(
                {
                    name: '📋 Comandos Básicos',
                    value: [
                        '`/crear-personaje` - Crea tu mago',
                        '`/perfil` - Ve tu perfil o el de otro',
                        '`/stats` - Asigna puntos de atributo',
                        '`/inventario` - Ve tus objetos',
                        '`/spells` - Ve tus hechizos aprendidos',
                        '`/descansar` - Recupera HP y MP'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🏆 Competencia',
                    value: [
                        '`/ranking` - Ranking global',
                        '`/ranking [casa]` - Ranking por casa'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '⚔️ Atributos',
                    value: [
                        '💪 **Fuerza** - Daño físico',
                        '🧠 **Inteligencia** - Poder mágico',
                        '🏃 **Destreza** - Velocidad y esquiva',
                        '🛡️ **Constitución** - Defensa física',
                        '📚 **Sabiduría** - Defensa mágica',
                        '🍀 **Suerte** - Críticos y drops'
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '✨ Bonus por Casa',
                    value: [
                        '🦁 **Gryffindor** - +Fuerza, +Const.',
                        '🦡 **Hufflepuff** - +Const., +Sabiduría',
                        '🦅 **Ravenclaw** - +Inteligencia',
                        '🐍 **Slytherin** - Stats equilibrados'
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📈 Progresión',
                    value: 'Ganas **experiencia** derrotando enemigos y completando misiones.\nAl subir de **nivel** obtienes:\n• +10 HP máximo\n• +8 MP máximo\n• +3 puntos de atributo',
                    inline: false
                },
                {
                    name: '💰 Economía',
                    value: 'La moneda del mundo mágico son los **Galeones**.\nPuedes ganarlos derrotando enemigos, vendiendo objetos o completando misiones.',
                    inline: false
                },
                {
                    name: '🔮 Próximamente',
                    value: [
                        '• Sistema de combate por turnos',
                        '• Criaturas mágicas y jefes',
                        '• Misiones y aventuras',
                        '• Tienda de Ollivander',
                        '• Duelos entre magos',
                        '• Eventos especiales'
                    ].join('\n'),
                    inline: false
                }
            )
            .setFooter({ text: '¡Comienza tu aventura con /crear-personaje!' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [helpEmbed] });
    }
};
