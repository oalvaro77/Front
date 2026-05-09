export const chooseCpuAction = (playerState, cpuState) => {
  if (cpuState.morale < 30) {
    return { action: 'reinforce', target: 'defense' };
  }

  if (playerState.popularity > cpuState.popularity) {
    return { action: 'attack', target: 'campaign' };
  }

  return { action: 'maintain', target: 'strategy' };
};
