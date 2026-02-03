// Sistema de preguntas del Sombrero Seleccionador
// Cada respuesta tiene un peso para cada casa: [Gryffindor, Hufflepuff, Ravenclaw, Slytherin]

module.exports = {
  questions: [
    {
      id: 1,
      question: "¿Qué cualidad valoras más?",
      options: [
        { label: "Valentía y coraje", points: [3, 0, 1, 0] },
        { label: "Lealtad y justicia", points: [0, 3, 0, 1] },
        { label: "Sabiduría e inteligencia", points: [0, 1, 3, 0] },
        { label: "Astucia y ambición", points: [1, 0, 0, 3] }
      ]
    },
    {
      id: 2,
      question: "Si encontraras un objeto perdido, ¿qué harías?",
      options: [
        { label: "Lo devolvería inmediatamente al dueño", points: [1, 3, 0, 0] },
        { label: "Lo investigaría para entender su valor", points: [0, 0, 3, 1] },
        { label: "Lo usaría para ayudar a otros", points: [2, 2, 0, 0] },
        { label: "Lo usaría para mi beneficio", points: [0, 0, 1, 3] }
      ]
    },
    {
      id: 3,
      question: "¿Qué te motiva más?",
      options: [
        { label: "Proteger a los que amo", points: [3, 1, 0, 1] },
        { label: "Ser justo y ayudar a todos", points: [1, 3, 0, 0] },
        { label: "Aprender y descubrir la verdad", points: [0, 0, 3, 1] },
        { label: "Alcanzar mis objetivos", points: [0, 0, 1, 3] }
      ]
    },
    {
      id: 4,
      question: "En una situación difícil, ¿cómo reaccionas?",
      options: [
        { label: "Actúo sin pensar, confiando en mi instinto", points: [3, 0, 0, 1] },
        { label: "Busco una solución que beneficie a todos", points: [1, 3, 0, 0] },
        { label: "Analizo todas las opciones antes de decidir", points: [0, 0, 3, 1] },
        { label: "Evalúo qué me beneficia más", points: [0, 0, 1, 3] }
      ]
    },
    {
      id: 5,
      question: "¿Qué tipo de amistad prefieres?",
      options: [
        { label: "Amigos valientes que me apoyen", points: [3, 1, 0, 0] },
        { label: "Amigos leales y confiables", points: [1, 3, 0, 0] },
        { label: "Amigos inteligentes con quienes debatir", points: [0, 0, 3, 1] },
        { label: "Amigos ambiciosos que compartan mis metas", points: [0, 0, 1, 3] }
      ]
    },
    {
      id: 6,
      question: "¿Qué harías si vieras una injusticia?",
      options: [
        { label: "Intervendría inmediatamente", points: [3, 1, 0, 0] },
        { label: "Buscaría una solución pacífica", points: [1, 3, 0, 0] },
        { label: "Analizaría la situación primero", points: [0, 0, 3, 1] },
        { label: "Evaluaría si me conviene intervenir", points: [0, 0, 1, 3] }
      ]
    },
    {
      id: 7,
      question: "¿Qué te define mejor?",
      options: [
        { label: "Soy audaz y no temo los desafíos", points: [3, 0, 0, 1] },
        { label: "Soy trabajador y perseverante", points: [0, 3, 1, 0] },
        { label: "Soy curioso y siempre quiero aprender", points: [0, 1, 3, 0] },
        { label: "Soy determinado y sé lo que quiero", points: [1, 0, 0, 3] }
      ]
    },
    {
      id: 8,
      question: "¿Qué prefieres hacer en tu tiempo libre?",
      options: [
        { label: "Aventuras y actividades emocionantes", points: [3, 0, 0, 1] },
        { label: "Ayudar a otros o trabajar en proyectos", points: [1, 3, 0, 0] },
        { label: "Leer, estudiar o investigar", points: [0, 0, 3, 1] },
        { label: "Planificar y trabajar en mis objetivos", points: [0, 0, 1, 3] }
      ]
    },
    {
      id: 9,
      question: "¿Qué valoras más en una persona?",
      options: [
        { label: "Coraje y determinación", points: [3, 0, 1, 0] },
        { label: "Honestidad y bondad", points: [0, 3, 0, 1] },
        { label: "Inteligencia y creatividad", points: [0, 1, 3, 0] },
        { label: "Ambición y astucia", points: [1, 0, 0, 3] }
      ]
    },
    {
      id: 10,
      question: "¿Cuál es tu mayor miedo?",
      options: [
        { label: "Ser cobarde o no estar a la altura", points: [3, 0, 0, 1] },
        { label: "Fallar a quienes confían en mí", points: [1, 3, 0, 0] },
        { label: "Ser ignorante o no entender algo", points: [0, 0, 3, 1] },
        { label: "No alcanzar mis metas", points: [0, 0, 1, 3] }
      ]
    }
  ],
  
  // Función para calcular la casa ganadora
  calculateHouse: (scores) => {
    const houses = ['Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'];
    const maxScore = Math.max(...scores);
    
    // Encontrar todas las casas con el puntaje máximo (empates)
    const tiedHouses = scores
      .map((score, index) => score === maxScore ? { house: houses[index], index } : null)
      .filter(item => item !== null);
    
    // Si hay empate, elegir aleatoriamente entre las casas empatadas
    if (tiedHouses.length > 1) {
      const randomIndex = Math.floor(Math.random() * tiedHouses.length);
      const winner = tiedHouses[randomIndex];
      console.log(`Empate entre: ${tiedHouses.map(t => t.house).join(', ')}. Eligiendo aleatoriamente: ${winner.house}`);
      return winner.house;
    }
    
    // Si no hay empate, devolver la única casa con el puntaje máximo
    const winningIndex = scores.indexOf(maxScore);
    return houses[winningIndex];
  },
  
  // Función para obtener información de la casa
  getHouseInfo: (houseName) => {
    const houses = {
      'Gryffindor': {
        message: `Puedes pertenecer a Gryffindor, donde habitan los valientes. Su osadía, temple y caballerosidad ponen aparte a los de Gryffindor.`,
        image: "https://static.wikia.nocookie.net/esharrypotter/images/a/a3/Gryffindor_Pottermore.png/revision/latest?cb=20140922195249",
        color: 0xC41E3A
      },
      'Hufflepuff': {
        message: `Puedes pertenecer a Hufflepuff donde son justos y leales. Esos perseverantes Hufflepuff de verdad no temen el trabajo pesado.`,
        image: "https://static.wikia.nocookie.net/esharrypotter/images/4/42/Hufflepuff_Pottermore.png/revision/latest?cb=20141001131135",
        color: 0xFFC800
      },
      'Ravenclaw': {
        message: `Tal vez a la antigua sabiduría de Ravenclaw, Si tienes una mente dispuesta, porque los de inteligencia y erudición siempre encontrarán allí a sus semejantes.`,
        image: "https://static.wikia.nocookie.net/esharrypotter/images/7/76/Ravenclaw_Pottermore.png/revision/latest?cb=20141001130914",
        color: 0x0E4A99
      },
      'Slytherin': {
        message: `Tal vez en Slytherin, harás tus verdaderos amigos. Esa gente astuta utiliza cualquier medio para lograr sus fines.`,
        image: "https://static.wikia.nocookie.net/esharrypotter/images/6/69/Slytherin_Pottermore.png/revision/latest?cb=20141001130915",
        color: 0x1A472A
      }
    };
    return houses[houseName];
  }
};

