import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    console.log('Chiamata API con password:', password); 
    const response = await axios.post('/api/admin/login', { password });
    console.log('Risposta ricevuta:', response.data); 
    
    if (response.data.success) {
      sessionStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    }
  } catch (error) {
    console.error('Errore completo:', error); 
    console.error('Response error:', error.response); 
    setError(error.response?.data?.message || 'Password errata');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container">
      <h1>Admin Login</h1>
      <p className="subtitle">Inserisci la password per accedere</p>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Password Admin</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci password..."
              required
              autoFocus
            />
          </div>

          <div className="button-group">
            <button type="submit" disabled={loading}>
              {loading ? 'Verifica...' : 'Accedi'}
            </button>
            <button type="button" className="secondary" onClick={() => navigate('/')}>
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;