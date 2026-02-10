import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="home-header">
        <h1>Eventi & Verifiche</h1>
        <p className="subtitle">Sistema di verifica eventi con classifica</p>
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