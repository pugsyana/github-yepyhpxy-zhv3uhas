import React, { useState, useCallback } from 'react';
import { summarizeText } from '../services/geminiService';
import Card from './Card';
import useLocalStorage from '../hooks/useLocalStorage';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const NotesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface NotesProps {
    workspaceId: string;
}

const Notes: React.FC<NotesProps> = ({ workspaceId }) => {
  const [note, setNote] = useLocalStorage<string>(`note-${workspaceId}`, '');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isOnline = useOnlineStatus();

  const handleSummarize = useCallback(async () => {
    if (!note.trim() || isLoading || !isOnline) return;
    setIsLoading(true);
    setSummary('');
    try {
      const result = await summarizeText(note);
      setSummary(result);
    } catch (error) {
      setSummary('An error occurred while summarizing.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [note, isLoading, isOnline]);

  return (
    <Card title="AI Notes" icon={<NotesIcon />}>
      <div className="flex flex-col space-y-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your notes here..."
          className="w-full h-48 p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Notes"
        />
        <div className="flex justify-end">
            <button
                onClick={handleSummarize}
                disabled={isLoading || !note.trim() || !isOnline}
                title={!isOnline ? "This feature requires an internet connection" : "Summarize your notes"}
                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? <LoadingSpinner /> : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z" />
                    </svg>
                    Summarize
                </>
                )}
            </button>
        </div>
        
        {summary && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md">
            <h3 className="font-semibold text-indigo-800 mb-1">Summary:</h3>
            <p className="text-sm text-indigo-700">{summary}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Notes;
