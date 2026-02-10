import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Leaderboard() {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await axios.get('/api/leaderboard');
      setScores(response.data);
    } catch (error) {
      console.error('Errore nel caricamento della classifica:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Caricamento classifica</div>
      </div>
    );
  }

  const topThree = scores.slice(0, 3);
  const rest = scores.slice(3);

  return (
    <div className="container">
      <h1>Classifica</h1>
      <p className="subtitle">I migliori giocatori in classifica</p>

      {topThree.length > 0 && (
        <div className="podium">
          {topThree[1] && (
            <div className="podium-place">
              <div className="podium-position second">
                2°
              </div>
              <div className="podium-name">{topThree[1].user_name}</div>
              <div className="podium-points">{topThree[1].total_points} pt</div>
            </div>
          )}

          {topThree[0] && (
            <div className="podium-place">
              <div className="podium-position first">
                1°
              </div>
              <div className="podium-name">{topThree[0].user_name}</div>
              <div className="podium-points">{topThree[0].total_points} pt</div>
            </div>
          )}

          {topThree[2] && (
            <div className="podium-place">
              <div className="podium-position third">
                3°
              </div>
              <div className="podium-name">{topThree[2].user_name}</div>
              <div className="podium-points">{topThree[2].total_points} pt</div>
            </div>
          )}
        </div>
      )}

      {rest.length > 0 && (
        <div className="leaderboard-list">
          <h2>Classifica completa</h2>
          {rest.map((score, index) => (
            <div key={score.id} className="leaderboard-item">
              <span className="leaderboard-rank">{index + 4}°</span>
              <span className="leaderboard-name">{score.user_name}</span>
              <span className="leaderboard-points">{score.total_points} pt</span>
            </div>
          ))}
        </div>
      )}

      {scores.length === 0 && (
        <div className="alert alert-info">
          Nessun punteggio disponibile
        </div>
      )}

      <div className="button-group mt-20">
        <button className="secondary" onClick={() => navigate('/')}>
          Torna alla home
        </button>
      </div>
    </div>
  );
}

export default Leaderboard;