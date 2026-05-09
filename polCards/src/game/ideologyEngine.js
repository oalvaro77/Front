export const evaluateAlignment = (candidate, narrative) => {
  const ideologyWeight = candidate.ideology === narrative.ideology ? 20 : 0;
  const charismaBonus = candidate.charisma * 1.5;

  return Math.round(candidate.baseSupport + ideologyWeight + charismaBonus);
};
