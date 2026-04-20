import { useState, useEffect } from 'react';
import { stoicQuotes } from './quotes';

function Progress() {
  const [sessions, setSessions] = useState(0);
  const [totalMins, setTotalMins] = useState(0);
  const [todayData, setTodayData] = useState({ sessions: 0, mins: 0 });
  const [weeklyData, setWeeklyData] = useState({});
  const [favorites, setFavorites] = useState([]);

  // Track today's date for daily reset
  const getTodayKey = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  // Initialize data on mount
  useEffect(() => {
    const s = parseInt(localStorage.getItem('sf_sessions') || '0');
    const m = parseInt(localStorage.getItem('sf_total_mins') || '0');
    setSessions(s);
    setTotalMins(m);

    // Load today's data
    const todayKey = getTodayKey();
    const today = JSON.parse(localStorage.getItem(`sf_daily_${todayKey}`) || '{"sessions":0,"mins":0}');
    setTodayData(today);

    // Load weekly data
    const weekly = JSON.parse(localStorage.getItem('sf_weekly_data') || '{}');
    setWeeklyData(weekly);

    // Load favorites
    const fav = JSON.parse(localStorage.getItem('sf_favorite_quotes') || '[]');
    setFavorites(fav);
  }, []);

  // Poll for updates from localStorage (syncs when stats update)
  useEffect(() => {
    const interval = setInterval(() => {
      const s = parseInt(localStorage.getItem('sf_sessions') || '0');
      const m = parseInt(localStorage.getItem('sf_total_mins') || '0');
      setSessions(s);
      setTotalMins(m);

      const todayKey = getTodayKey();
      const today = JSON.parse(localStorage.getItem(`sf_daily_${todayKey}`) || '{"sessions":0,"mins":0}');
      setTodayData(today);

      const weekly = JSON.parse(localStorage.getItem('sf_weekly_data') || '{}');
      setWeeklyData(weekly);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function reset() {
    const todayKey = getTodayKey();
    localStorage.setItem('sf_sessions', '0');
    localStorage.setItem('sf_total_mins', '0');
    localStorage.removeItem(`sf_daily_${todayKey}`);
    localStorage.setItem('sf_weekly_data', '{}');
    setSessions(0);
    setTotalMins(0);
    setTodayData({ sessions: 0, mins: 0 });
    setWeeklyData({});
  }

  // Get favorite quotes details
  const favoriteQuotesData = favorites
    .slice(0, 3) // Show top 3
    .map(i => stoicQuotes[i])
    .filter(q => q);

  return (
    <div className="progress-page">
      <h2 className="progress-title">Your Progress</h2>
      <p className="progress-subtitle">Every session is a victory over distraction.</p>

      {/* TODAY'S STATS */}
      <div className="stats-section">
        <h3 className="stats-section-title">TODAY</h3>
        <div className="progress-stats">
          <div className="stat-card">
            <span className="stat-number">{todayData.sessions}</span>
            <span className="stat-label">Sessions Today</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{todayData.mins}</span>
            <span className="stat-label">Minutes Today</span>
          </div>
        </div>
      </div>

      {/* ALL-TIME STATS */}
      <div className="stats-section">
        <h3 className="stats-section-title">ALL TIME</h3>
        <div className="progress-stats">
          <div className="stat-card">
            <span className="stat-number">{sessions}</span>
            <span className="stat-label">Sessions Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{totalMins}</span>
            <span className="stat-label">Total Minutes Focused</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{Math.floor(totalMins / 60)}h {totalMins % 60}m</span>
            <span className="stat-label">Total Hours</span>
          </div>
        </div>
      </div>

      {/* WEEKLY BREAKDOWN */}
      {Object.keys(weeklyData).length > 0 && (
        <div className="stats-section">
          <h3 className="stats-section-title">WEEKLY BREAKDOWN</h3>
          <div className="weekly-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="day-stat">
                <div className="day-name">{day}</div>
                <div className="day-sessions">{weeklyData[day]?.sessions || 0}</div>
                <div className="day-mins">{weeklyData[day]?.mins || 0}m</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAVORITE QUOTES */}
      {favoriteQuotesData.length > 0 && (
        <div className="stats-section">
          <h3 className="stats-section-title">FAVORITE QUOTES ({favorites.length})</h3>
          <div className="favorite-quotes-preview">
            {favoriteQuotesData.map((quote, idx) => (
              <div key={idx} className="fav-quote-preview">
                <p className="fav-quote-text">"{quote.text}"</p>
                <span className="fav-quote-author">— {quote.author}</span>
              </div>
            ))}
          </div>
          <p className="fav-quote-link">View all {favorites.length} saved quotes in Favorites tab</p>
        </div>
      )}

      <button className="btn-ghost" onClick={reset}>Reset All Stats</button>
    </div>
  );
}

export default Progress;