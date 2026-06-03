/**
 * Vercel Serverless Function
 * GET /api/stats/rating - Obtiene los ratings persistidos de candidatos
 * POST /api/stats/rating - Actualiza el rating de un candidato
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const keys = await kv.keys('candidate:rating:*');
      const ratings = {};

      await Promise.all(
        keys.map(async (key) => {
          const candidateId = key.replace('candidate:rating:', '');
          const value = await kv.get(key);
          ratings[candidateId] = value !== null ? Number(value) : 5.0;
        })
      );

      return res.status(200).json({ ratings });
    } catch (error) {
      console.error('[API /stats/rating] GET Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { candidateId, rating } = req.body;

      if (typeof candidateId !== 'string' || candidateId.trim() === '') {
        return res.status(400).json({ error: 'Invalid candidateId' });
      }

      const numericRating = Number(rating);
      if (Number.isNaN(numericRating) || numericRating < 0 || numericRating > 10) {
        return res.status(400).json({ error: 'Invalid rating. Must be a number between 0 and 10.' });
      }

      await kv.set(`candidate:rating:${candidateId}`, numericRating);

      return res.status(200).json({ success: true, candidateId, rating: numericRating });
    } catch (error) {
      console.error('[API /stats/rating] POST Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
