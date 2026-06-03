// Todos los candidatos comienzan con valores iguales para estadísticas base.
const BASE_STATS = { propuestas: 5, experiencia: 5, escandalos: 5 };
const BASE_RATING = 5.0;

const createCandidate = ({ id, name, party, type, image }) => ({
  id,
  name,
  party,
  type,
  image,
  stats: { ...BASE_STATS },
  rating: BASE_RATING,
});

export const politicians = [
  createCandidate({
    id: 'ivan-cepeda',
    name: 'Iván Cepeda',
    party: 'Pacto Histórico',
    type: 'izquierda',
    image: '/images/ivan_cepeda.png',
  }),
  createCandidate({
    id: 'abelardo-espriella',
    name: 'Abelardo de la Espriella',
    party: 'Independiente (Derecha)',
    type: 'derecha',
    image: '/images/abelardo.png',
  }),
  createCandidate({
    id: 'paloma-valencia',
    name: 'Paloma Valencia',
    party: 'Centro Democrático',
    type: 'derecha',
    image: '/images/paloma_valencia.png',
  }),
  createCandidate({
    id: 'claudia-lopez',
    name: 'Claudia López',
    party: 'Alianza Verde',
    type: 'centro',
    image: '/images/claudia_lopez.png',
  }),
  createCandidate({
    id: 'sergio-fajardo',
    name: 'Sergio Fajardo',
    party: 'Dignidad y Compromiso',
    type: 'centro',
    image: '/images/sergio_fajardo.png',
  }),
  createCandidate({
    id: 'luis-g-murillo',
    name: 'Luis Gilberto Murillo',
    party: 'Colombia Renaciente',
    type: 'centro',
    image: '/images/luis_murillo.png',
  }),
  createCandidate({
    id: 'miguel-uribe',
    name: 'Miguel Uribe Londoño',
    party: 'Centro Democrático',
    type: 'derecha',
    image: '/images/miguel_uribe.png',
  }),
  createCandidate({
    id: 'roy-barreras',
    name: 'Roy Barreras',
    party: 'La Fuerza de la Paz',
    type: 'centro',
    image: '/images/roy_barrera.png',
  }),
  createCandidate({
    id: 'carlos-caicedo',
    name: 'Carlos Caicedo',
    party: 'Fuerza Ciudadana',
    type: 'izquierda',
    image: '/images/carlos_caicedo.png',
  }),
  createCandidate({
    id: 'clara-lopez',
    name: 'Clara López',
    party: 'Todos Somos Colombia',
    type: 'izquierda',
    image: '/images/clara_lopez.png',
  }),
  createCandidate({
    id: 'gustavo-matamoros',
    name: 'Gustavo Matamoros',
    party: 'Independiente (Militar r.)',
    type: 'derecha',
    image: '/images/gustavo_matamoros.png',
  }),
  createCandidate({
    id: 'santiago-botero',
    name: 'Santiago Botero',
    party: 'Independiente',
    type: 'derecha',
    image: '/images/santiago_botero.png',
  }),
  createCandidate({
    id: 'sondra-mccollins',
    name: 'Sondra Macollins',
    party: 'Independiente',
    type: 'centro',
    image: '/images/sondra_macollins.png',
  }),
];

export function shuffleDeck(cards) {
  return [...cards].sort(() => Math.random() - 0.5);
}

export function dealHand(deck, size) {
  return { hand: deck.slice(0, size), remaining: deck.slice(size) };
}
