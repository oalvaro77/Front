const STORAGE_KEY = 'policards_candidate_ratings';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export function getLocalRatings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('[RatingsService] Error reading localStorage:', error);
    return {};
  }
}

export function saveLocalRatings(ratings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
    return ratings;
  } catch (error) {
    console.error('[RatingsService] Error saving local ratings:', error);
    return ratings;
  }
}

export function adjustCandidateRating(candidateId, delta) {
  const ratings = getLocalRatings();
  const currentRating = Number(ratings[candidateId] ?? 5.0);
  const nextRating = Number(Math.max(0, Math.min(10, currentRating + delta)).toFixed(1));
  const updatedRatings = { ...ratings, [candidateId]: nextRating };
  saveLocalRatings(updatedRatings);
  return updatedRatings;
}

export async function syncRatingAdjustment(candidateId, rating) {
  if (!API_BASE_URL) {
    throw new Error('API URL not configured');
  }

  const response = await fetch(`${API_BASE_URL}/api/stats/rating`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ candidateId, rating }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchCandidateRatings() {
  if (!API_BASE_URL) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/stats/rating`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data.ratings || null;
  } catch (error) {
    console.error('[RatingsService] Error fetching ratings from API:', error);
    return null;
  }
}
