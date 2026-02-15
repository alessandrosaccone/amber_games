import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL, { getMediaUrl } from '../config';

function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [eventTypes, setEventTypes] = useState([]);
  const [events, setEvents] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Form states
  const [newEventType, setNewEventType] = useState({ name: '', points: '' });
  const [newPerson, setNewPerson] = useState({ name: '', avatar: null });

  useEffect(() => {
    // Verifica autenticazione
    if (!sessionStorage.getItem('adminAuth')) {
      navigate('/admin-login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [typesRes, eventsRes, peopleRes] = await Promise.all([
        axios.get(`${API_BASE_URL} /api/events / types`),
        axios.get(`${API_BASE_URL} /api/admin / events`),
        axios.get(`${API_BASE_URL} /api/admin / people`)
      ]);
      setEventTypes(typesRes.data);
      setEvents(eventsRes.data);
      setPeople(peopleRes.data);
    } catch (error) {
      console.error('Errore caricamento dati:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    navigate('/');
  };

  const handleAddEventType = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await axios.post(`${API_BASE_URL} /api/admin / event - types`, newEventType);
      setMessage({ type: 'success', text: 'Tipo evento aggiunto!' });
      setNewEventType({ name: '', points: '' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore nell\'aggiunta' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEventType = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo tipo di evento?')) return;

    try {
      await axios.delete(`${API_BASE_URL} /api/admin / event - types / ${id} `);
      setMessage({ type: 'success', text: 'Tipo evento eliminato!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore nell\'eliminazione' });
    }
  };

  const handleAddPerson = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('name', newPerson.name);
    if (newPerson.avatar) {
      formData.append('avatar', newPerson.avatar);
    }

    try {
      await axios.post(`${API_BASE_URL} /api/admin / people`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Persona aggiunta!' });
      setNewPerson({ name: '', avatar: null });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore nell\'aggiunta' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePerson = async (id) => {
    if (!window.confirm('Sei sicuro? Questo eliminerà anche i suoi punteggi.')) return;

    try {
      await axios.delete(`${API_BASE_URL} /api/admin / people / ${id} `);
      setMessage({ type: 'success', text: 'Persona eliminata!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore nell\'eliminazione' });
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo evento?')) return;

    try {
      await axios.delete(`${API_BASE_URL} /api/admin / events / ${id} `);
      setMessage({ type: 'success', text: 'Evento eliminato!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore nell\'eliminazione' });
    }
  };

  const handleResetDatabase = async () => {
    const confirmed = window.confirm(
      'ATTENZIONE! Questa azione eliminerà tutti gli eventi e resetterà i punteggi a 0. Continuare?'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm('Sei ASSOLUTAMENTE sicuro? Questa azione è irreversibile!');

    if (!doubleConfirm) return;

    try {
      await axios.delete(`${API_BASE_URL} /api/admin / reset - all`);
      setMessage({ type: 'success', text: 'Database resettato!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore nel reset' });
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Admin Panel</h1>
        <button className="secondary" onClick={handleLogout} style={{ width: 'auto', padding: '10px 20px' }}>
          Logout
        </button>
      </div>

      {message && (
        <div className={`alert alert - ${message.type === 'success' ? 'success' : 'error'} `}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={activeTab === 'events' ? 'active' : ''}
          onClick={() => setActiveTab('events')}
        >
          Eventi
        </button>
        <button
          className={activeTab === 'types' ? 'active' : ''}
          onClick={() => setActiveTab('types')}
        >
          Tipi Evento
        </button>
        <button
          className={activeTab === 'people' ? 'active' : ''}
          onClick={() => setActiveTab('people')}
        >
          Persone
        </button>
        <button
          className={activeTab === 'danger' ? 'active' : ''}
          onClick={() => setActiveTab('danger')}
        >
          Danger Zone
        </button>
      </div>

      <div className="scrollable-content">
        {/* TAB: Eventi */}
        {activeTab === 'events' && (
          <div>
            <h2>Gestione Eventi</h2>
            {events.length === 0 ? (
              <div className="alert alert-info">Nessun evento</div>
            ) : (
              events.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-info">
                    <p><strong>ID:</strong> {event.id}</p>
                    <p><strong>Persona:</strong> {event.person_name}</p>
                    <p><strong>Tipo:</strong> {event.event_type_name}</p>
                    <p><strong>Dichiarato da:</strong> {event.declarer_name}</p>
                    <p><strong>Status:</strong> {event.status}</p>
                    <p><strong>Conferme:</strong> {event.confirmations}/3</p>
                    <p><strong>Rifiuti:</strong> {event.rejections}/3</p>
                  </div>
                  <button
                    className="danger"
                    onClick={() => handleDeleteEvent(event.id)}
                    style={{ marginTop: '10px' }}
                  >
                    Elimina Evento
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: Tipi Evento */}
        {activeTab === 'types' && (
          <div>
            <h2>Aggiungi Tipo Evento</h2>
            <div className="card mb-20">
              <form onSubmit={handleAddEventType}>
                <div className="form-group">
                  <label>Nome Evento</label>
                  <input
                    type="text"
                    value={newEventType.name}
                    onChange={(e) => setNewEventType({ ...newEventType, name: e.target.value })}
                    placeholder="es. Compleanno"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Punti</label>
                  <input
                    type="number"
                    value={newEventType.points}
                    onChange={(e) => setNewEventType({ ...newEventType, points: e.target.value })}
                    placeholder="es. 10"
                    required
                  />
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? 'Aggiunta...' : 'Aggiungi Tipo'}
                </button>
              </form>
            </div>

            <h2>Tipi Esistenti</h2>
            {eventTypes.map(type => (
              <div key={type.id} className="event-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{type.name}</strong> - {type.points} punti
                  </div>
                  <button
                    className="danger"
                    onClick={() => handleDeleteEventType(type.id)}
                    style={{ width: 'auto', padding: '8px 16px' }}
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Persone */}
        {activeTab === 'people' && (
          <div>
            <h2>Aggiungi Persona</h2>
            <div className="card mb-20">
              <form onSubmit={handleAddPerson}>
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    type="text"
                    value={newPerson.name}
                    onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Avatar (opzionale)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewPerson({ ...newPerson, avatar: e.target.files[0] })}
                    className="file-input"
                  />
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? 'Aggiunta...' : 'Aggiungi Persona'}
                </button>
              </form>
            </div>

            <h2>Persone Esistenti</h2>
            {people.map(person => (
              <div key={person.id} className="event-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {person.avatar_url && (
                      <img
                        src={getMediaUrl(person.avatar_url)}
                        alt="Avatar"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'contain' }}
                      />
                    )}
                    <div>
                      <strong>{person.name}</strong> (ID: {person.id})
                    </div>
                  </div>
                  <button
                    className="danger"
                    onClick={() => handleDeletePerson(person.id)}
                    style={{ width: 'auto', padding: '8px 16px' }}
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Danger Zone */}
        {activeTab === 'danger' && (
          <div>
            <h2 style={{ color: '#ff6b9d' }}>Danger Zone</h2>
            <div className="card" style={{ borderColor: '#ff6b9d' }}>
              <h3>Reset Completo Database</h3>
              <p style={{ color: '#c0c0d8', marginBottom: '20px' }}>
                Questa azione eliminerà tutti gli eventi e le verifiche,
                e resetterà tutti i punteggi a 0. Le persone e i tipi di evento rimarranno.
              </p>
              <button
                className="danger"
                onClick={handleResetDatabase}
              >
                Reset Database
              </button>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}

export default AdminPanel;