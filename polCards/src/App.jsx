import React, { useEffect, useMemo, useState } from 'react';
import Board from './components/Board';
import DeckSelector from './components/DeckSelector';
import OpinionBar from './components/OpinionBar';
import EventBanner from './components/EventBanner';
import BattleLog from './components/BattleLog';
import { politicians, shuffleDeck } from './data/candidates';
import narratives from './data/narratives';
import events from './data/events';
import { resolveBattle } from './game/battleEngine';
import { chooseCpuAction } from './game/cpuEngine';
import { analyzeProfile } from './game/ideologyEngine';
import { trackEvent } from './services/analyticsService';

const INITIAL_OPINION = 50;
const MAX_TURNS = 4;

const selectHand = (primary, alternate) => {
  const primaryDeck = shuffleDeck(primary);
  const alternateDeck = shuffleDeck(alternate);
  return primaryDeck.concat(alternateDeck).slice(0, MAX_TURNS);
};

const buildMatch = (selectedDeck) => {
  const playerPool = politicians.filter((card) => card.type === selectedDeck);
  const cpuPool = politicians.filter((card) => card.type !== selectedDeck);
  const otherPool = politicians.filter((card) => card.type !== selectedDeck);
  const otherPrimary = politicians.filter((card) => card.type === selectedDeck);

  const playerHand = selectHand(playerPool, otherPool);
  const cpuHand = selectHand(cpuPool, otherPrimary);
  const playerNarratives = shuffleDeck(narratives).slice(0, 2);
  const cpuNarratives = shuffleDeck(narratives).slice(0, 2);
  const eventDeck = shuffleDeck(events).slice(0, MAX_TURNS);

  return { playerHand, cpuHand, playerNarratives, cpuNarratives, eventDeck };
};

