# CLAUDE.md

Esta guía describe el estado actual del proyecto y qué debe hacer el agente de Claude integrado en Visual Studio Code.

## Proyecto

Policards 2 es una experiencia de política gamificada en React + Vite. El juego ahora está diseñado para que:
- todos los candidatos comiencen con los mismos valores base,
- el modo sea más interactivo con candidatos enfrentándose a crisis nacionales,
- al terminar una partida el jugador pueda ajustar el rating de un candidato en +0.1 o -0.1,
- los ajustes se guarden localmente y se sincronicen con una API en la nube cuando esté disponible.

## Flujo del juego actual

1. El jugador elige 4 candidatos y 2 narrativas.
2. Se construye una partida con una mano de jugador, una mano de CPU y una baraja de eventos.
3. Cada turno se resuelve entre el candidato elegido y una acción de la CPU.
4. Al finalizar, el resultado se muestra y el jugador puede ajustar ratings de candidatos.
5. Las selecciones de la partida se guardan en localStorage y se intentan sincronizar con el backend.

## Cambios implementados

### Igualdad de valores base de candidatos
- En `src/data/candidates.js`, todos los candidatos ahora inician con `stats: { propuestas: 5, experiencia: 5, escandalos: 5 }`.
- Cada candidato tiene un `rating` inicial de `5.0`.
- Se corrigió que cada candidato tenga un objeto `stats` independiente para evitar mutaciones compartidas.

### Ajuste de rating persistente
- Nuevo servicio: `src/services/ratingsService.js`
  - `getLocalRatings()`
  - `saveLocalRatings()`
  - `adjustCandidateRating(candidateId, delta)`
  - `fetchCandidateRatings()`
  - `syncRatingAdjustment(candidateId, rating)`
- En `src/App.jsx` se cargan ratings locales al iniciar y se mezclan con la API cuando está disponible.
- En la pantalla final se muestra un panel para subir o bajar en `0.1` el rating de cada candidato jugado.

### Conexión con backend
- Se agregó el endpoint serverless `api/stats/rating.js`:
  - GET `/api/stats/rating` → obtiene ratings persistidos
  - POST `/api/stats/rating` → actualiza el rating de un candidato
- Se mantiene el endpoint existente:
  - POST `/api/stats/vote` → registra selecciones de candidatos por partida

### UI actualizada
- `src/components/Card.jsx` ahora muestra el `rating` si está disponible.
- `src/App.jsx` usa `candidatesWithRatings` para que todos los datos del juego respeten la valoración dinámica.

## Arquitectura relevante

### `src/App.jsx`
- Maneja los estados de pantalla (`deck`, `candidates`, `battle`, `end`).
- Usa `useMemo` para mantener la lista de candidatos con ratings dinámicos.
- Llama a `recordMatch()` para guardar la participación del jugador.
- Agrega `handleRatingChange()` para modificar ratings de candidatos después de la partida.

### `src/services/ratingsService.js`
- Define persistencia local y opcional sincronización a la nube.
- Usa `import.meta.env.VITE_API_URL` para determinar si se debe intentar enviar datos a la API.

### `api/stats/rating.js`
- Implementa un endpoint Vercel KV storage para persistir los ratings.
- Permite lectura y escritura de ratings por candidato.

## Instrucciones para el agente de Claude en VS Code

### Qué debe hacer el agente
1. Abrir `src/data/candidates.js` y verificar que todos los candidatos tengan datos base iguales y objetos `stats` únicos.
2. Abrir `src/services/ratingsService.js` y validar que la persistencia local funcione junto con la API.
3. Abrir `src/App.jsx` y confirmar que:
   - la pantalla de fin de partida permite ajustes `+0.1` y `-0.1` por candidato,
   - los ratings se cargan desde `localStorage` y se mezclan con `GET /api/stats/rating`,
   - los cambios se sincronizan con `POST /api/stats/rating`.
4. Abrir `api/stats/rating.js` y revisar la validación de `candidateId` y `rating`.
5. Ejecutar pruebas básicas en el flujo de partida y comprobar que no hay errores de importación.

### Frase sugerida para el chat integrado de VS Code

> "Actualiza el modo de juego para que todos los candidatos empiecen con los mismos valores base y agrega una pantalla final donde el jugador pueda ajustar el rating de cada candidato jugado en ±0.1. Guarda esos ajustes en localStorage y sincronízalos con el backend en `/api/stats/rating`. Revisa `src/data/candidates.js`, `src/App.jsx`, `src/services/ratingsService.js` y `api/stats/rating.js`."

## Notas de integración

- `VITE_API_URL` se usa para configurar el backend.
- Si no hay backend, el juego funciona con localStorage y los ratings se preservan en el navegador.
- El backend existente de votos permanece activo como fuente de ranking de selecciones.

## Comandos de desarrollo

```bash
npm run dev
vite build
npm run preview
npm run lint
```

## Observaciones

- El proyecto fue adaptado hacia un modo más analítico y de crisis nacionales en lugar de un duelo directo de candidatos.
- El valor de los candidatos ahora es dinámico y puede ajustarse con mejores criterios tras terminar cada partida.

