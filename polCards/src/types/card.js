/**
 * @typedef {Object} CardStats
 * @property {number} propuestas
 * @property {number} experiencia
 * @property {number} escandalos
 */

/**
 * @typedef {Object} Card
 * @property {string} id
 * @property {string} name
 * @property {string} party
 * @property {'izquierda'|'centro'|'derecha'} type
 * @property {string} image
 * @property {CardStats} stats
 */

/**
 * @typedef {Object} Narrative
 * @property {string} id
 * @property {string} name
 * @property {Object.<string, number>} effect
 */

/**
 * @typedef {Object} EventCard
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {Object.<string, Object.<string, number>>} modifiers
 */

export {}; // Mantener archivo como módulo
