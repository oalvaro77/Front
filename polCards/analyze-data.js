import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el archivo CSV
const csvContent = fs.readFileSync(path.join(__dirname, 'data', 'users.csv'), 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = lines[0].split(',');

// Parsear datos
const users = lines.slice(1).map(line => {
  const values = line.split(',');
  return {
    edad: parseInt(values[0]),
    genero: values[1],
    ciudad: values[2],
    correo: values[3],
    candidato_preferido: values[4],
  };
});

// Análisis 1: Votos por candidato
const votosPorCandidato = {};
users.forEach(user => {
  const candidato = user.candidato_preferido;
  votosPorCandidato[candidato] = (votosPorCandidato[candidato] || 0) + 1;
});

// Ordenar candidatos por votos
const candidatosOrdenados = Object.entries(votosPorCandidato)
  .sort((a, b) => b[1] - a[1])
  .map(([candidato, votos], index) => ({
    posicion: index + 1,
    candidato,
    votos,
    porcentaje: ((votos / users.length) * 100).toFixed(2),
  }));

// Análisis 2: Distribución por género
const distribucionGenero = {};
users.forEach(user => {
  const genero = user.genero;
  distribucionGenero[genero] = (distribucionGenero[genero] || 0) + 1;
});

// Análisis 3: Distribución por ciudad
const distribucionCiudad = {};
users.forEach(user => {
  const ciudad = user.ciudad;
  distribucionCiudad[ciudad] = (distribucionCiudad[ciudad] || 0) + 1;
});

const ciudadesOrdenadas = Object.entries(distribucionCiudad)
  .sort((a, b) => b[1] - a[1])
  .map(([ciudad, cantidad]) => ({
    ciudad,
    cantidad,
    porcentaje: ((cantidad / users.length) * 100).toFixed(2),
  }));

// Análisis 4: Distribución por edad
const edades = users.map(u => u.edad);
const edadPromedio = (edades.reduce((sum, edad) => sum + edad, 0) / edades.length).toFixed(2);
const edadMinima = Math.min(...edades);
const edadMaxima = Math.max(...edades);

// Rangos de edad
const rangosEdad = {
  '18-25': 0,
  '26-35': 0,
  '36-45': 0,
  '46-55': 0,
  '56-65': 0,
  '66+': 0,
};

users.forEach(user => {
  const edad = user.edad;
  if (edad >= 18 && edad <= 25) rangosEdad['18-25']++;
  else if (edad >= 26 && edad <= 35) rangosEdad['26-35']++;
  else if (edad >= 36 && edad <= 45) rangosEdad['36-45']++;
  else if (edad >= 46 && edad <= 55) rangosEdad['46-55']++;
  else if (edad >= 56 && edad <= 65) rangosEdad['56-65']++;
  else rangosEdad['66+']++;
});

// Análisis 5: Preferencias por género
const preferenciasPorGenero = {};
users.forEach(user => {
  const genero = user.genero;
  const candidato = user.candidato_preferido;

  if (!preferenciasPorGenero[genero]) {
    preferenciasPorGenero[genero] = {};
  }

  preferenciasPorGenero[genero][candidato] = (preferenciasPorGenero[genero][candidato] || 0) + 1;
});

// Análisis 6: Preferencias por ciudad (top 5 ciudades)
const top5Ciudades = ciudadesOrdenadas.slice(0, 5);
const preferenciasPorCiudad = {};

top5Ciudades.forEach(({ ciudad }) => {
  preferenciasPorCiudad[ciudad] = {};
  users.filter(u => u.ciudad === ciudad).forEach(user => {
    const candidato = user.candidato_preferido;
    preferenciasPorCiudad[ciudad][candidato] = (preferenciasPorCiudad[ciudad][candidato] || 0) + 1;
  });
});

// Exportar resultados
const resultados = {
  resumenGeneral: {
    totalUsuarios: users.length,
    totalCandidatos: Object.keys(votosPorCandidato).length,
  },
  candidatosRanking: candidatosOrdenados,
  ganador: candidatosOrdenados[0],
  distribucionGenero: Object.entries(distribucionGenero).map(([genero, cantidad]) => ({
    genero,
    cantidad,
    porcentaje: ((cantidad / users.length) * 100).toFixed(2),
  })),
  distribucionCiudad: ciudadesOrdenadas,
  estadisticasEdad: {
    promedio: parseFloat(edadPromedio),
    minima: edadMinima,
    maxima: edadMaxima,
    rangos: Object.entries(rangosEdad).map(([rango, cantidad]) => ({
      rango,
      cantidad,
      porcentaje: ((cantidad / users.length) * 100).toFixed(2),
    })),
  },
  preferenciasPorGenero,
  preferenciasPorCiudad,
};

console.log(JSON.stringify(resultados, null, 2));
