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
  const [filters, setFilters] = useState({ izquierda: true, centro: true, derecha: true });
  const [screen, setScreen] = useState('candidates');
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
  const [showCandidateStats, setShowCandidateStats] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustedCandidateId, setAdjustedCandidateId] = useState(null);
  const [adjustmentLocked, setAdjustmentLocked] = useState(false);
  const [selectedAdjustCandidateId, setSelectedAdjustCandidateId] = useState(null);
  const [selectedStatField, setSelectedStatField] = useState(null);

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

  const availableCandidatesForSelection = useMemo(
    () => candidatesWithRatings.filter((candidate) => filters[candidate.type]),
    [filters, candidatesWithRatings]
  );

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


  const handleToggleFilter = (filterId) => {
    setFilters((prev) => ({ ...prev, [filterId]: !prev[filterId] }));
    setCandidateSelection([]);
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
    if (adjustmentLocked) return;

    // One-time adjustment: lock after performing the change
    const updatedRatings = adjustCandidateRating(candidateId, delta);
    setCandidateRatings(updatedRatings);
    setAdjustedCandidateId(candidateId);
    setAdjustmentLocked(true);

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
          <DeckSelector filters={filters} onToggleFilter={handleToggleFilter} />
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
          <section className="deck-selector">
            <div className="banner-container">
              <img
                src="/images/casa de nariño.png"
                alt="Casa de Nariño"
                className="banner-image"
              />
            </div>
          </section>
          <section className="selection-panel">
            <h2>Selecciona 4 candidatos</h2>
            <p>Elige tus favoritos. El resultado depende de tus decisiones, no del candidato.</p>
            <div className="candidate-grid">
              {candidatesWithRatings.map((candidate) => (
                <Card
                  key={candidate.id}
                  {...candidate}
                  showStats={false}
                  className={candidateSelection.includes(candidate.id) ? 'selected' : ''}
                  onClick={() => toggleCandidateSelection(candidate.id)}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
              <button type="button" className="start-button" onClick={handleStartMatch} disabled={candidateSelection.length !== 4}>
                Comenzar partida
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowCandidateStats(true)} style={{ padding: '12px 24px' }}>
                Ver estadísticas
              </button>
            </div>
          </section>
        </main>
        {showCandidateStats && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}>
              <h2 style={{ marginTop: 0, marginBottom: '24px', textAlign: 'center' }}>Estadísticas de todos los candidatos</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {candidatesWithRatings.map((candidate) => (
                  <div key={candidate.id} style={{
                    border: '2px solid #d4a574',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#f5e6d3',
                  }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>{candidate.name}</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', margin: 0, marginBottom: '12px' }}>{candidate.party}</p>
                    <div>
                      <p style={{ margin: '6px 0' }}><strong>Propuestas:</strong> {candidate.stats.propuestas}</p>
                      <p style={{ margin: '6px 0' }}><strong>Experiencia:</strong> {candidate.stats.experiencia}</p>
                      <p style={{ margin: '6px 0' }}><strong>Escándalos:</strong> {candidate.stats.escandalos}</p>
                      <p style={{ margin: '12px 0 0 0', color: '#dc2626', fontWeight: 'bold' }}><strong>Rating:</strong> {(candidateRatings[candidate.id] ?? candidate.rating ?? 5.0).toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowCandidateStats(false)} className="btn-primary" style={{ padding: '12px 32px' }}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
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
            filters={filters}
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
              <button type="button" onClick={() => setScreen('candidates')} className="btn-primary">
                Jugar de nuevo
              </button>
            </div>
            <div className="rating-adjustment" style={{ marginTop: '24px' }}>
              <h3>Ajustar estadísticas de un candidato</h3>
              <p>Selecciona un candidato para ajustar sus estadísticas.</p>
              <button
                type="button"
                onClick={() => !adjustmentLocked && setShowAdjustmentModal(true)}
                disabled={adjustmentLocked}
                className="btn-primary"
                style={{ marginTop: '12px', padding: '12px 24px' }}
              >
                {adjustmentLocked ? 'Ajuste aplicado' : 'Abrir ajustador'}
              </button>
              {ratingMessage && <p style={{ marginTop: '12px', fontStyle: 'italic', color: '#059669' }}>{ratingMessage}</p>}
            </div>
            {profile && (
              <pre>{JSON.stringify(profile, null, 2)}</pre>
            )}
          </section>
        </main>
        {showAdjustmentModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}>
              <h2 style={{ marginTop: 0, marginBottom: '24px', textAlign: 'center' }}>Ajustar Estadísticas</h2>
              
              {!selectedAdjustCandidateId ? (
                <div>
                  <p style={{ marginBottom: '20px', textAlign: 'center', fontSize: '1rem' }}>Selecciona un candidato:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                    {candidatesWithRatings.map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => setSelectedAdjustCandidateId(candidate.id)}
                        style={{
                          padding: '12px',
                          border: '2px solid #d4a574',
                          borderRadius: '8px',
                          backgroundColor: '#f5e6d3',
                          cursor: 'pointer',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e8d4b8'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f5e6d3'}
                      >
                        {candidate.name}
                        <br />
                        <small style={{ fontSize: '0.85rem', color: '#666' }}>{candidate.party}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '8px' }}>
                      {candidatesWithRatings.find((c) => c.id === selectedAdjustCandidateId)?.name}
                    </h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                      {candidatesWithRatings.find((c) => c.id === selectedAdjustCandidateId)?.party}
                    </p>
                  </div>
                  
                  <p style={{ marginBottom: '16px', textAlign: 'center' }}>Selecciona un campo y ajusta en 0.1:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
                    {['propuestas', 'experiencia', 'escandalos'].map((field) => {
                      const candidate = candidatesWithRatings.find((c) => c.id === selectedAdjustCandidateId);
                      return (
                        <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                          <div>
                            <strong style={{ textTransform: 'capitalize' }}>{field}:</strong>
                            <br />
                            <span style={{ color: '#666', fontSize: '0.9rem' }}>{candidate?.stats[field] ?? 'N/A'}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                const candidate = candidatesWithRatings.find((c) => c.id === selectedAdjustCandidateId);
                                if (candidate) {
                                  const newValue = Math.max(0, candidate.stats[field] - 0.1);
                                  candidate.stats[field] = parseFloat(newValue.toFixed(1));
                                  setRatingMessage(`${field} de ${candidate.name} ajustado a ${newValue.toFixed(1)}`);
                                  setAdjustedCandidateId(candidate.id);
                                  setAdjustmentLocked(true);
                                  setShowAdjustmentModal(false);
                                  setSelectedAdjustCandidateId(null);
                                  window.setTimeout(() => setRatingMessage(''), 3000);
                                }
                              }}
                              disabled={adjustmentLocked}
                              className="btn-secondary"
                              style={{ padding: '8px 16px' }}
                            >
                              -0.1
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const candidate = candidatesWithRatings.find((c) => c.id === selectedAdjustCandidateId);
                                if (candidate) {
                                  const newValue = Math.min(10, candidate.stats[field] + 0.1);
                                  candidate.stats[field] = parseFloat(newValue.toFixed(1));
                                  setRatingMessage(`${field} de ${candidate.name} ajustado a ${newValue.toFixed(1)}`);
                                  setAdjustedCandidateId(candidate.id);
                                  setAdjustmentLocked(true);
                                  setShowAdjustmentModal(false);
                                  setSelectedAdjustCandidateId(null);
                                  window.setTimeout(() => setRatingMessage(''), 3000);
                                }
                              }}
                              disabled={adjustmentLocked}
                              className="btn-primary"
                              style={{ padding: '8px 16px' }}
                            >
                              +0.1
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAdjustCandidateId(null)}
                    className="btn-secondary"
                    style={{ width: '100%', padding: '10px' }}
                  >
                    Volver
                  </button>
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustmentModal(false);
                    setSelectedAdjustCandidateId(null);
                  }}
                  className="btn-primary"
                  style={{ padding: '12px 32px' }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {showRanking && <Ranking onClose={() => setShowRanking(false)} />}
      </div>
    );
  }

  return null;
};

export default App;
