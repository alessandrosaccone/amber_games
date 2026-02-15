// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? (process.env.REACT_APP_API_URL || '')  // Produzione: Path relativi (Monolith)
    : (process.env.REACT_APP_API_URL || 'http://localhost:5000'); // Sviluppo: Localhost

export default API_BASE_URL;
