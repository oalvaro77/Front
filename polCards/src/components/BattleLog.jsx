import React from 'react';

const BattleLog = ({ entries = [] }) => {
  return (
    <section className="battle-log">
      <h2>Registro de batalla</h2>
      <ul>
        {entries.map((entry, index) => (
          <li key={index}>
            <span>{entry.time}</span> - <span>{entry.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default BattleLog;
