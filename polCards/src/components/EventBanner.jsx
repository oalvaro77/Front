import React from 'react';

const EventBanner = ({ event }) => {
  if (!event) {
    return (
      <aside className="event-banner">
        <p>Esperando el evento político...</p>
      </aside>
    );
  }

  return (
    <aside className="event-banner">
      <h2>🔔 Evento político</h2>
      <strong>{event.name}</strong>
      <p>{event.description}</p>
      <div className="event-modifiers">
        {Object.entries(event.modifiers).map(([ideology, modifier]) => (
          <div key={ideology}>
            <strong>{ideology}:</strong> {Object.entries(modifier)
              .map(([key, value]) => `${key} ${value > 0 ? '+' : ''}${value}`)
              .join(', ')}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default EventBanner;
