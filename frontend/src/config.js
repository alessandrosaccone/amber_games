const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? (process.env.REACT_APP_API_URL || '')  // Produzione: Path relativi (Monolith)
    : (process.env.REACT_APP_API_URL || 'http://localhost:5000'); // Sviluppo: Localhost

export const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    // In sviluppo aggiungiamo il dominio backend, in produzione (monolith) usiamo path relativi
    const baseUrl = API_BASE_URL.includes('localhost') ? API_BASE_URL : '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // Se il path ha già il prefisso corretto (/uploads/ o /avatars/), lo usiamo
    if (cleanPath.startsWith('/uploads/') || cleanPath.startsWith('/avatars/')) {
        return `${baseUrl}${cleanPath}`;
    }

    // Default: assumiamo sia un'immagine d'evento nella root di uploads
    return `${baseUrl}/uploads${cleanPath}`;
};

export default API_BASE_URL;
