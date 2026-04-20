import { useState, useEffect } from 'react';

function Navbar({ activeTab, setActiveTab, timerDisplay }) {
  const tabs = ['Timers', 'Stoic Library', 'Progress', 'Favorites', 'Settings'];
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update browser tab title with remaining timer
  useEffect(() => {
    if (timerDisplay) {
      document.title = `StoicFocus-${timerDisplay}`;
    }
  }, [timerDisplay]);

  const timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/favicon.png" alt="StoicFocus" className="brand-logo" />
        <div className="brand-text">
          <span className="brand-title">STOICFOCUS</span>
          
        </div>
      </div>
      <div className="navbar-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;