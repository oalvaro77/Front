import React from 'react';

const decks = [
  { id: 'izquierda', label: 'Mazo Izquierda' },
  { id: 'centro', label: 'Mazo Centro' },
  { id: 'derecha', label: 'Mazo Derecha' },
];

const DeckSelector = ({ selectedDeck, onSelectDeck }) => {
  return (
    <section className="deck-selector">
      <div className="banner-container">
        <img
          src="/images/casa de nariño.png"
          alt="Casa de Nariño"
          className="banner-image"
        />
      </div>
      <h2>Selecciona un mazo político</h2>
      <div className="deck-buttons">
        {decks.map((deck) => (
          <button
            key={deck.id}
            type="button"
            className={deck.id === selectedDeck ? 'active' : ''}
            onClick={() => onSelectDeck(deck.id)}
          >
            {deck.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default DeckSelector;
