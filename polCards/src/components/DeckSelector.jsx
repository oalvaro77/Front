import React from 'react';

const decks = [
  { id: 'izquierda', label: 'Mazo Izquierda' },
  { id: 'centro', label: 'Mazo Centro' },
  { id: 'derecha', label: 'Mazo Derecha' },
];

const DeckSelector = () => {
  return (
    <section className="deck-selector">
      <h2>Selecciona un mazo político</h2>
      <div className="deck-buttons">
        {decks.map((deck) => (
          <button key={deck.id} type="button">
            {deck.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default DeckSelector;
