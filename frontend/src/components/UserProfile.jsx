import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL, { getMediaUrl } from '../config';

function UserProfile() {
    const { userName } = useParams();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [userAvatar, setUserAvatar] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Events
                const eventsRes = await axios.get(`${API_BASE_URL}/api/events/user/${userName}`);
                setEvents(eventsRes.data);

                // 2. Fetch User Avatar from names list
                const namesRes = await axios.get(`${API_BASE_URL}/api/events/names`);
                const user = namesRes.data.find(u => u.name === userName);
                if (user) {
                    setUserAvatar(user.avatar_url);
                }
            } catch (err) {
                console.error('Errore caricamento dati:', err);
                setError('Impossibile caricare il profilo.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userName]);

    // Calculate total points
    const totalPoints = events.reduce((sum, event) => sum + (event.event_points || 0), 0);

    return (
        <div className="container">
            <div className="home-header">
                {userAvatar && (
                    <img
                        src={getMediaUrl(userAvatar)}
                        alt={userName}
                        style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            objectFit: 'contain',
                            border: '4px solid rgba(255, 255, 255, 0.2)',
                            marginBottom: '10px'
                        }}
                    />
                )}
                <h1>{userName}</h1>
                <p className="subtitle">Punti Totali: <strong style={{ color: '#8ac5ff' }}>{totalPoints}</strong></p>
            </div>

            <div className="scrollable-content">
                {error && <div className="alert alert-error">{error}</div>}

                {events.length === 0 && !error ? (
                    <div className="alert alert-info">Nessun evento registrato per questo utente.</div>
                ) : (
                    <div>
                        <h2 style={{ paddingLeft: '8px', borderLeft: '3px solid #667eea', marginBottom: '16px' }}>Storico Eventi</h2>
                        {events.map((event) => (
                            <div key={event.id} className="event-card">
                                <div className="event-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{
                                        background: 'rgba(102, 126, 234, 0.2)',
                                        color: '#8ac5ff',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {event.event_type_name}
                                    </span>
                                    <span style={{ color: '#a0a0b8', fontSize: '0.75rem' }}>
                                        {new Date(event.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {event.media_path && (
                                    <div className="media-preview">
                                        {event.media_type === 'video' ? (
                                            <video controls src={getMediaUrl(event.media_path)} playsInline preload="metadata" />
                                        ) : event.media_type === 'audio' ? (
                                            <audio controls src={getMediaUrl(event.media_path)} />
                                        ) : (
                                            <img
                                                src={getMediaUrl(event.media_path)}
                                                alt="Evento"
                                                onClick={() => setSelectedImage(getMediaUrl(event.media_path))}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        )}
                                    </div>
                                )}

                                <div className="event-info">
                                    <p>{event.description}</p>
                                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Punti: <strong style={{ color: '#56ab2f' }}>+{event.event_points}</strong></span>
                                        {event.declarer_name && (
                                            <span style={{ fontSize: '0.75rem', color: '#a0a0b8' }}>
                                                Dichiarato da: <strong>{event.declarer_name}</strong>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="button-group mt-20">
                <button className="secondary" onClick={() => navigate('/leaderboard')}>
                    Torna alla classifica
                </button>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedImage(null)}>×</button>
                        <img src={selectedImage} alt="Full size" className="modal-image" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserProfile;
