import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './App.css';
import PlayButton from './PlayButton.jsx';
import PauseButton from './PauseButton.jsx';
import SettingButton from './SettingButton.jsx';
import { stoicQuotes } from './quotes';

const olive = "#4d908e";
const red ="#f54e4e";
const green = "#4aec8c";

function Timer() { 
  const quote = stoicQuotes[0] || "Focus on what you can control, not what you cannot.";

  return (
    <div style={{ backgroundColor: '#060504', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f5f5dc', padding: '20px', fontFamily: 'Georgia, serif' }}>
      <div style={{ width: '240px', marginBottom: '24px' }}>
        <CircularProgressbar
          value={90}
          text={`20:00`}
          styles={buildStyles({
            rotation: 0.25,
            strokeLinecap: 'butt',
            textColor: '#f5f5dc',
            textSize: '24px',
            pathColor: '#daa520',
            pathTransition: 'stroke-dashoffset 0.5s ease 0s',
            pathTransitionDuration: 0.5,
            trailColor: '#2b271f',
            backgroundColor: '#090704',
          })}
        />
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <PlayButton />
        <PauseButton />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
        <SettingButton />
        <h2 style={{ color: '#f5f5dc', fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.5, maxWidth: '320px', textAlign: 'center' }}>
          {quote}
        </h2>
      </div>
    </div>
  );
}

export default Timer;