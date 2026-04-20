import { useState, useEffect } from 'react';

function Settings({ onSave }) {
  const [focusMins, setFocusMins] = useState(25);
  const [shortBreakMins, setShortBreakMins] = useState(5);
  const [longBreakMins, setLongBreakMins] = useState(15);
  const [pomosBeforeLong, setPomosBeforeLong] = useState(4);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFocusMins(parseInt(localStorage.getItem('sf_focus_mins') || '25'));
    setShortBreakMins(parseInt(localStorage.getItem('sf_short_break_mins') || '5'));
    setLongBreakMins(parseInt(localStorage.getItem('sf_long_break_mins') || '15'));
    setPomosBeforeLong(parseInt(localStorage.getItem('sf_pomos_before_long') || '4'));
  }, []);

  function save() {
    localStorage.setItem('sf_focus_mins', focusMins);
    localStorage.setItem('sf_short_break_mins', shortBreakMins);
    localStorage.setItem('sf_long_break_mins', longBreakMins);
    localStorage.setItem('sf_pomos_before_long', pomosBeforeLong);
    setSaved(true);
    if (onSave) onSave({ focusMins, shortBreakMins, longBreakMins, pomosBeforeLong });
    setTimeout(() => setSaved(false), 2000);
  }

  const rows = [
    { label: 'Focus Duration (mins)', val: focusMins, set: setFocusMins, min: 1, max: 120 },
    { label: 'Short Break (mins)', val: shortBreakMins, set: setShortBreakMins, min: 1, max: 30 },
    { label: 'Long Break (mins)', val: longBreakMins, set: setLongBreakMins, min: 5, max: 60 },
    { label: 'Sessions Before Long Break', val: pomosBeforeLong, set: setPomosBeforeLong, min: 1, max: 10 },
  ];

  return (
    <div className="settings-page">
      <h2 className="settings-title">Settings</h2>
      <p className="settings-subtitle">Shape your discipline.</p>
      <div className="settings-form">
        {rows.map(r => (
          <div className="setting-row" key={r.label}>
            <label className="setting-label">{r.label}</label>
            <input className="setting-input" type="number" min={r.min} max={r.max}
              value={r.val} onChange={e => r.set(Number(e.target.value))} />
          </div>
        ))}
        <button className="btn-primary" onClick={save}>{saved ? 'Saved ✓' : 'Save Settings'}</button>
      </div>
    </div>
  );
}

export default Settings;