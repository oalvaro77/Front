export const trackEvent = (name, data = {}) => {
  console.log('[Analytics]', name, data);
  // Aquí se puede integrar con un servicio real como Google Analytics o Mixpanel.
};
