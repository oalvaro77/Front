import React from 'react';
import Card from './Card';

const Board = ({
  playerHand = [],
  cpuHand = [],
  playerNarratives = [],
  event,
  selectedDeck,
  selectedCandidateId,
  selectedNarrativeId,
  onSelectCandidate,
  onSelectNarrative,
  onPlayTurn,
  canPlay,
  turnNumber,
  maxTurns,
  matchEnded,
}) => {
  return (
    <section className="board">
      <header className="board-header">
        <div>
          <h2>Duelo político</h2>
          <p>Mazo activo: <strong>{selectedDeck}</strong></p>
          <p>Turno {turnNumber} / {maxTurns}</p>
        </div>
        {event && (
          <div className="event-summary">
            <strong>Evento activo:</strong>
            <p>{event.name}</p>
            <small>{event.description}</small>
          </div>
        )}
      </header>

      <div className="board-grid">
        <section className="hand-panel cpu-hand">
          <h3>Mano CPU</h3>
          <div className="card-row">
            {cpuHand.map((card) => (
              <Card key={card.id} {...card} className="card-back" />
            ))}
          </div>
        </section>

        <section className="hand-panel player-hand">
          <h3>Tu mano</h3>
          <div className="card-row">
            {playerHand.map((card) => (
              <Card
                key={card.id}
                {...card}
                className={card.id === selectedCandidateId ? 'selected' : ''}
                onClick={() => onSelectCandidate(card.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="narrative-panel">
        <h3>Narrativas disponibles</h3>
        <div className="card-row">
          {playerNarratives.map((narrative) => (
            <Card
              key={narrative.id}
              title={narrative.name}
              description={`Efecto: ${Object.entries(narrative.effect)
                .map(([key, value]) => `${key} ${value > 0 ? '+' : ''}${value}`)
                .join(', ')}`}
              className={narrative.id === selectedNarrativeId ? 'selected' : ''}
              onClick={() => onSelectNarrative(narrative.id)}
            />
          ))}
        </div>
      </section>

      <footer className="board-footer">
        <button type="button" onClick={onPlayTurn} disabled={!canPlay || matchEnded}>
          Jugar turno
        </button>
      </footer>
    </section>
  );
};

export default Board;
