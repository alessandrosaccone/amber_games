import React from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingAvatars from './FloatingAvatars'; 

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <FloatingAvatars />
      {/* Icona Admin */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => navigate('/admin-login')}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            padding: '0',
            fontSize: '1.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer'
          }}
        >
          ⚙️
        </button>
      </div>

      <div className="home-header">
        <h1>Amber Games</h1>
        <p className="subtitle">Eventi, Verifiche e Classifica</p>
      </div>

      <div className="home-buttons">
        <button onClick={() => navigate('/insert')}>
          Inserisci Evento
        </button>
        <button onClick={() => navigate('/verify')}>
          Verifica Evento
        </button>
        <button className="secondary" onClick={() => navigate('/leaderboard')}>
          Classifica
        </button>
      </div>
    </div>
  );
}

export default Home;