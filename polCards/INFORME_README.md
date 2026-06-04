# Informe Estadístico - Policards 2

Este directorio contiene un análisis completo de las preferencias electorales basado en los datos de 100 usuarios del juego Policards 2.

## Archivos Generados

### 📊 Informes Principales

1. **INFORME_ESTADISTICO.md**
   - Informe completo en formato Markdown
   - Incluye análisis detallado, tablas, conclusiones y recomendaciones
   - Ideal para lectura en GitHub o editores de texto
   - **Recomendado para:** Lectura detallada y documentación

2. **informe-estadistico.html**
   - Informe visual e interactivo con gráficos
   - Incluye visualizaciones con Chart.js
   - Diseño responsive y profesional
   - **Recomendado para:** Presentaciones y visualización ejecutiva
   - **Cómo abrir:** Doble clic en el archivo o abrir en navegador

3. **data/estadisticas-completas.json**
   - Datos estructurados en formato JSON
   - Incluye todos los análisis y métricas calculadas
   - **Recomendado para:** Integración con aplicaciones o análisis programático

### 🔧 Herramientas de Análisis

4. **analyze-data.js**
   - Script Node.js para procesar datos del CSV
   - Genera análisis estadístico completo
   - **Uso:** `node analyze-data.js`

### 📁 Datos Fuente

5. **data/users.csv**
   - Datos originales de 100 usuarios
   - Columnas: edad, género, ciudad, correo, candidato_preferido

## Cómo Usar el Informe

### Ver el Informe Visual (HTML)

1. Abrir el archivo `informe-estadistico.html` en cualquier navegador web
2. El informe incluye:
   - Resumen ejecutivo con estadísticas clave
   - Tarjeta destacada del candidato ganador
   - Gráficos interactivos (pie charts, bar charts, doughnut charts)
   - Análisis demográfico con barras de progreso
   - Conclusiones y recomendaciones estratégicas

### Leer el Informe Completo (Markdown)

```bash
# Ver en terminal (con bat, glow, o similar)
bat INFORME_ESTADISTICO.md

# O abrir en VSCode
code INFORME_ESTADISTICO.md
```

### Usar los Datos en JSON

```javascript
// Ejemplo de uso en Node.js
const estadisticas = require('./data/estadisticas-completas.json');

console.log('Ganador:', estadisticas.ganador.nombre);
console.log('Votos:', estadisticas.ganador.votos);
console.log('Porcentaje:', estadisticas.ganador.porcentaje);

// Acceder al ranking
estadisticas.ranking_candidatos.forEach(candidato => {
  console.log(`${candidato.posicion}. ${candidato.nombre} - ${candidato.votos} votos`);
});
```

### Regenerar el Análisis

Si se actualizan los datos en `data/users.csv`:

```bash
# Ejecutar el script de análisis
node analyze-data.js > nuevos-resultados.json

# O simplemente ver en consola
node analyze-data.js
```

## Estructura del Informe

### 1. Resumen Ejecutivo
- Total de participantes: 100
- Total de candidatos: 13
- Total de ciudades: 20
- Edad promedio: 45.2 años

### 2. Resultados Principales

**Ganador:** Claudia López (16 votos, 16%)

**Top 3:**
1. Claudia López - 16 votos (16%)
2. Iván Cepeda Castro - 15 votos (15%)
3. Abelardo de la Espriella - 14 votos (14%)

### 3. Análisis Demográfico

**Por Género:**
- Masculino: 30%
- Otro: 26%
- Femenino: 22%
- Prefiero no decir: 22%

**Por Edad:**
- Promedio: 45.2 años
- Rango: 18-74 años
- Grupos dominantes: 26-35 y 46-55 años (26% cada uno)

**Por Ciudad:**
- Top 3: Popayán (10%), Bogotá (9%), Medellín (8%)
- Total de ciudades representadas: 20

### 4. Hallazgos Clave

1. **Competencia reñida:** Solo 2 votos separan los tres primeros lugares
2. **Centro político dominante:** 55% de votos para candidatos de centro
3. **Alta fragmentación:** Ningún candidato supera el 16%
4. **Diversidad demográfica:** 48% fuera del binario de género tradicional
5. **Electorado maduro:** Edad promedio de 45.2 años

## Visualizaciones Incluidas (HTML)

- 📊 Gráfico de torta: Distribución por tendencia política
- 📊 Gráfico de barras: Top 10 candidatos
- 📊 Gráfico circular: Distribución por género
- 📊 Gráfico de barras: Distribución por rango de edad
- 📊 Gráfico horizontal: Top 10 ciudades

## Recomendaciones Estratégicas

El informe incluye recomendaciones personalizadas para:
- Claudia López (1° lugar)
- Iván Cepeda Castro (2° lugar)
- Otros candidatos

## Exportación de Datos

### Para Excel
```javascript
// Convertir JSON a CSV
const json2csv = require('json2csv');
const estadisticas = require('./data/estadisticas-completas.json');
const csv = json2csv.parse(estadisticas.ranking_candidatos);
console.log(csv);
```

### Para Presentaciones
- Usar `informe-estadistico.html` directamente en el navegador
- Hacer capturas de pantalla de los gráficos
- Copiar tablas desde `INFORME_ESTADISTICO.md`

## Soporte Técnico

### Requisitos
- **Para HTML:** Cualquier navegador moderno (Chrome, Firefox, Safari, Edge)
- **Para JSON:** Node.js o cualquier lenguaje con parser JSON
- **Para Markdown:** Visor de Markdown (VSCode, GitHub, etc.)
- **Para scripts:** Node.js 14+

### Dependencias del script
```bash
# No requiere instalación de paquetes adicionales
# Solo Node.js nativo con módulos fs y path
```

## Contacto y Contribuciones

Para preguntas o sugerencias sobre el informe:
- Revisar los archivos generados
- Modificar `analyze-data.js` para análisis personalizados
- Actualizar `data/users.csv` con nuevos datos

---

**Fecha de generación:** 4 de junio de 2026
**Versión:** 1.0
**Proyecto:** Policards 2 - Análisis Electoral
