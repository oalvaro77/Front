# Policards 2 - Guía de Deployment

Esta guía explica cómo deployar Policards 2 en Vercel con todas las funcionalidades implementadas.

## Cambios Implementados

### 1. Stats Promedio para Todos los Candidatos
- Todos los candidatos ahora tienen las mismas características (propuestas: 75, experiencia: 74, escándalos: 19)
- La selección se basa en preferencia personal, no en ventajas estadísticas
- Ver: `src/data/candidates.js`

### 2. Sistema de Ranking de Candidatos
- Tracking local con localStorage (funciona offline)
- Sincronización automática con API backend (cuando está disponible)
- Componente visual para ver candidatos más elegidos
- Ver: `src/services/statsService.js`, `src/components/Ranking.jsx`

### 3. API Backend Serverless (Vercel)
- Dos endpoints: GET /api/stats y POST /api/stats/vote
- Base de datos: Vercel KV (Redis serverless)
- Compatible con deployment en Vercel
- Ver: carpeta `/api`

## Estructura del Proyecto

```
polCards/
├── api/                      # Vercel Serverless Functions
│   ├── stats/
│   │   ├── index.js         # GET - Obtener ranking
│   │   └── vote.js          # POST - Registrar votos
│   └── README.md            # Documentación de la API
├── src/
│   ├── components/
│   │   └── Ranking.jsx      # Componente de ranking (NUEVO)
│   ├── services/
│   │   └── statsService.js  # Servicio de tracking (NUEVO)
│   └── data/
│       └── candidates.js    # Stats promedio (MODIFICADO)
├── vercel.json              # Configuración de Vercel (NUEVO)
├── .env.example             # Variables de entorno (NUEVO)
└── DEPLOYMENT.md            # Este archivo (NUEVO)
```

## Setup Inicial

### 1. Instalar Dependencias

```bash
npm install
```

Esto instalará:
- React 19
- @vercel/kv (para las serverless functions)
- Vite y todas las dev dependencies

### 2. Configurar Variables de Entorno (Opcional para desarrollo)

```bash
cp .env.example .env
```

Edita `.env`:
```env
VITE_API_URL=http://localhost:3000  # Para desarrollo local con vercel dev
```

**Nota:** En producción, Vercel configura esto automáticamente.

## Desarrollo Local

### Opción A: Solo Frontend (Sin API)
```bash
npm run dev
```
- El ranking funcionará con localStorage solamente
- No se sincronizará con base de datos global
- Útil para desarrollar UI

### Opción B: Frontend + API Local (Con Vercel CLI)
```bash
# 1. Instalar Vercel CLI (una sola vez)
npm i -g vercel

# 2. Configurar Vercel KV local (primera vez)
vercel link
vercel env pull

# 3. Iniciar servidor completo
vercel dev
```
- Frontend en `http://localhost:3000`
- API en `http://localhost:3000/api/*`
- Base de datos KV funcional

## Deployment a Vercel

### Método 1: Deploy desde GitHub (Recomendado)

1. **Sube tu código a GitHub:**
   ```bash
   git add .
   git commit -m "feat: add ranking system and serverless API"
   git push origin main
   ```

2. **Conecta con Vercel:**
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente Vite

3. **Configura Vercel KV:**
   - En Vercel Dashboard, ve a tu proyecto
   - Storage → Create Database → KV
   - Nombra la DB: `policards-stats`
   - Vercel conectará automáticamente las variables de entorno

4. **Deploy:**
   - Vercel hará deploy automático cada vez que hagas push a main
   - También puedes hacer deploy manual desde el Dashboard

### Método 2: Deploy Manual (CLI)

```bash
# 1. Login a Vercel
vercel login

# 2. Deploy
vercel

# 3. Promover a producción (si es necesario)
vercel --prod
```

## Post-Deployment

### 1. Verificar que la API funciona

```bash
# Obtener ranking (debería estar vacío inicialmente)
curl https://tu-proyecto.vercel.app/api/stats

# Registrar un voto de prueba
curl -X POST https://tu-proyecto.vercel.app/api/stats/vote \
  -H "Content-Type: application/json" \
  -d '{"candidateIds":["sergio-fajardo","claudia-lopez","ivan-cepeda","clara-lopez"]}'
```

