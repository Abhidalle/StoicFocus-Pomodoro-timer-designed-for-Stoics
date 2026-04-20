import { useState, useEffect, useRef } from 'react';

export function useTimer(initialSeconds) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  function start() { setIsRunning(true); }
  function pause() { setIsRunning(false); }
  function reset() {
    setIsRunning(false);
    setSecondsLeft(initialSeconds);
  }
  function restart(newSeconds) {
    setIsRunning(false);
    setSecondsLeft(newSeconds);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const percentage = (secondsLeft / initialSeconds) * 100;

  return { secondsLeft, isRunning, start, pause, reset, restart, display, percentage };
}