import { useState, useEffect } from 'react';
import './App.css';
import Navbar from './Navbar.jsx';
import FocusTimer from './FocusTimer.jsx';
import BreakTimer from './BreakTimer.jsx';
import StoicLibrary from './StoicLibrary.jsx';
import Progress from './Progress.jsx';
import FavoriteQuotes from './FavoriteQuotes.jsx';
import Settings from './Settings.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('Timers');
  
  // Initialize from localStorage to preserve state across navigation
  const [phase, setPhase] = useState(() => localStorage.getItem('sf_current_phase') || 'focus');
  const [sessionCount, setSessionCount] = useState(() => parseInt(localStorage.getItem('sf_session_count') || '0'));
  const [timerDisplay, setTimerDisplay] = useState('25:00');

  const [focusMins, setFocusMins] = useState(() => parseInt(localStorage.getItem('sf_focus_mins') || '25'));
  const [shortBreakMins, setShortBreakMins] = useState(() => parseInt(localStorage.getItem('sf_short_break_mins') || '5'));
  const [longBreakMins, setLongBreakMins] = useState(() => parseInt(localStorage.getItem('sf_long_break_mins') || '15'));
  const [pomosBeforeLong, setPomosBeforeLong] = useState(() => parseInt(localStorage.getItem('sf_pomos_before_long') || '4'));

  // Persist phase to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sf_current_phase', phase);
  }, [phase]);

  // Persist sessionCount to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sf_session_count', String(sessionCount));
  }, [sessionCount]);

  function handleFocusComplete() {
    const next = sessionCount + 1;
    setSessionCount(next);
    const total = parseInt(localStorage.getItem('sf_sessions') || '0') + 1;
    const mins = parseInt(localStorage.getItem('sf_total_mins') || '0') + focusMins;
    localStorage.setItem('sf_sessions', total);
    localStorage.setItem('sf_total_mins', mins);
    setPhase(next % pomosBeforeLong === 0 ? 'longBreak' : 'shortBreak');
  }

  function handleBreakComplete() { setPhase('focus'); }
  function handleSkipFocus() { setPhase((sessionCount + 1) % pomosBeforeLong === 0 ? 'longBreak' : 'shortBreak'); }
  function handleSkipBreak() { setPhase('focus'); }

  function handleSettingsSave(s) {
    setFocusMins(s.focusMins);
    setShortBreakMins(s.shortBreakMins);
    setLongBreakMins(s.longBreakMins);
    setPomosBeforeLong(s.pomosBeforeLong);
    setPhase('focus');
    setSessionCount(0);
  }

  const isBreak = phase === 'shortBreak' || phase === 'longBreak';
  const breakMins = phase === 'longBreak' ? longBreakMins : shortBreakMins;

  return (
    <div className="app-root">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} timerDisplay={timerDisplay} />
      <main className="app-main">
        {activeTab === 'Timers' && (
          <div className="timers-layout">
            <FocusTimer
              focusMins={focusMins}
              onComplete={handleFocusComplete}
              onSkip={handleSkipFocus}
              sessionCount={sessionCount}
              pomosBeforeLong={pomosBeforeLong}
              active={phase === 'focus'}
              onTimerDisplay={setTimerDisplay}
            />
            <BreakTimer
              breakMins={breakMins}
              isLong={phase === 'longBreak'}
              onSkip={handleSkipBreak}
              onComplete={handleBreakComplete}
              active={isBreak}
              onTimerDisplay={setTimerDisplay}
            />
          </div>
        )}
        {activeTab === 'Stoic Library' && <StoicLibrary />}
        {activeTab === 'Progress' && <Progress />}
        {activeTab === 'Favorites' && <FavoriteQuotes />}
        {activeTab === 'Settings' && <Settings onSave={handleSettingsSave} />}
      </main>
      <footer className="app-footer">
        <span>A project for Hack Club Horizons — Manage your mindset, not just your time.</span>
      </footer>
    </div>
  );
}

export default App;