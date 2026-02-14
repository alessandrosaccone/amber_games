// API Configuration
// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? (process.env.REACT_APP_API_URL || '')  // Uso relativo in produzione (o override se settato)
    : (process.env.REACT_APP_API_URL || 'http://localhost:5000'); // Uso localhost in sviluppo

export default API_BASE_URL;
