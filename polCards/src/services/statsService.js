/**
 * Stats Service - Maneja el tracking de selecciones de candidatos
 * Compatible con localStorage (offline) y API backend (Vercel)
 */

const STORAGE_KEY = 'policards_candidate_stats';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Obtiene las estadísticas actuales del localStorage
 * @returns {Object} Objeto con candidateId como key y count como value
 */
export function getLocalStats() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('[StatsService] Error reading localStorage:', error);
    return {};
  }
}

/**
 * Guarda una selección de candidato en localStorage
 * @param {string} candidateId - ID del candidato seleccionado
 */
export function recordCandidateSelection(candidateId) {
  try {
    const stats = getLocalStats();
    stats[candidateId] = (stats[candidateId] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    return stats[candidateId];
  } catch (error) {
    console.error('[StatsService] Error saving to localStorage:', error);
    return 0;
  }
}

/**
 * Guarda múltiples selecciones (los 4 candidatos de una partida)
 * @param {string[]} candidateIds - Array de IDs de candidatos seleccionados
 */
export function recordMatch(candidateIds) {
  try {
    const stats = getLocalStats();
    candidateIds.forEach((id) => {
      stats[id] = (stats[id] || 0) + 1;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));

    // Intentar sincronizar con API si está disponible
    syncWithAPI(candidateIds).catch((err) => {
      console.warn('[StatsService] API sync failed, data saved locally:', err.message);
    });

    return stats;
  } catch (error) {
    console.error('[StatsService] Error recording match:', error);
    return {};
  }
}

/**
 * Obtiene el ranking de candidatos más seleccionados
 * @param {Object} candidatesMap - Mapa de candidatos con información completa
 * @returns {Array} Array de candidatos ordenados por selecciones (descendente)
 */
export function getRanking(candidatesMap) {
  const stats = getLocalStats();

  // Convertir stats a array con información del candidato
  const ranking = Object.entries(stats)
    .map(([candidateId, count]) => ({
      id: candidateId,
      count,
      ...candidatesMap[candidateId], // Incluye name, party, type, image
    }))
    .sort((a, b) => b.count - a.count);

  return ranking;
}

/**
 * Obtiene el total de partidas jugadas (contando cada 4 selecciones como 1 partida)
 * @returns {number} Número aproximado de partidas
 */
export function getTotalMatches() {
  const stats = getLocalStats();
  const totalSelections = Object.values(stats).reduce((sum, count) => sum + count, 0);
  return Math.floor(totalSelections / 4); // Cada partida tiene 4 candidatos
}

/**
 * Limpia todas las estadísticas (útil para desarrollo/testing)
 */
export function clearLocalStats() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('[StatsService] Error clearing localStorage:', error);
    return false;
  }
}

// ========== API INTEGRATION ==========

/**
 * Sincroniza selecciones con el backend API (Vercel)
 * @param {string[]} candidateIds - Array de IDs de candidatos
 */
async function syncWithAPI(candidateIds) {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured');
  }

  const response = await fetch(`${API_BASE_URL}/api/stats/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ candidateIds }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Obtiene el ranking global desde la API
 * @returns {Promise<Array>} Ranking global de todos los jugadores
 */
export async function getGlobalRanking() {
  if (!API_BASE_URL) {
    console.warn('[StatsService] API not configured, returning local ranking only');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/stats`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.ranking || [];
  } catch (error) {
    console.error('[StatsService] Error fetching global ranking:', error);
    return null;
  }
}

/**
 * Obtiene stats combinados: locales + globales
 * @param {Object} candidatesMap - Mapa de candidatos
 * @returns {Promise<Object>} { local: Array, global: Array|null, totalMatches: number }
 */
export async function getCombinedStats(candidatesMap) {
  const localRanking = getRanking(candidatesMap);
  const globalRanking = await getGlobalRanking();
  const totalMatches = getTotalMatches();

  return {
    local: localRanking,
    global: globalRanking,
    totalMatches,
  };
}
