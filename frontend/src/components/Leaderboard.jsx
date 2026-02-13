import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

function Leaderboard() {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaderboard`);
      setScores(response.data);
    } catch (error) {
      console.error('Errore nel caricamento della classifica:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per calcolare i ranghi con gestione pareggi (Standard Competition Ranking)
  const getRankedScores = (data) => {
    let currentRank = 1;
    return data.map((score, index) => {
      if (index > 0 && score.total_points < data[index - 1].total_points) {
        currentRank = index + 1;
      }
      return { ...score, rank: currentRank };
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Caricamento classifica</div>
      </div>
    );
  }

  const rankedScores = getRankedScores(scores);
  const topThree = rankedScores.filter(s => s.rank <= 3);

  // Per il podio, cerchiamo esattamente chi ha rank 1, 2 e 3 (anche se multipli)
  const firstPlace = rankedScores.filter(s => s.rank === 1);
  const secondPlace = rankedScores.filter(s => s.rank === 2);
  const thirdPlace = rankedScores.filter(s => s.rank === 3);

  const restSize = rankedScores.length > 3 ? rankedScores.slice(3) : [];

  return (
    <div className="container">
      <h1>Classifica</h1>
      <p className="subtitle">I migliori giocatori in classifica</p>

      {rankedScores.length > 0 && (
        <div className="podium-wrapper">
          {/* Visualizzazione speciale per i primi 3 ranghi */}
          <div className="podium">
            {/* Secondo Rango */}
            {secondPlace.length > 0 && (
              <div className="podium-group">
                {secondPlace.map(user => (
                  <div key={user.id} className="podium-place">
                    <div className="podium-position second">2°</div>
                    {user.avatar_url && <img src={user.avatar_url} alt={user.user_name} className="avatar-podium" style={{ width: '80px', height: '80px', margin: '5px auto', display: 'block' }} />}
                    <div className="podium-name">{user.user_name}</div>
                    <div className="podium-points">{user.total_points} pt</div>
                  </div>
                ))}
              </div>
            )}

            {/* Primo Rango */}
            {firstPlace.length > 0 && (
              <div className="podium-group">
                {firstPlace.map(user => (
                  <div key={user.id} className="podium-place">
                    <div className="podium-position first">1°</div>
                    {user.avatar_url && <img src={user.avatar_url} alt={user.user_name} className="avatar-podium" style={{ width: '100px', height: '100px', margin: '5px auto', display: 'block' }} />}
                    <div className="podium-name">{user.user_name}</div>
                    <div className="podium-points">{user.total_points} pt</div>
                  </div>
                ))}
              </div>
            )}

            {/* Terzo Rango */}
            {thirdPlace.length > 0 && (
              <div className="podium-group">
                {thirdPlace.map(user => (
                  <div key={user.id} className="podium-place">
                    <div className="podium-position third">3°</div>
                    {user.avatar_url && <img src={user.avatar_url} alt={user.user_name} className="avatar-podium" style={{ width: '80px', height: '80px', margin: '5px auto', display: 'block' }} />}
                    <div className="podium-name">{user.user_name}</div>
                    <div className="podium-points">{user.total_points} pt</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {rankedScores.length > 3 && (
        <div className="leaderboard-list">
          <h2>Tutta la classifica</h2>
          {rankedScores.map((score) => (
            <div key={score.id} className="leaderboard-item">
              <span className="leaderboard-rank">{score.rank}°</span>
              <div className="leaderboard-user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                {score.avatar_url && <img src={score.avatar_url} alt={score.user_name} className="avatar-list" style={{ width: '60px', height: '60px' }} />}
                <span className="leaderboard-name">{score.user_name}</span>
              </div>
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