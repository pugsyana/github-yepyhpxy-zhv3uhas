import React, { useState } from 'react';
import type { Workspace } from '../types';

interface WorkspaceSwitcherProps {
    workspaces: Workspace[];
    activeWorkspace: Workspace;
    setActiveWorkspaceId: (id: string) => void;
    setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
}

const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId,
    setWorkspaces
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const addWorkspace = () => {
        const name = prompt("Enter new workspace name:");
        if (name && name.trim()) {
            const newWorkspace: Workspace = {
                id: `ws_${Date.now()}`,
                name: name.trim(),
            };
            setWorkspaces(prev => [...prev, newWorkspace]);
            setActiveWorkspaceId(newWorkspace.id);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-md hover:bg-slate-200"
            >
                <span className="font-medium text-slate-700">{activeWorkspace.name}</span>
                 <svg className={`h-5 w-5 text-slate-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {workspaces.map(ws => (
                            <button
                                key={ws.id}
                                onClick={() => {
                                    setActiveWorkspaceId(ws.id);
                                    setIsOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                role="menuitem"
                            >
                                {ws.name}
                            </button>
                        ))}
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                            onClick={addWorkspace}
                            className="block w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100 font-medium"
                            role="menuitem"
                        >
                            + Add Workspace
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceSwitcher;
