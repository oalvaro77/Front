import React from 'react';
import Board from './components/Board';
import DeckSelector from './components/DeckSelector';
import OpinionBar from './components/OpinionBar';
import EventBanner from './components/EventBanner';
import BattleLog from './components/BattleLog';

const App = () => {
  return (
    <div className="app-shell">
      <header>
        <h1>Policars 2</h1>
      </header>

      <main>
        <DeckSelector />
        <EventBanner message="La campaña está en marcha." />
        <OpinionBar approval={62} intensity={0.8} />
        <Board />
        <BattleLog entries={[{ time: '09:00', text: 'Comienza el debate' }]} />
      </main>
    </div>
  );
};

export default App;
