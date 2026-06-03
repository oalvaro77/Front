/**
 * Vercel Serverless Function
 * POST /api/stats/vote - Registra votos de candidatos seleccionados
 *
 * Body esperado:
 * {
 *   "candidateIds": ["ivan-cepeda", "claudia-lopez", "sergio-fajardo", "clara-lopez"]
 * }
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { candidateIds } = req.body;

    // Validar que se envió un array de IDs
    if (!Array.isArray(candidateIds) || candidateIds.length !== 4) {
      return res.status(400).json({
        error: 'Invalid request. Expected array of 4 candidate IDs',
      });
    }

    // Validar que todos los IDs son strings no vacíos
    if (!candidateIds.every((id) => typeof id === 'string' && id.length > 0)) {
      return res.status(400).json({
        error: 'Invalid candidate IDs. All IDs must be non-empty strings',
      });
    }

    // Incrementar contador para cada candidato usando transacción atómica
    const results = await Promise.all(
      candidateIds.map(async (candidateId) => {
        const key = `candidate:${candidateId}`;
        const newCount = await kv.incr(key);
        return { candidateId, newCount };
      })
    );

    // Registrar timestamp de la votación
    await kv.zadd('votes:timeline', {
      score: Date.now(),
      member: JSON.stringify({ candidateIds, timestamp: new Date().toISOString() }),
    });

    return res.status(200).json({
      success: true,
      results,
      message: 'Votes recorded successfully',
    });
  } catch (error) {
    console.error('[API /stats/vote] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
