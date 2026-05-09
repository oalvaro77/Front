const IDEOLOGY_ORDER = ['izquierda', 'centro', 'derecha'];

const countByType = (cards) =>
  cards.reduce((acc, card) => {
    acc[card.type] = (acc[card.type] || 0) + 1;
    return acc;
  }, {});

export const analyzeProfile = ({ playedCandidates = [], usedNarratives = [], history = [] }) => {
  const typeCounts = countByType(playedCandidates);
  const dominantIdeology =
    Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0] || 'centro';

  const favoriteNarrative =
    usedNarratives.reduce((acc, narrative) => {
      acc[narrative.id] = (acc[narrative.id] || 0) + 1;
      return acc;
    }, {});

  const favoriteNarrativeId = Object.keys(favoriteNarrative).sort(
    (a, b) => favoriteNarrative[b] - favoriteNarrative[a]
  )[0];

  const avgScandal =
    playedCandidates.reduce((sum, card) => sum + (card.stats?.escandalos || 0), 0) /
    Math.max(1, playedCandidates.length);

  const corruptionTolerance = avgScandal > 30 ? 'alto' : avgScandal > 15 ? 'medio' : 'bajo';
  const aggressionLevel = history.filter((turn) => turn.action === 'attack').length >= 2 ? 'alto' : 'medio';

  return {
    dominantIdeology,
    favoriteNarrative: favoriteNarrativeId || null,
    corruptionTolerance,
    aggressionLevel,
  };
};
