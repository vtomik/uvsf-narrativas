export type Reflection = {
  title: string;
  text: string;
  invitation: string;
  reading: string;
  tension: string;
  practice: string;
  opening: string;
};

export const reflections: Record<string, Reflection> = {
  paciente: {
    title: "Cuidar también es dejar elegir.",
    text: "Al revelar la voz de Elena, su autonomía deja de quedar detrás del diagnóstico. El miedo de su hija y la orientación del médico siguen siendo importantes; ahora pueden dialogar con lo que ella quiere para su propia vida.",
    invitation: "¿Cómo acompañarías a Elena sin decidir por ella?",
    reading:
      "Elena habla desde un presente que todavía quiere habitar. Su temor no se limita a olvidar: también teme que los demás dejen de reconocerla como alguien con deseos y una historia propia. Leer su voz permite distinguir entre necesitar ayuda y desaparecer de la conversación. El diagnóstico nombra una enfermedad; no agota lo que una persona es.",
    tension:
      "La protección puede nacer del amor y aun así sentirse como una pérdida de libertad. Eso no vuelve innecesaria la ayuda de su hija ni la orientación profesional. Abre una tarea más difícil: conversar sobre apoyos y riesgos sin asumir que una sola respuesta sirve para todas las decisiones. Escuchar a Elena también exige preguntar qué quiere y qué necesita para poder expresarlo.",
    practice:
      "En esta escena, un primer gesto sería dirigirse a Elena antes de hablar sobre ella, darle tiempo para responder y explorar qué actividades desea conservar. Después, invitar a su hija a compartir sus preocupaciones y al profesional a explicar los apoyos posibles. La conversación puede buscar acuerdos concretos y revisables, en lugar de convertir el miedo al futuro en una decisión sobre toda su vida.",
    opening:
      "Elena, ¿qué es importante para ti seguir haciendo y qué ayuda te gustaría recibir?",
  },
  cuidadora: {
    title: "Quien cuida también necesita cuidado.",
    text: "Al revelar la voz de su hija, el cansancio y el miedo dejan de confundirse con falta de amor. Escuchar esa carga permite pensar un cuidado compartido, que acompañe a Elena y también a quien está a su lado.",
    invitation: "¿Qué apoyo necesitaría su hija para cuidar sin quedarse sola?",
    reading:
      "La hija recuerda haber sido cuidada y desea corresponder a ese vínculo. Pero el amor convive con noches de preocupación, cansancio y culpa. El poema hace visible un trabajo que puede quedar fuera de la consulta: anticipar lo que podría ocurrir, sostener lo cotidiano y tratar de descansar sin sentir que se está fallando.",
    tension:
      "Escuchar su miedo no significa darle autoridad para decidirlo todo por Elena. Tampoco basta con pedirle más paciencia. Las dos necesitan ser reconocidas: una desea conservar su libertad y la otra necesita apoyo para acompañarla. El cuidado se empobrece si la única solución imaginable es que una de ellas renuncie a su propia voz.",
    practice:
      "En esta escena, se podría preguntar qué tareas está sosteniendo la hija, cuáles le resultan más difíciles y con quién podría compartirlas. Hacer lugar al descanso, identificar una red de apoyo y acordar un siguiente encuentro vuelve más concreta la ayuda. Las posibilidades deben conversarse con Elena y con el equipo, sin suponer que toda familia dispone de los mismos recursos.",
    opening:
      "¿Qué parte del cuidado estás sosteniendo sola y qué apoyo concreto te aliviaría esta semana?",
  },
  medico: {
    title: "Escuchar también forma parte de tratar.",
    text: "Al revelar la voz del médico, aparece la tensión entre orientar y reconocer lo que no puede prometer. La información clínica sigue siendo necesaria; escuchar a Elena y a su hija permite darle un sentido humano.",
    invitation:
      "¿Qué pregunta abriría una conversación más allá del diagnóstico?",
    reading:
      "El médico cuenta con un nombre para la enfermedad, pero reconoce que ese nombre no responde a todas las preguntas. Elena pregunta por su libertad; su hija, por cómo protegerla. La misma explicación puede ser recibida desde preocupaciones distintas. El poema sitúa la responsabilidad profesional en ese encuentro entre conocimiento, incertidumbre y escucha.",
    tension:
      "Prometer certezas que no se tienen puede dañar la confianza; limitarse a reconocer la incertidumbre puede dejar a las personas sin orientación. Entre ambos extremos hay espacio para explicar lo que se sabe, reconocer lo que sigue abierto y construir un siguiente paso. Escuchar no sustituye el saber clínico: ayuda a entender qué necesita aclarar cada persona para participar.",
    practice:
      "En esta escena, el profesional podría preguntar primero qué entendieron Elena y su hija, explorar por separado qué les preocupa y explicar con palabras claras los próximos pasos. Cerrar la consulta con un acuerdo y una forma de retomar las dudas hace visible el acompañamiento. Una conversación abierta también necesita tiempo, continuidad y responsabilidad.",
    opening:
      "Después de lo que hemos conversado, ¿qué les preocupa más y qué necesitan que aclaremos antes de salir?",
  },
};
