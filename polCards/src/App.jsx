import React, { useEffect, useMemo, useState } from 'react';
import Board from './components/Board';
import DeckSelector from './components/DeckSelector';
import OpinionBar from './components/OpinionBar';
import EventBanner from './components/EventBanner';
import BattleLog from './components/BattleLog';
import Card from './components/Card';
import Ranking from './components/Ranking';
import { politicians, shuffleDeck } from './data/candidates';
import events from './data/events';
import { resolveDecision } from './game/battleEngine';
import { analyzeProfile } from './game/ideologyEngine';
import { trackEvent } from './services/analyticsService';
import { recordMatch } from './services/statsService';
import {
  getLocalRatings,
  saveLocalRatings,
  adjustCandidateRating,
  fetchCandidateRatings,
  syncRatingAdjustment,
} from './services/ratingsService';

const INITIAL_OPINION = 50;
const MAX_TURNS = 4;

const buildMatch = ({ selectedCandidates }) => {
  const playerHand = selectedCandidates;
  const eventDeck = shuffleDeck(events).slice(0, MAX_TURNS);

  return { playerHand, eventDeck };
};

const App = () => {
  const [selectedDeck, setSelectedDeck] = useState('izquierda');
  const [screen, setScreen] = useState('deck');
  const [candidateSelection, setCandidateSelection] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [eventDeck, setEventDeck] = useState([]);
  const [candidateRatings, setCandidateRatings] = useState({});
  const [ratingMessage, setRatingMessage] = useState('');
  const [turnNumber, setTurnNumber] = useState(1);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [usedPlayerCards, setUsedPlayerCards] = useState([]);
  const [approval, setApproval] = useState(INITIAL_OPINION);
  const [battleLog, setBattleLog] = useState([]);
  const [matchEnded, setMatchEnded] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showRanking, setShowRanking] = useState(false);

  useEffect(() => {
    const localRatings = getLocalRatings();
    setCandidateRatings(localRatings);

    if (import.meta.env.VITE_API_URL) {
      fetchCandidateRatings()
        .then((apiRatings) => {
          if (apiRatings) {
            const mergedRatings = { ...localRatings, ...apiRatings };
            setCandidateRatings(mergedRatings);
            saveLocalRatings(mergedRatings);
          }
        })
        .catch(() => {
          // Si la API no está disponible, seguimos con las configuraciones locales.
        });
    }
  }, []);

  const candidatesWithRatings = useMemo(
    () =>
      politicians.map((candidate) => ({
        ...candidate,
        rating: candidateRatings[candidate.id] ?? candidate.rating ?? 5.0,
        stats: { ...candidate.stats },
      })),
    [candidateRatings]
  );

  const availableCandidatesForSelection = useMemo(() => {
    // Solo agrupa por ideología seleccionada primero, sin sorting por stats
    return [...candidatesWithRatings].sort((a, b) => {
      if (a.type === selectedDeck && b.type !== selectedDeck) return -1;
      if (a.type !== selectedDeck && b.type === selectedDeck) return 1;
      return 0; // Mantiene orden original cuando stats son iguales
    });
  }, [selectedDeck, candidatesWithRatings]);

  const selectedCandidate = playerHand.find((card) => card.id === selectedCandidateId);
  const currentEvent = useMemo(() => eventDeck[turnNumber - 1] || null, [eventDeck, turnNumber]);
  const selectedOption = currentEvent?.choices?.find((choice) => choice.id === selectedOptionId) || null;

  const availablePlayerHand = playerHand.filter((card) => !usedPlayerCards.includes(card.id));

  // useEffect(() => {
  //   setCandidateSelection([]);
  //   setNarrativeSelection([]);
  //   setSelectedCandidateId(null);
  //   setSelectedNarrativeId(null);
  //   setMatchEnded(false);
  // }, [selectedDeck]);

  const toggleCandidateSelection = (id) => {
    if (screen !== 'candidates') return;
    setCandidateSelection((prev) =>
      prev.includes(id)
        ? prev.filter((candidateId) => candidateId !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  };


  const handleDeckSelect = (deckId) => {
    setSelectedDeck(deckId);
    setCandidateSelection([]);
    setScreen('candidates');
  };

  const handleStartMatch = () => {
    if (candidateSelection.length !== 4) return;

    const selectedCandidates = candidatesWithRatings.filter((candidate) => candidateSelection.includes(candidate.id));
    const { playerHand, eventDeck } = buildMatch({ selectedCandidates });

    setPlayerHand(playerHand);
    setEventDeck(eventDeck);
    setTurnNumber(1);
    setSelectedCandidateId(null);
    setSelectedOptionId(null);
    setUsedPlayerCards([]);
    setApproval(INITIAL_OPINION);
    setBattleLog([
      { time: 'Inicio', text: `Se abre la primera situación: ${eventDeck[0]?.name || 'N/A'}` },
    ]);
    setMatchEnded(false);
    setProfile(null);
    setScreen('battle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRatingChange = async (candidateId, delta) => {
    const updatedRatings = adjustCandidateRating(candidateId, delta);
    setCandidateRatings(updatedRatings);

    const newRating = updatedRatings[candidateId];
    setRatingMessage(`Rating de ${candidateId} actualizado a ${newRating.toFixed(1)}`);
    window.setTimeout(() => setRatingMessage(''), 2500);

    if (import.meta.env.VITE_API_URL) {
      try {
        await syncRatingAdjustment(candidateId, newRating);
      } catch (error) {
        console.warn('[App] Rating sync failed:', error.message || error);
      }
    }
  };

  const handlePlayTurn = () => {
    if (screen !== 'battle' || !selectedCandidate || !selectedOptionId) return;

    const result = resolveDecision(currentEvent, selectedOptionId);
    const nextApproval = Math.min(100, Math.max(0, approval + result.scoreDelta));

    setApproval(nextApproval);
    setUsedPlayerCards((prev) => [...prev, selectedCandidate.id]);

    setBattleLog((prev) => [
      {
        time: `Turno ${turnNumber}`,
        text: `${selectedCandidate.name} tomó la decisión: ${result.choice?.label || 'Sin opción valida'}. ${result.message} (${result.scoreDelta >= 0 ? '+' : ''}${result.scoreDelta}). Satisfacción: ${nextApproval}%`,
      },
      ...prev,
    ]);

    const nextTurn = turnNumber + 1;
    const matchOver = nextTurn > MAX_TURNS || availablePlayerHand.length <= 1;

    if (matchOver) {
      setMatchEnded(true);
      const candidateIds = playerHand.map((card) => card.id);
      recordMatch(candidateIds);

      const finalProfile = analyzeProfile({
        playedCandidates: playerHand.filter((card) => usedPlayerCards.includes(card.id) || card.id === selectedCandidate.id),
        usedNarratives: [],
        history: [{ action: 'decision', result: result.outcome }],
      });
      setProfile(finalProfile);
      setTurnNumber(nextTurn);
      setScreen('end');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setTurnNumber(nextTurn);
      setSelectedCandidateId(null);
      setSelectedOptionId(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleDeck = (deckId) => {
    if (screen !== 'deck') return;
    setSelectedDeck(deckId);
  };

  const resultMessage = matchEnded
    ? approval >= 60
      ? 'Tus decisiones fueron acertadas y la opinión pública es positiva.'
      : approval >= 40
      ? 'La población quedó con sentimientos mixtos tras tus respuestas.'
      : 'Las decisiones fueron débiles y la opinión pública cayó.'
    : null;

  if (screen === 'deck') {
    return (
      <div className="screen">
        <header>
          <h1>Policards 2</h1>
        </header>
        <main className="screen-content">
          <DeckSelector selectedDeck={selectedDeck} onSelectDeck={handleDeckSelect} />
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              className="btn-secondary"
              onClick={() => setShowRanking(true)}
              style={{ fontSize: '1rem', padding: '12px 32px' }}
            >
              Ver Ranking de Candidatos
            </button>
          </div>
        </main>
        {showRanking && <Ranking onClose={() => setShowRanking(false)} />}
      </div>
    );
  }

  if (screen === 'candidates') {
    return (
      <div className="screen">
        <header>
          <h1>Policars 2</h1>
        </header>
        <main className="screen-content">
          <DeckSelector selectedDeck={selectedDeck} onSelectDeck={handleDeckSelect} />
          <section className="selection-panel">
            <h2>Selecciona 4 candidatos</h2>
            <p>Elige tus favoritos. El resultado depende de tus decisiones, no del candidato.</p>
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
            <button type="button" className="start-button" onClick={handleStartMatch} disabled={candidateSelection.length !== 4}>
              Comenzar partida
            </button>
          </section>
        </main>
      </div>
    );
  }

  if (screen === 'battle') {
    return (
      <div className="screen">
        <header>
          <h1>Policards 2</h1>
        </header>
        <main className="battle-screen">
          <EventBanner event={currentEvent} />
          <OpinionBar approval={approval} />
          <Board
            playerHand={availablePlayerHand}
            event={currentEvent}
            selectedDeck={selectedDeck}
            selectedCandidateId={selectedCandidateId}
            selectedOptionId={selectedOptionId}
            onSelectCandidate={setSelectedCandidateId}
            onSelectOption={setSelectedOptionId}
            onPlayTurn={handlePlayTurn}
            canPlay={!matchEnded && !!selectedCandidate && !!selectedOptionId}
            turnNumber={turnNumber}
            maxTurns={MAX_TURNS}
            matchEnded={matchEnded}
          />
        </main>
      </div>
    );
  }

  if (screen === 'end') {
    return (
      <div className="screen">
        <header>
          <h1>Policars 2</h1>
        </header>
        <main className="screen-content">
          <section className="match-summary">
            <h2>Resultado final</h2>
            <p>{resultMessage}</p>
            <p>Opinión pública: {approval}%</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
              <button type="button" onClick={() => setShowRanking(true)} className="btn-secondary">
                Ver Ranking
              </button>
              <button type="button" onClick={() => setScreen('deck')} className="btn-primary">
                Jugar de nuevo
              </button>
            </div>
            <div className="rating-adjustment" style={{ marginTop: '24px' }}>
              <h3>Ajuste de rating de candidatos</h3>
              <p>Después de la partida puedes aumentar o disminuir en 0.1 el rating de cada candidato jugado.</p>
              <div className="rating-list" style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
                {playerHand.map((candidate) => {
                  const currentRating = candidateRatings[candidate.id] ?? candidate.rating ?? 5.0;
                  return (
                    <div key={candidate.id} className="rating-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ flex: 1 }}><strong>{candidate.name}</strong> ({currentRating.toFixed(1)})</span>
                      <button type="button" onClick={() => handleRatingChange(candidate.id, -0.1)} className="btn-secondary">
                        -0.1
                      </button>
                      <button type="button" onClick={() => handleRatingChange(candidate.id, 0.1)} className="btn-primary">
                        +0.1
                      </button>
                    </div>
                  );
                })}
              </div>
              {ratingMessage && <p style={{ marginTop: '12px', fontStyle: 'italic' }}>{ratingMessage}</p>}
            </div>
            {profile && (
              <pre>{JSON.stringify(profile, null, 2)}</pre>
            )}
          </section>
        </main>
        {showRanking && <Ranking onClose={() => setShowRanking(false)} />}
      </div>
    );
  }

  return null;
};

export default App;
