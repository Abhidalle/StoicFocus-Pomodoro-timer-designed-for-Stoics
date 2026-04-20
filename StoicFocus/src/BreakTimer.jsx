import { useState, useMemo, useEffect } from 'react';
import { useTimer } from './useTimer.jsx';
import { stoicQuotes } from './quotes';

function playTick() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = 1046;
  o.connect(g); g.connect(ctx.destination);
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  o.start(); o.stop(ctx.currentTime + 0.12);
}

function playBell() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  [440, 550].forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    const t = ctx.currentTime + i * 0.3;
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    o.start(t); o.stop(t + 1.2);
  });
}

function playBirdChirp() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  // Cute bird chirps with varying frequencies
  [1200, 1400, 1100].forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    const t = ctx.currentTime + i * 0.15;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.08, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.start(t); o.stop(t + 0.25);
  });
}

function BreakTimer({ breakMins, isLong, onSkip, onComplete, active, onTimerDisplay }) {
  const seconds = (breakMins || 5) * 60;
  
  // Initialize timer with saved remaining time if available
  const [initialSeconds, setInitialSeconds] = useState(() => {
    const saved = localStorage.getItem('sf_break_remaining_seconds');
    const savedPhase = localStorage.getItem('sf_current_phase');
    // Only use saved seconds if we're in a break phase
    if (saved && (savedPhase === 'shortBreak' || savedPhase === 'longBreak')) {
      return parseInt(saved);
    }
    return seconds;
  });

  const { isRunning, start, restart, display, percentage, secondsLeft, pause } = useTimer(initialSeconds);
  const [quote, setQuote] = useState(stoicQuotes[Math.floor(Math.random() * stoicQuotes.length)]);
  const [quoteIndex, setQuoteIndex] = useState(stoicQuotes.indexOf(quote));
  const [favorites, setFavorites] = useState([]);
  const [justFavorited, setJustFavorited] = useState(false);

  // Load favorites from localStorage on mount and when component mounts
  useEffect(() => {
    const saved = localStorage.getItem('sf_favorite_quotes');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Persist remaining seconds when they change (every second during countdown)
  useEffect(() => {
    if (active && isRunning) {
      localStorage.setItem('sf_break_remaining_seconds', String(secondsLeft));
    }
  }, [secondsLeft, active, isRunning]);

  // Clear saved seconds when timer completes
  useEffect(() => {
    if (secondsLeft === 0 && active) {
      localStorage.removeItem('sf_break_remaining_seconds');
    }
  }, [secondsLeft, active]);

  // Generate new quote each time break becomes active
  useEffect(() => {
    if (active) {
      const randomIndex = Math.floor(Math.random() * stoicQuotes.length);
      setQuote(stoicQuotes[randomIndex]);
      setQuoteIndex(randomIndex);
      setJustFavorited(false);
    }
  }, [active]);

  // Update browser tab with current timer display
  useEffect(() => {
    if (onTimerDisplay) {
      onTimerDisplay(display);
    }
  }, [display, onTimerDisplay]);

  useEffect(() => {
    if (active) {
      // Check if we're resuming from saved time
      const savedSeconds = localStorage.getItem('sf_break_remaining_seconds');
      const shouldRestore = savedSeconds && parseInt(savedSeconds) > 0 && parseInt(savedSeconds) < seconds;
      
      if (!shouldRestore) {
        // Only restart with full seconds if not resuming from saved time
        restart(seconds);
      }
      
      setTimeout(() => { playBell(); start(); }, 300);
    } else if (isRunning) {
      pause();
    }
  }, [active]);

  useEffect(() => {
    if (secondsLeft === 0 && active && onComplete) {
      playBirdChirp();
      onComplete();
    }
  }, [secondsLeft, active, onComplete]);

  function handleSkip() { 
    playBell();
    pause();
    onSkip(); 
  }

  function toggleFavorite() {
    let updated;
    if (favorites.includes(quoteIndex)) {
      updated = favorites.filter(i => i !== quoteIndex);
    } else {
      updated = [...favorites, quoteIndex];
      setJustFavorited(true);
      setTimeout(() => setJustFavorited(false), 600);
    }
    setFavorites(updated);
    localStorage.setItem('sf_favorite_quotes', JSON.stringify(updated));
  }

  const isFavorite = favorites.includes(quoteIndex);

  return (
    <div className={`timer-panel break-panel ${!active ? 'panel-dimmed' : ''}`}>
      <div className="break-type-badge">{isLong ? '☽ Long Break' : '· Short Break'}</div>

      <div className="break-time-display">
        <span className="break-clock">{display}</span>
        <span className="break-label">{isLong ? 'Rest.' : 'Break.'}</span>
      </div>

      <div className="quote-frame">
        <p className="break-quote-text">"{quote.text || quote}"</p>
        <span className="break-quote-author">— {quote.author || 'Marcus Aurelius'}</span>
        <button 
          className={`break-quote-heart-btn ${isFavorite ? 'favorited' : ''} ${justFavorited ? 'animate-heart' : ''}`}
          onClick={toggleFavorite}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '❤' : '🤍'}
        </button>
      </div>

      <div className="break-controls">
        <button className="btn-secondary" onClick={() => { playTick(); pause(); }} disabled={!isRunning}>
          Pause
        </button>
        <button className="btn-secondary" onClick={() => { playTick(); start(); }} disabled={isRunning}>
          Resume
        </button>
        <button className="btn-ghost" onClick={handleSkip}>Skip Break</button>
      </div>
    </div>
  );
}

export default BreakTimer;