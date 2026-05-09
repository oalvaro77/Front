const getCandidateScore = (card) => {
  const influence = card.stats.propuestas;
  const debate = card.stats.experiencia;
  const credibility = Math.max(0, 100 - card.stats.escandalos);
  const corruption = card.stats.escandalos;

  return influence * 0.4 + debate * 0.3 + credibility * 0.3 - corruption * 0.2;
};

export const chooseCpuAction = (cpuHand = [], narrativeHand = [], event = null, usedCandidateIds = []) => {
  const availableCandidates = cpuHand.filter((card) => !usedCandidateIds.includes(card.id));
  const candidate = availableCandidates.reduce((best, card) => {
    const score = getCandidateScore(card);
    return !best || score > best.score ? { card, score } : best;
  }, null)?.card;

  if (!candidate) {
    return { candidate: null, narrative: null };
  }

  const narrative = narrativeHand.reduce((best, candidateNarrative) => {
    const impact = Object.values(candidateNarrative.effect).reduce((sum, value) => sum + value, 0);
    return impact > best.impact ? { narrative: candidateNarrative, impact } : best;
  }, { narrative: null, impact: -Infinity }).narrative;

  return { candidate, narrative };
};
