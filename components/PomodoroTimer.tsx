
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from './Card';

const TimerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const WORK_MINS = 25;
const SHORT_BREAK_MINS = 5;
const LONG_BREAK_MINS = 15;

type Mode = 'work' | 'shortBreak' | 'longBreak';

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<Mode>('work');
  const [time, setTime] = useState(WORK_MINS * 60);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const switchMode = useCallback((newMode: Mode) => {
    setIsActive(false);
    setMode(newMode);
    switch (newMode) {
      case 'work':
        setTime(WORK_MINS * 60);
        break;
      case 'shortBreak':
        setTime(SHORT_BREAK_MINS * 60);
        break;
      case 'longBreak':
        setTime(LONG_BREAK_MINS * 60);
        break;
    }
  }, []);
  
  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setTime(prevTime => {
            if(prevTime > 0) return prevTime - 1;
            
            // Time is up, switch mode
            switch(mode) {
                case 'work':
                    switchMode('shortBreak');
                    break;
                default:
                    switchMode('work');
                    break;
            }
            return 0; // Returning 0 ensures it doesn't go negative on the last tick
        });
      }, 1000);
    } else {
      if(intervalRef.current) window.clearInterval(intervalRef.current);
    }

    return () => {
      if(intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isActive, mode, switchMode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeButtons: {id: Mode, label: string}[] = [
      { id: 'work', label: 'Work' },
      { id: 'shortBreak', label: 'Short Break' },
      { id: 'longBreak', label: 'Long Break' },
  ]

  return (
    <Card title="Pomodoro Timer" icon={<TimerIcon />}>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-2 p-1 bg-slate-100 rounded-md">
            {modeButtons.map(m => (
                 <button
                    key={m.id}
                    onClick={() => switchMode(m.id)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        mode === m.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    {m.label}
                </button>
            ))}
        </div>
        <div className="text-6xl font-bold text-slate-800 tabular-nums">
          {formatTime(time)}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={toggleTimer}
            className={`w-28 px-4 py-2 text-white font-semibold rounded-md transition-colors ${
              isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PomodoroTimer;
