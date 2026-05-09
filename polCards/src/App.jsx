import React, { useEffect, useMemo, useState } from 'react';
import Board from './components/Board';
import DeckSelector from './components/DeckSelector';
import OpinionBar from './components/OpinionBar';
import EventBanner from './components/EventBanner';
import BattleLog from './components/BattleLog';
import Card from './components/Card';
import { politicians, shuffleDeck } from './data/candidates';
import narratives from './data/narratives';
import events from './data/events';
import { resolveBattle } from './game/battleEngine';
import { chooseCpuAction } from './game/cpuEngine';
import { analyzeProfile } from './game/ideologyEngine';
import { trackEvent } from './services/analyticsService';

const INITIAL_OPINION = 50;
const MAX_TURNS = 4;

const buildMatch = ({ selectedCandidates, selectedNarratives }) => {
  const playerHand = selectedCandidates;
  const cpuHand = shuffleDeck(politicians.filter((card) => !selectedCandidates.some((selected) => selected.id === card.id))).slice(0, MAX_TURNS);
  const playerNarratives = selectedNarratives;
  const cpuNarratives = shuffleDeck(narratives.filter((narrative) => !selectedNarratives.some((selected) => selected.id === narrative.id))).slice(0, 2);
  const eventDeck = shuffleDeck(events).slice(0, MAX_TURNS);

  return { playerHand, cpuHand, playerNarratives, cpuNarratives, eventDeck };
};

const App = () => {
  const [selectedDeck, setSelectedDeck] = useState('izquierda');
  const [phase, setPhase] = useState('selection');
  const [candidateSelection, setCandidateSelection] = useState([]);
  const [narrativeSelection, setNarrativeSelection] = useState([]);
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
  const [usedCpuNarratives, setUsedCpuNarratives] = useState([]);
  const [playerOpinion, setPlayerOpinion] = useState(INITIAL_OPINION);
  const [cpuOpinion, setCpuOpinion] = useState(INITIAL_OPINION);
  const [battleLog, setBattleLog] = useState([]);
  const [matchEnded, setMatchEnded] = useState(false);
  const [profile, setProfile] = useState(null);

  const availableCandidatesForSelection = useMemo(() => {
    return [...politicians].sort((a, b) => {
      if (a.type === selectedDeck && b.type !== selectedDeck) return -1;
      if (a.type !== selectedDeck && b.type === selectedDeck) return 1;
      return b.stats.propuestas - a.stats.propuestas;
    });
  }, [selectedDeck]);

  const selectedCandidate = playerHand.find((card) => card.id === selectedCandidateId);
  const selectedNarrative = playerNarratives.find((card) => card.id === selectedNarrativeId);
  const currentEvent = useMemo(() => eventDeck[turnNumber - 1] || null, [eventDeck, turnNumber]);

  const availablePlayerHand = playerHand.filter((card) => !usedPlayerCards.includes(card.id));
  const availableCpuHand = cpuHand.filter((card) => !usedCpuCards.includes(card.id));
  const availablePlayerNarratives = playerNarratives.filter((narrative) => !usedPlayerNarratives.includes(narrative.id));

  useEffect(() => {
    setPhase('selection');
    setCandidateSelection([]);
    setNarrativeSelection([]);
    setSelectedCandidateId(null);
    setSelectedNarrativeId(null);
    setMatchEnded(false);
  }, [selectedDeck]);

  const toggleCandidateSelection = (id) => {
    if (phase !== 'selection') return;
    setCandidateSelection((prev) =>
      prev.includes(id)
        ? prev.filter((candidateId) => candidateId !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  };

  const toggleNarrativeSelection = (id) => {
    if (phase !== 'selection') return;
    setNarrativeSelection((prev) =>
      prev.includes(id)
        ? prev.filter((narrativeId) => narrativeId !== id)
        : prev.length < 2
        ? [...prev, id]
        : prev
    );
  };

  const handleStartMatch = () => {
    if (candidateSelection.length !== 4 || narrativeSelection.length !== 2) return;

    const selectedCandidates = politicians.filter((candidate) => candidateSelection.includes(candidate.id));
    const selectedNarrativesList = narratives.filter((narrative) => narrativeSelection.includes(narrative.id));
    const { playerHand, cpuHand, playerNarratives, cpuNarratives, eventDeck } = buildMatch({
      selectedCandidates,
      selectedNarratives: selectedNarrativesList,
    });

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
    setUsedCpuNarratives([]);
    setPlayerOpinion(INITIAL_OPINION);
    setCpuOpinion(INITIAL_OPINION);
    setBattleLog([
      { time: 'Inicio', text: `Duelo iniciado. Evento: ${eventDeck[0]?.name || 'N/A'}` },
    ]);
    setMatchEnded(false);
    setProfile(null);
    setPhase('battle');
  };

  const handlePlayTurn = () => {
    if (phase !== 'battle' || !selectedCandidate) return;

    const cpuAction = chooseCpuAction(
      availableCpuHand,
      cpuNarratives,
      currentEvent,
      usedCpuCards,
      usedCpuNarratives
    );
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
    if (cpuNarrative) {
      setUsedCpuNarratives((prev) => [...prev, cpuNarrative.id]);
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

  const toggleDeck = (deckId) => {
    if (phase !== 'selection') return;
    setSelectedDeck(deckId);
  };

  const resultMessage = matchEnded
    ? playerOpinion > cpuOpinion
      ? 'Has ganado el duelo político.'
      : playerOpinion < cpuOpinion
      ? 'Has perdido el duelo político.'
      : 'El duelo político terminó en empate.'
    : null;

  if (phase === 'selection') {
    return (
      <div className="app-shell">
        <header>
          <h1>Policars 2</h1>
        </header>

        <main>
          <DeckSelector selectedDeck={selectedDeck} onSelectDeck={toggleDeck} />
          <section className="selection-panel">
            <h2>Selecciona 4 candidatos</h2>
            <p>Elige tu equipo político. Elige 4 candidatos y 2 narrativas.</p>
            <div className="candidate-grid">
              {availableCandidatesForSelection.map((candidate) => (
                <Card
                  key={candidate.id}
                  {...candidate}
                  className={candidateSelection.includes(candidate.id) ? 'selected' : ''}
                  onClick={() => toggleCandidateSelection(candidate.id)}
                />
              ))}
            </div>
            <h2>Selecciona 2 narrativas</h2>
            <div className="card-row narrative-selection">
              {narratives.map((narrative) => (
                <Card
                  key={narrative.id}
                  title={narrative.name}
                  description={`Efecto: ${Object.entries(narrative.effect)
                    .map(([key, value]) => `${key} ${value > 0 ? '+' : ''}${value}`)
                    .join(', ')}`}
                  className={narrativeSelection.includes(narrative.id) ? 'selected' : ''}
                  onClick={() => toggleNarrativeSelection(narrative.id)}
                />
              ))}
            </div>
            <button type="button" className="start-button" onClick={handleStartMatch} disabled={candidateSelection.length !== 4 || narrativeSelection.length !== 2}>
              Comenzar partida
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header>
        <h1>Policars 2</h1>
      </header>

      <main>
        <DeckSelector selectedDeck={selectedDeck} onSelectDeck={toggleDeck} />
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
            <button type="button" onClick={() => setPhase('selection')}>
              Reiniciar selección de mazo
            </button>
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
