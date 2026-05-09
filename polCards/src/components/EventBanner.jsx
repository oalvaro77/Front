import React from 'react';

const EventBanner = ({ message }) => {
  return (
    <aside className="event-banner">
      <p>{message}</p>
    </aside>
  );
};

export default EventBanner;
