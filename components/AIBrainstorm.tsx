import React, { useState, useCallback } from 'react';
import { brainstormIdeas } from '../services/geminiService';
import type { BrainstormIdea } from '../types';
import Card from './Card';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const BrainstormIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const AIBrainstorm: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [ideas, setIdeas] = useState<BrainstormIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isOnline = useOnlineStatus();

    const handleBrainstorm = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim() || isLoading || !isOnline) return;
        
        setIsLoading(true);
        setError(null);
        setIdeas([]);

        try {
            const results = await brainstormIdeas(topic);
            setIdeas(results);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [topic, isLoading, isOnline]);

    return (
        <Card title="AI Brainstorm" icon={<BrainstormIcon />}>
            <form onSubmit={handleBrainstorm} className="flex flex-col space-y-3">
                <label htmlFor="brainstorm-topic" className="font-medium text-slate-700">Topic</label>
                <input
                    id="brainstorm-topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., healthy morning routines"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    type="submit"
                    disabled={isLoading || !topic.trim() || !isOnline}
                    title={!isOnline ? "This feature requires an internet connection" : "Generate creative ideas"}
                    className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generating...' : 'Generate Ideas'}
                </button>
            </form>

            <div className="mt-6">
                {isLoading && <LoadingSpinner />}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {!isLoading && ideas.length > 0 && (
                     <div className="space-y-4">
                        <h3 className="font-semibold text-slate-800">Generated Ideas:</h3>
                        <ul className="space-y-3">
                            {ideas.map((idea, index) => (
                                <li key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                                    <p className="font-semibold text-indigo-700">{idea.title}</p>
                                    <p className="text-slate-600 text-sm">{idea.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default AIBrainstorm;
