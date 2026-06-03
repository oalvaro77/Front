// Stats promedio calculados: propuestas: 75, experiencia: 74, escandalos: 19
// Todos los candidatos tienen las mismas características para que la elección sea por preferencia
const AVERAGE_STATS = { propuestas: 75, experiencia: 74, escandalos: 19 };

export const politicians = [
  {
    id: 'ivan-cepeda',
    name: 'Iván Cepeda',
    party: 'Pacto Histórico',
    type: 'izquierda',
    image: '/images/ivan_cepeda.png',
    stats: AVERAGE_STATS,
  },
  {
    id: 'abelardo-espriella',
    name: 'Abelardo de la Espriella',
    party: 'Independiente (Derecha)',
    type: 'derecha',
    image: '/images/abelardo.png',
    stats: AVERAGE_STATS,
  },
  {
    id: 'paloma-valencia',
    name: 'Paloma Valencia',
    party: 'Centro Democrático',
    type: 'derecha',
    image: '/images/paloma_valencia.png',
    stats: AVERAGE_STATS,
  },
  {
    id: 'claudia-lopez',
    name: 'Claudia López',
    party: 'Alianza Verde',
    type: 'centro',
    image: '/images/claudia_lopez.png',
    stats: AVERAGE_STATS,
  },
  {
    id: 'sergio-fajardo',
    name: 'Sergio Fajardo',
    party: 'Dignidad y Compromiso',
    type: 'centro',
    image: '/images/sergio_fajardo.png',
    stats: AVERAGE_STATS,
  },
  {
    id: 'luis-g-murillo',
    name: 'Luis Gilberto Murillo',
    party: 'Colombia Renaciente',
    type: 'centro',
    image: '/images/luis_murillo.png',
    stats: AVERAGE_STATS,
  },
  {
    id: 'miguel-uribe',
    name: 'Miguel Uribe Londoño',
    party: 'Centro Democrático',
    type: 'derecha',
    image: '/images/miguel_uribe.png',
    stats: AVERAGE_STATS,
  },
  {
    id: 'roy-barreras',
    name: 'Roy Barreras',
    party: 'La Fuerza de la Paz',
    type: 'centro',
    image: '/images/roy_barrera.png',
    stats: AVERAGE_STATS,
  },
  {
    id: 'carlos-caicedo',
    name: 'Carlos Caicedo',
    party: 'Fuerza Ciudadana',
    type: 'izquierda',
    image: '/images/carlos_caicedo.png',
    stats: AVERAGE_STATS,
  },
  {
    id: 'clara-lopez',
    name: 'Clara López',
    party: 'Todos Somos Colombia',
    type: 'izquierda',
    image: '/images/clara_lopez.png',
    stats: AVERAGE_STATS,
  },
  {
    id: 'gustavo-matamoros',
    name: 'Gustavo Matamoros',
    party: 'Independiente (Militar r.)',
    type: 'derecha',
    image: '/images/gustavo_matamoros.png',
    stats: AVERAGE_STATS,
  },
  {
    id: 'santiago-botero',
    name: 'Santiago Botero',
    party: 'Independiente',
    type: 'derecha',
    image: '/images/santiago_botero.png',
    stats: AVERAGE_STATS,
  },
  {
    id: 'sondra-mccollins',
    name: 'Sondra Macollins',
    party: 'Independiente',
    type: 'centro',
    image: '/images/sondra_macollins.png',
    stats: AVERAGE_STATS,
  },
];

export function shuffleDeck(cards) {
  return [...cards].sort(() => Math.random() - 0.5);
}

export function dealHand(deck, size) {
  return { hand: deck.slice(0, size), remaining: deck.slice(size) };
}
