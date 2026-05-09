import React from 'react';

const decks = [
  { id: 'progressive', label: 'Progresista' },
  { id: 'traditional', label: 'Tradicional' },
  { id: 'populist', label: 'Populista' },
];

const DeckSelector = () => {
  return (
    <section className="deck-selector">
      <h2>Selecciona un mazo</h2>
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
