import React from 'react';

const Card = ({
  title,
  strength,
  description,
  name,
  party,
  type,
  image,
  stats,
  onClick,
  className,
}) => {
  const classes = ['card', className].filter(Boolean).join(' ');

  if (name) {
    return (
      <article className={classes} onClick={onClick}>
        <div className="card-portrait">
          {image ? <img src={image} alt={name} /> : <div className="card-placeholder">No Image</div>}
        </div>
        <header>
          <h3>{name}</h3>
          <p className="card-meta">{party} · {type}</p>
        </header>
        <div className="stats">
          <p>Propuestas: {stats.propuestas}</p>
          <p>Experiencia: {stats.experiencia}</p>
          <p>Escándalos: {stats.escandalos}</p>
        </div>
      </article>
    );
  }

  return (
    <article className={classes} onClick={onClick}>
      <header>
        <h3>{title}</h3>
        {strength !== undefined && <span className="strength">Fuerza: {strength}</span>}
      </header>
      <p>{description}</p>
    </article>
  );
};

export default Card;
