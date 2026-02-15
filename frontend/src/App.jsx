import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import InsertEvent from './components/InsertEvent';
import VerifyEvent from './components/VerifyEvent';
import Leaderboard from './components/Leaderboard';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import ViewEvents from './components/ViewEvents';
import UserProfile from './components/UserProfile';
import './App.css';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/insert" element={<InsertEvent />} />
          <Route path="/verify" element={<VerifyEvent />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile/:userName" element={<UserProfile />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/view-events" element={<ViewEvents />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;