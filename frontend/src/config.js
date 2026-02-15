const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? (process.env.REACT_APP_API_URL || '')  // Produzione: Path relativi (Monolith)
    : (process.env.REACT_APP_API_URL || 'http://localhost:5000'); // Sviluppo: Localhost

export const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    // Normalize path: removes leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // In sviluppo aggiungiamo il dominio backend, in produzione (monolith) usiamo path relativi
    const baseUrl = API_BASE_URL.includes('localhost') ? API_BASE_URL : '';

    // Se il path inizia con 'avatars/', è un asset statico del frontend (in public/avatars)
    // Quindi ritorniamo un path relativo (che in locale punta a localhost:3000, in prod allo stesso dominio)
    if (cleanPath.startsWith('avatars/')) {
        return `/${cleanPath}`;
    }

    // Se è un upload (starts with 'uploads/'), usiamo il server backend
    if (cleanPath.startsWith('uploads/')) {
        return `${baseUrl}/${cleanPath}`;
    }

    // Default: assumiamo sia un'immagine d'evento nella root di uploads
    return `${baseUrl}/uploads/${cleanPath}`;
};

export default API_BASE_URL;
