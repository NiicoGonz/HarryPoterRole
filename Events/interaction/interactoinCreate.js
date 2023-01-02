const { CommandInteraction } = require("discord.js");
require("dotenv").config();

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    let casa={
      'house':'',
      'img':'',
      'himno': '',
    };
    let rol;
    const msgCasas = {
      'Gryffindor': `Puedes pertenecer a Gryffindor, donde habitan los valientes. Su osadía, temple y caballerosidad ponen aparte a los de Gryffindor.`,
      'Hufflepuff': `Puedes pertenecer a Hufflepuff donde son justos y leales. Esos perseverantes Hufflepuff de verdad no temen el trabajo pesado.`,
      'Ravenclaw': `Tal vez a la antigua sabiduría de Ravenclaw, Si tienes una mente dispuesta, porque los de inteligencia y erudición siempre encontrarán allí a sus semejantes.`,
      'Slytherin': `Tal vez en Slytherin, harás tus verdaderos amigos. Esa gente astuta utiliza cualquier medio para lograr sus fines.`,
    };
    const imgCasas = {
      'Gryffindor':
        "https://static.wikia.nocookie.net/esharrypotter/images/a/a3/Gryffindor_Pottermore.png/revision/latest?cb=20140922195249",
      'Hufflepuff':
        "https://static.wikia.nocookie.net/esharrypotter/images/4/42/Hufflepuff_Pottermore.png/revision/latest?cb=20141001131135",
      'Ravenclaw':
        "https://static.wikia.nocookie.net/esharrypotter/images/7/76/Ravenclaw_Pottermore.png/revision/latest?cb=20141001130914",
      'Slytherin':
        "https://static.wikia.nocookie.net/esharrypotter/images/6/69/Slytherin_Pottermore.png/revision/latest?cb=20141001130915",
    };
    const himnosCasa = {
    'Gryffindor':`${process.env.HimmnoGryffindor}`,
    'Hufflepuff':`${process.env.HimmnoHufflepuff}`,
    'Ravenclaw': `${process.env.HimmnoRavenclaw}`,
    'Slytherin':`${process.env.HimnoSlytherin}`,
    }
    const { customId, values, guild, member } = interaction;
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({ content: "outdated command" });
      }
      command.execute(interaction, client);
    } else if (interaction.isButton()) {
      const roleIds = [
        process.env.Gryffindor,
        process.env.Hufflepuff,
        process.env.Ravenclaw,
        process.env.Slytherin,
      ];

      if (customId == "verify") {
        const num = Math.floor(Math.random() * (12 - 1 + 1)) + 1;
        if (num <= 3) {
          rol = process.env.Gryffindor;
          casa.house = msgCasas["Gryffindor"];
          casa.img= imgCasas['Gryffindor']
          casa.himno=himnosCasa['Gryffindor'];
        } else if (num >= 4 && num <= 6) {
          rol = process.env.Hufflepuff;
          casa.house = msgCasas["Hufflepuff"];
          casa.img = imgCasas['Hufflepuff']
          casa.himno=himnosCasa['Hufflepuff'];
        } else if (num >= 7 && num <= 9) {
          rol = process.env.Ravenclaw;
          casa.house = msgCasas["Ravenclaw"];
          casa.img = imgCasas['Ravenclaw']
          casa.himno=himnosCasa['Ravenclaw'];
        } else if (num >= 10 && num <= 12) {
          rol = process.env.Slytherin;
          casa.house = msgCasas["Slytherin"];
          casa.img =imgCasas['Slytherin']
          casa.himno=himnosCasa['Slytherin'];

        } else {
          null;
        }
        const role = interaction.guild.roles.cache.get(rol);
        if (roleIds.some((id) => member.roles.cache.has(id))) {
          return interaction.reply({
            content: `Ya perteneces a una casa de hogwarts`,
            ephemeral: true,
          });
        }
        return interaction.member.roles.add(role).then((member) => {
          const exampleEmbed = {
            color: 11027200,
            title: `${role.name}`,
            type: 'Rich',
            description: `${casa['house']}`,
            thumbnail: {
              url: `https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/350?cb=20150516174751`,
            },
            
            fields: [
              {
                name: "\u200b",
                value: "\u200b",
                inline: false,
              },
              {
                name: "Himnno",
                value: `${casa['himno']}`,
                inline: true,
              },
              {
                name: "\u200b",
                value: "\u200b",
                inline: false,
              },
            
            ],
            image: {
              url: `${casa['img']}`,
            },
            timestamp: new Date().toISOString(),
            footer: {
              text: "\u200b Draco dormiens nunquam titillandus",
            },
          };
          interaction.reply({
            content: `¡El Sombrero Seleccionador decide a qué iras a : `,
            ephemeral: true,
            embeds: [exampleEmbed],
          });
        });
      }
    } else {
      return;
    }
  },
};
