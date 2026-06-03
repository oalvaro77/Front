/**
 * Vercel Serverless Function
 * GET /api/stats - Obtiene el ranking global de candidatos
 *
 * Vercel KV (Redis) estructura de datos:
 * - Key: "candidate:{candidateId}" → Value: número de votos
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtener todos los keys de candidatos
    const keys = await kv.keys('candidate:*');

    if (!keys || keys.length === 0) {
      return res.status(200).json({ ranking: [], total: 0 });
    }

    // Obtener votos para cada candidato
    const candidateVotes = await Promise.all(
      keys.map(async (key) => {
        const candidateId = key.replace('candidate:', '');
        const votes = await kv.get(key);
        return { candidateId, votes: votes || 0 };
      })
    );

    // Ordenar por votos descendente
    const ranking = candidateVotes
      .sort((a, b) => b.votes - a.votes)
      .map((item) => ({
        id: item.candidateId,
        count: item.votes,
      }));

    // Calcular total de votos
    const totalVotes = candidateVotes.reduce((sum, item) => sum + item.votes, 0);

    return res.status(200).json({
      ranking,
      total: totalVotes,
      totalMatches: Math.floor(totalVotes / 4), // Aproximado
    });
  } catch (error) {
    console.error('[API /stats] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
