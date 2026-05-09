import React from 'react';

const OpinionBar = ({ playerOpinion = 50, cpuOpinion = 50 }) => {
  const safePlayer = Math.min(100, Math.max(0, playerOpinion));
  const safeCpu = Math.min(100, Math.max(0, cpuOpinion));

  return (
    <section className="opinion-bar">
      <h2>Opinión pública</h2>
      <div className="opinion-row">
        <div className="meter player-meter">
          <span>Jugador {safePlayer}</span>
          <div className="meter-track">
            <div className="fill player-fill" style={{ width: `${safePlayer}%` }} />
          </div>
        </div>
        <div className="meter cpu-meter">
          <span>CPU {safeCpu}</span>
          <div className="meter-track">
            <div className="fill cpu-fill" style={{ width: `${safeCpu}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OpinionBar;
