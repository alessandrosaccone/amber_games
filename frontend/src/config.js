const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? (process.env.REACT_APP_API_URL || '')  // Produzione: Path relativi (Monolith)
    : (process.env.REACT_APP_API_URL || 'http://localhost:5000'); // Sviluppo: Localhost

export const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    // Normalizziamo il path (rimuoviamo slash iniziale)
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // In sviluppo usciamo il dominio backend (localhost:5000), in produzione path relativi (Monolith)
    const baseUrl = API_BASE_URL.includes('localhost') ? API_BASE_URL : '';

    // Se il path ha già un prefisso conosciuto, lo usiamo così com'è
    if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('avatars/')) {
        return `${baseUrl}/${cleanPath}`;
    }

    // Default: se è solo un nome file senza cartella, assumiamo sia nella root di uploads
    return `${baseUrl}/uploads/${cleanPath}`;
};

export default API_BASE_URL;
