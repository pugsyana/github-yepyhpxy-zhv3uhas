import React from 'react';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import type { Workspace } from '../types';

interface HeaderProps {
    workspaces: Workspace[];
    activeWorkspace: Workspace;
    setActiveWorkspaceId: (id: string) => void;
    setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
}

const Header: React.FC<HeaderProps> = ({ workspaces, activeWorkspace, setActiveWorkspaceId, setWorkspaces }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h1 className="text-2xl font-bold text-slate-800">Momentum</h1>
            </div>
            <WorkspaceSwitcher
                workspaces={workspaces}
                activeWorkspace={activeWorkspace}
                setActiveWorkspaceId={setActiveWorkspaceId}
                setWorkspaces={setWorkspaces}
            />
        </div>
      </div>
    </header>
  );
};

export default Header;
