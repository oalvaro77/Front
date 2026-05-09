const narratives = [
  {
    id: 'orden',
    name: 'Orden',
    effect: { debate: 15 },
  },
  {
    id: 'cambio',
    name: 'Cambio',
    effect: { influence: 20 },
  },
  {
    id: 'anticorrupcion',
    name: 'Anticorrupción',
    effect: { credibility: 20 },
  },
  {
    id: 'seguridad',
    name: 'Seguridad',
    effect: { debate: 10, credibility: 5 },
  },
  {
    id: 'justicia-social',
    name: 'Justicia Social',
    effect: { influence: 15, credibility: 10 },
  },
];

export default narratives;
