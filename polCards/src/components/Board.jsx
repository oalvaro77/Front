import React from 'react';
import Card from './Card';

const Board = () => {
  const cards = [
    { id: 'c1', title: 'Economía', strength: 7, description: 'Aumenta la popularidad entre votantes urbanos.' },
    { id: 'c2', title: 'Seguridad', strength: 5, description: 'Incrementa el apoyo en zonas rurales.' },
  ];

  return (
    <section className="board">
      <h2>Tablero de juego</h2>
      <div className="card-row">
        {cards.map((card) => (
          <Card key={card.id} {...card} />
        ))}
      </div>
    </section>
  );
};

export default Board;
