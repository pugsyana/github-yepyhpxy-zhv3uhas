
import React, { useState, useCallback } from 'react';
import Card from './Card';
import useLocalStorage from '../hooks/useLocalStorage';
import type { MindMapNode } from '../types';

const MindMapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12l-5-3"/>
        <path d="M12 12l5 3"/>
        <circle cx="12" cy="12" r="3"/>
        <circle cx="5" cy="8" r="2"/>
        <circle cx="19" cy="16" r="2"/>
    </svg>
);

interface MindMapProps {
    workspaceId: string;
}

const NodeComponent: React.FC<{ node: MindMapNode; updateNode: (id: string, text: string) => void; addNode: (parentId: string) => void; deleteNode: (id: string) => void; }> = ({ node, updateNode, addNode, deleteNode }) => {
    return (
        <div className="ml-6 my-2">
            <div className="flex items-center space-x-2 group">
                <input
                    type="text"
                    value={node.text}
                    onChange={(e) => updateNode(node.id, e.target.value)}
                    className="flex-grow p-1 text-sm bg-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Node..."
                />
                 <button onClick={() => addNode(node.id)} className="opacity-0 group-hover:opacity-100 text-indigo-500 hover:text-indigo-700 transition-opacity" aria-label="Add child node">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                </button>
                 <button onClick={() => deleteNode(node.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity" aria-label="Delete node">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            {node.children.map(child => <NodeComponent key={child.id} node={child} updateNode={updateNode} addNode={addNode} deleteNode={deleteNode} />)}
        </div>
    )
}

const MindMap: React.FC<MindMapProps> = ({ workspaceId }) => {
    const [rootNode, setRootNode] = useLocalStorage<MindMapNode>(`mindmap-${workspaceId}`, { id: 'root', text: 'Central Idea', children: [] });

    const updateNodeText = useCallback((id: string, text: string) => {
        const update = (node: MindMapNode): MindMapNode => {
            if (node.id === id) {
                return { ...node, text };
            }
            return { ...node, children: node.children.map(update) };
        };
        setRootNode(update(rootNode));
    }, [rootNode, setRootNode]);

    const addNodeToParent = useCallback((parentId: string) => {
        const newNode: MindMapNode = { id: `node_${Date.now()}`, text: '', children: [], parentId };
         const add = (node: MindMapNode): MindMapNode => {
            if (node.id === parentId) {
                return { ...node, children: [...node.children, newNode] };
            }
            return { ...node, children: node.children.map(add) };
        };
        setRootNode(add(rootNode));
    }, [rootNode, setRootNode]);

    const deleteNodeById = useCallback((id: string) => {
        if(id === 'root') return; // Cannot delete root
        const remove = (node: MindMapNode): MindMapNode => {
            return {
                ...node,
                children: node.children.filter(child => child.id !== id).map(remove)
            }
        };
        setRootNode(remove(rootNode));
    }, [rootNode, setRootNode]);

    return (
        <Card title="Mind Map" icon={<MindMapIcon />}>
             <div className="h-96 overflow-auto pr-2">
                <div className="flex items-center space-x-2 group">
                    <input
                        type="text"
                        value={rootNode.text}
                        onChange={(e) => updateNodeText('root', e.target.value)}
                        className="flex-grow p-2 font-semibold text-lg bg-indigo-50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Central Idea"
                    />
                    <button onClick={() => addNodeToParent('root')} className="opacity-0 group-hover:opacity-100 text-indigo-500 hover:text-indigo-700 transition-opacity" aria-label="Add child node">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    </button>
                </div>

                {rootNode.children.map(node => <NodeComponent key={node.id} node={node} updateNode={updateNodeText} addNode={addNodeToParent} deleteNode={deleteNodeById} />)}
             </div>
        </Card>
    );
};

export default MindMap;