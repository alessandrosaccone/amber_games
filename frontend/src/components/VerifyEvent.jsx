import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

function VerifyEvent() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [names, setNames] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsRes, namesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/events/pending`),
        axios.get(`${API_BASE_URL}/api/events/names`)
      ]);
      setEvents(eventsRes.data);
      setNames(namesRes.data);
    } catch (error) {
      console.error('Errore nel caricamento:', error);
      setMessage({ type: 'error', text: 'Errore nel caricamento degli eventi' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (eventId, verificationType) => {
    if (!selectedName) {
      setMessage({ type: 'error', text: 'Seleziona il tuo nome' });
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/verifications`, {
        event_id: eventId,
        verifier_name: selectedName,
        verification_type: verificationType
      });

      setMessage({ type: 'success', text: response.data.message });

      setTimeout(() => {
        loadData();
        setMessage(null);
      }, 1500);
    } catch (error) {
      console.error('Errore nella verifica:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Errore nella verifica'
      });
    }
  };

  const renderMedia = (event) => {
    if (!event.media_path) return null;

    const mediaUrl = `http://localhost:5000/uploads/${event.media_path}`;

    switch (event.media_type) {
      case 'photo':
        return <img src={mediaUrl} alt="Evento" />;
      case 'video':
        return <video controls src={mediaUrl} />;
      case 'audio':
        return <audio controls src={mediaUrl} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Caricamento</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Verifica Eventi</h1>
      <p className="subtitle">Conferma o rifiuta (+2 pt)</p>

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="card mb-20">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Seleziona il tuo nome</label>
          <select
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
          >
            <option value="">Chi sei?</option>
            {names.map(name => (
              <option key={name.id} value={name.name}>{name.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="scrollable-content">
        {events.length === 0 ? (
          <div className="alert alert-info">
            Nessun evento da verificare
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  {event.person_avatar && <img src={event.person_avatar} alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'contain' }} />}
                  <p style={{ margin: 0 }}><strong>Persona:</strong> {event.person_name}</p>
                </div>
                <p><strong>Evento:</strong> {event.event_type_name}</p>
                <p><strong>Punti:</strong> {event.event_points}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  {event.declarer_avatar && <img src={event.declarer_avatar} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'contain' }} />}
                  <p style={{ margin: 0 }}><strong>Da:</strong> {event.declarer_name}</p>
                </div>
                {event.description && (
                  <p><strong>Desc:</strong> {event.description}</p>
                )}
              </div>

              <div className="verification-status">
                <div className="status-item">
                  <div className="status-label">Conferme</div>
                  <div className="status-value" style={{ color: '#a8e063' }}>
                    {event.confirmations}/3
                  </div>
                </div>
                <div className="status-item">
                  <div className="status-label">Rifiuti</div>
                  <div className="status-value" style={{ color: '#ff6b9d' }}>
                    {event.rejections}/3
                  </div>
                </div>
              </div>

              {event.media_path && (
                <div className="media-preview">
                  {renderMedia(event)}
                </div>
              )}

              <div className="button-group">
                <button
                  className="success"
                  onClick={() => handleVerify(event.id, 'confirm')}
                  disabled={!selectedName}
                >
                  Conferma
                </button>
                <button
                  className="danger"
                  onClick={() => handleVerify(event.id, 'reject')}
                  disabled={!selectedName}
                >
                  Rifiuta
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="button-group mt-20">
        <button className="secondary" onClick={() => navigate('/')}>
          Indietro
        </button>
      </div>
    </div>
  );
}

export default VerifyEvent;