import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function InsertEvent() {
  const navigate = useNavigate();
  const [names, setNames] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [formData, setFormData] = useState({
    person_name: '',
    event_type_id: '',
    declarer_name: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [namesRes, typesRes] = await Promise.all([
        axios.get('/api/events/names'),
        axios.get('/api/events/types')
      ]);
      setNames(namesRes.data);
      setEventTypes(typesRes.data);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      setMessage({ type: 'error', text: 'Errore nel caricamento dei dati' });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const data = new FormData();
    data.append('person_name', formData.person_name);
    data.append('event_type_id', formData.event_type_id);
    data.append('declarer_name', formData.declarer_name);
    data.append('description', formData.description);
    if (file) {
      data.append('media', file);
    }

    try {
      await axios.post('/api/events', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Evento inserito con successo!' });
      setFormData({
        person_name: '',
        event_type_id: '',
        declarer_name: '',
        description: ''
      });
      setFile(null);
      setFileName('');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Errore nell\'inserimento:', error);
      setMessage({ type: 'error', text: 'Errore nell\'inserimento dell\'evento' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Inserisci Evento</h1>
      <p className="subtitle">Compila il form per inserire un nuovo evento</p>

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="form-wrapper">
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Persona coinvolta</label>
              <select
                name="person_name"
                value={formData.person_name}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleziona</option>
                {names.map(name => (
                  <option key={name.id} value={name.name}>{name.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo di evento</label>
              <select
                name="event_type_id"
                value={formData.event_type_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleziona</option>
                {eventTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.points} pt)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Dichiarante</label>
              <select
                name="declarer_name"
                value={formData.declarer_name}
                onChange={handleInputChange}
                required
              >
                <option value="">Chi sei?</option>
                {names.map(name => (
                  <option key={name.id} value={name.name}>{name.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Descrizione</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Dettagli (opzionale)..."
              />
            </div>

            <div className="form-group">
              <label>Allegato</label>
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleFileChange}
                className="file-input"
              />
              {fileName && (
                <p style={{marginTop: '6px', color: '#8ac5ff', fontSize: '0.8rem'}}>
                  {fileName}
                </p>
              )}
            </div>

            <div className="button-group">
              <button type="submit" disabled={loading}>
                {loading ? 'Invio...' : 'Invia Evento'}
              </button>
              <button type="button" className="secondary" onClick={() => navigate('/')}>
                Annulla
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default InsertEvent;