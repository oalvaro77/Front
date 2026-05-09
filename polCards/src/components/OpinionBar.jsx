import React from 'react';

const OpinionBar = ({ approval, intensity }) => {
  const width = Math.min(100, Math.max(0, approval));
  return (
    <section className="opinion-bar">
      <h2>Opinión pública</h2>
      <div className="meter">
        <div className="fill" style={{ width: `${width}%` }} />
      </div>
      <p>
        Nivel de aprobación: <strong>{approval}%</strong> - Intensidad: <strong>{Math.round(intensity * 100)}%</strong>
      </p>
    </section>
  );
};

export default OpinionBar;
