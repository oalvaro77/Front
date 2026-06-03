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

export const resolveDecision = (event = null, selectedOptionId) => {
  if (!event || !selectedOptionId) {
    return {
      outcome: 'invalid',
      scoreDelta: 0,
      message: 'No se seleccionó una opción válida.',
      choice: null,
    };
  }

  const choice = event.choices?.find((option) => option.id === selectedOptionId);
  if (!choice) {
    return {
      outcome: 'invalid',
      scoreDelta: 0,
      message: 'La opción no existe para este evento.',
      choice: null,
    };
  }

  const scoreDelta = Math.max(-15, Math.min(15, Math.round(choice.score)));
  const outcome = scoreDelta >= 8 ? 'success' : scoreDelta >= 0 ? 'mixed' : 'challenge';
  const message = choice.feedback || `Elegiste: ${choice.label}.`;

  return {
    outcome,
    scoreDelta,
    message,
    choice,
  };
};
