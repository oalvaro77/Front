const IDEOLOGY_ADVANTAGE = {
  izquierda: 'derecha',
  derecha: 'centro',
  centro: 'izquierda',
};
const ADVANTAGE_MULTIPLIER = 1.2;
const DISADVANTAGE_MULTIPLIER = 0.85;

const getAdvantageMultiplier = (attackerType, defenderType) => {
  if (IDEOLOGY_ADVANTAGE[attackerType] === defenderType) {
    return ADVANTAGE_MULTIPLIER;
  }

  if (IDEOLOGY_ADVANTAGE[defenderType] === attackerType) {
    return DISADVANTAGE_MULTIPLIER;
  }

  return 1;
};

const normalizeStats = (card) => {
  const influencia = card.stats.propuestas;
  const debate = card.stats.experiencia;
  const credibilidad = Math.max(0, 100 - card.stats.escandalos);
  const corrupcion = card.stats.escandalos;

  return { influencia, debate, credibilidad, corrupcion };
};

const applyModifiers = (base, modifiers) => {
  if (!modifiers) {
    return base;
  }

  return Object.entries(modifiers).reduce((acc, [key, value]) => {
    if (typeof acc[key] === 'number') {
      return { ...acc, [key]: acc[key] + value };
    }
    return acc;
  }, base);
};

const scoreFromStats = (stats) => {
  return (
    stats.influencia * 0.4 +
    stats.debate * 0.3 +
    stats.credibilidad * 0.3 -
    stats.corrupcion * 0.2
  );
};

export const resolveBattle = (
  playerCard,
  cpuCard,
  event = null,
  playerNarrative = null,
  cpuNarrative = null
) => {
  const playerBase = normalizeStats(playerCard);
  const cpuBase = normalizeStats(cpuCard);

  const playerWithNarrative = applyModifiers(playerBase, playerNarrative?.effect);
  const cpuWithNarrative = applyModifiers(cpuBase, cpuNarrative?.effect);

  const eventPlayerModifiers = event?.modifiers?.[playerCard.type];
  const eventCpuModifiers = event?.modifiers?.[cpuCard.type];

  const playerFinal = applyModifiers(playerWithNarrative, eventPlayerModifiers);
  const cpuFinal = applyModifiers(cpuWithNarrative, eventCpuModifiers);

  const playerScore =
    scoreFromStats(playerFinal) * getAdvantageMultiplier(playerCard.type, cpuCard.type);
  const cpuScore = scoreFromStats(cpuFinal) * getAdvantageMultiplier(cpuCard.type, playerCard.type);

  if (playerScore > cpuScore) {
    return { winner: 'player', playerScore, cpuScore, margin: playerScore - cpuScore };
  }

  if (cpuScore > playerScore) {
    return { winner: 'cpu', playerScore, cpuScore, margin: cpuScore - playerScore };
  }

  return { winner: 'draw', playerScore, cpuScore, margin: 0 };
};
