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
      <p className="event-tip">Selecciona la mejor opción para esta crisis; el candidato elegido es solo tu portavoz.</p>
    </aside>
  );
};

export default EventBanner;
