// Gestor del estado del test para cada usuario
const testQuestions = require('./testQuestions');
const { StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

// Almacena el estado del test por usuario: { userId: { currentQuestion: 0, scores: [0,0,0,0], answers: [] } }
const testStates = new Map();

module.exports = {
  // Función para mezclar array (Fisher-Yates shuffle)
  shuffleArray: (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Inicia el test para un usuario
  startTest: (userId) => {
    testStates.set(userId, {
      currentQuestion: 0,
      scores: [0, 0, 0, 0], // [Gryffindor, Hufflepuff, Ravenclaw, Slytherin]
      answers: [],
      shuffledOptions: [] // Almacena el orden aleatorio de opciones por pregunta
    });
    return testStates.get(userId);
  },

  // Obtiene el estado actual del test
  getTestState: (userId) => {
    return testStates.get(userId);
  },

  // Procesa una respuesta y avanza a la siguiente pregunta
  processAnswer: (userId, answerIndex) => {
    const state = testStates.get(userId);
    if (!state) return null;

    const currentQuestion = testQuestions.questions[state.currentQuestion];
    // Obtener la opción original usando el índice aleatorizado
    const shuffledOptions = state.shuffledOptions[state.currentQuestion];
    const originalIndex = shuffledOptions[answerIndex];
    const selectedOption = currentQuestion.options[originalIndex];

    // Sumar puntos a cada casa
    for (let i = 0; i < 4; i++) {
      state.scores[i] += selectedOption.points[i];
    }

    state.answers.push(originalIndex); // Guardar el índice original
    state.currentQuestion++;

    return state;
  },

  // Verifica si el test está completo
  isTestComplete: (userId) => {
    const state = testStates.get(userId);
    if (!state) return false;
    return state.currentQuestion >= testQuestions.questions.length;
  },

  // Obtiene la pregunta actual
  getCurrentQuestion: (userId) => {
    const state = testStates.get(userId);
    if (!state) return null;
    return testQuestions.questions[state.currentQuestion];
  },

  // Obtiene los scores finales
  getFinalScores: (userId) => {
    const state = testStates.get(userId);
    if (!state) return null;
    return state.scores;
  },

  // Limpia el estado del test
  clearTest: (userId) => {
    testStates.delete(userId);
  },

  // Crea el embed y select menu para la pregunta actual
  createQuestionEmbed: (userId) => {
    const state = testStates.get(userId);
    if (!state) return null;

    const question = testQuestions.questions[state.currentQuestion];
    const questionNumber = state.currentQuestion + 1;
    const totalQuestions = testQuestions.questions.length;

    // Crear array de índices y mezclarlos
    const originalIndices = question.options.map((_, index) => index);
    // Función shuffle local (Fisher-Yates)
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    const shuffledIndices = shuffleArray(originalIndices);
    
    // Guardar el orden aleatorizado para esta pregunta
    if (!state.shuffledOptions) state.shuffledOptions = [];
    state.shuffledOptions[state.currentQuestion] = shuffledIndices;

    // Crear opciones en orden aleatorio
    const shuffledOptions = shuffledIndices.map(originalIndex => question.options[originalIndex]);

    // Calcular progreso visual
    const progressBar = '█'.repeat(Math.floor((questionNumber / totalQuestions) * 10)) + 
                       '░'.repeat(10 - Math.floor((questionNumber / totalQuestions) * 10));
    const percentage = Math.floor((questionNumber / totalQuestions) * 100);

    const embed = new EmbedBuilder()
      .setTitle(`🎩 El Sombrero Seleccionador te Observa...`)
      .setDescription(
        `**${question.question}**\n\n` +
        `📊 **Progreso:** \`${progressBar}\` **${percentage}%**\n` +
        `📝 Pregunta **${questionNumber}** de **${totalQuestions}**`
      )
      .setColor(0x740001)
      .setThumbnail('https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/350?cb=20150516174751')
      .setFooter({ 
        text: 'El sombrero analiza cada respuesta cuidadosamente...',
        iconURL: 'https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/350?cb=20150516174751'
      })
      .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`test_answer_${userId}`)
      .setPlaceholder('🎯 Selecciona tu respuesta...')
      .addOptions(
        shuffledOptions.map((option, shuffledIndex) => ({
          label: option.label.length > 100 ? option.label.substring(0, 97) + '...' : option.label,
          value: shuffledIndex.toString(), // Usar índice aleatorizado
          description: shuffledIndex < 3 ? 'Haz clic para seleccionar' : undefined
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    return { embed, components: [row] };
  },

  // Crea el embed de inicio del test
  createStartEmbed: () => {
    return new EmbedBuilder()
      .setTitle('🎩 El Sombrero Seleccionador')
      .setDescription(
        '**¡Bienvenido a Hogwarts!**\n\n' +
        'El Sombrero Seleccionador está listo para conocerte.\n\n' +
        '📚 **Sobre el Test:**\n' +
        '• Responderás **10 preguntas** cuidadosamente seleccionadas\n' +
        '• Cada respuesta revela algo sobre tu verdadera naturaleza\n' +
        '• El sombrero analizará tus respuestas y te asignará a tu casa\n\n' +
        '✨ **Recuerda:**\n' +
        '• Responde **honestamente** - no hay respuestas correctas o incorrectas\n' +
        '• El sombrero conoce tu corazón mejor que tú mismo\n' +
        '• Tu casa te espera...\n\n' +
        '🎯 **¡Haz clic en el botón de abajo para comenzar!**'
      )
      .setColor(0x740001)
      .setThumbnail('https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/350?cb=20150516174751')
      .setImage('https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/500?cb=20150516174751')
      .setFooter({ 
        text: 'Draco dormiens nunquam titillandus',
        iconURL: 'https://static.wikia.nocookie.net/esharrypotter/images/a/ae/Hogwartscrest.png/revision/latest/scale-to-width-down/350?cb=20150516174751'
      })
      .setTimestamp();
  }
};

