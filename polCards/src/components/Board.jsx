import React from 'react';
import Card from './Card';

const Board = ({
  playerHand = [],
  event,
  selectedDeck,
  selectedCandidateId,
  selectedOptionId,
  onSelectCandidate,
  onSelectOption,
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
          <h2>Decisiones políticas</h2>
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
        <section className="hand-panel player-hand">
          <h3>Tu equipo</h3>
          <p>Elige el candidato que quieres que represente tu decisión. El resultado depende de la opción, no del personaje.</p>
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

        <section className="options-panel">
          <h3>Opciones de respuesta</h3>
          <p>Selecciona la mejor acción para resolver la situación actual.</p>
          <div className="card-row">
            {event?.choices?.map((choice) => (
              <Card
                key={choice.id}
                title={choice.label}
                description={choice.description || choice.feedback}
                className={choice.id === selectedOptionId ? 'selected' : ''}
                onClick={() => onSelectOption(choice.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <footer className="board-footer">
        <button type="button" onClick={onPlayTurn} disabled={!canPlay || matchEnded}>
          Jugar turno
        </button>
      </footer>
    </section>
  );
};

export default Board;
