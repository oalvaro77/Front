const events = [
  {
    id: 'security-crisis',
    name: 'Crisis de seguridad',
    description: 'El país exige orden y respuestas claras sobre seguridad.',
    modifiers: {
      derecha: { debate: 10, credibility: 5 },
      centro: { debate: 5 },
      izquierda: { debate: -5, credibility: -5 },
    },
  },
  {
    id: 'corruption-scandal',
    name: 'Escándalo de corrupción',
    description: 'La atención pública se centra en transparencia y ética.',
    modifiers: {
      izquierda: { credibility: 10 },
      centro: { credibility: 5 },
      derecha: { credibility: -10 },
    },
  },
  {
    id: 'unemployment-protests',
    name: 'Protestas por desempleo',
    description: 'La economía y el empleo dominan la agenda política.',
    modifiers: {
      izquierda: { influence: 10 },
      centro: { influence: 5 },
      derecha: { influence: -5 },
    },
  },
  {
    id: 'energy-crisis',
    name: 'Crisis energética',
    description: 'La gestión de la energía marca la confianza ciudadana.',
    modifiers: {
      derecha: { debate: 5, credibility: 5 },
      centro: { credibility: 10 },
      izquierda: { influence: -5 },
    },
  },
  {
    id: 'social-justice',
    name: 'Justicia social',
    description: 'La sociedad exige equidad y derechos para todos.',
    modifiers: {
      izquierda: { influence: 10, credibility: 5 },
      centro: { influence: 5 },
      derecha: { influence: -10 },
    },
  },
];

export default events;
