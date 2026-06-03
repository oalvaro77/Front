import React from 'react';

const decks = [
  { id: 'izquierda', label: 'Izquierda' },
  { id: 'centro', label: 'Centro' },
  { id: 'derecha', label: 'Derecha' },
];

const DeckSelector = ({ filters = {}, onToggleFilter }) => {
  return (
    <section className="deck-selector">
      <div className="banner-container">
        <img
          src="/images/casa de nariño.png"
          alt="Casa de Nariño"
          className="banner-image"
        />
      </div>
      <h2>Filtra candidatos por corriente</h2>
      <p>Selecciona o desactiva izquierda, centro o derecha para ajustar la lista.</p>
      <div className="deck-buttons">
        {decks.map((deck) => (
          <button
            key={deck.id}
            type="button"
            className={filters[deck.id] ? 'active' : ''}
            onClick={() => onToggleFilter(deck.id)}
          >
            {deck.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default DeckSelector;
