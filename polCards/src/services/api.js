const BASE_URL = 'https://api.policars.local';

export const fetchGameData = async (endpoint) => {
  const response = await fetch(`${BASE_URL}/${endpoint}`);
  if (!response.ok) {
    throw new Error('Error al obtener datos del servidor');
  }
  return response.json();
};

export const submitMatchResult = async (payload) => {
  const response = await fetch(`${BASE_URL}/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Error al enviar resultados');
  }

  return response.json();
};
