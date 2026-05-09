const normalizeStats = (card) => {
  const influence = card.stats.propuestas;
  const debate = card.stats.experiencia;
  const credibility = Math.max(0, 100 - card.stats.escandalos);
  const corruption = card.stats.escandalos;

  return { influence, debate, credibility, corruption };
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
  return stats.influence * 0.4 + stats.debate * 0.3 + stats.credibility * 0.3 - stats.corruption * 0.2;
};

const estimateCandidateValue = (card, narrative = null, event = null) => {
  const base = normalizeStats(card);
  const withNarrative = applyModifiers(base, narrative?.effect);
  const withEvent = applyModifiers(withNarrative, event?.modifiers?.[card.type]);
  return scoreFromStats(withEvent);
};

export const chooseCpuAction = (
  cpuHand = [],
  narrativeHand = [],
  event = null,
  usedCandidateIds = [],
  usedNarrativeIds = []
) => {
  const availableCandidates = cpuHand.filter((card) => !usedCandidateIds.includes(card.id));
  const availableNarratives = narrativeHand.filter((narrative) => !usedNarrativeIds.includes(narrative.id));

  const candidateDecision = availableCandidates.reduce((best, card) => {
    const baseScore = estimateCandidateValue(card, null, event);
    const bestNarrative = availableNarratives.reduce(
      (selected, narrative) => {
        const score = estimateCandidateValue(card, narrative, event);
        return score > selected.score ? { narrative, score } : selected;
      },
      { narrative: null, score: baseScore }
    );

    return !best || bestNarrative.score > best.score
      ? { card, narrative: bestNarrative.narrative, score: bestNarrative.score }
      : best;
  }, null);

  if (!candidateDecision) {
    return { candidate: null, narrative: null };
  }

  return { candidate: candidateDecision.card, narrative: candidateDecision.narrative };
};