### 2. Actualizar URL en el Frontend

Si tu dominio es diferente al generado automáticamente por Vercel:

1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Agrega: `VITE_API_URL` = `https://tu-dominio.vercel.app`
3. Redeploy: `vercel --prod`

### 3. Probar el Ranking

1. Juega algunas partidas
2. Haz clic en "Ver Ranking" desde la pantalla principal
3. Verifica que los candidatos seleccionados aparecen en el ranking

## Arquitectura de Datos

### LocalStorage (Fallback)
```javascript
Key: "policards_candidate_stats"
Value: {
  "sergio-fajardo": 15,
  "claudia-lopez": 12,
  "ivan-cepeda": 8,
  ...
}
```

### Vercel KV (Global)
```
Key: "candidate:sergio-fajardo"    → Value: 150
Key: "candidate:claudia-lopez"      → Value: 142
Key: "candidate:ivan-cepeda"        → Value: 89
Key: "votes:timeline"               → Sorted Set con historial
```

## Flujo de Datos

```
1. Usuario juega partida → Selecciona 4 candidatos
2. Al terminar partida:
   a) Se guarda en localStorage inmediatamente
   b) Se intenta enviar a API /api/stats/vote
   c) Si API falla, datos permanecen en localStorage
3. Al abrir Ranking:
   a) Se muestran datos de localStorage (siempre disponible)
   b) Se intenta obtener ranking global de /api/stats
   c) Se muestran ambos rankings (local + global)
```

## Monitoreo y Logs

### Ver Logs de la API
1. Vercel Dashboard → Tu Proyecto → Logs
2. Filtra por `/api/stats` para ver requests

### Analytics
1. Vercel Dashboard → Tu Proyecto → Analytics
2. Verifica requests, latencia y errores

### Base de Datos
1. Vercel Dashboard → Storage → Tu KV Database
2. Puedes ejecutar comandos Redis directamente:
   ```
   KEYS candidate:*
   GET candidate:sergio-fajardo
   ZRANGE votes:timeline 0 -1 WITHSCORES
   ```

## Costos

### Vercel Free Tier incluye:
- ✅ Hosting ilimitado
- ✅ Serverless Functions (100 GB-hours/mes)
- ✅ Bandwidth (100 GB/mes)
- ✅ Vercel KV (200 MB, 100K comandos/mes)

**Suficiente para:**
- Varios miles de jugadores activos
- ~25,000 partidas al mes (100K comandos / 4 candidatos)

### Escalado (Si necesitas más):
- Vercel Pro: $20/mes
  - KV ilimitado con pricing por uso
  - Más bandwidth y functions

## Troubleshooting

### Error: "Cannot find module '@vercel/kv'"
```bash
npm install @vercel/kv
```

### Error: "KV_REST_API_URL is not defined"
- Crea una base de datos KV en Vercel Dashboard
- Variables se configuran automáticamente en deployment

### El ranking no se actualiza
- Verifica que la API esté respondiendo: `https://tu-proyecto.vercel.app/api/stats`
- Revisa los logs en Vercel Dashboard
- Comprueba que CORS esté configurado (ya incluido en `vercel.json`)

### localStorage funciona pero API no
- El juego sigue funcionando solo con datos locales
- Usuarios verán solo su ranking personal
- Para arreglarlo: verifica configuración de Vercel KV

## Roadmap Futuro (Opcional)

Ideas para extender el sistema:

1. **Autenticación:**
   - Agregar login con OAuth (Google, Twitter)
   - Tracking por usuario específico

2. **Analytics Avanzados:**
   - Heatmap de ideologías más populares
   - Estadísticas por hora/día
   - Correlación entre narrativas y candidatos

3. **Ranking Temporal:**
   - Top de la semana/mes
   - Candidatos trending

4. **Social Features:**
   - Compartir resultados en redes sociales
   - Comparar con amigos

## Soporte

Para más información sobre Vercel:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel KV Guide](https://vercel.com/docs/storage/vercel-kv)
- [Serverless Functions](https://vercel.com/docs/functions)

---

**Nota:** Este proyecto está listo para producción y escala automáticamente con Vercel. No requiere configuración de servidores, bases de datos o infraestructura adicional.
