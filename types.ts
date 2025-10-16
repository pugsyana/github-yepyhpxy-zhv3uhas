export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export interface BrainstormIdea {
  title: string;
  description: string;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface PlannerEvent {
  id: string;
  time: string; // e.g., "09:00"
  text: string;
}

export interface MindMapNode {
    id: string;
    text: string;
    children: MindMapNode[];
    parentId?: string;
}
