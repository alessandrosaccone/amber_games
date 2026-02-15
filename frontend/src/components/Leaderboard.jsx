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
  const topThree = rankedScores.slice(0, 3);
  const rest = rankedScores.slice(3);

  return (
    <div className="container">
      <h1>Classifica</h1>
      <p className="subtitle">I migliori giocatori in classifica</p>

      {topThree.length > 0 && (
        <div className="podium">
          {/* Secondo Posto */}
          {topThree[1] && (
            <div
              className="podium-place clickable"
              onClick={() => navigate(`/profile/${topThree[1].user_name}`)}
            >
              <div className="podium-position second">
                {topThree[1].rank}°
              </div>
              {topThree[1].avatar_url && <img src={topThree[1].avatar_url} alt={topThree[1].user_name} className="avatar-podium" style={{ width: '80px', height: '80px', margin: '5px auto', display: 'block', borderRadius: '50%', objectFit: 'contain' }} />}
              <div className="podium-name">{topThree[1].user_name}</div>
              <div className="podium-points">{topThree[1].total_points} pt</div>
            </div>
          )}

          {/* Primo Posto */}
          {topThree[0] && (
            <div
              className="podium-place clickable"
              onClick={() => navigate(`/profile/${topThree[0].user_name}`)}
            >
              <div className="podium-position first">
                {topThree[0].rank}°
              </div>
              {topThree[0].avatar_url && <img src={topThree[0].avatar_url} alt={topThree[0].user_name} className="avatar-podium" style={{ width: '100px', height: '100px', margin: '5px auto', display: 'block', borderRadius: '50%', objectFit: 'contain' }} />}
              <div className="podium-name">{topThree[0].user_name}</div>
              <div className="podium-points">{topThree[0].total_points} pt</div>
            </div>
          )}

          {/* Terzo Posto */}
          {topThree[2] && (
            <div
              className="podium-place clickable"
              onClick={() => navigate(`/profile/${topThree[2].user_name}`)}
            >
              <div className="podium-position third">
                {topThree[2].rank}°
              </div>
              {topThree[2].avatar_url && <img src={topThree[2].avatar_url} alt={topThree[2].user_name} className="avatar-podium" style={{ width: '80px', height: '80px', margin: '5px auto', display: 'block', borderRadius: '50%', objectFit: 'contain' }} />}
              <div className="podium-name">{topThree[2].user_name}</div>
              <div className="podium-points">{topThree[2].total_points} pt</div>
            </div>
          )}
        </div>
      )}

      {rest.length > 0 && (
        <div className="leaderboard-list">
          <h2>Tutta la classifica</h2>
          {rest.map((score) => (
            <div
              key={score.id}
              className="leaderboard-item clickable"
              onClick={() => navigate(`/profile/${score.user_name}`)}
            >
              <span className="leaderboard-rank">{score.rank}°</span>
              <div className="leaderboard-user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                {score.avatar_url && <img src={score.avatar_url} alt={score.user_name} className="avatar-list" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'contain' }} />}
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