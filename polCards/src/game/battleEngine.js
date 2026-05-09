export const resolveBattle = (playerCard, opponentCard) => {
  const attackerScore = playerCard.strength + (playerCard.bonus || 0);
  const defenderScore = opponentCard.strength + (opponentCard.bonus || 0);

  if (attackerScore > defenderScore) {
    return { winner: 'player', margin: attackerScore - defenderScore };
  }

  if (defenderScore > attackerScore) {
    return { winner: 'opponent', margin: defenderScore - attackerScore };
  }

  return { winner: 'draw', margin: 0 };
};
