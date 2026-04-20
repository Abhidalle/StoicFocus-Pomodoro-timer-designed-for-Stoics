import { useState, useEffect, useRef, useCallback } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useTimer } from './useTimer.jsx';

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

function playDone() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    const t = ctx.currentTime + i * 0.22;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.start(t); o.stop(t + 0.5);
  });
}

function Confetti({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 8 + 4,
      h: Math.random() * 14 + 6,
      color: ['#c9a84c','#f5f0e8','#4aec8c','#c9a84c','#daa520'][Math.floor(Math.random() * 5)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      vy: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 2,
    }));
    let frame;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.y += p.vy; p.x += p.vx; p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (pieces.some(p => p.y < canvas.height)) {
        frame = requestAnimationFrame(draw);
      }
    }
    draw();
    return () => cancelAnimationFrame(frame);
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="confetti-canvas" />;
}

function FocusTimer({ focusMins, onComplete, onSkip, sessionCount, pomosBeforeLong, active, onTimerDisplay }) {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [taskPomos, setTaskPomos] = useState(1);
  const [celebrate, setCelebrate] = useState(false);
  const [selectedTaskIdx, setSelectedTaskIdx] = useState(null);

  const seconds = (focusMins || 25) * 60;
  
  // Initialize timer with saved remaining time if available
  const [initialSeconds, setInitialSeconds] = useState(() => {
    const saved = localStorage.getItem('sf_focus_remaining_seconds');
    const savedPhase = localStorage.getItem('sf_current_phase');
    // Only use saved seconds if we're in the focus phase
    if (saved && savedPhase === 'focus') {
      return parseInt(saved);
    }
    return seconds;
  });

  const { isRunning, start, pause, reset, display, percentage, secondsLeft } = useTimer(initialSeconds);

  // Persist remaining seconds when they change (every second during countdown)
  useEffect(() => {
    if (active && isRunning) {
      localStorage.setItem('sf_focus_remaining_seconds', String(secondsLeft));
    }
  }, [secondsLeft, active, isRunning]);

  // Clear saved seconds when timer completes
  useEffect(() => {
    if (secondsLeft === 0 && active) {
      localStorage.removeItem('sf_focus_remaining_seconds');
    }
  }, [secondsLeft, active]);

  // Update browser tab with current timer display
  useEffect(() => {
    if (onTimerDisplay) {
      onTimerDisplay(display);
    }
  }, [display, onTimerDisplay]);

  // Pause when this timer is not active
  useEffect(() => {
    if (!active && isRunning) {
      pause();
    }
  }, [active, isRunning]);

  useEffect(() => {
    if (secondsLeft === 0 && !celebrate) {
      playDone();
      setCelebrate(true);
      setTimeout(() => {
        setCelebrate(false);
        // If a task was selected, mark it as complete for this pomodoro
        if (selectedTaskIdx !== null) {
          setTasks(prev => {
            const updated = [...prev];
            if (updated[selectedTaskIdx]) {
              updated[selectedTaskIdx].pomos -= 1;
              if (updated[selectedTaskIdx].pomos <= 0) {
                // Remove task if all pomos completed
                updated.splice(selectedTaskIdx, 1);
                setSelectedTaskIdx(null);
              } else {
                // Keep task but deselect for next round
                setSelectedTaskIdx(null);
              }
            }
            return updated;
          });
        }
        if (onComplete) onComplete();
      }, 3000);
    }
  }, [secondsLeft, celebrate]);

  function addTask() {
    if (!taskText.trim()) return;
    playTick();
    setTasks(prev => [...prev, { text: taskText.trim(), pomos: taskPomos, done: false }]);
    setTaskText(''); setTaskPomos(1);
  }

  function selectTask(i) {
    playTick();
    if (selectedTaskIdx === i) {
      // Deselect task - just stop it
      pause();
      setSelectedTaskIdx(null);
    } else {
      // Select task - reset timer and set new task
      pause();
      reset();
      setSelectedTaskIdx(i);
      // Timer will auto-start via useTimer effect when selectedTaskIdx changes and shouldRun becomes true
    }
  }

  function removeTask(i) { 
    playTick();
    setTasks(prev => prev.filter((_, idx) => idx !== i));
    if (selectedTaskIdx === i) setSelectedTaskIdx(null);
  }

  function handleSkip() {
    playDone();
    pause();
    reset();
    
    // Show confetti celebration
    setCelebrate(true);
    
    setTimeout(() => {
      setCelebrate(false);
      // If a task was selected, mark it as complete for this pomodoro
      if (selectedTaskIdx !== null) {
        setTasks(prev => {
          const updated = [...prev];
          if (updated[selectedTaskIdx]) {
            updated[selectedTaskIdx].pomos -= 1;
            if (updated[selectedTaskIdx].pomos <= 0) {
              // Remove task if all pomos completed
              updated.splice(selectedTaskIdx, 1);
              setSelectedTaskIdx(null);
            } else {
              // Keep task but deselect for next round
              setSelectedTaskIdx(null);
            }
          }
          return updated;
        });
      }
      onSkip();
    }, 3000);
  }

  const dotsTotal = pomosBeforeLong || 4;
  const dotsFilled = sessionCount % dotsTotal;

  return (
    <div className={`timer-panel focus-panel ${celebrate ? 'celebrating' : ''} ${!active ? 'panel-dimmed' : ''}`}>
      <Confetti active={celebrate} />

      <div className="session-dots-row">
        {Array.from({ length: dotsTotal }).map((_, i) => (
          <span key={i} className={`session-dot ${i < dotsFilled ? 'filled' : ''}`} />
        ))}
        <span className="session-dots-label">Focus Sessions</span>
      </div>

      {celebrate && <div className="celebrate-banner">✦ Session Complete. Well done. ✦</div>}

      <div className="circular-wrap">
        <CircularProgressbar value={percentage} text={display}
          styles={buildStyles({
            rotation: 0, strokeLinecap: 'butt',
            textColor: '#f5f0e8', textSize: '20px',
            pathColor: celebrate ? '#4aec8c' : '#c9a84c',
            trailColor: '#2a2318',
          })}
        />
      </div>

      <div className="timer-controls">
        <button className="btn-primary" onClick={() => { playTick(); start(); }} disabled={isRunning}>
          Start Focus Session
        </button>
        <button className="btn-secondary" onClick={() => { playTick(); pause(); }} disabled={!isRunning}>
          Pause
        </button>
        <button className="btn-ghost" onClick={() => { playTick(); reset(); }}>Reset</button>
        <button className="btn-skip" onClick={handleSkip}>Skip →</button>
      </div>

      <p className="timer-status">{isRunning ? (selectedTaskIdx !== null ? `Working on: ${tasks[selectedTaskIdx]?.text}` : 'Deep Work in Progress.') : (selectedTaskIdx !== null ? `Ready: ${tasks[selectedTaskIdx]?.text}` : 'Ready to focus.')}</p>

      <div className="task-section">
        <p className="task-section-title">Tasks</p>
        <div className="task-add-row">
          <input className="task-input" type="text" placeholder="What will you conquer?"
            value={taskText} onChange={e => setTaskText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <div className="task-pomo-control">
            <button className="pomo-btn" onClick={() => setTaskPomos(p => Math.max(1, p - 1))}>−</button>
            <span className="pomo-count">{taskPomos}🍅</span>
            <button className="pomo-btn" onClick={() => setTaskPomos(p => p + 1)}>+</button>
          </div>
          <button className="btn-secondary" onClick={addTask}>Add</button>
        </div>
        <ul className="task-list">
          {tasks.map((t, i) => (
            <li key={i} className={`task-item ${selectedTaskIdx === i ? 'task-selected' : ''}`}>
              <button className="task-check" onClick={() => selectTask(i)}>{selectedTaskIdx === i ? '◙' : '◯'}</button>
              <span className="task-text">{t.text}</span>
              <span className="task-pomos">{'🍅'.repeat(t.pomos)}</span>
              <button className="task-remove" onClick={() => removeTask(i)}>×</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FocusTimer;