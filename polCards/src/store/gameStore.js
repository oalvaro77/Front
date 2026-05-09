export const initialGameState = {
  selectedDeck: null,
  currentEvent: null,
  opinion: { approval: 50, intensity: 0.5 },
  battleLog: [],
};

export const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SELECT_DECK':
      return { ...state, selectedDeck: action.deck };
    case 'SET_EVENT':
      return { ...state, currentEvent: action.event };
    case 'UPDATE_OPINION':
      return { ...state, opinion: { ...state.opinion, ...action.payload } };
    case 'ADD_LOG':
      return { ...state, battleLog: [...state.battleLog, action.entry] };
    default:
      return state;
  }
};
