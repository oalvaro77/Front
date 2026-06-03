import React from 'react';

const OpinionBar = ({ approval = 50 }) => {
  const safeApproval = Math.min(100, Math.max(0, approval));

  return (
    <section className="opinion-bar">
      <h2>Opinión pública</h2>
      <div className="opinion-row">
        <div className="meter player-meter" style={{ width: '100%' }}>
          <span>Satisfacción ciudadana {safeApproval}%</span>
          <div className="meter-track">
            <div className="fill player-fill" style={{ width: `${safeApproval}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OpinionBar;
