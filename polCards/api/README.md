# Policards 2 - API Serverless (Vercel)

Esta carpeta contiene las Serverless Functions para el backend de Policards 2, diseñadas para deployarse en Vercel.

## Estructura de la API

```
api/
└── stats/
    ├── index.js    # GET  /api/stats       - Obtener ranking global
    └── vote.js     # POST /api/stats/vote  - Registrar votos
```

## Endpoints

### GET /api/stats
Obtiene el ranking global de candidatos más seleccionados.

**Respuesta:**
```json
{
  "ranking": [
    {
      "id": "sergio-fajardo",
      "count": 150
    },
    {
      "id": "claudia-lopez",
      "count": 142
    }
  ],
  "total": 580,
  "totalMatches": 145
}
```

### POST /api/stats/vote
Registra una selección de 4 candidatos de una partida.

**Request Body:**
```json
{
  "candidateIds": [
    "ivan-cepeda",
    "claudia-lopez",
    "sergio-fajardo",
    "clara-lopez"
  ]
}
```

**Respuesta:**
```json
{
  "success": true,
  "results": [
    { "candidateId": "ivan-cepeda", "newCount": 45 },
    { "candidateId": "claudia-lopez", "newCount": 143 },
    { "candidateId": "sergio-fajardo", "newCount": 151 },
    { "candidateId": "clara-lopez", "newCount": 67 }
  ],
  "message": "Votes recorded successfully"
}
```

### GET /api/stats/rating
Obtiene los ratings persistidos para cada candidato.

**Respuesta:**
```json
{
  "ratings": {
    "ivan-cepeda": 5.1,
    "claudia-lopez": 4.9
  }
}
```

### POST /api/stats/rating
Actualiza el rating de un candidato tras finalizar una partida.

**Request Body:**
```json
{
  "candidateId": "ivan-cepeda",
  "rating": 5.1
}
```

**Respuesta:**
```json
{
  "success": true,
  "candidateId": "ivan-cepeda",
  "rating": 5.1
}
```

## Base de Datos: Vercel KV (Redis)

### Estructura de Datos

**Votos por candidato:**
- Key: `candidate:{candidateId}`
- Value: número entero (contador)
- Ejemplo: `candidate:sergio-fajardo` → `150`

**Timeline de votaciones:**
- Key: `votes:timeline`
- Type: Sorted Set (ZADD)
- Score: timestamp
- Member: JSON con candidateIds y timestamp

## Setup y Deployment

### 1. Instalar Vercel CLI (opcional para desarrollo local)

```bash
npm i -g vercel
```

### 2. Instalar dependencias del proyecto

```bash
npm install
```

### 3. Agregar Vercel KV al proyecto

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Navega a: **Storage → Create Database → KV**
3. Crea una base de datos KV (nombre sugerido: `policards-stats`)
4. Vercel configurará automáticamente las variables de entorno

### 4. Configurar variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` y configura:
```
VITE_API_URL=https://tu-proyecto.vercel.app
```

### 5. Deploy a Vercel

**Opción A: Deploy desde GitHub (Recomendado)**
1. Push tu código a GitHub
2. Conecta el repositorio en Vercel Dashboard
3. Vercel desplegará automáticamente

**Opción B: Deploy manual con CLI**
```bash
vercel
```

### 6. Testing Local (Opcional)

Para probar las functions localmente con Vercel CLI:

```bash
# Descargar variables de entorno de Vercel
vercel env pull

# Iniciar servidor de desarrollo
vercel dev
```

El servidor local estará disponible en `http://localhost:3000`

## Configuración de CORS

El archivo `vercel.json` ya incluye headers CORS que permiten requests desde cualquier origen. Para producción, considera restringir el origen a tu dominio:

```json
{
  "key": "Access-Control-Allow-Origin",
  "value": "https://tu-dominio.vercel.app"
}
```

## Monitoreo

Vercel provee logs y analytics automáticamente:
- **Logs:** Vercel Dashboard → Tu Proyecto → Logs
- **Analytics:** Vercel Dashboard → Tu Proyecto → Analytics

## Seguridad

- Las functions usan rate limiting automático de Vercel
- Validación de inputs en cada endpoint
- Redis (Vercel KV) es serverless y auto-escalable
- No requiere autenticación para esta versión (solo lectura/escritura pública)

## Costo

- Vercel KV incluye:
  - **Hobby plan:** 200 MB storage, 100K comandos/mes GRATIS
  - **Pro plan:** Escalado según uso

Para más información: [Vercel KV Pricing](https://vercel.com/docs/storage/vercel-kv/usage-and-pricing)

## Troubleshooting

**Error: "@vercel/kv" no encontrado**
```bash
npm install @vercel/kv
```

**Error: KV_REST_API_URL no definido**
- Asegúrate de haber creado una base de datos KV en Vercel Dashboard
- Las variables se configuran automáticamente en deploy

**Error 405: Method not allowed**
- Verifica que estés usando el método HTTP correcto (GET o POST)

**Error 500 en producción**
- Revisa los logs en Vercel Dashboard
- Verifica que la base de datos KV esté conectada al proyecto
