const narratives = [
  {
    id: 'orden',
    name: 'Discurso de Orden',
    description: 'Promesas de mano dura, estabilidad y disciplina para restablecer el control.',
    effect: { debate: 15 },
  },
  {
    id: 'cambio',
    name: 'Promesa de Cambio',
    description: 'Una visión renovadora que conecta con el deseo ciudadano de transformación.',
    effect: { influencia: 20 },
  },
  {
    id: 'anticorrupcion',
    name: 'Cruzada Anticorrupción',
    description: 'Transparencia radical y ética inquebrantable contra la corrupción sistémica.',
    effect: { credibilidad: 20 },
  },
  {
    id: 'seguridad',
    name: 'Agenda de Seguridad',
    description: 'Propuestas firmes para combatir el crimen y proteger a los ciudadanos.',
    effect: { debate: 10, credibilidad: 5 },
  },
  {
    id: 'justicia-social',
    name: 'Justicia Social',
    description: 'Equidad, derechos y dignidad para los sectores más vulnerables de la sociedad.',
    effect: { influencia: 15, credibilidad: 10 },
  },
  {
    id: 'progreso-economico',
    name: 'Progreso Económico',
    description: 'Crecimiento, empleo y oportunidades para reactivar la economía del país.',
    effect: { influencia: 12, debate: 8 },
  },
  {
    id: 'unidad-nacional',
    name: 'Unidad Nacional',
    description: 'Un llamado a superar divisiones y construir consensos para el bien común.',
    effect: { credibilidad: 15, debate: 5 },
  },
  {
    id: 'reforma-institucional',
    name: 'Reforma Institucional',
    description: 'Modernización profunda del Estado para hacerlo más eficiente y cercano.',
    effect: { debate: 18 },
  },
];

export default narratives;