const App = () => {
  const [selectedDeck, setSelectedDeck] = useState('izquierda');
  const [playerHand, setPlayerHand] = useState([]);
  const [cpuHand, setCpuHand] = useState([]);
  const [playerNarratives, setPlayerNarratives] = useState([]);
  const [cpuNarratives, setCpuNarratives] = useState([]);
  const [eventDeck, setEventDeck] = useState([]);
  const [turnNumber, setTurnNumber] = useState(1);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedNarrativeId, setSelectedNarrativeId] = useState(null);
  const [usedPlayerCards, setUsedPlayerCards] = useState([]);
  const [usedCpuCards, setUsedCpuCards] = useState([]);
  const [usedPlayerNarratives, setUsedPlayerNarratives] = useState([]);
  const [playerOpinion, setPlayerOpinion] = useState(INITIAL_OPINION);
  const [cpuOpinion, setCpuOpinion] = useState(INITIAL_OPINION);
  const [battleLog, setBattleLog] = useState([]);
  const [matchEnded, setMatchEnded] = useState(false);
  const [profile, setProfile] = useState(null);

  const currentEvent = useMemo(() => eventDeck[turnNumber - 1] || null, [eventDeck, turnNumber]);
  const selectedCandidate = playerHand.find((card) => card.id === selectedCandidateId);
  const selectedNarrative = playerNarratives.find((card) => card.id === selectedNarrativeId);

  const resetMatch = () => {
    const { playerHand, cpuHand, playerNarratives, cpuNarratives, eventDeck } = buildMatch(selectedDeck);

    setPlayerHand(playerHand);
    setCpuHand(cpuHand);
    setPlayerNarratives(playerNarratives);
    setCpuNarratives(cpuNarratives);
    setEventDeck(eventDeck);
    setTurnNumber(1);
    setSelectedCandidateId(null);
    setSelectedNarrativeId(null);
    setUsedPlayerCards([]);
    setUsedCpuCards([]);
    setUsedPlayerNarratives([]);
    setPlayerOpinion(INITIAL_OPINION);
    setCpuOpinion(INITIAL_OPINION);
    setBattleLog([{ time: 'Inicio', text: `Mazo ${selectedDeck} listo para el duelo.` }]);
    setMatchEnded(false);
    setProfile(null);
  };

  useEffect(() => {
    resetMatch();
  }, [selectedDeck]);

  const availablePlayerHand = playerHand.filter((card) => !usedPlayerCards.includes(card.id));
  const availableCpuHand = cpuHand.filter((card) => !usedCpuCards.includes(card.id));
  const availablePlayerNarratives = playerNarratives.filter((narrative) => !usedPlayerNarratives.includes(narrative.id));

  const handlePlayTurn = () => {
    if (!selectedCandidate) return;

    const cpuAction = chooseCpuAction(availableCpuHand, cpuNarratives, currentEvent, usedCpuCards);
    const cpuCard = cpuAction.candidate;
    const cpuNarrative = cpuAction.narrative;

    if (!cpuCard) {
      setMatchEnded(true);
      setBattleLog((prev) => [
        { time: `Turno ${turnNumber}`, text: 'La CPU no tiene más candidatos disponibles.' },
        ...prev,
      ]);
      return;
    }

    const result = resolveBattle(selectedCandidate, cpuCard, currentEvent, selectedNarrative, cpuNarrative);
    const winnerText =
      result.winner === 'player'
        ? 'Jugador gana el turno'
        : result.winner === 'cpu'
        ? 'CPU gana el turno'
        : 'Empate';

    const nextPlayerOpinion =
      result.winner === 'player'
        ? Math.min(100, playerOpinion + 10)
        : result.winner === 'cpu'
        ? Math.max(0, playerOpinion - 5)
        : playerOpinion;
    const nextCpuOpinion =
      result.winner === 'player'
        ? Math.max(0, cpuOpinion - 5)
        : result.winner === 'cpu'
        ? Math.min(100, cpuOpinion + 10)
        : cpuOpinion;

    setPlayerOpinion(nextPlayerOpinion);
    setCpuOpinion(nextCpuOpinion);
    setUsedPlayerCards((prev) => [...prev, selectedCandidate.id]);
    setUsedCpuCards((prev) => [...prev, cpuCard.id]);
    if (selectedNarrative) {
      setUsedPlayerNarratives((prev) => [...prev, selectedNarrative.id]);
    }

    setBattleLog((prev) => [
      {
        time: `Turno ${turnNumber}`,
        text: `${selectedCandidate.name}${selectedNarrative ? ` + ${selectedNarrative.name}` : ''} vs ${cpuCard.name}${cpuNarrative ? ` + ${cpuNarrative.name}` : ''}: ${winnerText}`,
      },
      ...prev,
    ]);

    trackEvent('turnResolved', {
      turn: turnNumber,
      event: currentEvent?.id,
      playerCandidate: selectedCandidate.id,
      playerNarrative: selectedNarrative?.id,
      cpuCandidate: cpuCard.id,
      cpuNarrative: cpuNarrative?.id,
      winner: result.winner,
    });

    const nextTurn = turnNumber + 1;
    const matchOver = nextTurn > MAX_TURNS || availablePlayerHand.length <= 1 || availableCpuHand.length <= 1;

    if (matchOver) {
      setMatchEnded(true);
      const finalProfile = analyzeProfile({
        playedCandidates: playerHand.filter((card) => usedPlayerCards.includes(card.id) || card.id === selectedCandidate.id),
        usedNarratives: playerNarratives.filter((narrative) => usedPlayerNarratives.includes(narrative.id) || narrative.id === selectedNarrative?.id),
        history: [{ action: 'battle', result: result.winner }],
      });
      setProfile(finalProfile);
      setTurnNumber(nextTurn);
      return;
    }

    setTurnNumber(nextTurn);
    setSelectedCandidateId(null);
    setSelectedNarrativeId(null);
  };

  const resultMessage = matchEnded
    ? playerOpinion > cpuOpinion
      ? 'Has ganado el duelo político.'
      : playerOpinion < cpuOpinion
      ? 'Has perdido el duelo político.'
      : 'El duelo político terminó en empate.'
    : null;

  return (
    <div className="app-shell">
      <header>
        <h1>Policars 2</h1>
      </header>

      <main>
        <DeckSelector selectedDeck={selectedDeck} onSelectDeck={setSelectedDeck} />
        <EventBanner event={currentEvent} />
        <OpinionBar playerOpinion={playerOpinion} cpuOpinion={cpuOpinion} />
        <Board
          playerHand={availablePlayerHand}
          cpuHand={availableCpuHand}
          playerNarratives={availablePlayerNarratives}
          event={currentEvent}
          selectedDeck={selectedDeck}
          selectedCandidateId={selectedCandidateId}
          selectedNarrativeId={selectedNarrativeId}
          onSelectCandidate={setSelectedCandidateId}
          onSelectNarrative={setSelectedNarrativeId}
          onPlayTurn={handlePlayTurn}
          canPlay={!matchEnded && !!selectedCandidate}
          turnNumber={turnNumber}
          maxTurns={MAX_TURNS}
          matchEnded={matchEnded}
        />
        {resultMessage && (
          <section className="match-summary">
            <h2>Resultado final</h2>
            <p>{resultMessage}</p>
            <p>Jugador: {playerOpinion} / CPU: {cpuOpinion}</p>
            {profile && (
              <pre>{JSON.stringify(profile, null, 2)}</pre>
            )}
          </section>
        )}
        <BattleLog entries={battleLog} />
      </main>
    </div>
  );
};

export default App;
