import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL, { getMediaUrl } from '../config';

function ViewEvents() {
  const navigate = useNavigate();
  const [names, setNames] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    fetchNames();
  }, []);

  const fetchNames = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/names`);
      setNames(response.data);
    } catch (error) {
      console.error('Errore nel caricamento dei nomi:', error);
    }
  };

  const fetchUserEvents = async (userName) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/user/${encodeURIComponent(userName)}`);
      setEvents(response.data);

      // Calcola il totale dei punti
      const total = response.data.reduce((sum, event) => sum + event.event_points, 0);
      setTotalPoints(total);
    } catch (error) {
      console.error('Errore nel caricamento degli eventi:', error);
      setEvents([]);
      setTotalPoints(0);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSelect = (e) => {
    const name = e.target.value;
    setSelectedName(name);

    // Trova l'avatar della persona selezionata
    const selectedPerson = names.find(n => n.name === name);
    setSelectedAvatar(selectedPerson?.avatar_url || '');

    if (name) {
      fetchUserEvents(name);
    } else {
      setEvents([]);
      setTotalPoints(0);
    }
  };

  // Rimosso getMediaUrl locale per usare quello globale di config.js

  return (
    <div className="container">
      <button
        onClick={() => navigate('/')}
        className="secondary"
        style={{ marginBottom: '20px' }}
      >
        ← Torna alla Home
      </button>

      <div className="home-header">
        <h1>Visualizza Eventi</h1>
        <p className="subtitle">Seleziona un partecipante per vedere i suoi eventi</p>
      </div>

      {/* Selezione nome */}
      <div className="form-wrapper" style={{ marginBottom: '30px' }}>
        <div className="card">
          <div className="form-group">
            <label>Seleziona Partecipante</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={selectedName}
                onChange={handleNameSelect}
                style={{ flex: 1 }}
              >
                <option value="">-- Seleziona un nome --</option>
                {names.map((name) => (
                  <option key={name.id} value={name.name}>
                    {name.name}
                  </option>
                ))}
              </select>
              {selectedAvatar && (
                <img
                  src={getMediaUrl(selectedAvatar)}
                  alt="Avatar"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    objectFit: 'contain'
                  }}
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Risultati */}
      {selectedName && (
        <div>
          {/* Statistiche utente */}
          <div className="card" style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '1.8rem' }}>{selectedName}</h2>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div>
                <p style={{ fontSize: '0.9rem', opacity: 0.7, margin: '0 0 5px 0' }}>
                  Eventi Totali
                </p>
                <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>
                  {events.length}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', opacity: 0.7, margin: '0 0 5px 0' }}>
                  Punti Totali
                </p>
                <p style={{
                  fontSize: '2rem',
                  margin: 0,
                  fontWeight: 'bold',
                  color: '#4ade80'
                }}>
                  {totalPoints}
                </p>
              </div>
            </div>
          </div>

          {/* Lista eventi */}
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p>Caricamento eventi...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ opacity: 0.7 }}>
                Nessun evento confermato per questo utente
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {events.map((event) => (
                <div
                  key={event.id}
                  className="card"
                  style={{
                    border: '2px solid rgba(74, 222, 128, 0.3)',
                    background: 'rgba(74, 222, 128, 0.05)'
                  }}
                >
                  {/* Header evento */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '15px',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        margin: '0 0 8px 0',
                        fontSize: '1.3rem',
                        color: '#4ade80'
                      }}>
                        {event.event_type_name}
                      </h3>
                      <p style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        opacity: 0.7,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        📢 Dichiarato da: <strong>{event.declarer_name}</strong>
                      </p>
                    </div>
                    <div style={{
                      background: 'rgba(74, 222, 128, 0.2)',
                      padding: '10px 20px',
                      borderRadius: '25px',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      color: '#4ade80',
                      border: '2px solid rgba(74, 222, 128, 0.4)'
                    }}>
                      +{event.event_points} pt
                    </div>
                  </div>

                  {/* Descrizione */}
                  {event.description && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '15px'
                    }}>
                      <p style={{
                        margin: 0,
                        fontStyle: 'italic',
                        opacity: 0.9,
                        lineHeight: '1.5'
                      }}>
                        💬 "{event.description}"
                      </p>
                    </div>
                  )}

                  {/* Media */}
                  {event.media_path && (
                    <div style={{ marginBottom: '15px' }}>
                      {event.media_type === 'photo' && (
                        <img
                          src={getMediaUrl(event.media_path)}
                          alt="Foto evento"
                          style={{
                            maxWidth: '100%',
                            borderRadius: '10px',
                            display: 'block',
                            border: '2px solid rgba(255, 255, 255, 0.1)'
                          }}
                        />
                      )}
                      {event.media_type === 'video' && (
                        <video
                          controls
                          playsInline
                          preload="metadata"
                          style={{
                            maxWidth: '100%',
                            borderRadius: '10px',
                            display: 'block',
                            border: '2px solid rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          <source src={getMediaUrl(event.media_path)} type="video/mp4" />
                          Il tuo browser non supporta il tag video.
                        </video>
                      )}
                      {event.media_type === 'audio' && (
                        <audio
                          controls
                          style={{
                            width: '100%',
                            borderRadius: '10px'
                          }}
                        >
                          <source src={getMediaUrl(event.media_path)} />
                          Il tuo browser non supporta il tag audio.
                        </audio>
                      )}
                    </div>
                  )}

                  {/* Footer info */}
                  <div style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.85rem',
                    opacity: 0.6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <span>
                      📅 {new Date(event.created_at).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span>
                      ✅ {event.confirmations} {event.confirmations === 1 ? 'conferma' : 'conferme'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ViewEvents;