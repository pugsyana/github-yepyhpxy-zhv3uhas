import React, { useState, useCallback } from 'react';
import Card from './Card';
import useLocalStorage from '../hooks/useLocalStorage';
import type { PlannerEvent } from '../types';

const PlannerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

// Generate time slots for the day
const timeSlots: string[] = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
});


interface DailyPlannerProps {
    workspaceId: string;
}

const DailyPlanner: React.FC<DailyPlannerProps> = ({ workspaceId }) => {
    const today = new Date().toISOString().split('T')[0];
    const [events, setEvents] = useLocalStorage<PlannerEvent[]>(`planner-${workspaceId}-${today}`, []);
    const [editingSlot, setEditingSlot] = useState<string | null>(null);
    const [eventText, setEventText] = useState('');

    const handleAddEvent = useCallback((time: string) => {
        if (!eventText.trim()) {
            // If text is empty, remove existing event if any
            setEvents(prev => prev.filter(e => e.time !== time));
        } else {
            const newEvent: PlannerEvent = { id: `evt_${Date.now()}`, time, text: eventText };
            setEvents(prev => {
                const existing = prev.find(e => e.time === time);
                if (existing) {
                    return prev.map(e => e.time === time ? newEvent : e);
                }
                return [...prev, newEvent];
            });
        }
        setEditingSlot(null);
        setEventText('');

    }, [eventText, setEvents]);
    
    const startEditing = (time: string) => {
        const existingEvent = events.find(e => e.time === time);
        setEventText(existingEvent?.text || '');
        setEditingSlot(time);
    };

    return (
        <Card title={`Daily Planner - ${new Date().toLocaleDateString()}`} icon={<PlannerIcon />}>
            <div className="h-96 overflow-y-auto pr-2">
                <ul className="divide-y divide-slate-200">
                    {timeSlots.slice(14, 42).map(time => { // Show 7am to 9pm
                        const event = events.find(e => e.time === time);
                        return (
                            <li key={time} className="py-2 flex items-center space-x-4">
                                <span className="text-sm font-medium text-slate-500 w-12">{time}</span>
                                <div className="flex-grow">
                                    {editingSlot === time ? (
                                         <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(time); }}>
                                            <input
                                                type="text"
                                                value={eventText}
                                                onChange={(e) => setEventText(e.target.value)}
                                                onBlur={() => handleAddEvent(time)}
                                                autoFocus
                                                className="w-full text-sm p-1 border border-indigo-300 rounded-md"
                                                placeholder="Add event..."
                                            />
                                        </form>
                                    ) : (
                                        <button onClick={() => startEditing(time)} className="w-full text-left p-1 rounded-md hover:bg-slate-100">
                                            <p className={`text-sm ${event ? 'text-indigo-700 font-semibold' : 'text-slate-400'}`}>
                                                {event?.text || '...'}
                                            </p>
                                        </button>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </Card>
    );
};

export default DailyPlanner;
