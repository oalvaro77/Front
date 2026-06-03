import React, { useEffect, useState } from 'react';
import { getCombinedStats } from '../services/statsService';
import { politicians } from '../data/candidates';

/**
 * Componente Ranking - Muestra los candidatos más seleccionados
 * Datos locales + ranking global (cuando API esté disponible)
 */
const Ranking = ({ onClose }) => {
  const [stats, setStats] = useState({ local: [], global: null, totalMatches: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('local'); // 'local' | 'global'

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Crear mapa de candidatos para fácil lookup
      const candidatesMap = politicians.reduce((acc, politician) => {
        acc[politician.id] = politician;
        return acc;
      }, {});

      const data = await getCombinedStats(candidatesMap);
      setStats(data);
    } catch (error) {
      console.error('[Ranking] Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentRanking = viewMode === 'local' ? stats.local : stats.global;

  return (
    <div className="ranking-overlay">
      <div className="ranking-container">
        <header className="ranking-header">
          <h2>Ranking de Candidatos</h2>
          <button className="ranking-close-btn" onClick={onClose} aria-label="Cerrar ranking">
            ✕
          </button>
        </header>

        {stats.totalMatches > 0 && (
          <p className="ranking-meta">
            Has jugado {stats.totalMatches} {stats.totalMatches === 1 ? 'partida' : 'partidas'}
          </p>
        )}

        {/* Tabs para cambiar entre local y global */}
        {stats.global && (
          <div className="ranking-tabs">
            <button
              className={`ranking-tab ${viewMode === 'local' ? 'active' : ''}`}
              onClick={() => setViewMode('local')}
            >
              Tus Estadísticas
            </button>
            <button
              className={`ranking-tab ${viewMode === 'global' ? 'active' : ''}`}
              onClick={() => setViewMode('global')}
            >
              Ranking Global
            </button>
          </div>
        )}

        <div className="ranking-content">
          {loading ? (
            <div className="ranking-loading">Cargando estadísticas...</div>
          ) : currentRanking && currentRanking.length > 0 ? (
            <ol className="ranking-list">
              {currentRanking.map((candidate, index) => (
                <li key={candidate.id} className="ranking-item">
                  <div className="ranking-position">{index + 1}</div>
                  <div className="ranking-portrait">
                    {candidate.image ? (
                      <img src={candidate.image} alt={candidate.name} />
                    ) : (
                      <div className="ranking-placeholder">?</div>
                    )}
                  </div>
                  <div className="ranking-info">
                    <h4>{candidate.name}</h4>
                    <p className="ranking-party">
                      {candidate.party} · {candidate.type}
                    </p>
                  </div>
                  <div className="ranking-count">
                    <strong>{candidate.count}</strong>
                    <span>{candidate.count === 1 ? 'vez' : 'veces'}</span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="ranking-empty">
              <p>Aún no hay datos de ranking.</p>
              <p>Juega algunas partidas para ver tus candidatos favoritos aquí.</p>
            </div>
          )}
        </div>

        <footer className="ranking-footer">
          <button className="btn-primary" onClick={onClose}>
            Volver
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Ranking;
