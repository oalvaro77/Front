import React from 'react';

const Card = ({ title, strength, description }) => {
  return (
    <article className="card">
      <header>
        <h3>{title}</h3>
        <span className="strength">Fuerza: {strength}</span>
      </header>
      <p>{description}</p>
    </article>
  );
};

export default Card;
