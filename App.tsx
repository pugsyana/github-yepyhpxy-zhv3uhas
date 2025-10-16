// Fix: Corrected malformed import statement for React hooks.
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import * as d3 from "d3";

// Note: This is a self-contained, single-file application.
// Original shadcn/ui components were replaced with Tailwind-styled standard elements.
// D3.js is included for the mind map visualization.

// ================= Data types =================
interface Task {
    id: string;
    title: string;
    priority: number;
    weekPlacedOn?: string;
    userScheduled?: boolean;
    scheduledFor?: string;
    doneAt?: string;
    area?: string;
    someday?: boolean;
    due?: string;
    description?: string;
    subtasks?: { id: string; title: string; done: boolean }[];
    attachments?: { name: string; size: number }[];
    estimateMin?: number;
    dependencies?: string[];
}
interface Document {
    id: string;
    name: string;
    size: number;
}
interface DocItem {
    id: string;
    name: string;
    type: 'folder' | 'file' | 'link';
    parentId: string | null;
    size?: number;
    mimeType?: string;
    url?: string;
}
interface NotebookItem {
    id:string;
    name: string;
    parentId: string | null;
}
interface Note {
    id: string;
    title: string;
    content: string;
    notebookId: string;
    parentId: string | null;
}
interface Project {
    id: string;
    title: string;
    content: string;
    status: string;
    deadline: string | null;
}
interface ProjectStatus {
    name: string;
    color: string;
}
interface Workspace {
    id: string;
    name: string;
    color: string;
}
interface Priority {
    level: number;
    name: string;
    color: string;
}
interface TaskSettings {
    priorities: Priority[];
}
type Theme = 'light' | 'dark' | 'system';
interface BrainstormIdea {
  title: string;
  description: string;
}
interface MindMapNode {
    id: string;
    text: string;
    children: MindMapNode[];
}


// ================= Icons (inline, no CDN) =================
// Fix: Added explicit return type to iconProps to satisfy SVGProps type constraints for strokeLinecap/strokeLinejoin.
const iconProps = (className = "w-6 h-6"): React.SVGProps<SVGSVGElement> => ({ className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" });
// Fix: Added type for icon component props.
type IconComponentProps = { className?: string };
const IconBookOpen = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);
const IconBriefcase = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>);
const IconCalendar = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
const IconChevronDown = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><polyline points="6 9 12 15 18 9"/></svg>);
const IconChevronLeft = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><polyline points="15 18 9 12 15 6" /></svg>);
const IconChevronRight = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><polyline points="9 18 15 12 9 6" /></svg>);
const IconClipboardCheck = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/><path d="m9 14 2 2 4-4"/></svg>);
const IconSettings = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const IconSquarePlus = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);
const IconFileText = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>);
const IconPanelLeft = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="9" x2="9" y1="3" y2="21" /></svg>);
const IconPanelRight = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="15" x2="15" y1="3" y2="21" /></svg>);
const IconCornerDownLeft = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>);
const IconMoreHorizontal = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>);
const IconGripVertical = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><circle cx="9" cy="12" r="1"></circle><circle cx="9"cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>);
// Fix: Added specific prop types for IconTodayWithDate
type IconTodayWithDateProps = { className?: string; day: number; };
const IconTodayWithDate = ({ className, day }: IconTodayWithDateProps) => (
    <svg {...iconProps(className)}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <text x="50%" y="68%" textAnchor="middle" dy=".1em" fontSize="11" fontWeight="300" fill="currentColor">{day}</text>
    </svg>
);
const IconListTodo = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 6h8M8 12h8M8 18h8M4 6h.01M4 12h.01M4 18h.01" /></svg>);
const IconMindMap = ({ className }: IconComponentProps) => (
    <svg {...iconProps(className)}>
        <circle cx="12" cy="18" r="3"/>
        <circle cx="6" cy="6" r="3"/>
        <circle cx="18" cy="6" r="3"/>
        <path d="M12 15V9"/>
        <path d="M12 9c-3 0-6-3-6-3"/>
        <path d="M12 9c3 0 6-3 6-3"/>
    </svg>
);
const IconNotebook = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><path d="M2 6h4"/><path d="M2 12h4"/><path d="M2 18h4"/><path d="M6 2v20"/><path d="M10 2v20"/><rect x="6" y="2" width="16" height="20" rx="2" ry="2"/></svg>);
const IconSearch = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const IconSubtask = ({ className }: IconComponentProps) => (<svg {...iconProps(className)} transform="rotate(90) translate(0 -24)"><path d="M10 15V5 M15 10l-5 5-5-5"/></svg>);
const IconTrash = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
const IconWorkflow = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M8 12h8m-4-4v8"/></svg>);
const IconSun = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>);
const IconMoon = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>);
const IconLaptop = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0l1.28 2.55A1 1 0 0 1 20.28 20H3.72a1 1 0 0 1-.98-1.45L4 16z"></path></svg>);
const IconBold = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>);
const IconItalic = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>);
const IconHeading = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M20 18h-3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3"/></svg>);
const IconList = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><line x1="8" x2="21" y2="10" y1="10"/><line x1="8" x2="21" y2="6" y1="6"/><line x1="8" x2="21" y2="14" y1="14"/><line x1="8" x2="21" y2="18" y1="18"/><line x1="3" x2="3.01" y2="6" y1="6"/><line x1="3" x2="3.01" y2="10" y1="10"/><line x1="3" x2="3.01" y2="14" y1="14"/><line x1="3" x2="3.01" y2="18" y1="18"/></svg>);
const IconCheckSquare = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>);
const IconFolder = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>);
const IconLink = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>);
const IconUploadCloud = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><path d="M20 16.2A4.5 4.5 0 0 0 15.5 12H13a3 3 0 0 0-3-3H7.8A4.5 4.5 0 0 0 4 13.5V16.5A3.5 3.5 0 0 0 7.5 20H18a2 2 0 0 0 2-2v-1.8Z"/><path d="m9 12 3-3 3 3"/><path d="M12 9v9"/></svg>);
const IconLock = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const IconBrainstorm = ({ className }: IconComponentProps) => (<svg {...iconProps(className)}><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>);


// ================= Mock shadcn/ui Components =================
// Fix: Added explicit prop types for all mock components.
// Fix: Changed ButtonProps to a type intersection to correctly include all HTML button attributes.
type ButtonProps = {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'default', size = 'default', className = '', children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
    const sizeClasses = { default: "h-10 py-2 px-4", sm: "h-9 px-3 rounded-md", lg: "h-11 px-8 rounded-md", icon: "h-10 w-10" };
    const variantClasses = { default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90", destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90", outline: "border border-slate-200 bg-transparent hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-50", secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80", ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50", link: "underline-offset-4 hover:underline text-slate-900 dark:text-slate-50" };
    return (<button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} ref={ref} {...props}>{children}</button>);
});
const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (<div className={`rounded-xl border bg-white text-slate-950 shadow dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 ${className}`} {...props}>{children}</div>);
const CardHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (<div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>);
const CardTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => (<h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>);
const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (<div className={`p-6 pt-0 ${className}`}>{children}</div>);
// Fix: Correctly typed forwardedRef for Input component.
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
    <input
        className={`flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 ${className}`}
        ref={ref}
        {...props}
    />
));
interface BadgeProps {
    variant?: 'default' | 'secondary' | 'outline' | 'Not Started' | 'In Progress' | 'Completed' | string;
    className?: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
}
const Badge = ({ variant = 'default', className = '', children, style={} }: BadgeProps) => {
    const variantClasses = { 
        default: "bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80", 
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80", 
        outline: "text-slate-950 border-slate-200 dark:text-slate-50 dark:border-slate-800",
        'Not Started': "bg-gray-200 text-gray-800",
        'In Progress': "bg-blue-200 text-blue-800",
        'Completed': "bg-green-200 text-green-800",
    };
    // Fix: Cast variant to keyof variantClasses to allow indexing.
    return (<div style={style} className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses[variant as keyof typeof variantClasses] || ''} ${className}`}>{children}</div>)
};
// Fix: Added explicit type for DropdownMenuContext.
interface DropdownMenuContextType {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const DropdownMenuContext = React.createContext<DropdownMenuContextType>({ open: false, setOpen: () => {} });
const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) { setOpen(false); } }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
    return <DropdownMenuContext.Provider value={{ open, setOpen }}><div ref={menuRef} className="relative inline-block text-left">{children}</div></DropdownMenuContext.Provider>;
};
// Fix: Cast children in React.cloneElement to allow adding an onClick prop without type errors.
const DropdownMenuTrigger = ({ children, asChild }: { children: React.ReactElement, asChild?: boolean }) => { 
    const { setOpen } = React.useContext(DropdownMenuContext);
    if (asChild) {
        // Fix: Added type assertion to children.props to resolve TypeScript error.
        return React.cloneElement(children as React.ReactElement<any>, { onClick: (e: React.MouseEvent) => { (children.props as any).onClick?.(e); setOpen(o => !o); } });
    }
    // Fix: Added type assertion to children.props to resolve TypeScript error.
    return React.cloneElement(children as React.ReactElement<any>, { onClick: (e: React.MouseEvent) => { (children.props as any).onClick?.(e); setOpen(o => !o); } }); 
};
const DropdownMenuContent = ({ children, align = 'start', className = '' }: { children: React.ReactNode, align?: 'start' | 'end', className?: string }) => {
    const { open } = React.useContext(DropdownMenuContext);
    const alignClass = align === 'end' ? 'right-0' : 'left-0';
    if (!open) return null;
    return <div className={`absolute ${alignClass} z-10 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-900 dark:ring-slate-800 ${className}`}>{children}</div>;
};
const DropdownMenuItem = ({ children, onClick, onSelect, className }: { children: React.ReactNode, onClick?: () => void, onSelect?: () => void, className?: string }) => {
    const { setOpen } = React.useContext(DropdownMenuContext);
    return <a href="#" className={`text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 ${className}`} role="menuitem" onClick={(e) => { e.preventDefault(); onClick && onClick(); onSelect && onSelect(); setOpen(false); }}>{children}</a>;
};
const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => <div className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">{children}</div>;
// Fix: Updated DropdownMenuSeparator to accept a className prop and removed hardcoded margin to resolve type errors.
const DropdownMenuSeparator = ({ className }: { className?: string }) => <hr className={`border-t border-slate-200 dark:border-slate-800 ${className || ''}`} />;
// Fix: Added explicit type for TabsContext.
interface TabsContextType {
    activeTab: string;
    setActiveTab: (value: string) => void;
}
const TabsContext = React.createContext<TabsContextType>({ activeTab: '', setActiveTab: () => {} });
// Fix: Added explicit props type for Tabs and made defaultValue optional.
interface TabsProps {
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    children: React.ReactNode;
    className?: string;
}
const Tabs = ({ value, onValueChange, defaultValue, children, className }: TabsProps) => {
    const [internalTab, setInternalTab] = useState(defaultValue || '');
    const activeTab = value !== undefined ? value : internalTab;
    const setActiveTab = onValueChange !== undefined ? onValueChange : setInternalTab;
    const contextValue = useMemo(() => ({ activeTab, setActiveTab }), [activeTab, setActiveTab]);
    return <TabsContext.Provider value={contextValue}><div className={className}>{children}</div></TabsContext.Provider>;
};
const TabsList = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ${className}`}>{children}</div>;
const TabsTrigger = ({ value, children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; children: React.ReactNode; }) => {
    const { activeTab, setActiveTab } = React.useContext(TabsContext);
    const isActive = activeTab === value;
    return (<button onClick={() => setActiveTab(value)} className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isActive ? 'bg-white shadow-sm text-slate-950 dark:bg-slate-950 dark:text-slate-50' : ''} ${className}`} {...props}>{children}</button>);
};
const TabsContent = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string; }) => { const { activeTab } = React.useContext(TabsContext); return activeTab === value ? <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>{children}</div> : null; };

// ================= Utils & helpers =================
function getContrastYIQ(hexcolor: string | undefined){
    if (!hexcolor) return 'black';
    hexcolor = hexcolor.replace("#", "");
    if (hexcolor.length === 3) {
        hexcolor = hexcolor.split('').map(char => char + char).join('');
    }
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
}
function fmtDate(d: Date) { return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); }
export function carryAllTasks(carry: Task[], today: Task[]) { return { carry: [], today: [...carry, ...today] }; }
export function moveTaskPure(today: Task[], id: string) { const found = today.find((t) => t.id === id); return { found, today: today.filter((t) => t.id !== id) }; }
export function formatDuration(sec: number) { const m = Math.floor(sec / 60).toString().padStart(2, "0"); const s = Math.floor(sec % 60).toString().padStart(2, "0"); return `${m}:${s}`; }
export function startOfWeek(d: Date) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const day = x.getDay(); const diff = (day === 0 ? -6 : 1 - day); x.setDate(x.getDate() + diff); x.setHours(0, 0, 0, 0); return x; }
export function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
export function addDays(d: Date, n: number) { const y = new Date(d); y.setDate(y.getDate() + n); return y; }
export function mondayNextWeek(d: Date) { return addDays(startOfWeek(d), 7); }
export function isMonday(d: Date) { return d.getDay() === 1; }
export const INDENT = "  ";
export function findLineStart(text: string, pos: number) { while (pos > 0 && text[pos - 1] !== "\n") pos--; return pos; }
export function applyIndent(text: string, start: number, end: number, unindent = false, indentArg = INDENT) { const ls = findLineStart(text, start); const le = end; let newText = text; const starts = [ls]; for (let i = ls; i < le; i++) if (newText[i] === "\n") starts.push(i + 1); let dS = 0, dE = 0, off = 0; for (const s0r of starts) { const s0 = s0r + off; if (!unindent) { newText = newText.slice(0, s0) + indentArg + newText.slice(s0); if (start >= s0) dS += indentArg.length; dE += indentArg.length; off += indentArg.length; } else { if (newText.slice(s0, s0 + indentArg.length) === INDENT) { newText = newText.slice(0, s0) + newText.slice(s0 + indentArg.length); if (start > s0) dS -= Math.min(indentArg.length, start - s0); dE -= indentArg.length; off -= indentArg.length; } else if (newText[s0] === "\t") { newText = newText.slice(0, s0) + newText.slice(s0 + 1); if (start > s0) dS -= Math.min(1, start - s0); dE -= 1; off -= 1; } } } return { text: newText, start: start + dS, end: end + dE }; }
export function insertChecklistAt(text: string, start: number, end: number) { const ls = findLineStart(text, start); const ins = "- [ ] "; const nt = text.slice(0, ls) + ins + text.slice(ls); const np = start + ins.length; return { text: nt, start: np, end: np }; }
export function insertLinkScaffoldAt(text: string, start: number, end: number) { if (end > start) { const sel = text.slice(start, end); const nt = text.slice(0, start) + "[[" + sel + "]]" + text.slice(end); const np = start + 2 + sel.length; return { text: nt, start: np, end: np }; } const ins = "[[link]]"; const nt = text.slice(0, start) + ins + text.slice(end); const np = start + 2; return { text: nt, start: np, end: np + 4 }; }
export function continueChecklistNewline(text: string, pos: number) { const ls = findLineStart(text, pos); const le = text.indexOf('\n', ls) === -1 ? text.length : text.indexOf('\n', ls); const line = text.slice(ls, le); if (!/^\s*- \[( |x)\] /i.test(line)) return null; const ins = "\n- [ ] "; const nt = text.slice(0, le) + ins + text.slice(le); const np = le + ins.length; return { text: nt, start: np, end: np }; }
export function parseQuickTask(input: string) { let title = input.trim(); let area; let someday = false; let due; if (/\#work\b/i.test(title)) { area = 'Work'; title = title.replace(/\s*#work\b/ig, ''); } if (/\#family\b/i.test(title)) { area = 'Family'; title = title.replace(/\s*#family\b/ig, ''); } if (/\#personal\b/i.test(title)) { area = 'Personal'; title = title.replace(/\s*#personal\b/ig, ''); } if (/\#someday\b/i.test(title)) { someday = true; title = title.replace(/\s*#someday\b/ig, ''); } const m = title.match(/@([0-9]{4}-[0-9]{2}-[0-9]{2})/); if (m) { due = m[1]; title = title.replace(/\s*@([0-9]{4}-[0-9]{2}-[0-9]{2})/, ''); } return { title: title.trim(), area, someday, due }; }
export function computeDropIndex(srcIndex: number, dstIndex: number) { return srcIndex < dstIndex ? dstIndex : dstIndex + 1; }
export function formatBytes(bytes: number, decimals = 2) { if (bytes === 0) return '0 Bytes'; const k = 1024; const dm = decimals < 0 ? 0 : decimals; const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]; }
export function parseHtmlToMindMap(htmlContent: string, title: string): MindMapNode {
    const root: MindMapNode = { id: 'root', text: title || 'Central Idea', children: [] };
    if (!htmlContent) return root;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        const firstList = doc.querySelector('ul, ol');
        if (!firstList) return root;

        const processList = (listElement: Element, parentNode: MindMapNode) => {
            for (const li of Array.from(listElement.children)) {
                if (li.tagName === 'LI') {
                    // Extract text content directly from the LI, excluding text from nested lists.
                    const liText = Array.from(li.childNodes)
                        .filter(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
                        .map(node => node.textContent?.trim())
                        .join(' ');
                    
                    if (liText) {
                        const newNode: MindMapNode = {
                            id: `mm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                            text: liText,
                            children: []
                        };
                        parentNode.children.push(newNode);

                        const nestedList = li.querySelector('ul, ol');
                        if (nestedList) {
                            processList(nestedList, newNode);
                        }
                    }
                }
            }
        };

        processList(firstList, root);
        return root;
    } catch (e) {
        console.error("Failed to parse HTML for mind map", e);
        return root; // Return the default root on error
    }
}

// ================= Persistence (Local-first) =================
const seedCarry: Task[] = [{ id: "c1", title: "Finish intake form", priority: 2 }, { id: "c2", title: "Draft family budget v1", priority: 3 }];
const defaultWorkspaces: Workspace[] = [
    { id: 'personal', name: 'Personal', color: '#3b82f6' },
    { id: 'work', name: 'Work', color: '#8b5cf6' },
    { id: 'family', name: 'Family', color: '#10b981' },
];
const LS_PREFIX = "pkmState::"; 
const lsKey = (workspaceId: string) => `${LS_PREFIX}${workspaceId}`; 
const todayKey = (d: Date) => d.toISOString().slice(0, 10);
function loadWorkspaceState(workspaceId: string) { try { const raw = localStorage.getItem(lsKey(workspaceId)); return raw ? JSON.parse(raw) : null; } catch { return null; } }
function saveWorkspaceState(workspaceId: string, state: any) { try { localStorage.setItem(lsKey(workspaceId), JSON.stringify(state)); } catch { } }
function clearWorkspaceState(workspaceId: string) { try { localStorage.removeItem(lsKey(workspaceId)); } catch { } }
function collectAllFromLocalStorage() { const data: Record<string, any> = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(LS_PREFIX)) { try { data[k.slice(LS_PREFIX.length)] = JSON.parse(localStorage.getItem(k) || 'null'); } catch { } } } } catch { } return data; }
function buildBackupPayload(workspaces: Record<string, any>, lastWorkspace: string | null) { return { version: 1, exportedAt: new Date().toISOString(), lastWorkspace, workspaces }; }
function stringifyBackup(obj: any) { try { return JSON.stringify(obj, null, 2); } catch { return '{}'; } }
function downloadText(filename: string, text: string) { try { const blob = new Blob([text], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 0); } catch { } }
function applyBackupToLocalStorage(payload: any) { if (!payload || typeof payload !== 'object' || typeof payload.workspaces !== 'object') return { ok: false, reason: 'Invalid payload' }; try { const existing: string[] = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(LS_PREFIX)) existing.push(k); } existing.forEach(k => { try { localStorage.removeItem(k); } catch { } }); for (const [name, state] of Object.entries(payload.workspaces)) { try { localStorage.setItem(lsKey(name), JSON.stringify(state)); } catch { } } if (payload.lastWorkspace && typeof payload.lastWorkspace === 'string') { try { localStorage.setItem('lastWorkspace', payload.lastWorkspace); } catch { } } return { ok: true }; } catch (e: any) { return { ok: false, reason: String(e?.message || e) }; } }

// ================= Gemini Services =================
const brainstormIdeas = async (topic: string): Promise<BrainstormIdea[]> => {
    if (!topic.trim()) {
        return [];
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Brainstorm 5 creative and actionable ideas related to the topic: "${topic}". For each idea, provide a short title and a one-sentence description.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        ideas: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: {
                                        type: Type.STRING,
                                        description: 'A short, catchy title for the idea.'
                                    },
                                    description: {
                                        type: Type.STRING,
                                        description: 'A one-sentence description of the idea.'
                                    },
                                },
                                required: ["title", "description"],
                            },
                        },
                    },
                    required: ["ideas"],
                },
            },
        });

        const jsonResponse = JSON.parse(response.text);
        return jsonResponse.ideas || [];

    } catch (error) {
        console.error("Error brainstorming ideas:", error);
        throw new Error("Failed to brainstorm ideas. Please check the topic and try again.");
    }
};

// ================= Components (must be defined before App) =================

function CalendarView({ selectedDate, onDateSelect }: { selectedDate: Date; onDateSelect: (date: Date) => void }) {
    const { setOpen } = React.useContext(DropdownMenuContext);
    const [displayDate, setDisplayDate] = useState(selectedDate || new Date());

    const startOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const endOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay(); // Sunday - 0, Monday - 1, etc.
    const daysInMonth = endOfMonth.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(displayDate.getFullYear(), displayDate.getMonth(), i));
    }

    const today = new Date();

    const changeMonth = (offset: number) => {
        setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + offset, 1));
    };

    const handleDateClick = (day: Date) => {
        onDateSelect(day);
        setOpen(false);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-2">
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => changeMonth(-1)}>
                    <IconChevronLeft className="w-4 h-4" />
                </Button>
                <div className="font-semibold text-sm">
                    {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => changeMonth(1)}>
                    <IconChevronRight className="w-4 h-4" />
                </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`} className="w-10">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
                {days.map((day, index) => {
                    if (!day) return <div key={`blank-${index}`} />;
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, today);
                    return (
                        <button key={day.toISOString()} onClick={() => handleDateClick(day)} className={`w-10 h-10 rounded-full text-sm flex items-center justify-center transition-colors ${isSelected ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900' : isToday ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function TopBar({ activeWorkspace, date, setDate }: { activeWorkspace: Workspace | null; date: Date; setDate: React.Dispatch<React.SetStateAction<Date>> }) {
    const activeWsName = activeWorkspace ? activeWorkspace.name : 'Global';
    const activeWsColor = activeWorkspace ? activeWorkspace.color : '#64748b';

    return (
        <header className="flex-shrink-0 h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{backgroundColor: activeWsColor}}></span>
                <h1 className="text-lg font-semibold">{activeWsName}</h1>
                <div className="flex items-center gap-2 ml-4">
                     <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setDate(d => addDays(d, -1))}>
                        <IconChevronLeft className="w-4 h-4" />
                     </Button>
                     <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="ghost" className="text-base flex items-center gap-2">
                                <IconCalendar className="w-4 h-4 text-slate-500" />
                                {fmtDate(date)}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-80">
                            <CalendarView selectedDate={date} onDateSelect={setDate} />
                        </DropdownMenuContent>
                     </DropdownMenu>
                     <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setDate(d => addDays(d, 1))}>
                        <IconChevronRight className="w-4 h-4" />
                     </Button>
                </div>
            </div>
            <div></div>
        </header>
    );
}

function WorkspaceSidebar({ workspaces, activeWorkspaceId, setActiveWorkspaceId, onManageWorkspaces, activeView, setActiveView, onOpenSearch, date, activeMode, onQuickAdd }: { workspaces: Workspace[], activeWorkspaceId: string | null, setActiveWorkspaceId: (id: string | null) => void, onManageWorkspaces: () => void, activeView: string, setActiveView: (view: string) => void, onOpenSearch: () => void, date: Date, activeMode: string, onQuickAdd: () => void }) {
    const Separator = () => <div className="h-0.5 w-8 bg-slate-200 dark:bg-slate-700 rounded-full" />;

    const NavIconButton = ({ title, children, onClick, isActive }: { title: string, children: React.ReactNode, onClick: () => void, isActive: boolean }) => (
        <div className="w-full px-2 group relative">
            <button
                onClick={onClick}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title={title}
            >
                {children}
            </button>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {title}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
        </div>
    );

    return (
        <div className="w-14 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center pt-4 shrink-0">
            <div>
                <div className="space-y-4">
                    {workspaces.map(ws => (
                        <div key={ws.id} className="w-full px-2 group relative">
                            <button 
                                onClick={() => setActiveWorkspaceId(ws.id)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg relative transition-all duration-200 ease-in-out transform hover:scale-105
                                            ${activeMode === 'workspace' && activeWorkspaceId === ws.id 
                                                ? 'ring-2 ring-black dark:ring-slate-300 text-black shadow-lg' 
                                                : 'text-white opacity-70 hover:opacity-100'
                                            }`}
                                style={{ backgroundColor: ws.color, color: getContrastYIQ(ws.color) }}
                                title={ws.name}
                            >
                                {ws.name.charAt(0).toUpperCase()}
                            </button>
                            {/* Tooltip */}
                            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {ws.name}
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="my-4 flex justify-center">
                    <Separator />
                </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
                <NavIconButton title="Search (Cmd+K)" onClick={onOpenSearch} isActive={false}>
                    <IconSearch className="w-5 h-5" />
                </NavIconButton>
                <NavIconButton title="Today" onClick={() => setActiveView('today')} isActive={activeMode === 'global' && activeView === 'today'}>
                    <IconTodayWithDate day={date.getDate()} className="w-5 h-5" />
                </NavIconButton>
                <NavIconButton title="Tasks" onClick={() => setActiveView('tasks')} isActive={activeMode === 'global' && activeView === 'tasks'}>
                    <IconClipboardCheck className="w-5 h-5" />
                </NavIconButton>
                <NavIconButton title="Calendar" onClick={() => setActiveView('calendar')} isActive={activeMode === 'global' && activeView === 'calendar'}>
                    <IconCalendar className="w-5 h-5" />
                </NavIconButton>
                <NavIconButton title="Notes" onClick={() => setActiveView('notes')} isActive={activeMode === 'global' && activeView === 'notes'}>
                    <IconNotebook className="w-5 h-5" />
                </NavIconButton>
                <NavIconButton title="Docs" onClick={() => setActiveView('docs')} isActive={activeMode === 'global' && activeView === 'docs'}>
                    <IconFileText className="w-5 h-5" />
                </NavIconButton>
                <NavIconButton title="Quick Add" onClick={onQuickAdd} isActive={false}>
                    <IconSquarePlus className="w-5 h-5" />
                </NavIconButton>
            </div>

            <div className="flex-grow" />

            <div className="w-full flex flex-col items-center space-y-4 pb-4">
                <Separator />
                <button 
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    onClick={onManageWorkspaces}
                    title="Manage Workspaces"
                >
                    <IconSettings className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
            </div>
        </div>
    );
}

interface GlobalLayoutProps {
    activeView: string;
    allData: Record<string, any>;
    workspaces: Workspace[];
    onOpenDetails: (workspaceId: string, taskId: string) => void;
    onCompleteTask: (workspaceId: string, taskId: string) => void;
    onMoveTask: (workspaceId: string, taskId: string, dest: 'today' | 'week' | 'later') => void;
    taskSettings: TaskSettings;
    onDeleteTask: (workspaceId: string, taskId: string) => void;
}

function GlobalLayout(props: GlobalLayoutProps) {
    const { activeView } = props;
    return (
        <div className="p-4 h-full">
            {activeView === 'today' && <GlobalTodayView {...props} />}
            {activeView === 'tasks' && <GlobalTasksView {...props} />}
            {activeView === 'calendar' && <div className="flex items-center justify-center h-full"><p className="text-slate-500">Global Calendar view coming soon.</p></div>}
            {activeView === 'notes' && <div className="flex items-center justify-center h-full"><p className="text-slate-500">Global Notes view coming soon.</p></div>}
            {activeView === 'docs' && <div className="flex items-center justify-center h-full"><p className="text-slate-500">Global Docs view coming soon.</p></div>}
        </div>
    );
}

type TaskListName = 'inbox' | 'big3' | 'other';
// ... other component definitions

interface MobileLayoutProps {
    carry: Task[];
    onCarryAll: () => void;
    onCarryOne: (id: string) => void;
    todayBucket: Task[];
    weekBucket: Task[];
    laterBucket: Task[];
    inboxTasks: Task[];
    big3Tasks: Task[];
    otherTasks: Task[];
    note: string;
    setNote: (note: string) => void;
    onAddTask: () => void;
    newTask: string;
    setNewTask: React.Dispatch<React.SetStateAction<string>>;
    onMoveTask: (id: string, dest: 'today' | 'week' | 'later') => void;
    onScheduleTask: (id: string, date: Date) => void;
    date: Date;
    doneToday: Task[];
    onCompleteTask: (id: string) => void;
    onOpenDetails: (id: string) => void;
    onDeleteTask: (id: string) => void;
    taskSettings: TaskSettings;
    onMoveTodayTask: (taskId: string, sourceList: TaskListName, destList: TaskListName) => void;
    blockedTasks: Record<string, { isBlocked: boolean; blockers: string[] }>;
    allTasksById: Map<string, Task>;
}

function MobileLayout(props: MobileLayoutProps) {
    return (
        <div className="p-3">
            <Tabs defaultValue="tasks">
                <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="plan">Plan</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="note">Note</TabsTrigger>
                </TabsList>
                <TabsContent value="plan">
                    <PlanPane {...props} compact />
                </TabsContent>
                <TabsContent value="tasks">
                    <TasksPane {...props} compact onOpenDetails={props.onOpenDetails} />
                </TabsContent>
                <TabsContent value="note">
                    <NotesPane {...props} compact />
                </TabsContent>
            </Tabs>
            <div className="fixed right-4 bottom-4">
                <Button className="rounded-full h-12 w-12 p-0" onClick={props.onAddTask}>
                    <IconSquarePlus className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}

interface WorkspaceManagerProps {
    workspaces: Workspace[];
    onAdd: () => void;
    onUpdate: (id: string, patch: { name?: string; color?: string }) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
    taskSettings: TaskSettings;
    onUpdateTaskSettings: React.Dispatch<React.SetStateAction<TaskSettings>>;
    rolloverEnabled: boolean;
    setRolloverEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    onOpenBackup: () => void;
    onResetDemo: () => void;
    device: string;
    setDevice: React.Dispatch<React.SetStateAction<string>>;
    theme: Theme;
    setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

function WorkspaceManager({ workspaces, onAdd, onUpdate, onDelete, onClose, taskSettings, onUpdateTaskSettings, rolloverEnabled, setRolloverEnabled, onOpenBackup, onResetDemo, device, setDevice, theme, setTheme }: WorkspaceManagerProps) {
    const handlePriorityChange = (index: number, field: string, value: string | number) => {
        onUpdateTaskSettings(currentSettings => {
            const newPriorities = [...currentSettings.priorities];
            newPriorities[index] = { ...newPriorities[index], [field]: value };
            return { ...currentSettings, priorities: newPriorities };
        });
    };
    
    const addPriority = () => {
        onUpdateTaskSettings(currentSettings => {
            const newLevel = Math.max(0, ...currentSettings.priorities.map(p => p.level)) + 1;
            const newPriorities = [...currentSettings.priorities, { level: newLevel, name: 'New', color: '#cccccc' }];
            return { ...currentSettings, priorities: newPriorities };
        });
    };

    const deletePriority = (index: number) => {
        onUpdateTaskSettings(currentSettings => {
            if (currentSettings.priorities.length <= 1) {
                console.error("You must have at least one priority level.");
                return currentSettings;
            }
            const newPriorities = currentSettings.priorities.filter((_, i) => i !== index);
            return { ...currentSettings, priorities: newPriorities };
        });
    };

    const ThemeButton = ({ value, current, children }: { value: Theme, current: Theme, children: React.ReactNode }) => (
        <button
            onClick={() => setTheme(value)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md transition-colors ${
                current === value
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <Tabs defaultValue="workspaces">
                    <CardHeader>
                        <TabsList className="grid w-full grid-cols-4">
                           <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
                           <TabsTrigger value="priority-tags">Priorities</TabsTrigger>
                           <TabsTrigger value="general">General</TabsTrigger>
                           <TabsTrigger value="data">Data</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <TabsContent value="workspaces">
                            <div className="space-y-4">
                                {workspaces.map((ws: Workspace) => (
                                    <div key={ws.id} className="flex items-center gap-4">
                                        <input 
                                            type="color" 
                                            value={ws.color} 
                                            onChange={(e) => onUpdate(ws.id, { color: e.target.value })}
                                            className="w-10 h-10 p-1 border-none cursor-pointer rounded-md"
                                        />
                                        <Input 
                                            value={ws.name}
                                            onChange={(e) => onUpdate(ws.id, { name: e.target.value })}
                                            className="flex-grow"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => onDelete(ws.id)}>
                                            <IconTrash className="w-4 h-4 text-slate-500 hover:text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-between">
                                <Button onClick={onAdd}>Add Workspace</Button>
                                <Button variant="outline" onClick={onClose}>Done</Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="priority-tags">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    {taskSettings.priorities.map((p: Priority, index: number) => (
                                        <div key={p.level} className="flex items-center gap-2">
                                             <input 
                                                type="color" 
                                                value={p.color} 
                                                onChange={(e) => handlePriorityChange(index, 'color', e.target.value)}
                                                className="w-10 h-10 p-1 border-none cursor-pointer rounded-md bg-transparent"
                                            />
                                            <Input 
                                                value={p.name}
                                                onChange={(e) => handlePriorityChange(index, 'name', e.target.value)}
                                                className="flex-grow"
                                                placeholder={`Level ${p.level} Name`}
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => deletePriority(index)}>
                                                <IconTrash className="w-4 h-4 text-slate-500 hover:text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button onClick={addPriority}>Add Priority</Button>
                            </div>
                             <div className="mt-6 flex justify-end">
                                <Button variant="outline" onClick={onClose}>Done</Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="general">
                            <div className="space-y-6">
                                <div className="p-2 rounded-lg border">
                                    <h4 className="font-medium text-sm mb-1 px-1">Appearance</h4>
                                    <p className="text-sm text-slate-500 mb-3 px-1">Choose how the application looks.</p>
                                    <div className="flex space-x-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                        <ThemeButton value="light" current={theme}><IconSun className="w-4 h-4" /> Light</ThemeButton>
                                        <ThemeButton value="dark" current={theme}><IconMoon className="w-4 h-4" /> Dark</ThemeButton>
                                        <ThemeButton value="system" current={theme}><IconLaptop className="w-4 h-4" /> System</ThemeButton>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg border">
                                    <div>
                                        <h4 className="font-medium">Rollover Tasks</h4>
                                        <p className="text-sm text-slate-500">Automatically move unfinished tasks from 'This Week' on Mondays.</p>
                                    </div>
                                    <button onClick={() => setRolloverEnabled((e: boolean) => !e)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${rolloverEnabled ? 'bg-slate-900 dark:bg-slate-50' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition-transform ${rolloverEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg border">
                                     <div>
                                         <h4 className="font-medium">Interface View</h4>
                                         <p className="text-sm text-slate-500">Switch between desktop and mobile layouts.</p>
                                     </div>
                                     <button id="device-toggle" onClick={() => setDevice((d: string) => d === 'desktop' ? 'mobile' : 'desktop')} className="flex items-center w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded-full p-1">
                                         <span className={`flex items-center justify-center w-1/2 h-full rounded-full transition-transform transform ${device === 'desktop' ? 'translate-x-0 bg-white dark:bg-slate-900' : 'translate-x-full bg-white dark:bg-slate-900'}`}>
                                             {device === 'desktop' ? <IconPanelLeft className="w-4 h-4" /> : <IconPanelRight className="w-4 h-4" />}
                                         </span>
                                     </button>
                                 </div>
                            </div>
                             <div className="mt-6 flex justify-end">
                                <Button variant="outline" onClick={onClose}>Done</Button>
                            </div>
                        </TabsContent>
                         <TabsContent value="data">
                             <div className="space-y-4">
                                <div className="flex items-center justify-between p-2 rounded-lg border">
                                    <div>
                                        <h4 className="font-medium">Backup & Export</h4>
                                        <p className="text-sm text-slate-500">Save all your data to a JSON file, or restore from a backup.</p>
                                    </div>
                                    <Button onClick={onOpenBackup}>Open Utility</Button>
                                 </div>
                                 <div className="flex items-center justify-between p-2 rounded-lg border border-red-500/50">
                                     <div>
                                        <h4 className="font-medium text-red-600 dark:text-red-400">Reset Demo Data</h4>
                                        <p className="text-sm text-slate-500">Reset the current workspace to its original demo state.</p>
                                    </div>
                                    <Button variant="destructive" onClick={onResetDemo}>Reset</Button>
                                 </div>
                             </div>
                             <div className="mt-6 flex justify-end">
                                <Button variant="outline" onClick={onClose}>Done</Button>
                            </div>
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>
        </div>
    );
}

// Fix: Implement missing components to resolve "Cannot find name" errors.
function TaskItem({ task, onComplete, onOpenDetails, taskSettings, isDone = false, onDelete, draggable, onDragStart, onDragEnd, isDragged, isBlocked, blockerTitles }: { task: Task, onComplete?: (id: string) => void, onOpenDetails: (id: string) => void, taskSettings: TaskSettings, isDone?: boolean, onDelete?: (id: string) => void, draggable?: boolean, onDragStart?: React.DragEventHandler<HTMLDivElement>, onDragEnd?: React.DragEventHandler<HTMLDivElement>, isDragged?: boolean, isBlocked?: boolean, blockerTitles?: string[] }) {
    const priority = taskSettings.priorities.find(p => p.level === task.priority);
    const subtaskProgress = task.subtasks && task.subtasks.length > 0 ? {
        done: task.subtasks.filter(st => st.done).length,
        total: task.subtasks.length,
    } : null;
    const tooltipText = isBlocked && blockerTitles && blockerTitles.length > 0 ? `Blocked by: ${blockerTitles.join(', ')}` : undefined;


    return (
        <div 
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 group transition-opacity ${draggable ? 'cursor-grab' : ''} ${isDragged ? 'opacity-30' : ''} ${isBlocked ? 'opacity-60' : ''}`}
        >
            <div className="w-7 flex-shrink-0 flex items-center">
                {isBlocked ? (
                    <div title={tooltipText}>
                        <IconLock className="w-4 h-4 text-slate-500" />
                    </div>
                ) : (
                    onComplete && <input type="checkbox" checked={isDone} onChange={() => onComplete && onComplete(task.id)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                )}
            </div>
            <button className={`flex-grow text-left flex items-center`} onClick={() => onOpenDetails(task.id)}>
                <span className={`text-sm ${isDone ? 'line-through text-slate-500' : ''}`}>{task.title}</span>
                {subtaskProgress && !isDone && (
                    <span className="ml-2 text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded px-1.5 py-0.5">
                        {subtaskProgress.done}/{subtaskProgress.total}
                    </span>
                )}
            </button>
            {!isDone && priority && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priority.color }} title={priority.name}></div>}
            {onDelete && (
                <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}>
                    <IconTrash className="w-4 h-4 text-slate-500 hover:text-red-500" />
                </Button>
            )}
        </div>
    )
}

function PlanPane({ carry, todayBucket, weekBucket, laterBucket, onOpenDetails, taskSettings, compact, blockedTasks, allTasksById, onDeleteTask }: any) {
    const renderTaskList = (title: string, tasks: Task[]) => (
        <Card>
            <CardHeader><CardTitle>{title} ({tasks.length})</CardTitle></CardHeader>
            <CardContent>
                {tasks.map((t: Task) => {
                    const blockedInfo = blockedTasks[t.id];
                    const isBlocked = blockedInfo?.isBlocked;
                    const blockerTitles = blockedInfo?.blockers.map((id: string) => allTasksById.get(id)?.title || 'Unknown Task');
                    return (
                        <TaskItem 
                            key={t.id} 
                            task={t} 
                            onOpenDetails={onOpenDetails} 
                            taskSettings={taskSettings}
                            isBlocked={isBlocked}
                            blockerTitles={blockerTitles}
                            onDelete={onDeleteTask}
                        />
                    );
                })}
            </CardContent>
        </Card>
    );
    
    return (
        <div className={`space-y-4 ${compact ? 'p-2' : 'p-6'}`}>
            {carry.length > 0 && <Card><CardHeader><CardTitle>Carry Over ({carry.length})</CardTitle></CardHeader><CardContent>{carry.map((t: Task) => <div key={t.id}>{t.title}</div>)}</CardContent></Card>}
            {renderTaskList("Today", todayBucket)}
            {renderTaskList("This Week", weekBucket)}
            {renderTaskList("Later", laterBucket)}
        </div>
    )
}

function TasksPane({ 
    inboxTasks, big3Tasks, otherTasks,
    doneToday, onCompleteTask, onOpenDetails, 
    newTask, setNewTask, onAddTask, taskSettings, 
    compact, onDeleteTask, isEmbedded = false, 
    onMoveTodayTask, blockedTasks, allTasksById
}: any) {
    const sortedDone = useMemo(() => {
        return [...doneToday].sort((a, b) => new Date(b.doneAt!).getTime() - new Date(a.doneAt!).getTime());
    }, [doneToday]);

    const [draggedItem, setDraggedItem] = useState<{ id: string, source: TaskListName } | null>(null);
    const [dragOverList, setDragOverList] = useState<TaskListName | null>(null);

    const handleDragStart = (e: React.DragEvent, task: Task, source: TaskListName) => {
        if (blockedTasks[task.id]?.isBlocked) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.setData('source', source);
        setDraggedItem({ id: task.id, source });
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverList(null);
    };

    const handleDrop = (e: React.DragEvent, target: TaskListName) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const source = e.dataTransfer.getData('source') as TaskListName;
        
        if (taskId && source && onMoveTodayTask) {
            onMoveTodayTask(taskId, source, target);
        }
        handleDragEnd();
    };

    const handleDragOver = (e: React.DragEvent, list: TaskListName) => {
        e.preventDefault();
        setDragOverList(list);
    };

    const paddingClass = isEmbedded ? '' : (compact ? 'p-2' : 'p-6');

    const renderTaskList = (title: string, tasks: Task[], listId: TaskListName) => (
        <div 
            onDrop={(e) => handleDrop(e, listId)} 
            onDragOver={(e) => handleDragOver(e, listId)}
            onDragLeave={() => setDragOverList(null)}
            className={`p-2 rounded-lg transition-colors ${dragOverList === listId ? 'bg-slate-100 dark:bg-slate-800/50' : ''}`}
        >
            <h3 className="font-semibold mb-2 text-sm uppercase text-slate-500 tracking-wider">{title} ({tasks.length})</h3>
            <div className="space-y-1">
                 {tasks.map((t: Task) => {
                    const blockedInfo = blockedTasks[t.id];
                    const isBlocked = blockedInfo?.isBlocked;
                    const blockerTitles = blockedInfo?.blockers.map((id: string) => allTasksById.get(id)?.title || 'Unknown Task');
                    return (
                        <TaskItem 
                            key={t.id} 
                            task={t} 
                            onComplete={onCompleteTask} 
                            onOpenDetails={onOpenDetails} 
                            taskSettings={taskSettings}
                            draggable={!isBlocked}
                            onDragStart={(e) => handleDragStart(e, t, listId)}
                            onDragEnd={handleDragEnd}
                            isDragged={draggedItem?.id === t.id}
                            isBlocked={isBlocked}
                            blockerTitles={blockerTitles}
                            onDelete={onDeleteTask}
                        />
                    );
                })}
                {tasks.length === 0 && <div className="text-center text-xs text-slate-400 py-3">Empty</div>}
                {listId === 'big3' && tasks.length >= 3 && <p className="text-xs text-slate-500 text-center py-1">Big 3 is full.</p>}
            </div>
        </div>
    );

    return (
        <div className={`space-y-4 ${paddingClass}`}>
            <Card>
                <CardHeader>
                    <form onSubmit={e => { e.preventDefault(); onAddTask(); }} className="flex gap-2">
                        <Input value={newTask} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)} placeholder="Add a task to your inbox..." />
                        <Button type="submit">Add</Button>
                    </form>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {renderTaskList("INBOX (BRAIN DUMP)", inboxTasks, 'inbox')}
                        {renderTaskList("DAILY BIG 3", big3Tasks, 'big3')}
                        {renderTaskList("OTHER TASKS", otherTasks, 'other')}
                    </div>
                </CardContent>
                {sortedDone.length > 0 && (
                    <CardContent className="border-t pt-4">
                        <h3 className="font-semibold mb-2 text-slate-600 dark:text-slate-400">Done ({sortedDone.length})</h3>
                        {sortedDone.map((t: Task) => (
                            <TaskItem 
                                key={t.id} 
                                task={t} 
                                onOpenDetails={onOpenDetails} 
                                taskSettings={taskSettings} 
                                isDone={true} 
                                onDelete={onDeleteTask}
                            />
                        ))}
                    </CardContent>
                )}
            </Card>
        </div>
    )
}


function NotesPane({ note, setNote, compact }: any) {
    return (
        <div className={`${compact ? 'p-2' : 'p-6'}`}>
            <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full h-[70vh] p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                placeholder="Start writing your daily note..."
            />
        </div>
    )
}

function TaskItemGlobal({ task, workspace, onComplete, onOpenDetails, taskSettings, isDone = false, onDelete, isBlocked, blockerTitles }: { task: Task, workspace: Workspace, onComplete?: (workspaceId: string, taskId: string) => void, onOpenDetails: (workspaceId: string, taskId: string) => void, taskSettings: TaskSettings, isDone?: boolean, onDelete?: (workspaceId: string, taskId: string) => void, isBlocked?: boolean, blockerTitles?: string[] }) {
    const priority = taskSettings.priorities.find(p => p.level === task.priority);
    const subtaskProgress = task.subtasks && task.subtasks.length > 0 ? {
        done: task.subtasks.filter(st => st.done).length,
        total: task.subtasks.length,
    } : null;
    const tooltipText = isBlocked && blockerTitles && blockerTitles.length > 0 ? `Blocked by: ${blockerTitles.join(', ')}` : undefined;

    return (
        <div className={`flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 group ${isBlocked ? 'opacity-60' : ''}`}>
            <div className="w-7 flex-shrink-0 flex items-center">
                {isBlocked ? (
                    <div title={tooltipText}>
                        <IconLock className="w-4 h-4 text-slate-500" />
                    </div>
                ) : (
                    onComplete && <input type="checkbox" checked={isDone} onChange={() => onComplete && onComplete(workspace.id, task.id)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                )}
            </div>
            <button className={`flex-grow text-left flex items-center`} onClick={() => onOpenDetails(workspace.id, task.id)}>
                <span className={`text-sm ${isDone ? 'line-through text-slate-500' : ''}`}>{task.title}</span>
                {subtaskProgress && !isDone && (
                    <span className="ml-2 text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded px-1.5 py-0.5">
                        {subtaskProgress.done}/{subtaskProgress.total}
                    </span>
                )}
                <span className="ml-2 text-xs text-slate-400">{workspace.name}</span>
            </button>
            {!isDone && priority && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priority.color }} title={priority.name}></div>}
            {onDelete && (
                <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onDelete(workspace.id, task.id); }}>
                    <IconTrash className="w-4 h-4 text-slate-500 hover:text-red-500" />
                </Button>
            )}
        </div>
    )
}

function GlobalTodayView({ allData, workspaces, onOpenDetails, onCompleteTask, taskSettings, onDeleteTask }: GlobalLayoutProps) {
    const { openTasks, doneTasks, allTasksById } = useMemo(() => {
        const open: { task: Task, workspace: Workspace }[] = [];
        const done: { task: Task, workspace: Workspace }[] = [];
        const taskMap = new Map<string, Task>();
        const todayStr = new Date().toISOString().slice(0, 10);

        workspaces.forEach(ws => {
            const data = allData[ws.id];
            if (data) {
                const taskBuckets = ['inboxTasks', 'big3Tasks', 'otherTasks', 'todayTasks'];
                taskBuckets.forEach(bucket => {
                    if(Array.isArray(data[bucket])) {
                         data[bucket].forEach((t: Task) => {
                            open.push({ task: t, workspace: ws });
                            taskMap.set(t.id, t);
                        });
                    }
                });
                if (Array.isArray(data.doneToday)) {
                    data.doneToday.forEach((t: Task) => {
                        if (t.doneAt && t.doneAt.startsWith(todayStr)) {
                            done.push({ task: t, workspace: ws });
                        }
                        taskMap.set(t.id, t);
                    });
                }
            }
        });
        done.sort((a, b) => new Date(b.task.doneAt!).getTime() - new Date(a.task.doneAt!).getTime());
        return { openTasks: open, doneTasks: done, allTasksById: taskMap };
    }, [allData, workspaces]);
    
    const blockedTasks = useMemo(() => {
        const doneTasksByWorkspace = new Map<string, Set<string>>();
        for (const { task, workspace } of doneTasks) {
            if (!doneTasksByWorkspace.has(workspace.id)) {
                doneTasksByWorkspace.set(workspace.id, new Set());
            }
            doneTasksByWorkspace.get(workspace.id)!.add(task.id);
        }

        const blockedStatus: Record<string, {isBlocked: boolean, blockers: string[]}> = {};
        for (const { task, workspace } of openTasks) {
            if (!task.dependencies || task.dependencies.length === 0) {
                blockedStatus[task.id] = { isBlocked: false, blockers: [] };
                continue;
            }
            
            const doneIdsInSameWorkspace = doneTasksByWorkspace.get(workspace.id) || new Set();
            const blockers = task.dependencies.filter(depId => !doneIdsInSameWorkspace.has(depId));

            blockedStatus[task.id] = {
                isBlocked: blockers.length > 0,
                blockers: blockers
            };
        }
        return blockedStatus;
    }, [openTasks, doneTasks]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Today's Tasks (All Workspaces)</h2>
            <Card>
                <CardContent>
                    {openTasks.length === 0 && doneTasks.length === 0 && <p className="text-center text-slate-500 py-8">No tasks for today across all workspaces.</p>}
                    {openTasks.length > 0 && openTasks.map(({task, workspace}) => {
                        const blockedInfo = blockedTasks[task.id];
                        const isBlocked = blockedInfo?.isBlocked;
                        const blockerTitles = blockedInfo?.blockers.map((id: string) => allTasksById.get(id)?.title || 'Unknown Task');
                        return <TaskItemGlobal key={`${workspace.id}-${task.id}`} task={task} workspace={workspace} onComplete={onCompleteTask} onOpenDetails={onOpenDetails} taskSettings={taskSettings} isBlocked={isBlocked} blockerTitles={blockerTitles} onDelete={onDeleteTask} />
                    })}
                </CardContent>

                {doneTasks.length > 0 && (
                    <CardContent className="border-t pt-4">
                        <h3 className="text-sm font-semibold mb-2 text-slate-600 dark:text-slate-400">Done Today ({doneTasks.length})</h3>
                        {doneTasks.map(({task, workspace}) => (
                            <TaskItemGlobal 
                                key={`${workspace.id}-${task.id}`} 
                                task={task} 
                                workspace={workspace} 
                                onOpenDetails={onOpenDetails} 
                                taskSettings={taskSettings} 
                                isDone={true}
                                onDelete={onDeleteTask}
                            />
                        ))}
                    </CardContent>
                )}
            </Card>
        </div>
    );
}

function GlobalTasksView({ allData, workspaces, onOpenDetails, onCompleteTask, taskSettings, onDeleteTask }: GlobalLayoutProps) {
    const { openTasks, doneTasks, allTasksById } = useMemo(() => {
        const open: { task: Task, workspace: Workspace }[] = [];
        const done: { task: Task, workspace: Workspace }[] = [];
        const taskMap = new Map<string, Task>();

        workspaces.forEach(ws => {
            const data = allData[ws.id];
            if (data) {
                const taskBuckets = ['todayTasks', 'inboxTasks', 'big3Tasks', 'otherTasks', 'weekBucket', 'laterBucket', 'todayBucket', 'carry'];
                taskBuckets.forEach(bucket => {
                    if(Array.isArray(data[bucket])) {
                         data[bucket].forEach((t: Task) => {
                            open.push({ task: t, workspace: ws });
                            taskMap.set(t.id, t);
                        });
                    }
                });
                if (Array.isArray(data.doneToday)) {
                    data.doneToday.forEach((t: Task) => {
                        done.push({ task: t, workspace: ws });
                        taskMap.set(t.id, t);
                    });
                }
            }
        });
        done.sort((a, b) => new Date(b.task.doneAt!).getTime() - new Date(a.task.doneAt!).getTime());
        return { openTasks: open, doneTasks: done, allTasksById: taskMap };
    }, [allData, workspaces]);

    const blockedTasks = useMemo(() => {
        const doneTasksByWorkspace = new Map<string, Set<string>>();
        for (const { task, workspace } of doneTasks) {
            if (!doneTasksByWorkspace.has(workspace.id)) {
                doneTasksByWorkspace.set(workspace.id, new Set());
            }
            doneTasksByWorkspace.get(workspace.id)!.add(task.id);
        }

        const blockedStatus: Record<string, {isBlocked: boolean, blockers: string[]}> = {};
        for (const { task, workspace } of openTasks) {
            if (!task.dependencies || task.dependencies.length === 0) {
                blockedStatus[task.id] = { isBlocked: false, blockers: [] };
                continue;
            }

            const doneIdsInSameWorkspace = doneTasksByWorkspace.get(workspace.id) || new Set();
            const blockers = task.dependencies.filter(depId => !doneIdsInSameWorkspace.has(depId));
            
            blockedStatus[task.id] = {
                isBlocked: blockers.length > 0,
                blockers: blockers
            };
        }
        return blockedStatus;
    }, [openTasks, doneTasks]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">All Tasks</h2>
            <Card>
                <CardContent>
                    <h3 className="text-sm font-semibold mb-2 text-slate-600 dark:text-slate-400">To Do ({openTasks.length})</h3>
                    {openTasks.length > 0 ? openTasks.map(({task, workspace}) => {
                        const blockedInfo = blockedTasks[task.id];
                        const isBlocked = blockedInfo?.isBlocked;
                        const blockerTitles = blockedInfo?.blockers.map((id: string) => allTasksById.get(id)?.title || 'Unknown Task');
                        return <TaskItemGlobal key={`${workspace.id}-${task.id}`} task={task} workspace={workspace} onComplete={onCompleteTask} onOpenDetails={onOpenDetails} taskSettings={taskSettings} isBlocked={isBlocked} blockerTitles={blockerTitles} onDelete={onDeleteTask} />
                    }) : <p className="text-center text-slate-500 py-4">No open tasks found.</p>}
                </CardContent>

                {doneTasks.length > 0 && (
                    <CardContent className="border-t pt-4">
                        <h3 className="text-sm font-semibold mb-2 text-slate-600 dark:text-slate-400">Done ({doneTasks.length})</h3>
                        {doneTasks.map(({task, workspace}) => (
                            <TaskItemGlobal 
                                key={`${workspace.id}-${task.id}`} 
                                task={task} 
                                workspace={workspace} 
                                onOpenDetails={onOpenDetails} 
                                taskSettings={taskSettings} 
                                isDone={true}
                                onDelete={onDeleteTask}
                            />
                        ))}
                    </CardContent>
                )}
            </Card>
        </div>
    );
}

function CalendarPane({ todayBucket, setTodayBucket, weekBucket, setWeekBucket, laterBucket, setLaterBucket, scheduledTasks, setScheduledTasks, taskSettings, onOpenDetails }: any) {
    const [displayDate, setDisplayDate] = useState(new Date());
    const [dragOverDate, setDragOverDate] = useState<string | null>(null);
    const [isUnscheduledDragOver, setIsUnscheduledDragOver] = useState(false);

    const unscheduledTasks = useMemo(() => [...todayBucket, ...weekBucket, ...laterBucket], [todayBucket, weekBucket, laterBucket]);

    const handleUnscheduledDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData("dragType", "unscheduledTask");
        e.dataTransfer.setData("taskId", taskId);
    };

    const handleCalendarDragStart = (e: React.DragEvent, task: Task, sourceDateStr: string) => {
        e.dataTransfer.setData("dragType", "calendarTask");
        e.dataTransfer.setData("taskId", task.id);
        e.dataTransfer.setData("sourceDate", sourceDateStr);
    };

    const handleDrop = (e: React.DragEvent, date: Date) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");
        const dateStr = todayKey(date);
        setDragOverDate(null);
        const dragType = e.dataTransfer.getData("dragType");

        if (dragType === 'calendarTask') {
            const sourceDateStr = e.dataTransfer.getData("sourceDate");
            if (sourceDateStr === dateStr) return; 

            setScheduledTasks((prev: Record<string, Task[]>) => {
                const newScheduled = { ...prev };
                const sourceTasks = newScheduled[sourceDateStr] ? [...newScheduled[sourceDateStr]] : [];
                const taskIndex = sourceTasks.findIndex(t => t.id === taskId);
                
                if (taskIndex > -1) {
                    const [movedTask] = sourceTasks.splice(taskIndex, 1);
                    if (sourceTasks.length === 0) delete newScheduled[sourceDateStr];
                    else newScheduled[sourceDateStr] = sourceTasks;

                    const destTasks = newScheduled[dateStr] ? [...newScheduled[dateStr]] : [];
                    destTasks.push({ ...movedTask, scheduledFor: date.toISOString() });
                    newScheduled[dateStr] = destTasks;
                }
                return newScheduled;
            });

        } else { // This is for unscheduledTask
            let droppedTask: Task | undefined;
            let sourceBucket: 'today' | 'week' | 'later' | null = null;
            
            if (todayBucket.find((t: Task) => t.id === taskId)) { droppedTask = todayBucket.find((t: Task) => t.id === taskId); sourceBucket = 'today'; }
            else if (weekBucket.find((t: Task) => t.id === taskId)) { droppedTask = weekBucket.find((t: Task) => t.id === taskId); sourceBucket = 'week'; }
            else if (laterBucket.find((t: Task) => t.id === taskId)) { droppedTask = laterBucket.find((t: Task) => t.id === taskId); sourceBucket = 'later'; }

            if (droppedTask && sourceBucket) {
                if (sourceBucket === 'today') setTodayBucket((p: Task[]) => p.filter(t => t.id !== taskId));
                if (sourceBucket === 'week') setWeekBucket((p: Task[]) => p.filter(t => t.id !== taskId));
                if (sourceBucket === 'later') setLaterBucket((p: Task[]) => p.filter(t => t.id !== taskId));

                setScheduledTasks((prev: Record<string, Task[]>) => {
                    const existing = prev[dateStr] || [];
                    return { ...prev, [dateStr]: [...existing, { ...droppedTask!, scheduledFor: date.toISOString() }] };
                });
            }
        }
    };

    const handleUnscheduleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsUnscheduledDragOver(false);

        const dragType = e.dataTransfer.getData("dragType");
        if (dragType !== 'calendarTask') return;

        const taskId = e.dataTransfer.getData("taskId");
        const sourceDateStr = e.dataTransfer.getData("sourceDate");

        let movedTask: Task | undefined;
        setScheduledTasks((prev: Record<string, Task[]>) => {
            const newScheduled = { ...prev };
            const sourceTasks = newScheduled[sourceDateStr] ? [...newScheduled[sourceDateStr]] : [];
            const taskIndex = sourceTasks.findIndex(t => t.id === taskId);
            
            if (taskIndex > -1) {
                [movedTask] = sourceTasks.splice(taskIndex, 1);
                if (sourceTasks.length === 0) delete newScheduled[sourceDateStr];
                else newScheduled[sourceDateStr] = sourceTasks;
            }
            return newScheduled;
        });

        if (movedTask) {
            const unscheduledTask = { ...movedTask };
            delete unscheduledTask.scheduledFor;
            setLaterBucket((prev: Task[]) => [unscheduledTask, ...prev]);
        }
    };
    
    const startOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const endOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);
    const startDayOfWeek = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const calendarDays: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(displayDate.getFullYear(), displayDate.getMonth(), i));
    
    const changeMonth = (offset: number) => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + offset, 1));
    const today = new Date();

    return (
        <div className="flex h-full">
            <div className="w-2/3 p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}><IconChevronLeft className="w-5 h-5" /></Button>
                    <h2 className="text-xl font-semibold">{displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                    <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}><IconChevronRight className="w-5 h-5" /></Button>
                </div>
                <div 
                    className="grid grid-cols-7 flex-grow"
                    onDragLeave={() => setDragOverDate(null)}
                >
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center font-medium text-sm text-slate-500 py-2">{day}</div>)}
                    {calendarDays.map((day, index) => {
                         if (!day) return <div key={`blank-${index}`} className="border-t border-r dark:border-slate-800" />;
                         const dateStr = todayKey(day);
                         const tasksForDay = scheduledTasks[dateStr] || [];
                         const isToday = isSameDay(day, today);

                         return (
                            <div 
                                key={dateStr}
                                className={`border-t border-r dark:border-slate-800 p-2 transition-colors ${dragOverDate === dateStr ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOverDate(dateStr);
                                }}
                                onDrop={(e) => handleDrop(e, day)}
                            >
                                <div className={`flex items-center justify-center h-6 w-6 rounded-full text-sm mb-2 ${isToday ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-black' : ''}`}>
                                    {day.getDate()}
                                </div>
                                <div className="space-y-1">
                                    {tasksForDay.map(task => {
                                        const priority = taskSettings.priorities.find((p: Priority) => p.level === task.priority);
                                        return (
                                            <div 
                                                key={task.id} 
                                                draggable="true"
                                                onDragStart={(e) => handleCalendarDragStart(e, task, dateStr)}
                                                className="text-xs p-1.5 rounded-md text-white font-medium truncate cursor-grab"
                                                style={{backgroundColor: priority?.color || '#64748b', color: getContrastYIQ(priority?.color) }}
                                                title={task.title}
                                            >
                                                {task.title}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                         );
                    })}
                </div>
            </div>
            <div 
                className={`w-1/3 border-l dark:border-slate-800 p-4 overflow-y-auto transition-colors ${isUnscheduledDragOver ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleUnscheduleDrop}
                onDragEnter={() => setIsUnscheduledDragOver(true)}
                onDragLeave={() => setIsUnscheduledDragOver(false)}
            >
                <h3 className="font-semibold mb-4">Unscheduled Tasks</h3>
                <div className="space-y-2">
                    {unscheduledTasks.map(task => (
                        <div 
                            key={task.id} 
                            draggable="true" 
                            onDragStart={(e) => handleUnscheduledDragStart(e, task.id)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md cursor-grab"
                        >
                            <p className="text-sm font-medium">{task.title}</p>
                        </div>
                    ))}
                    {unscheduledTasks.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No unscheduled tasks.</p>}
                </div>
            </div>
        </div>
    );
}

const DAILY_TEMPLATE = `<h3>Daily Priorities</h3><ol><li><br></li><li><br></li><li><br></li></ol><h3>Schedule</h3><ul><li><b>Morning:</b>&nbsp;</li><li><b>Afternoon:</b>&nbsp;</li><li><b>Evening:</b>&nbsp;</li></ul><h3>Notes &amp; Reflections</h3><ul><li><br></li></ul>`;

function MarkdownToolbar({ editorRef }: { editorRef: React.RefObject<HTMLDivElement> }) {
    const applyFormat = (command: string, value: string | null = null) => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();
        document.execCommand(command, false, value);
        
        const event = new Event('input', { bubbles: true, cancelable: true });
        editor.dispatchEvent(event);
    };

    const applyChecklist = () => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();
        document.execCommand('insertUnorderedList', false, undefined);
        // Fix: Cast parentNode to Element to use the `closest` method safely.
        const list = (window.getSelection()?.focusNode?.parentNode as Element)?.closest('ul');
        if (list) {
            Array.from(list.children).forEach(li => {
                // Fix: Use a type guard to ensure `li` is an HTMLLIElement, allowing safe access to `innerHTML` and `style`.
                if (li instanceof HTMLLIElement) {
                   // This is a naive implementation. A real implementation would be more robust.
                   if(!li.innerHTML.startsWith('[ ]')) {
                       li.innerHTML = `[ ] ${li.innerHTML}`;
                       li.style.listStyleType = 'none';
                   }
                }
            });
        }
        const event = new Event('input', { bubbles: true, cancelable: true });
        editor.dispatchEvent(event);
    };
    
    const buttons = [
        { title: 'Bold', icon: <IconBold className="w-4 h-4" />, action: () => applyFormat('bold') },
        { title: 'Italic', icon: <IconItalic className="w-4 h-4" />, action: () => applyFormat('italic') },
        { title: 'Heading', icon: <IconHeading className="w-4 h-4" />, action: () => applyFormat('formatBlock', 'h3') },
        { title: 'List', icon: <IconList className="w-4 h-4" />, action: () => applyFormat('insertUnorderedList') },
        { title: 'Checklist', icon: <IconCheckSquare className="w-4 h-4" />, action: applyChecklist },
    ];

    return (
        <div className="flex items-center space-x-1 border border-b-0 rounded-t-md p-1 bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
            {buttons.map(btn => (
                <Button key={btn.title} variant="ghost" size="icon" className="w-8 h-8" title={btn.title} onMouseDown={(e) => { e.preventDefault(); btn.action(); }}>
                    {btn.icon}
                </Button>
            ))}
        </div>
    );
}


function DailyTemplatePane({ note, setNote, template, setTemplate }: { note: string; setNote: React.Dispatch<React.SetStateAction<string>>; template: string; setTemplate: React.Dispatch<React.SetStateAction<string>>; }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTemplate, setTempTemplate] = useState(template);
    const dailyNoteRef = useRef<HTMLDivElement>(null);
    const templateEditorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (dailyNoteRef.current && dailyNoteRef.current.innerHTML !== note) {
            dailyNoteRef.current.innerHTML = note;
        }
    }, [note]);

    useEffect(() => {
        if (isEditing && templateEditorRef.current && templateEditorRef.current.innerHTML !== tempTemplate) {
            templateEditorRef.current.innerHTML = tempTemplate;
        }
    }, [tempTemplate, isEditing]);
    
    const applyTemplate = () => {
        const contentToAppend = `<br><br>${template}`;
        if (note.trim() === '' || window.confirm('This will append the template to your current plan. Continue?')) {
            setNote(currentNote => currentNote.trim() === '' ? template : currentNote + contentToAppend);
        }
    };

    const handleSave = () => {
        setTemplate(tempTemplate);
        setIsEditing(false);
    };

    const handleEdit = () => {
        setTempTemplate(template);
        setIsEditing(true);
    };

    if (isEditing) {
        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconBookOpen className="w-5 h-5 text-slate-500" />
                        Edit Daily Plan Template
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <MarkdownToolbar editorRef={templateEditorRef} />
                    <div
                        ref={templateEditorRef}
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onInput={e => setTempTemplate(e.currentTarget.innerHTML)}
                        className="w-full h-64 bg-transparent border rounded-b-md focus:outline-none focus:ring-0 p-2 text-sm text-slate-700 dark:text-slate-300 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 overflow-y-auto"
                    />
                    <div className="mt-4 flex justify-between">
                        <Button variant="ghost" onClick={() => setTempTemplate(DAILY_TEMPLATE)}>Reset to Default</Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save Template</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <IconBookOpen className="w-5 h-5 text-slate-500" />
                        Daily Plan
                    </CardTitle>
                    <div className="flex items-center gap-2">
                         <Button variant="secondary" size="sm" onClick={applyTemplate}>
                            Apply Template
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleEdit}>
                            Edit Template
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <MarkdownToolbar editorRef={dailyNoteRef} />
                 <div
                    ref={dailyNoteRef}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onInput={e => setNote(e.currentTarget.innerHTML)}
                    className="w-full h-64 bg-transparent border rounded-b-md focus:outline-none focus:ring-0 p-2 text-sm text-slate-700 dark:text-slate-300 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 overflow-y-auto"
                />
            </CardContent>
        </Card>
    );
}


// Fix: Corrected the type of the `setNote` prop to allow passing a function updater, which is standard for React state setters.
function StickyNote({ note, setNote }: { note: string; setNote: React.Dispatch<React.SetStateAction<string>> }) {
    return (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-full flex flex-col shadow">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z" clipRule="evenodd" /></svg>
                    Quick Note
                </h3>
            </div>
            <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full flex-grow bg-transparent border-0 focus:ring-0 p-0 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                placeholder="Jot down a quick thought..."
            />
        </div>
    );
}

function WorkspaceTodayView(props: any) {
    const { quickNote, setQuickNote, dailyPlanNote, setDailyPlanNote, dailyPlanTemplate, setDailyPlanTemplate, addTaskFromText, ...tasksPaneProps } = props;
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            <div className="lg:col-span-2">
                <DailyTemplatePane note={dailyPlanNote} setNote={setDailyPlanNote} template={dailyPlanTemplate} setTemplate={setDailyPlanTemplate} />
                <TasksPane {...tasksPaneProps} isEmbedded={true} />
            </div>
            <div className="lg:col-span-1 min-h-[24rem]">
                <StickyNote note={quickNote} setNote={setQuickNote} />
            </div>
        </div>
    );
}

function ProjectCard({ project, isDragged, onDragStart, onDragEnd, deleteProject, updateProject, onProjectMove }: { project: Project, isDragged: boolean, onDragStart: (e: React.DragEvent, project: Project) => void, onDragEnd: () => void, deleteProject: (id: string) => void, updateProject: (id: string, patch: Partial<Project>) => void, onProjectMove: (draggedId: string, targetStatus: string, targetId?: string, position?: 'before' | 'after') => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(project.title);
    const inputRef = useRef<HTMLInputElement>(null);
    const [dropIndicator, setDropIndicator] = useState<'top' | 'bottom' | null>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        if (title.trim() && title !== project.title) {
            updateProject(project.id, { title });
        } else {
            setTitle(project.title); // Reset if empty or unchanged
        }
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.getData('type') !== 'project') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        setDropIndicator(y < rect.height / 2 ? 'top' : 'bottom');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedId = e.dataTransfer.getData('projectId');
        if (draggedId && draggedId !== project.id) {
            onProjectMove(draggedId, project.status, project.id, dropIndicator === 'top' ? 'before' : 'after');
        }
        setDropIndicator(null);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.stopPropagation();
        setDropIndicator(null);
    };


    return (
        <div
            draggable={!isEditing}
            onDragStart={(e) => { if (!isEditing) onDragStart(e, project); }}
            onDragEnd={onDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            className={`relative group p-3 bg-white dark:bg-slate-900/70 rounded-md shadow-sm border dark:border-slate-700/50 transition-opacity ${isDragged ? 'opacity-30' : ''} ${isEditing ? 'cursor-default' : 'cursor-grab'}`}
        >
            {dropIndicator === 'top' && <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-full -mt-0.5 z-10" />}
            <div className="flex justify-between items-start">
                {isEditing ? (
                    <Input
                        ref={inputRef}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setIsEditing(false); setTitle(project.title); } }}
                        className="h-7 text-sm flex-grow mr-2"
                    />
                ) : (
                    <p className="text-sm font-medium flex-grow" onDoubleClick={() => setIsEditing(true)}>
                        {project.title}
                    </p>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteProject(project.id)}>
                    <IconTrash className="w-4 h-4 text-slate-500 hover:text-red-500" />
                </Button>
            </div>
            {project.deadline && <Badge variant="outline" className="mt-2 text-xs">{project.deadline}</Badge>}
            {dropIndicator === 'bottom' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full -mb-0.5 z-10" />}
        </div>
    );
}

function ProjectColumn({ status, projects, draggedItem, onProjectDragStart, onColumnDragStart, onColumnDrop, onDragEnd, addProject, deleteProject, updateProject, updateProjectStatus, deleteProjectStatus, allStatuses, onProjectMove }: { status: ProjectStatus, projects: Project[], draggedItem: {type: 'project' | 'column', id: string} | null, onProjectDragStart: any, onProjectMove: (draggedId: string, targetStatus: string, targetId?: string, position?: 'before' | 'after') => void, onColumnDragStart: any, onColumnDrop: any, onDragEnd: any, addProject: any, deleteProject: any, updateProject: (id: string, patch: Partial<Project>) => void, updateProjectStatus: any, deleteProjectStatus: any, allStatuses: ProjectStatus[] }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [currentName, setCurrentName] = useState(status.name);
    const [isDragOver, setIsDragOver] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditingName) {
            nameInputRef.current?.focus();
            nameInputRef.current?.select();
        }
    }, [isEditingName]);

    const handleNameBlur = () => {
        setIsEditingName(false);
        if (currentName.trim() === '') {
            setCurrentName(status.name);
            return;
        }
        if (currentName !== status.name) {
            if (allStatuses.some((s: ProjectStatus) => s.name === currentName)) {
                alert('A column with this name already exists.');
                setCurrentName(status.name);
                return;
            }
            updateProjectStatus(status.name, { name: currentName });
        }
    };
    
    return (
        <div
                                    onDragEnter={(e) => e.preventDefault()}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
                 e.stopPropagation();
                 const type = e.dataTransfer.getData('type');
                 if (type === 'column') {
                    onColumnDrop(e, status.name);
                 } else if (type === 'project') {
                    const draggedId = e.dataTransfer.getData('projectId');
                    if (draggedId) {
                        onProjectMove(draggedId, status.name);
                    }
                 }
                 setIsDragOver(false);
            }}
            onDragEnd={onDragEnd}
            className={`flex-shrink-0 w-80 bg-slate-200/70 dark:bg-slate-800/50 rounded-lg flex flex-col transition-opacity ${draggedItem?.type === 'column' && draggedItem?.id === status.name ? 'opacity-30' : ''}`}
        >
            <div className="flex items-center justify-between p-3 border-b-4" style={{ borderBottomColor: status.color }}>
                 <div className="flex items-center gap-2 w-full">
                    <div className="cursor-grab text-slate-400">
                         <IconGripVertical className="w-4 h-4" />
                    </div>
                    {isEditingName ? (
                        <Input 
                            ref={nameInputRef}
                            value={currentName}
                            onChange={(e) => setCurrentName(e.target.value)}
                            onBlur={handleNameBlur}
                            onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
                            className="h-8 font-semibold"
                        />
                    ) : (
                        <h3 onClick={() => setIsEditingName(true)} className="font-semibold p-1.5 w-full cursor-pointer">{status.name}</h3>
                    )}
                 </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}><IconMoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                        <DropdownMenuItem onSelect={() => setIsEditingName(true)}>Rename</DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <div className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between">
                            <span>Change Color</span>
                            <input 
                                type="color" 
                                value={status.color} 
                                onChange={(e) => updateProjectStatus(status.name, { color: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                className="w-10 h-6 p-0 border-none cursor-pointer rounded-sm bg-transparent"
                            />
                        </div>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem onSelect={() => deleteProjectStatus(status.name)} className="text-red-600 focus:bg-red-50 focus:text-red-700">Delete Column</DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
            </div>

            <div 
                className={`p-2 space-y-2 flex-grow overflow-y-auto transition-colors ${isDragOver && draggedItem?.type === 'project' ? 'bg-slate-300 dark:bg-slate-700' : ''}`}
                onDragOver={(e) => {
                    if (draggedItem?.type === 'project') e.preventDefault();
                }}
            >
                {projects.map(project => (
                    <ProjectCard 
                        key={project.id}
                        project={project}
                        isDragged={draggedItem?.type === 'project' && draggedItem?.id === project.id}
                        onDragStart={onProjectDragStart}
                        onDragEnd={onDragEnd}
                        deleteProject={deleteProject}
                        updateProject={updateProject}
                        onProjectMove={onProjectMove}
                    />
                ))}
                 <Button variant="ghost" className="w-full justify-start mt-2" onClick={() => addProject(status.name)}>
                     <IconSquarePlus className="w-4 h-4 mr-2" /> Add a card
                 </Button>
            </div>
        </div>
    );
}

function ProjectsView({ projects, updateProject, addProject, deleteProject, projectStatuses, addProjectStatus, updateProjectStatus, deleteProjectStatus, reorderProjectStatuses, onProjectMove, onOpenDetails }: { projects: Project[], updateProject: (id: string, patch: Partial<Project>) => void, addProject: (status: string) => void, deleteProject: (id: string) => void, projectStatuses: ProjectStatus[], addProjectStatus: () => void, updateProjectStatus: (oldName: string, patch: Partial<ProjectStatus>) => void, deleteProjectStatus: (name: string) => void, reorderProjectStatuses: (from: number, to: number) => void, onProjectMove: (draggedId: string, targetStatus: string, targetId?: string, position?: 'before' | 'after') => void, onOpenDetails: (id: string) => void }) {
    const [draggedItem, setDraggedItem] = useState<{type: 'project' | 'column', id: string} | null>(null);

    const handleProjectDragStart = (e: React.DragEvent, project: Project) => {
        e.dataTransfer.setData('type', 'project');
        e.dataTransfer.setData('projectId', project.id);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedItem({ type: 'project', id: project.id });
    };

    const handleColumnDragStart = (e: React.DragEvent, statusName: string) => {
        e.dataTransfer.setData('type', 'column');
        e.dataTransfer.setData('statusName', statusName);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedItem({ type: 'column', id: statusName });
    };

    const handleColumnDrop = (e: React.DragEvent, targetStatusName: string) => {
        if (e.dataTransfer.getData('type') !== 'column') return;
        const sourceStatusName = e.dataTransfer.getData('statusName');
        if (sourceStatusName === targetStatusName) {
             setDraggedItem(null);
             return;
        }

        const sourceIndex = projectStatuses.findIndex((s: ProjectStatus) => s.name === sourceStatusName);
        const targetIndex = projectStatuses.findIndex((s: ProjectStatus) => s.name === targetStatusName);
        if (sourceIndex > -1 && targetIndex > -1) {
            reorderProjectStatuses(sourceIndex, targetIndex);
        }
        setDraggedItem(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        onProjectMove('',''); // Call with empty args to reset any visual state if needed
    };

    return (
        <div className="flex h-full p-4 space-x-4 overflow-x-auto bg-slate-100/50 dark:bg-slate-900/50">
            {projectStatuses.map((status: ProjectStatus) => (
                <ProjectColumn 
                    key={status.name}
                    status={status}
                    projects={projects.filter(p => p.status === status.name)}
                    draggedItem={draggedItem}
                    onProjectDragStart={handleProjectDragStart}
                    onColumnDragStart={handleColumnDragStart}
                    onColumnDrop={handleColumnDrop}
                    onDragEnd={handleDragEnd}
                    addProject={addProject}
                    deleteProject={deleteProject}
                    updateProject={updateProject}
                    updateProjectStatus={updateProjectStatus}
                    deleteProjectStatus={deleteProjectStatus}
                    allStatuses={projectStatuses}
                    onProjectMove={onProjectMove}
                />
            ))}
            <div className="flex-shrink-0 w-24">
                <Button 
                    variant="secondary" 
                    className="w-full h-full rounded-lg bg-slate-200/50 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300" 
                    onClick={addProjectStatus}
                >
                    <IconSquarePlus className="w-4 h-4 mr-2" />
                    Add another column
                </Button>
            </div>
        </div>
    );
}

function WorkspaceNavBar({ activeView, setActiveView, date }: { activeView: string, setActiveView: (view: string) => void, date: Date }) {
    const NavButton = ({ view, children, title }: { view: string; children: React.ReactNode, title: string }) => (
        <button 
            onClick={() => setActiveView(view)} 
            title={title}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeView === view 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
        >
            {children}
        </button>
    );

    return (
        <nav className="flex-shrink-0 h-12 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 space-x-1 overflow-x-auto">
            <NavButton view="today" title="Today"><IconTodayWithDate day={date.getDate()} className="w-4 h-4" /> Today</NavButton>
            <NavButton view="projects" title="Projects"><IconBriefcase className="w-4 h-4" /> Projects</NavButton>
            <NavButton view="tasks" title="Tasks"><IconClipboardCheck className="w-4 h-4" /> Tasks</NavButton>
            <NavButton view="calendar" title="Calendar"><IconCalendar className="w-4 h-4" /> Calendar</NavButton>
            <NavButton view="notes" title="Notes"><IconNotebook className="w-4 h-4" /> Notes</NavButton>
            <NavButton view="docs" title="Docs"><IconFileText className="w-4 h-4" /> Docs</NavButton>
            <NavButton view="mindmap" title="Mind Map"><IconMindMap className="w-4 h-4" /> Mind Map</NavButton>
            <NavButton view="brainstorm" title="AI Brainstorm"><IconBrainstorm className="w-4 h-4" /> Brainstorm</NavButton>
        </nav>
    );
}

function NoteEditor({ selectedNote, updateNote, onGenerateMindMap }: { selectedNote: Note | null, updateNote: (id: string, patch: Partial<Note>) => void, onGenerateMindMap: (note: Note) => void }) {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && selectedNote && editorRef.current.innerHTML !== selectedNote.content) {
            editorRef.current.innerHTML = selectedNote.content;
        } else if (editorRef.current && !selectedNote) {
            editorRef.current.innerHTML = '';
        }
    }, [selectedNote]);

    if (!selectedNote) {
        return <div className="flex-1 flex items-center justify-center text-slate-500 p-4 text-center">Select a page to start writing, or create a new one.</div>;
    }

    return (
        <div className="flex-1 flex flex-col p-4 bg-white dark:bg-slate-950">
            <div className="flex items-center gap-2 mb-4">
                <Input 
                    value={selectedNote.title}
                    onChange={e => updateNote(selectedNote.id, { title: e.target.value })}
                    className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0 p-0 h-auto bg-transparent flex-grow"
                    placeholder="Page Title"
                />
                 <Button variant="ghost" size="icon" onClick={() => onGenerateMindMap(selectedNote)} title="Generate Mind Map from Note">
                    <IconMindMap className="w-5 h-5 text-slate-500" />
                </Button>
            </div>
            <div className="flex-grow flex flex-col">
                <MarkdownToolbar editorRef={editorRef} />
                <div
                    ref={editorRef}
                    key={selectedNote.id}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onInput={e => updateNote(selectedNote.id, { content: e.currentTarget.innerHTML })}
                    className="w-full flex-grow bg-transparent border rounded-b-md focus:outline-none focus:ring-0 p-2 text-base text-slate-800 dark:text-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 overflow-y-auto"
                />
            </div>
        </div>
    );
}

function NoteItemRecursive({ note, allNotes, level, selectedNoteId, setSelectedNoteId, addNote, deleteNote, onReorder, draggedItemId, setDraggedItemId }: { note: Note, allNotes: Note[], level: number, selectedNoteId: string | null, setSelectedNoteId: (id: string | null) => void, addNote: (sectionId: string, parentId?: string | null) => void, deleteNote: (id: string) => void, onReorder: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void, draggedItemId: string | null, setDraggedItemId: (id: string | null) => void }) {
    const children = allNotes.filter(n => n.parentId === note.id);
    const isSelected = selectedNoteId === note.id;
    const isDragged = draggedItemId === note.id;

    const [dropIndicator, setDropIndicator] = useState<'top' | 'bottom' | 'middle' | null>(null);

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', note.id);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedItemId(note.id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const dropZoneHeight = rect.height * 0.25;

        if (y < dropZoneHeight) setDropIndicator('top');
        else if (y > rect.height - dropZoneHeight) setDropIndicator('bottom');
        else setDropIndicator('middle');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId && draggedId !== note.id) {
            const position = dropIndicator === 'top' ? 'before' : dropIndicator === 'bottom' ? 'after' : 'inside';
            onReorder(draggedId, note.id, position);
        }
        setDropIndicator(null);
    };


    return (
        <div className={`relative ${isDragged ? 'opacity-30' : ''}`} >
            {dropIndicator === 'top' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />}
            <div 
                draggable
                onDragStart={handleDragStart}
                onDragEnd={() => setDraggedItemId(null)}
                onDragOver={handleDragOver}
                onDragLeave={() => setDropIndicator(null)}
                onDrop={handleDrop}
                className={`flex items-center group p-1.5 rounded-md cursor-pointer ${isSelected ? 'bg-slate-200 dark:bg-slate-700' : ''} ${dropIndicator === 'middle' ? 'bg-blue-200/50 dark:bg-blue-800/50' : isSelected ? '' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                style={{ paddingLeft: `${level * 16 + 6}px` }}
                onClick={() => setSelectedNoteId(note.id)}
            >
                <IconFileText className="w-4 h-4 mr-2 flex-shrink-0 text-slate-500" />
                <span className="flex-grow truncate text-sm">{note.title || 'Untitled'}</span>
                <div className="flex-shrink-0 flex items-center">
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" title="Add Subpage" onClick={(e) => { e.stopPropagation(); addNote(note.notebookId, note.id); }}>
                        <IconSquarePlus className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" title="Delete Page" onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>
                        <IconTrash className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
            {dropIndicator === 'bottom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />}

            {children.length > 0 && (
                <div>
                    {children.map(child => (
                        <NoteItemRecursive 
                            key={child.id}
                            note={child}
                            allNotes={allNotes}
                            level={level + 1}
                            selectedNoteId={selectedNoteId}
                            setSelectedNoteId={setSelectedNoteId}
                            addNote={addNote}
                            deleteNote={deleteNote}
                            onReorder={onReorder}
                            draggedItemId={draggedItemId}
                            setDraggedItemId={setDraggedItemId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}


function NoteList({ notes, selectedSectionId, selectedNoteId, setSelectedNoteId, addNote, deleteNote, onReorder, draggedItemId, setDraggedItemId }: { notes: Note[], selectedSectionId: string | null, selectedNoteId: string | null, setSelectedNoteId: (id: string | null) => void, addNote: (sectionId: string, parentId?: string | null) => void, deleteNote: (id: string) => void, onReorder: any, draggedItemId: string | null, setDraggedItemId: any }) {
    const rootNotes = useMemo(() => {
        if (!selectedSectionId) return [];
        return notes.filter(n => n.notebookId === selectedSectionId && n.parentId === null);
    }, [notes, selectedSectionId]);

    const sectionNotes = useMemo(() => {
        if (!selectedSectionId) return [];
        return notes.filter(n => n.notebookId === selectedSectionId);
    }, [notes, selectedSectionId]);

    if (!selectedSectionId) {
        return <div className="w-64 border-r dark:border-slate-800 p-4 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-900/50">Select a section to see its pages.</div>;
    }

    return (
        <div className="w-64 border-r dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50">
            <div className="p-2 border-b dark:border-slate-800 flex-shrink-0">
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => addNote(selectedSectionId, null)}>
                    <IconSquarePlus className="w-4 h-4 mr-2" />
                    New Page
                </Button>
            </div>
            <div className="flex-grow overflow-y-auto p-2 space-y-0.5">
                {rootNotes.length === 0 && <p className="text-center text-xs text-slate-500 py-4">No pages in this section.</p>}
                {rootNotes.map(note => (
                    <NoteItemRecursive 
                        key={note.id}
                        note={note}
                        allNotes={sectionNotes}
                        level={0}
                        selectedNoteId={selectedNoteId}
                        setSelectedNoteId={setSelectedNoteId}
                        addNote={addNote}
                        deleteNote={deleteNote}
                        onReorder={onReorder}
                        draggedItemId={draggedItemId}
                        setDraggedItemId={setDraggedItemId}
                    />
                ))}
            </div>
        </div>
    );
}

function NotebookItemComponent({ item, type, children, onSelect, isSelected, onUpdate, onDelete, onAddSection, onReorder, draggedItemId, setDraggedItemId }: { item: NotebookItem, type: 'notebook' | 'section', children?: React.ReactNode, onSelect: () => void, isSelected: boolean, onUpdate: (id: string, patch: Partial<NotebookItem>) => void, onDelete: (id: string) => void, onAddSection?: (notebookId: string) => void, onReorder: any, draggedItemId: string | null, setDraggedItemId: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(item.name);
    const inputRef = useRef<HTMLInputElement>(null);
    const [dropIndicator, setDropIndicator] = useState<'top' | 'bottom' | 'middle' | null>(null);

    useEffect(() => {
        if (isEditing) inputRef.current?.focus();
    }, [isEditing]);
    
    const handleSave = () => {
        if (name.trim() && name !== item.name) {
            onUpdate(item.id, { name });
        } else {
            setName(item.name);
        }
        setIsEditing(false);
    };

    const isDragged = draggedItemId === item.id;
    const canAcceptDrop = type === 'notebook';

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', item.id);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedItemId(item.id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const dropZoneHeight = rect.height * 0.25;

        if (y < dropZoneHeight) setDropIndicator('top');
        else if (y > rect.height - dropZoneHeight) setDropIndicator('bottom');
        else if (canAcceptDrop) setDropIndicator('middle');
        else setDropIndicator(null); // Can't drop inside this type of item
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId && draggedId !== item.id) {
            const position = dropIndicator === 'top' ? 'before' : dropIndicator === 'bottom' ? 'after' : 'inside';
            onReorder(draggedId, item.id, position);
        }
        setDropIndicator(null);
    };

    return (
        <div className={`relative ${isDragged ? 'opacity-30' : ''}`}>
             {dropIndicator === 'top' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />}
            <div 
                draggable
                onDragStart={handleDragStart}
                onDragEnd={() => setDraggedItemId(null)}
                onDragOver={handleDragOver}
                onDragLeave={() => setDropIndicator(null)}
                onDrop={handleDrop}
                className={`flex items-center group p-1.5 rounded-md cursor-pointer ${isSelected && type === 'section' ? 'bg-slate-200 dark:bg-slate-700' : ''} ${dropIndicator === 'middle' ? 'bg-blue-200/50 dark:bg-blue-800/50' : isSelected && type === 'section' ? '' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                onClick={onSelect}
            >
                {type === 'notebook' ? <IconChevronRight className="w-4 h-4 mr-1 flex-shrink-0" /> : <div className="w-5" />}
                {isEditing ? (
                    <Input 
                        ref={inputRef}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={e => e.key === 'Enter' && handleSave()}
                        className="h-7 text-sm flex-grow"
                    />
                ) : (
                    <span className="flex-grow truncate text-sm" onDoubleClick={() => setIsEditing(true)}>{item.name}</span>
                )}
                <div className="flex-shrink-0 flex items-center">
                    {type === 'notebook' && onAddSection && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" title="Add Section" onClick={(e) => { e.stopPropagation(); onAddSection(item.id); }}>
                            <IconSquarePlus className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                <IconMoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-32" align="end">
                            <DropdownMenuItem onSelect={() => setIsEditing(true)}>Rename</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onDelete(item.id)} className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            {dropIndicator === 'bottom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />}
            {children}
        </div>
    );
}

function NotesSidebar({ notebooks, selectedSectionId, setSelectedSectionId, addNotebookItem, updateNotebookItem, deleteNotebookItem, onReorder, draggedItemId, setDraggedItemId, expandedNotebooks, setExpandedNotebooks }: { notebooks: NotebookItem[], selectedSectionId: string | null, setSelectedSectionId: (id: string | null) => void, addNotebookItem: (name: string, parentId?: string | null) => void, updateNotebookItem: (id: string, patch: Partial<NotebookItem>) => void, deleteNotebookItem: (id: string) => void, onReorder: any, draggedItemId: string | null, setDraggedItemId: any, expandedNotebooks: Record<string, boolean>, setExpandedNotebooks: React.Dispatch<React.SetStateAction<Record<string, boolean>>> }) {
    const rootNotebooks = notebooks.filter(nb => nb.parentId === null);

    const toggleNotebook = (id: string) => {
        setExpandedNotebooks(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="w-56 border-r dark:border-slate-800 flex flex-col bg-slate-100/50 dark:bg-slate-900/50">
            <div className="p-2 border-b dark:border-slate-800 flex-shrink-0">
                <h2 className="px-2 text-lg font-semibold">Notebooks</h2>
            </div>
            <div className="flex-grow overflow-y-auto p-2 space-y-1">
                {rootNotebooks.map(notebook => {
                    const sections = notebooks.filter(s => s.parentId === notebook.id);
                    return (
                        <NotebookItemComponent 
                            key={notebook.id}
                            item={notebook}
                            type="notebook"
                            onSelect={() => toggleNotebook(notebook.id)}
                            isSelected={false}
                            onUpdate={updateNotebookItem}
                            onDelete={deleteNotebookItem}
                            onAddSection={(id) => addNotebookItem('New Section', id)}
                            onReorder={onReorder}
                            draggedItemId={draggedItemId}
                            setDraggedItemId={setDraggedItemId}
                        >
                            {expandedNotebooks[notebook.id] && (
                                <div className="pl-4">
                                    {sections.map(section => (
                                        <NotebookItemComponent
                                            key={section.id}
                                            item={section}
                                            type="section"
                                            onSelect={() => setSelectedSectionId(section.id)}
                                            isSelected={selectedSectionId === section.id}
                                            onUpdate={updateNotebookItem}
                                            onDelete={deleteNotebookItem}
                                            onReorder={onReorder}
                                            draggedItemId={draggedItemId}
                                            setDraggedItemId={setDraggedItemId}
                                        />
                                    ))}
                                </div>
                            )}
                        </NotebookItemComponent>
                    );
                })}
            </div>
            <div className="p-2 border-t dark:border-slate-800 flex-shrink-0">
                <Button variant="secondary" className="w-full" onClick={() => addNotebookItem('New Notebook', null)}>
                    <IconSquarePlus className="w-4 h-4 mr-2" /> Add Notebook
                </Button>
            </div>
        </div>
    );
}
{/* Fix: Corrected NotesView to accept separate reorder handlers for notebooks and notes. */}
function NotesView({ notebooks, notes, selectedSectionId, setSelectedSectionId, selectedNoteId, setSelectedNoteId, addNotebookItem, updateNotebookItem, deleteNotebookItem, addNote, updateNote, deleteNote, onNotebookReorder, onNoteReorder, draggedItemId, setDraggedItemId, expandedNotebooks, setExpandedNotebooks, onGenerateMindMap }: any) {
    const selectedNote = useMemo(() => notes.find((n: Note) => n.id === selectedNoteId) || null, [notes, selectedNoteId]);

    // When selected section is deleted, deselect note and section
    useEffect(() => {
        if (selectedSectionId && !notebooks.find((nb: NotebookItem) => nb.id === selectedSectionId)) {
            setSelectedSectionId(null);
            setSelectedNoteId(null);
        }
    }, [notebooks, selectedSectionId, setSelectedSectionId, setSelectedNoteId]);

    return (
        <div className="flex h-full">
            <NotesSidebar 
                notebooks={notebooks}
                selectedSectionId={selectedSectionId}
                setSelectedSectionId={setSelectedSectionId}
                addNotebookItem={addNotebookItem}
                updateNotebookItem={updateNotebookItem}
                deleteNotebookItem={deleteNotebookItem}
                onReorder={onNotebookReorder}
                draggedItemId={draggedItemId}
                setDraggedItemId={setDraggedItemId}
                expandedNotebooks={expandedNotebooks}
                setExpandedNotebooks={setExpandedNotebooks}
            />
            <NoteList 
                notes={notes}
                selectedSectionId={selectedSectionId}
                selectedNoteId={selectedNoteId}
                setSelectedNoteId={setSelectedNoteId}
                addNote={addNote}
                deleteNote={deleteNote}
                onReorder={onNoteReorder}
                draggedItemId={draggedItemId}
                setDraggedItemId={setDraggedItemId}
            />
            <NoteEditor 
                selectedNote={selectedNote}
                updateNote={updateNote}
                onGenerateMindMap={onGenerateMindMap}
            />
        </div>
    );
}

function DocsView({ docItems, addDocItem, updateDocItem, deleteDocItem, selectedFolderId, setSelectedFolderId, handleFileUpload }: { docItems: DocItem[], addDocItem: (item: Omit<DocItem, 'id'>) => void, updateDocItem: (id: string, patch: Partial<DocItem>) => void, deleteDocItem: (id: string) => void, selectedFolderId: string | null, setSelectedFolderId: (id: string | null) => void, handleFileUpload: (files: FileList) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
    
    const currentFolder = useMemo(() => docItems.find(item => item.id === selectedFolderId), [docItems, selectedFolderId]);
    const itemsInCurrentFolder = useMemo(() => docItems.filter(item => item.parentId === selectedFolderId), [docItems, selectedFolderId]);

    const breadcrumbs = useMemo(() => {
        const path = [];
        let current = currentFolder;
        while(current) {
            path.unshift(current);
            current = docItems.find(item => item.id === current?.parentId);
        }
        return path;
    }, [currentFolder, docItems]);
    
    const FolderItem = ({ item, level, isSelected, onSelect, onUpdate, onDelete }: { item: DocItem; level: number; isSelected: boolean; onSelect: (id: string) => void; onUpdate: (id: string, patch: Partial<DocItem>) => void; onDelete: (id: string) => void; }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [name, setName] = useState(item.name);
        const inputRef = useRef<HTMLInputElement>(null);
    
        useEffect(() => {
            if (isEditing) {
                inputRef.current?.focus();
                inputRef.current?.select();
            }
        }, [isEditing]);
    
        const handleSave = () => {
            if (name.trim() && name !== item.name) {
                onUpdate(item.id, { name });
            } else {
                setName(item.name);
            }
            setIsEditing(false);
        };
    
        return (
            <div 
                className={`flex items-center group p-1.5 rounded-md cursor-pointer ${isSelected ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                style={{ paddingLeft: `${level * 16 + 6}px` }}
                onClick={() => onSelect(item.id)}
                onDoubleClick={() => setIsEditing(true)}
            >
                <IconFolder className="w-4 h-4 mr-2 flex-shrink-0 text-slate-500" />
                {isEditing ? (
                    <Input 
                        ref={inputRef}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={e => e.key === 'Enter' && handleSave()}
                        onClick={e => e.stopPropagation()}
                        className="h-7 text-sm flex-grow"
                    />
                ) : (
                    <span className="flex-grow truncate text-sm">{item.name}</span>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                            <IconMoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32" align="end">
                        <DropdownMenuItem onSelect={() => setIsEditing(true)}>Rename</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onDelete(item.id)} className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    };

    const FolderTree = ({ parentId, level }: { parentId: string | null, level: number }) => {
        const folders = docItems.filter(item => item.parentId === parentId && item.type === 'folder');
        return (
            <div>
                {folders.map(folder => (
                    <div key={folder.id}>
                        <FolderItem
                            item={folder}
                            level={level}
                            isSelected={selectedFolderId === folder.id}
                            onSelect={setSelectedFolderId}
                            onUpdate={updateDocItem}
                            onDelete={deleteDocItem}
                        />
                        <FolderTree parentId={folder.id} level={level + 1} />
                    </div>
                ))}
            </div>
        );
    };

    const DocItemComponent = ({ item }: { item: DocItem }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [name, setName] = useState(item.name);
        const inputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (isEditing) {
                inputRef.current?.focus();
                inputRef.current?.select();
            }
        }, [isEditing]);
        
        const handleSave = () => {
            if (name.trim() && name !== item.name) {
                updateDocItem(item.id, { name });
            } else {
                setName(item.name);
            }
            setIsEditing(false);
        };
        
        const Icon = item.type === 'folder' ? IconFolder : item.type === 'link' ? IconLink : IconFileText;
        const subtext = item.type === 'file' ? formatBytes(item.size || 0) : item.type === 'link' ? item.url : null;
        
        return (
            <div 
                className="flex items-center group p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" 
                onDoubleClick={() => { if (item.type !== 'folder') setIsEditing(true); else setSelectedFolderId(item.id);}}
            >
                <Icon className="w-6 h-6 mr-3 flex-shrink-0 text-slate-500" />
                <div className="flex-grow truncate">
                    {isEditing ? (
                        <Input 
                            ref={inputRef}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={e => e.key === 'Enter' && handleSave()}
                            className="h-8 text-sm"
                        />
                    ) : (
                        <p className="text-sm font-medium truncate" title={item.name}>{item.name}</p>
                    )}
                    {subtext && !isEditing && <p className="text-xs text-slate-500 truncate" title={subtext}>{subtext}</p>}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                            <IconMoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32" align="end">
                        <DropdownMenuItem onSelect={() => setIsEditing(true)}>Rename</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => deleteDocItem(item.id)} className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    };

    const AddLinkModal = () => {
        const [name, setName] = useState('');
        const [url, setUrl] = useState('');

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (name.trim() && url.trim()) {
                addDocItem({ name, url, type: 'link', parentId: selectedFolderId });
                setIsAddLinkOpen(false);
            }
        };

        return (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setIsAddLinkOpen(false)}>
                <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={handleSubmit}>
                        <CardHeader><CardTitle>Add New Link</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <label className="text-sm font-medium">Link Name</label>
                                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Project Specs" />
                             </div>
                             <div>
                                <label className="text-sm font-medium">URL</label>
                                <Input value={url} onChange={e => setUrl(e.target.value)} required type="url" placeholder="https://..." />
                            </div>
                        </CardContent>
                        <div className="p-6 pt-0 flex justify-end gap-2">
                             <Button type="button" variant="ghost" onClick={() => setIsAddLinkOpen(false)}>Cancel</Button>
                             <Button type="submit">Save Link</Button>
                        </div>
                    </form>
                </Card>
            </div>
        );
    };

    return (
        <div className="flex h-full bg-slate-50 dark:bg-slate-900/50">
            <input type="file" ref={fileInputRef} onChange={e => e.target.files && handleFileUpload(e.target.files)} multiple className="hidden" />
            {isAddLinkOpen && <AddLinkModal />}
            <div className="w-64 border-r dark:border-slate-800 flex flex-col p-2">
                <div className="p-2 flex-shrink-0">
                    <h2 className="text-lg font-semibold">Folders</h2>
                </div>
                <div className="flex-grow overflow-y-auto pr-1">
                    <div className="p-1 border-b dark:border-slate-700 mb-1">
                         <button 
                            onClick={() => setSelectedFolderId(null)}
                            className={`w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium ${selectedFolderId === null ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            All Files
                        </button>
                    </div>
                    <FolderTree parentId={null} level={0} />
                </div>
                <div className="p-2 border-t dark:border-slate-800 flex-shrink-0">
                    <Button variant="secondary" className="w-full" onClick={() => addDocItem({ name: 'New Folder', type: 'folder', parentId: selectedFolderId })}>
                        <IconSquarePlus className="w-4 h-4 mr-2" /> Add Folder
                    </Button>
                </div>
            </div>
            <div className="flex-1 flex flex-col">
                <header className="flex-shrink-0 h-14 border-b dark:border-slate-800 flex items-center justify-between px-4">
                    <div className="flex items-center gap-1 text-sm">
                        <button onClick={() => setSelectedFolderId(null)} className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700">All Files</button>
                        {breadcrumbs.length > 0 && <IconChevronRight className="w-4 h-4 text-slate-400" />}
                        {breadcrumbs.map((crumb, index) => (
                           <React.Fragment key={crumb.id}>
                                <button onClick={() => setSelectedFolderId(crumb.id)} className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700">{crumb.name}</button>
                                {index < breadcrumbs.length - 1 && <IconChevronRight className="w-4 h-4 text-slate-400" />}
                           </React.Fragment>
                        ))}
                    </div>
                     <div className="flex items-center gap-2">
                         <Button size="sm" onClick={() => setIsAddLinkOpen(true)}><IconLink className="w-4 h-4 mr-2" /> Add Link</Button>
                         <Button size="sm" onClick={() => fileInputRef.current?.click()}><IconUploadCloud className="w-4 h-4 mr-2" /> Upload File</Button>
                     </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4">
                     {itemsInCurrentFolder.length === 0 ? (
                         <div className="text-center text-slate-500 pt-16">
                             <p>This folder is empty.</p>
                             <p className="text-sm">Upload a file or add a link to get started.</p>
                         </div>
                     ) : (
                         <div className="space-y-1">
                            {itemsInCurrentFolder.map(item => <DocItemComponent key={item.id} item={item} />)}
                         </div>
                     )}
                </main>
            </div>
        </div>
    );
}

function AIBrainstormView() {
    const [topic, setTopic] = useState('');
    const [ideas, setIdeas] = useState<BrainstormIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isOnline = navigator.onLine;

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

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center h-full">
            <svg className="animate-spin h-8 w-8 text-slate-600 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );

    return (
        <div className="p-6">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconBrainstorm className="w-5 h-5 text-slate-500" />
                        AI Brainstorm
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleBrainstorm} className="flex flex-col space-y-3">
                        <label htmlFor="brainstorm-topic" className="font-medium text-slate-700 dark:text-slate-300">Topic</label>
                        <Input
                            id="brainstorm-topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., healthy morning routines"
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !topic.trim() || !isOnline}
                            title={!isOnline ? "This feature requires an internet connection" : "Generate creative ideas"}
                        >
                            {isLoading ? 'Generating...' : 'Generate Ideas'}
                        </Button>
                    </form>

                    <div className="mt-6">
                        {isLoading && <LoadingSpinner />}
                        {error && <p className="text-red-500 text-center">{error}</p>}
                        {!isLoading && ideas.length > 0 && (
                             <div className="space-y-4">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Generated Ideas:</h3>
                                <ul className="space-y-3">
                                    {ideas.map((idea, index) => (
                                        <li key={index} className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{idea.title}</p>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm">{idea.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function MindMapView({ rootNode, onAddNode, onUpdateNode, onDeleteNode }: { rootNode: MindMapNode; onAddNode: (parentId: string) => void; onUpdateNode: (nodeId: string, text: string) => void; onDeleteNode: (nodeId: string) => void; }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [editingNode, setEditingNode] = useState<{ id: string; text: string; x: number; y: number; } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingNode]);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); 

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        if (width === 0 || height === 0) return;

        const g = svg.append("g").attr("transform", `translate(40,40)`);

        const treeLayout = d3.tree<MindMapNode>().size([width - 80, height - 120]);
        const root = d3.hierarchy(rootNode, d => d.children);

        treeLayout(root);
        
        g.selectAll(".link")
            .data(root.links())
            .enter().append("path")
            .attr("class", "link fill-none stroke-slate-300 dark:stroke-slate-600")
            .attr("stroke-width", 1.5)
            .attr("d", d3.linkVertical()
                .x(d => (d as any).x)
                .y(d => (d as any).y) as any
            );

        const node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", "node cursor-pointer")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .on("click", (event, d) => {
                event.stopPropagation();
                setSelectedNodeId(d.data.id);
                setEditingNode(null);
            })
            .on("dblclick", (event, d) => {
                event.stopPropagation();
                const svgRect = svgRef.current!.getBoundingClientRect();
                setEditingNode({
                    id: d.data.id,
                    text: d.data.text,
                    x: d.x + 40 + svgRect.left,
                    y: d.y + 40 + svgRect.top,
                });
            });

        node.append("circle")
            .attr("r", 8)
            .attr("class", d => selectedNodeId === d.data.id ? "fill-blue-500 stroke-blue-700" : "fill-slate-100 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-500")
            .attr("stroke-width", 2);

        node.append("text")
            .attr("dy", "0.31em")
            .attr("y", d => d.children ? -20 : 20)
            .attr("text-anchor", "middle")
            .text(d => d.data.text)
            .attr("class", "text-sm fill-slate-800 dark:fill-slate-200");

    }, [rootNode, selectedNodeId, onAddNode, onDeleteNode, onUpdateNode]);

    return (
        <div className="relative w-full h-full bg-slate-50 dark:bg-slate-900" onClick={() => { setSelectedNodeId(null); setEditingNode(null); }}>
            <svg ref={svgRef} className="w-full h-full"></svg>
            <div className="absolute top-4 right-4 flex gap-2">
                <Button disabled={!selectedNodeId} onClick={() => selectedNodeId && onAddNode(selectedNodeId)}>
                    <IconSquarePlus className="w-4 h-4 mr-2" /> Add Child
                </Button>
                <Button variant="destructive" disabled={!selectedNodeId || selectedNodeId === 'root'} onClick={() => selectedNodeId && onDeleteNode(selectedNodeId)}>
                    <IconTrash className="w-4 h-4 mr-2" /> Delete
                </Button>
            </div>
            {editingNode && (
                <Input
                    ref={inputRef}
                    style={{
                        position: 'fixed',
                        left: `${editingNode.x}px`,
                        top: `${editingNode.y}px`,
                        transform: 'translate(-50%, -50%)',
                        width: '150px',
                        textAlign: 'center',
                    }}
                    defaultValue={editingNode.text}
                    onBlur={(e) => {
                        onUpdateNode(editingNode.id, e.target.value);
                        setEditingNode(null);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onUpdateNode(editingNode.id, e.currentTarget.value);
                            setEditingNode(null);
                        }
                        if (e.key === 'Escape') {
                            setEditingNode(null);
                        }
                    }}
                    onClick={e => e.stopPropagation()}
                />
            )}
        </div>
    );
}

function DesktopLayout({ activeView, ...props }: any) {
    return (
        <div className="h-full bg-slate-50/50 dark:bg-black/20">
            {activeView === 'today' && <WorkspaceTodayView {...props} />}
            {activeView === 'projects' && <ProjectsView {...props} />}
            {activeView === 'tasks' && <PlanPane {...props} />}
            {activeView === 'calendar' && <CalendarPane {...props} />}
            {activeView === 'notes' && <NotesView {...props} />}
            {activeView === 'docs' && <DocsView {...props} />}
            {activeView === 'mindmap' && <MindMapView rootNode={props.mindMapData} onAddNode={props.addMindMapNode} onUpdateNode={props.updateMindMapNode} onDeleteNode={props.deleteMindMapNode} />}
            {activeView === 'brainstorm' && <AIBrainstormView />}
        </div>
    );
}

function CarryPrompt({ items, selection, setSelection, onConfirm, onSkip, taskSettings }: { items: Task[], selection: Record<string, boolean>, setSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, onConfirm: () => void, onSkip: () => void, taskSettings: TaskSettings }) {
    const allSelected = items.every(it => selection[it.id]);
    const toggleAll = () => {
        const nextState = !allSelected;
        const newSelection: Record<string, boolean> = {};
        for (const it of items) newSelection[it.id] = nextState;
        setSelection(newSelection);
    };

    return (
        <Card className="shadow-2xl">
            <CardHeader>
                <CardTitle>Carry Over Yesterday's Tasks?</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-slate-500 mb-4">You have {items.length} unfinished tasks from yesterday. Select which ones to move to today's list.</p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 border-t border-b py-2">
                    <div className="flex items-center p-2">
                        <input type="checkbox" id="toggle-all" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <label htmlFor="toggle-all" className="ml-3 block text-sm font-medium text-slate-900 dark:text-slate-50">
                            Select All
                        </label>
                    </div>
                    {items.map(item => (
                        <div key={item.id} className="flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                            <input type="checkbox" id={`carry-${item.id}`} checked={!!selection[item.id]} onChange={() => setSelection(s => ({ ...s, [item.id]: !s[item.id] }))} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <label htmlFor={`carry-${item.id}`} className="ml-3 block text-sm text-slate-900 dark:text-slate-50">
                                {item.title}
                            </label>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" onClick={onSkip}>Skip</Button>
                    <Button onClick={onConfirm}>Carry Over ({Object.values(selection).filter(Boolean).length})</Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Fix: Corrected the onMove prop type to expect the task ID, and updated the internal calls to provide it. This resolves the type mismatch with the `moveTask` handler.
function TaskDetailsOverlay({ onClose, task, onChange, onMove, taskSettings, tasksInWorkspace, onCheckCircular, onDelete }: { onClose: () => void, task: Task | null, onChange: (patch: Partial<Task>) => void, onMove: (id: string, dest: 'today' | 'week' | 'later') => void, taskSettings: TaskSettings, tasksInWorkspace: Task[], onCheckCircular: (taskId: string, newDepId: string) => boolean, onDelete: (taskId: string) => void }) {
    if (!task) return null;

    const handleSubtaskChange = (subtaskId: string, patch: Partial<{ title: string; done: boolean }>) => {
        const newSubtasks = (task.subtasks || []).map(st => 
            st.id === subtaskId ? { ...st, ...patch } : st
        );
        onChange({ subtasks: newSubtasks });
    };

    const handleAddSubtask = () => {
        const newSubtask = { id: `sub_${Date.now()}`, title: '', done: false };
        const newSubtasks = [...(task.subtasks || []), newSubtask];
        onChange({ subtasks: newSubtasks });
    };

    const handleDeleteSubtask = (subtaskId: string) => {
        const newSubtasks = (task.subtasks || []).filter(st => st.id !== subtaskId);
        onChange({ subtasks: newSubtasks });
    };
    
    const availableDependencies = useMemo(() => {
        if (!task) return [];
        return tasksInWorkspace.filter(t => 
            t.id !== task.id && 
            !task.dependencies?.includes(t.id) &&
            !onCheckCircular(task.id, t.id)
        );
    }, [tasksInWorkspace, task, onCheckCircular]);

    const addDependency = (depId: string) => {
        if (!depId || !task) return;
        const newDependencies = [...(task.dependencies || []), depId];
        onChange({ dependencies: newDependencies });
    };

    const removeDependency = (depId: string) => {
        if (!task) return;
        const newDependencies = (task.dependencies || []).filter(id => id !== depId);
        onChange({ dependencies: newDependencies });
    };
    
    const handleDelete = () => {
        onDelete(task.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                    <Input value={task.title} onChange={e => onChange({ title: e.target.value })} className="text-lg font-semibold leading-none tracking-tight border-0 shadow-none focus-visible:ring-0 p-0" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-500">Description</label>
                            <textarea
                                value={task.description || ''}
                                onChange={e => onChange({ description: e.target.value })}
                                rows={5}
                                className="mt-1 flex w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
                                placeholder="Add more details..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-500">Subtasks</label>
                            <div className="mt-2 space-y-2">
                                {(task.subtasks || []).map(subtask => (
                                    <div key={subtask.id} className="flex items-center gap-2 group">
                                        <input
                                            type="checkbox"
                                            checked={subtask.done}
                                            onChange={(e) => handleSubtaskChange(subtask.id, { done: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <Input
                                            value={subtask.title}
                                            onChange={(e) => handleSubtaskChange(subtask.id, { title: e.target.value })}
                                            className={`flex-grow h-8 text-sm bg-transparent border-0 focus-visible:ring-0 p-1 ${subtask.done ? 'line-through text-slate-500' : ''}`}
                                            placeholder="Subtask title..."
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteSubtask(subtask.id)}>
                                            <IconTrash className="w-4 h-4 text-slate-500 hover:text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                                 <Button variant="ghost" size="sm" className="mt-2 text-slate-500" onClick={handleAddSubtask}>
                                    <IconSquarePlus className="w-4 h-4 mr-2" /> Add Subtask
                                </Button>
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-slate-500">Dependencies</label>
                            <div className="mt-2 space-y-2">
                                {(task.dependencies || []).map(depId => {
                                    const depTask = tasksInWorkspace.find(t => t.id === depId);
                                    return (
                                        <div key={depId} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                                            <span className="text-sm">{depTask?.title || 'Unknown Task'}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeDependency(depId)}>
                                                <IconTrash className="w-3.5 h-3.5 text-slate-500 hover:text-red-500" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-2">
                                 <select 
                                    onChange={e => addDependency(e.target.value)} 
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
                                    value=""
                                >
                                    <option value="" disabled>Add a dependency...</option>
                                    {availableDependencies.map(dep => (
                                        <option key={dep.id} value={dep.id}>{dep.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t dark:border-slate-800">
                            <div className="flex gap-2">
                                 <Button variant="outline" size="sm" onClick={() => onMove(task.id, 'today')}>Move to Plan</Button>
                                 <Button variant="outline" size="sm" onClick={() => onMove(task.id, 'week')}>Move to Week</Button>
                                 <Button variant="outline" size="sm" onClick={() => onMove(task.id, 'later')}>Move to Later</Button>
                            </div>
                             <div className="flex items-center gap-2">
                                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                                <Button variant="ghost" onClick={onClose}>Close</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function UniversalSearch({ onClose, notes, projects, tasks, onSelectNote, onSelectProject, onSelectTask, onNavigate }: { onClose: () => void, notes: Note[], projects: Project[], tasks: Task[], onSelectNote: (noteId: string) => void, onSelectProject: (projectId: string) => void, onSelectTask: (taskId: string) => void, onNavigate: (view: string) => void }) {
    const [query, setQuery] = useState('');
    const results = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        const noteResults = notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)).map(n => ({ type: 'note', item: n }));
        const projectResults = projects.filter(p => p.title.toLowerCase().includes(q)).map(p => ({ type: 'project', item: p }));
        const taskResults = tasks.filter(t => t.title.toLowerCase().includes(q)).map(t => ({ type: 'task', item: t }));
        return [...noteResults, ...projectResults, ...taskResults].slice(0, 10);
    }, [query, notes, projects, tasks]);

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 pt-[10vh]" onClick={onClose}>
            <Card className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b">
                     <div className="relative">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            autoFocus
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search tasks, notes, projects..."
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                    {results.length > 0 ? (
                        <ul>
                            {results.map(({ type, item }) => (
                                <li key={`${type}-${item.id}`}>
                                    <button className="w-full text-left p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3"
                                        onClick={() => {
                                            if (type === 'note') onSelectNote(item.id);
                                            if (type === 'project') onSelectProject(item.id);
                                            if (type === 'task') onSelectTask(item.id);
                                        }}>
                                        {type === 'note' && <IconNotebook className="w-4 h-4 text-slate-500" />}
                                        {type === 'project' && <IconBriefcase className="w-4 h-4 text-slate-500" />}
                                        {type === 'task' && <IconClipboardCheck className="w-4 h-4 text-slate-500" />}
                                        <span>{(item as any).title}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : query.trim() ? (
                        <p className="p-4 text-center text-sm text-slate-500">No results found.</p>
                    ) : (
                         <div className="p-4 text-sm text-slate-500 space-y-2">
                            <p className="font-medium">Quick navigation:</p>
                            <button onClick={() => onNavigate('today')} className="block p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">Go to Today</button>
                            <button onClick={() => onNavigate('tasks')} className="block p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">Go to Tasks</button>
                            <button onClick={() => onNavigate('notes')} className="block p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">Go to Notes</button>
                         </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

function QuickAddModal({
    workspaces,
    onClose,
    onAddTask,
}: {
    workspaces: Workspace[];
    onClose: () => void;
    onAddTask: (workspaceId: string, task: Task) => void;
}) {
    const [taskInput, setTaskInput] = useState("");
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(workspaces.length > 0 ? workspaces[0].id : null);

    useEffect(() => {
        const inputLower = taskInput.toLowerCase();
        let foundWsId = null;
        for (const ws of workspaces) {
            if (inputLower.includes(`#${ws.name.toLowerCase()}`)) {
                foundWsId = ws.id;
            }
        }
        if (foundWsId) {
            setSelectedWorkspaceId(foundWsId);
        }
    }, [taskInput, workspaces]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskInput.trim() || !selectedWorkspaceId) return;

        let processedInput = taskInput;
        const selectedWs = workspaces.find(ws => ws.id === selectedWorkspaceId);
        if (selectedWs) {
            const regex = new RegExp(`\\s*#${selectedWs.name}\\b`, 'ig');
            processedInput = processedInput.replace(regex, '').trim();
        }

        const meta = parseQuickTask(processedInput);
        const newTask: Task = {
            id: `t${Date.now()}`,
            title: meta.title,
            priority: 2,
            ...(meta.area && { area: meta.area }),
            ...(meta.someday && { someday: meta.someday }),
            ...(meta.due && { due: meta.due }),
        };

        onAddTask(selectedWorkspaceId, newTask);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 pt-[10vh]" onClick={onClose}>
            <Card className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Quick Add Task</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            autoFocus
                            value={taskInput}
                            onChange={(e) => setTaskInput(e.target.value)}
                            placeholder="e.g., Follow up with team #work @2025-12-25"
                        />
                        <div className="mt-4">
                            <label className="text-sm font-medium text-slate-500">Workspace</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {workspaces.map(ws => (
                                    <button
                                        key={ws.id}
                                        type="button"
                                        onClick={() => setSelectedWorkspaceId(ws.id)}
                                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                            selectedWorkspaceId === ws.id
                                                ? 'border-transparent text-white'
                                                : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                        style={{ 
                                            backgroundColor: selectedWorkspaceId === ws.id ? ws.color : 'transparent',
                                            color: selectedWorkspaceId === ws.id ? getContrastYIQ(ws.color) : ''
                                        }}
                                    >
                                        {ws.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={!taskInput.trim() || !selectedWorkspaceId}>Add Task</Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}

// ================= App Component =================
export default function App() {
    const [device, setDevice] = useState("desktop");
    const [workspaces, setWorkspaces] = useState<Workspace[]>(defaultWorkspaces);
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>('personal');
    const [date, setDate] = useState(new Date());
    // Fix: Typed all state variables with the defined interfaces.
    const [carry, setCarry] = useState<Task[]>(seedCarry);
    const [todayBucket, setTodayBucket] = useState<Task[]>([{ id: "t1", title: "Plan my day", priority: 1 }]);
    const [weekBucket, setWeekBucket] = useState<Task[]>([{ id: "t2", title: "Email follow-ups", priority: 2, weekPlacedOn: startOfWeek(new Date()).toISOString(), userScheduled: false }]);
    const [laterBucket, setLaterBucket] = useState<Task[]>([{ id: "t3", title: "Outline REI project", priority: 3 }]);
    const [inboxTasks, setInboxTasks] = useState<Task[]>([]);
    const [big3Tasks, setBig3Tasks] = useState<Task[]>([]);
    const [otherTasks, setOtherTasks] = useState<Task[]>([{ id: "t4", title: "Pay water bill", priority: 2 }, { id: "t5", title: "Groceries list", priority: 3 }, { id: "t6", title: "Draft content ideas", priority: 2 }]);
    const [doneToday, setDoneToday] = useState<Task[]>([]);
    const [scheduledTasks, setScheduledTasks] = useState<Record<string, Task[]>>({});
    const [note, setNote] = useState(`<h2>Today</h2><ul><li>Standup notes</li><li>Key decisions</li></ul><p><br></p><hr><p>Example Mind Map</p><ul><li>Branch 1<ul><li>Sub-branch 1.1</li><li>Sub-branch 1.2</li></ul></li><li>Branch 2</li></ul>`);
    const [quickNote, setQuickNote] = useState("");
    const [dailyPlanNote, setDailyPlanNote] = useState("");
    const [dailyPlanTemplate, setDailyPlanTemplate] = useState(DAILY_TEMPLATE);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [docItems, setDocItems] = useState<DocItem[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [newTask, setNewTask] = useState("");
    const [rolloverEnabled, setRolloverEnabled] = useState(true);
    const [carryPromptOpen, setCarryPromptOpen] = useState(false);
    const [carrySelection, setCarrySelection] = useState<Record<string, boolean>>({});
    const [showBackup, setShowBackup] = useState(false);
    const [backupMsg, setBackupMsg] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('pkmTheme');
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
            return savedTheme;
        }
        return 'system';
    });
    
    const [taskSettings, setTaskSettings] = useState<TaskSettings>(() => {
        try {
            const savedSettings = localStorage.getItem("pkmGlobalTaskSettings");
            return savedSettings ? JSON.parse(savedSettings) : {
                priorities: [
                    { level: 1, name: 'High', color: '#ef4444' },
                    { level: 2, name: 'Medium', color: '#f97316' },
                    { level: 3, name: 'Low', color: '#22c55e' },
                ]
            };
        } catch {
            return {
                priorities: [
                    { level: 1, name: 'High', color: '#ef4444' },
                    { level: 2, name: 'Medium', color: '#f97316' },
                    { level: 3, name: 'Low', color: '#22c55e' },
                ]
            };
        }
    });

    const [notebooks, setNotebooks] = useState<NotebookItem[]>([
        { id: 'nb1', name: 'Personal', parentId: null },
        { id: 'sec1', name: 'Journal', parentId: 'nb1' },
        { id: 'sec2', name: 'Recipes', parentId: 'nb1' },
        { id: 'nb2', name: 'Work', parentId: null },
        { id: 'sec3', name: 'Project Titan', parentId: 'nb2' },
    ]);
    const [notes, setNotes] = useState<Note[]>([
        { id: 'n1', title: 'September 28, 2025', content: '<ul><li>A good day overall.</li></ul>', notebookId: 'sec1', parentId: null },
        { id: 'n2', title: 'Pasta Recipe', content: '<ol><li>Boil water...</li></ol>', notebookId: 'sec2', parentId: null },
        { id: 'n3', title: 'Meeting Notes', content: '<ul><li>Discussed Q4 goals.</li></ul>', notebookId: 'sec3', parentId: null },
        { id: 'n4', title: 'Follow-up items', content: '<ul><li>Email marketing team.</li></ul>', notebookId: 'sec3', parentId: 'n3' },
    ]);
    const [projects, setProjects] = useState<Project[]>([{id: 'p1', title: 'Finish productivity app', content: 'Add more features.', status: 'In Progress', deadline: '2025-10-31'}]);
    const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([
        {name: "Not Started", color: "#e2e8f0"},
        {name: "In Progress", color: "#bfdbfe"},
        {name: "Completed", color: "#bbf7d0"},
    ]);
    const [mindMapData, setMindMapData] = useState<MindMapNode>({ id: 'root', text: 'Central Idea', children: [] });
    
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>('sec1');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [mindMapNoteId, setMindMapNoteId] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [showWorkspaceManager, setShowWorkspaceManager] = useState(false);
    const [activeView, setActiveView] = useState('today');
    const [activeMode, setActiveMode] = useState('workspace'); // 'workspace' or 'global'
    const [allData, setAllData] = useState<Record<string, any>>({});
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [expandedNotebooks, setExpandedNotebooks] = useState<Record<string,boolean>>({'nb1': true, 'nb2': true});
    const hydratedRef = useRef(false);
    
    // Fix: Add handlers for projects, mind map, notes, docs etc. that are passed as props but were not defined.
    const updateProject = (id: string, patch: Partial<Project>) => { setProjects(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p)); };
    const addProject = (status: string) => { setProjects(ps => [...ps, { id: `p${Date.now()}`, title: "New Project", content: "", status: status, deadline: null }]); };
    const deleteProject = (id: string) => { setProjects(ps => ps.filter(p => p.id !== id)); };
    const addProjectStatus = () => { 
        const name = prompt("New column name:"); 
        if (name && !projectStatuses.some(s => s.name === name)) {
             setProjectStatuses(s => [...s, { name, color: '#cccccc' }]); 
        } else if (name) {
            alert("A column with this name already exists.");
        }
    };
    const updateProjectStatus = (oldName: string, patch: Partial<ProjectStatus>) => { 
        setProjectStatuses(s => s.map(ps => ps.name === oldName ? { ...ps, ...patch } : ps));
        if (patch.name) {
             setProjects(ps => ps.map(p => p.status === oldName ? { ...p, status: patch.name! } : p));
        }
    };
    const deleteProjectStatus = (name: string) => { 
        if (projects.some(p => p.status === name)) {
            alert("Cannot delete a column that contains projects. Please move them first.");
            return;
        }
        setProjectStatuses(s => s.filter(ps => ps.name !== name)); 
    };
    const reorderProjectStatuses = (from: number, to: number) => { setProjectStatuses(current => { const result = Array.from(current); const [removed] = result.splice(from, 1); result.splice(to, 0, removed); return result; }); };
    
    const handleProjectMove = (draggedId: string, targetStatus: string, targetId?: string, position?: 'before' | 'after') => {
        if (!draggedId) return; // a reset call
        setProjects(currentProjects => {
            const projectToMove = currentProjects.find(p => p.id === draggedId);
            // Abort if no project found or if dropping on itself
            if (!projectToMove || projectToMove.id === targetId) return currentProjects;

            const updatedProject = { ...projectToMove, status: targetStatus };
            const projectsWithoutMoved = currentProjects.filter(p => p.id !== draggedId);

            let insertionIndex = projectsWithoutMoved.length; // Default to end of the whole list

            if (targetId && position) {
                const targetIndex = projectsWithoutMoved.findIndex(p => p.id === targetId);
                if (targetIndex !== -1) {
                    insertionIndex = position === 'before' ? targetIndex : targetIndex + 1;
                }
            } else {
                // If no target card (e.g., dropping on empty column), find the last project in the target column to drop after it.
                const lastProjectInColumnIndex = projectsWithoutMoved.map(p => p.status).lastIndexOf(targetStatus);
                if (lastProjectInColumnIndex !== -1) {
                    insertionIndex = lastProjectInColumnIndex + 1;
                }
            }
            
            projectsWithoutMoved.splice(insertionIndex, 0, updatedProject);
            return projectsWithoutMoved;
        });
    };

    const addMindMapNode = (parentId: string) => {
        const newNode: MindMapNode = { id: `mm_${Date.now()}`, text: 'New Idea', children: [] };
        const addRec = (node: MindMapNode): MindMapNode => {
            if (node.id === parentId) {
                return { ...node, children: [...node.children, newNode] };
            }
            return { ...node, children: node.children.map(addRec) };
        };
        setMindMapData(addRec(mindMapData));
    };

    const updateMindMapNode = (nodeId: string, text: string) => {
        const updateRec = (node: MindMapNode): MindMapNode => {
            if (node.id === nodeId) {
                return { ...node, text };
            }
            return { ...node, children: node.children.map(updateRec) };
        };
        setMindMapData(updateRec(mindMapData));
    };

    const deleteMindMapNode = (nodeId: string) => {
        if (nodeId === 'root') return;
        const deleteRec = (node: MindMapNode): MindMapNode => {
            return {
                ...node,
                children: node.children.filter(child => child.id !== nodeId).map(deleteRec)
            };
        };
        setMindMapData(deleteRec(mindMapData));
    };

    const handleFileUpload = (files: FileList) => {
        const newFiles: DocItem[] = Array.from(files).map(file => ({
            id: `doc_${Date.now()}_${Math.random()}`,
            name: file.name,
            type: 'file',
            parentId: selectedFolderId,
            size: file.size,
            mimeType: file.type,
        }));
        setDocItems(current => [...current, ...newFiles]);
    };
    
    const onNoteReorder = (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
        setNotes(currentNotes => {
            const draggedNote = currentNotes.find(n => n.id === draggedId);
            if (!draggedNote) return currentNotes;

            const notesWithoutDragged = currentNotes.filter(n => n.id !== draggedId);
            const targetIndex = notesWithoutDragged.findIndex(n => n.id === targetId);
            if (targetIndex === -1) return currentNotes;

            const targetNote = notesWithoutDragged[targetIndex];

            if (position === 'inside') {
                draggedNote.parentId = targetId;
                return [...notesWithoutDragged, draggedNote];
            } else {
                draggedNote.parentId = targetNote.parentId;
                const insertionIndex = position === 'before' ? targetIndex : targetIndex + 1;
                notesWithoutDragged.splice(insertionIndex, 0, draggedNote);
                return notesWithoutDragged;
            }
        });
    };

    const onNotebookReorder = (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
        setNotebooks(currentItems => {
            const draggedItem = currentItems.find(n => n.id === draggedId);
            const targetItem = currentItems.find(n => n.id === targetId);
            if (!draggedItem || !targetItem) return currentItems;
    
            const isDraggedNotebook = draggedItem.parentId === null;
            const isTargetNotebook = targetItem.parentId === null;
    
            if (position === 'inside') {
                if (!isTargetNotebook || isDraggedNotebook) return currentItems; 
                draggedItem.parentId = targetId;
                return [...currentItems.filter(i => i.id !== draggedId), draggedItem];
            }
    
            if (draggedItem.parentId !== targetItem.parentId) return currentItems;
    
            const itemsAtSameLevel = currentItems.filter(i => i.parentId === targetItem.parentId);
            const itemsWithoutDragged = itemsAtSameLevel.filter(i => i.id !== draggedId);
            const targetIndex = itemsWithoutDragged.findIndex(i => i.id === targetId);
            
            const insertionIndex = position === 'before' ? targetIndex : targetIndex + 1;
            itemsWithoutDragged.splice(insertionIndex, 0, draggedItem);
    
            const otherItems = currentItems.filter(i => i.parentId !== targetItem.parentId);
            return [...otherItems, ...itemsWithoutDragged];
        });
    };

    const handleGenerateMindMapFromNote = (note: Note) => {
        if (window.confirm("This will replace the current mind map in this workspace. Are you sure?")) {
            const newMindMapData = parseHtmlToMindMap(note.content, note.title);
            setMindMapData(newMindMapData);
            setActiveView('mindmap');
        }
    };

    const allTasks = useMemo(() => [
        ...inboxTasks, ...big3Tasks, ...otherTasks,
        ...todayBucket, ...weekBucket, ...laterBucket, ...carry, ...doneToday
    ], [inboxTasks, big3Tasks, otherTasks, todayBucket, weekBucket, laterBucket, carry, doneToday]);

    const allTasksById = useMemo(() => {
        const map = new Map<string, Task>();
        for (const task of allTasks) {
            map.set(task.id, task);
        }
        return map;
    }, [allTasks]);

    const blockedTasks = useMemo(() => {
        const doneTaskIds = new Set(doneToday.map(t => t.id));
        const openTasks = allTasks.filter(t => !doneTaskIds.has(t.id));
        const blockedStatus: Record<string, {isBlocked: boolean, blockers: string[]}> = {};
    
        for (const task of openTasks) {
            if (!task.dependencies || task.dependencies.length === 0) {
                blockedStatus[task.id] = { isBlocked: false, blockers: [] };
                continue;
            }
    
            const blockers = task.dependencies.filter(depId => !doneTaskIds.has(depId));
            blockedStatus[task.id] = {
                isBlocked: blockers.length > 0,
                blockers: blockers
            };
        }
        return blockedStatus;
    }, [allTasks, doneToday]);

    const checkForCircularDependency = useCallback((taskId: string, newDependencyId: string): boolean => {
        const taskMap = allTasksById;
        const visited = new Set<string>();
        const stack = [newDependencyId];
    
        while (stack.length > 0) {
            const currentId = stack.pop()!;
    
            if (currentId === taskId) {
                return true; // Cycle detected
            }
    
            if (visited.has(currentId)) {
                continue;
            }
            visited.add(currentId);
    
            const currentTask = taskMap.get(currentId);
            if (currentTask && currentTask.dependencies) {
                for (const depId of currentTask.dependencies) {
                    stack.push(depId);
                }
            }
        }
        return false;
    }, [allTasksById]);

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        root.classList.toggle('dark', isDark);
        localStorage.setItem('pkmTheme', theme);
    
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                root.classList.toggle('dark', mediaQuery.matches);
            }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [theme]);

    useEffect(() => { 
        try { 
            const saved = localStorage.getItem("workspaces"); 
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setWorkspaces(parsed);
                }
            }
        } catch {} 
        try {
            const savedId = localStorage.getItem("lastWorkspaceId");
            if (savedId) {
                setActiveWorkspaceId(savedId);
            }
        } catch {}
    }, []);

    useEffect(() => {
        // This effect reliably saves task settings whenever they change.
        try {
            localStorage.setItem("pkmGlobalTaskSettings", JSON.stringify(taskSettings));
        } catch {}
    }, [taskSettings]);

    useEffect(() => {
        // Load all data from all workspaces on initial load or when workspaces change.
        const all = collectAllFromLocalStorage();
        setAllData(all);
    }, [workspaces, inboxTasks, big3Tasks, otherTasks, weekBucket, laterBucket, doneToday]);

    // Fix: Defined `openDetails` to resolve "Cannot find name 'openDetails'" error.
    const openDetails = (taskId: string, workspaceId?: string) => {
        if (workspaceId && workspaceId !== activeWorkspaceId) {
            setActiveWorkspaceId(workspaceId);
            setPendingTaskId(taskId);
        } else {
            setSelectedTaskId(taskId);
            setDetailsOpen(true);
        }
    };

    useEffect(() => {
        if (pendingTaskId && hydratedRef.current) {
            const all = [...inboxTasks, ...big3Tasks, ...otherTasks, ...weekBucket, ...laterBucket, ...doneToday, ...carry];
            if (all.find(t => t.id === pendingTaskId)) {
                openDetails(pendingTaskId);
                setPendingTaskId(null);
            }
        }
    }, [pendingTaskId, inboxTasks, big3Tasks, otherTasks, weekBucket, laterBucket, doneToday, carry]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                setIsSearchOpen(o => !o);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => { 
        try { 
            if(activeWorkspaceId) localStorage.setItem("lastWorkspaceId", activeWorkspaceId); 
            localStorage.setItem("workspaces", JSON.stringify(workspaces));
        } catch {} 
    }, [activeWorkspaceId, workspaces]);
    
    const resetDocState = () => {
        setDocItems([]);
        setSelectedFolderId(null);
    };

    useEffect(() => {
        if (!activeWorkspaceId) return;
        const data = loadWorkspaceState(activeWorkspaceId);
        if (data) {
            setCarry(Array.isArray(data.carry) ? data.carry : seedCarry);
            setTodayBucket(Array.isArray(data.todayBucket) ? data.todayBucket : [{ id: "t1", title: "Plan my day", priority: 1 }]);
            setWeekBucket(Array.isArray(data.weekBucket) ? data.weekBucket : [{ id: "t2", title: "Email follow-ups", priority: 2, weekPlacedOn: startOfWeek(new Date()).toISOString(), userScheduled: false }]);
            setLaterBucket(Array.isArray(data.laterBucket) ? data.laterBucket : [{ id: "t3", title: "Outline REI project", priority: 3 }]);
            
            if (data.todayTasks && !data.inboxTasks && !data.big3Tasks && !data.otherTasks) {
                setInboxTasks(Array.isArray(data.todayTasks) ? data.todayTasks : []); setBig3Tasks([]); setOtherTasks([]);
            } else {
                setInboxTasks(Array.isArray(data.inboxTasks) ? data.inboxTasks : []);
                setBig3Tasks(Array.isArray(data.big3Tasks) ? data.big3Tasks : []);
                setOtherTasks(Array.isArray(data.otherTasks) ? data.otherTasks : [{ id: "t4", title: "Pay water bill", priority: 2 }]);
            }

            setDoneToday(Array.isArray(data.doneToday) ? data.doneToday : []);
            setScheduledTasks(typeof data.scheduledTasks === 'object' ? data.scheduledTasks : {});
            setNote(typeof data.note === 'string' ? data.note : `<h2>Today</h2><ul><li>Standup notes</li><li>Key decisions</li></ul><p><br></p><hr><p>Example Mind Map</p><ul><li>Branch 1<ul><li>Sub-branch 1.1</li><li>Sub-branch 1.2</li></ul></li><li>Branch 2</li></ul>`);
            setQuickNote(typeof data.quickNote === 'string' ? data.quickNote : "");
            setDailyPlanNote(typeof data.dailyPlanNote === 'string' ? data.dailyPlanNote : "");
            setDailyPlanTemplate(typeof data.dailyPlanTemplate === 'string' ? data.dailyPlanTemplate : DAILY_TEMPLATE);
            setDocuments(Array.isArray(data.documents) ? data.documents : []);
            setDocItems(Array.isArray(data.docItems) ? data.docItems : []);
            setSelectedFolderId(typeof data.selectedFolderId === 'string' ? data.selectedFolderId : null);
            setNotebooks(Array.isArray(data.notebooks) ? data.notebooks : [
                { id: 'nb1', name: 'Personal', parentId: null },
                { id: 'sec1', name: 'Journal', parentId: 'nb1' },
                { id: 'sec2', name: 'Recipes', parentId: 'nb1' },
                { id: 'nb2', name: 'Work', parentId: null },
                { id: 'sec3', name: 'Project Titan', parentId: 'nb2' },
            ]);
            setNotes(Array.isArray(data.notes) ? data.notes : [
                { id: 'n1', title: 'September 28, 2025', content: '<ul><li>A good day overall.</li></ul>', notebookId: 'sec1', parentId: null },
                { id: 'n2', title: 'Pasta Recipe', content: '<ol><li>Boil water...</li></ol>', notebookId: 'sec2', parentId: null },
                { id: 'n3', title: 'Meeting Notes', content: '<ul><li>Discussed Q4 goals.</li></ul>', notebookId: 'sec3', parentId: null },
                { id: 'n4', title: 'Follow-up items', content: '<ul><li>Email marketing team.</li></ul>', notebookId: 'sec3', parentId: 'n3' },
            ]);
            setProjects(Array.isArray(data.projects) ? data.projects : [{id: 'p1', title: 'Finish productivity app', content: 'Add more features.', status: 'In Progress', deadline: '2025-10-31'}]);
            setProjectStatuses(Array.isArray(data.projectStatuses) ? data.projectStatuses : [
                {name: "Not Started", color: "#e2e8f0"},
                {name: "In Progress", color: "#bfdbfe"},
                {name: "Completed", color: "#bbf7d0"},
            ]);
            setMindMapData(typeof data.mindMapData === 'object' && data.mindMapData ? data.mindMapData : { id: 'root', text: 'Central Idea', children: [] });
            setSelectedSectionId(typeof data.selectedSectionId === 'string' ? data.selectedSectionId : 'sec1');
            setSelectedNoteId(null); // Reset selected note on workspace change
            setExpandedNotebooks(typeof data.expandedNotebooks === 'object' ? data.expandedNotebooks : {'nb1': true, 'nb2': true});
        } else {
            // Reset to default state if no saved data
            setCarry(seedCarry);
            setTodayBucket([{ id: "t1", title: "Plan my day", priority: 1 }]);
            setWeekBucket([{ id: "t2", title: "Email follow-ups", priority: 2, weekPlacedOn: startOfWeek(new Date()).toISOString(), userScheduled: false }]);
            setLaterBucket([{ id: "t3", title: "Outline REI project", priority: 3 }]);
            setInboxTasks([]);
            setBig3Tasks([]);
            setOtherTasks([{ id: "t4", title: "Pay water bill", priority: 2 }, { id: "t5", title: "Groceries list", priority: 3 }, { id: "t6", title: "Draft content ideas", priority: 2 }]);
            setDoneToday([]);
            setScheduledTasks({});
            setNote(`<h2>Today</h2><ul><li>Standup notes</li><li>Key decisions</li></ul><p><br></p><hr><p>Example Mind Map</p><ul><li>Branch 1<ul><li>Sub-branch 1.1</li><li>Sub-branch 1.2</li></ul></li><li>Branch 2</li></ul>`);
            setQuickNote("");
            setDailyPlanNote("");
            setDailyPlanTemplate(DAILY_TEMPLATE);
            setDocuments([]);
            resetDocState();
            setNotebooks([
                { id: 'nb1', name: 'Personal', parentId: null },
                { id: 'sec1', name: 'Journal', parentId: 'nb1' },
                { id: 'sec2', name: 'Recipes', parentId: 'nb1' },
                { id: 'nb2', name: 'Work', parentId: null },
                { id: 'sec3', name: 'Project Titan', parentId: 'nb2' },
            ]);
            setNotes([
                { id: 'n1', title: 'September 28, 2025', content: '<ul><li>A good day overall.</li></ul>', notebookId: 'sec1', parentId: null },
                { id: 'n2', title: 'Pasta Recipe', content: '<ol><li>Boil water...</li></ol>', notebookId: 'sec2', parentId: null },
                { id: 'n3', title: 'Meeting Notes', content: '<ul><li>Discussed Q4 goals.</li></ul>', notebookId: 'sec3', parentId: null },
                { id: 'n4', title: 'Follow-up items', content: '<ul><li>Email marketing team.</li></ul>', notebookId: 'sec3', parentId: 'n3' },
            ]);
            setProjects([{id: 'p1', title: 'Finish productivity app', content: 'Add more features.', status: 'In Progress', deadline: '2025-10-31'}]);
            setProjectStatuses([
                {name: "Not Started", color: "#e2e8f0"},
                {name: "In Progress", color: "#bfdbfe"},
                {name: "Completed", color: "#bbf7d0"},
            ]);
            setMindMapData({ id: 'root', text: 'Central Idea', children: [] });
            setSelectedSectionId('sec1');
            setSelectedNoteId(null);
            setExpandedNotebooks({'nb1': true, 'nb2': true});
        }
        hydratedRef.current = true;
    }, [activeWorkspaceId]);

    // Save state whenever it changes
    useEffect(() => {
        if (!activeWorkspaceId || !hydratedRef.current) return;
        const stateToSave = {
            carry, todayBucket, weekBucket, laterBucket, inboxTasks, big3Tasks,
            otherTasks, doneToday, scheduledTasks, note, quickNote, dailyPlanNote, dailyPlanTemplate,
            documents, docItems, selectedFolderId, notebooks, notes, projects, projectStatuses,
            mindMapData, selectedSectionId, expandedNotebooks
        };
        saveWorkspaceState(activeWorkspaceId, stateToSave);
    }, [
        activeWorkspaceId, carry, todayBucket, weekBucket, laterBucket,
        inboxTasks, big3Tasks, otherTasks, doneToday, scheduledTasks, note, quickNote,
        dailyPlanNote, dailyPlanTemplate, documents, docItems, selectedFolderId, notebooks,
        notes, projects, projectStatuses, mindMapData, selectedSectionId, expandedNotebooks
    ]);

    // Task Handlers
    const completeTask = (id: string) => {
        let taskToComplete: Task | undefined;
        const lists = [inboxTasks, big3Tasks, otherTasks, todayBucket, weekBucket, laterBucket, carry];
        const setters = [setInboxTasks, setBig3Tasks, setOtherTasks, setTodayBucket, setWeekBucket, setLaterBucket, setCarry];
        
        for (let i = 0; i < lists.length; i++) {
            const list = lists[i];
            const task = list.find(t => t.id === id);
            if (task) {
                taskToComplete = task;
                setters[i]((prev: Task[]) => prev.filter(t => t.id !== id));
                break;
            }
        }
        
        if (taskToComplete) {
            setDoneToday(prev => [...prev, { ...taskToComplete, doneAt: new Date().toISOString() }]);
        }
    };
    
    const deleteTask = (id: string) => {
        const allSetters = [setInboxTasks, setBig3Tasks, setOtherTasks, setTodayBucket, setWeekBucket, setLaterBucket, setCarry, setDoneToday];
        allSetters.forEach(setter => setter((prev: Task[]) => prev.filter(t => t.id !== id)));
        setScheduledTasks(prev => {
            const newScheduled: Record<string, Task[]> = {};
            for (const dateKey in prev) {
                const filteredTasks = prev[dateKey].filter(t => t.id !== id);
                if (filteredTasks.length > 0) {
                    newScheduled[dateKey] = filteredTasks;
                }
            }
            return newScheduled;
        });
    };

    const addTask = () => {
        if (newTask.trim() === '') return;
        const meta = parseQuickTask(newTask);
        const task: Task = {
            id: `t${Date.now()}`,
            title: meta.title,
            priority: 2,
            ...meta
        };
        setInboxTasks(prev => [...prev, task]);
        setNewTask('');
    };
    
    const moveTask = (id: string, dest: 'today' | 'week' | 'later') => {
        let taskToMove: Task | undefined;
        const lists = [inboxTasks, big3Tasks, otherTasks, todayBucket, weekBucket, laterBucket, carry];
        const setters = [setInboxTasks, setBig3Tasks, setOtherTasks, setTodayBucket, setWeekBucket, setLaterBucket, setCarry];

        for (let i=0; i < lists.length; i++) {
            taskToMove = lists[i].find(t => t.id === id);
            if(taskToMove) {
                setters[i]((prev: Task[]) => prev.filter(t => t.id !== id));
                break;
            }
        }

        if (taskToMove) {
            if (dest === 'today') setTodayBucket(p => [taskToMove!, ...p]);
            if (dest === 'week') setWeekBucket(p => [taskToMove!, ...p]);
            if (dest === 'later') setLaterBucket(p => [taskToMove!, ...p]);
        }
    };
    
    const updateTask = (id: string, patch: Partial<Task>) => {
        const allSetters = [setInboxTasks, setBig3Tasks, setOtherTasks, setTodayBucket, setWeekBucket, setLaterBucket, setCarry, setDoneToday];
        allSetters.forEach(setter => setter((prev: Task[]) => prev.map(t => t.id === id ? { ...t, ...patch } : t)));
    };
    
    const moveTodayTask = (taskId: string, sourceList: TaskListName, destList: TaskListName) => {
        if (sourceList === destList) return;
        
        let task: Task | undefined;
        const sourceSetter = sourceList === 'inbox' ? setInboxTasks : sourceList === 'big3' ? setBig3Tasks : setOtherTasks;
        
        sourceSetter((prev: Task[]) => {
            const newPrev = prev.filter(t => {
                if(t.id === taskId) {
                    task = t;
                    return false;
                }
                return true;
            });
            return newPrev;
        });

        if (task) {
            const destSetter = destList === 'inbox' ? setInboxTasks : destList === 'big3' ? setBig3Tasks : setOtherTasks;
             if(destList === 'big3' && big3Tasks.length >=3) {
                setOtherTasks(prev => [...prev, task!]);
                return; // Can't add more than 3 to big3
            }
            destSetter((prev: Task[]) => [...prev, task!]);
        }
    };

    // Workspace/Global handlers
    const setActiveWorkspaceAndMode = (id: string | null) => {
        setActiveWorkspaceId(id);
        setActiveMode(id ? 'workspace' : 'global');
        if (!id) { setActiveView('today'); }
    };
    
    const handleAddWorkspace = () => {
        const name = prompt("New workspace name:");
        if (name && name.trim()) {
            const newWorkspace: Workspace = { id: `ws_${Date.now()}`, name: name.trim(), color: `#${Math.floor(Math.random()*16777215).toString(16)}` };
            setWorkspaces(prev => [...prev, newWorkspace]);
            setActiveWorkspaceAndMode(newWorkspace.id);
        }
    };
    const handleUpdateWorkspace = (id: string, patch: {name?: string, color?: string}) => setWorkspaces(prev => prev.map(ws => ws.id === id ? {...ws, ...patch} : ws));
    const handleDeleteWorkspace = (id: string) => {
        if(window.confirm("Are you sure you want to delete this workspace and all its data? This cannot be undone.")){
            setWorkspaces(prev => prev.filter(ws => ws.id !== id));
            if (activeWorkspaceId === id) { setActiveWorkspaceAndMode(workspaces[0]?.id || null); }
            clearWorkspaceState(id);
        }
    };
    
    // Notes handlers
    const addNotebookItem = (name: string, parentId: string | null = null) => setNotebooks(prev => [...prev, {id: `nb_${Date.now()}`, name, parentId}]);
    const updateNotebookItem = (id: string, patch: Partial<NotebookItem>) => setNotebooks(prev => prev.map(nb => nb.id === id ? {...nb, ...patch} : nb));
    const deleteNotebookItem = (id: string) => {
        if (notebooks.some(nb => nb.parentId === id) || notes.some(n => n.notebookId === id)) {
            alert("Cannot delete a notebook or section that contains items. Please remove them first.");
            return;
        }
        setNotebooks(prev => prev.filter(nb => nb.id !== id));
    };
    const addNote = (notebookId: string, parentId: string | null = null) => {
        const newNote: Note = {id: `note_${Date.now()}`, title: "Untitled", content: "", notebookId, parentId};
        setNotes(prev => [...prev, newNote]);
        setSelectedNoteId(newNote.id);
    };
    const updateNote = (id: string, patch: Partial<Note>) => setNotes(prev => prev.map(n => n.id === id ? {...n, ...patch} : n));
    const deleteNote = (id: string) => {
        if (notes.some(n => n.parentId === id)) {
            alert("Cannot delete a page that has subpages.");
            return;
        }
        setNotes(prev => prev.filter(n => n.id !== id));
        if (selectedNoteId === id) setSelectedNoteId(null);
    };

    // Docs handlers
    const addDocItem = (item: Omit<DocItem, 'id'>) => setDocItems(prev => [...prev, {id: `doc_${Date.now()}`, ...item}]);
    const updateDocItem = (id: string, patch: Partial<DocItem>) => setDocItems(prev => prev.map(d => d.id === id ? {...d, ...patch} : d));
    const deleteDocItem = (id: string) => setDocItems(prev => prev.filter(d => d.id !== id));

    const activeWorkspace = useMemo(() => workspaces.find(ws => ws.id === activeWorkspaceId), [workspaces, activeWorkspaceId]);
    
    return (
        <div className="h-screen w-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex font-sans overflow-hidden">
            <WorkspaceSidebar 
                workspaces={workspaces}
                activeWorkspaceId={activeWorkspaceId}
                setActiveWorkspaceId={setActiveWorkspaceAndMode}
                onManageWorkspaces={() => setShowWorkspaceManager(true)}
                activeView={activeView}
                setActiveView={v => { setActiveView(v); setActiveMode('global'); setActiveWorkspaceId(null); }}
                onOpenSearch={() => setIsSearchOpen(true)}
                date={date}
                activeMode={activeMode}
                onQuickAdd={() => setIsQuickAddOpen(true)}
            />
             <div className="flex-1 flex flex-col min-w-0">
                <TopBar activeWorkspace={activeMode === 'workspace' ? activeWorkspace || null : null} date={date} setDate={setDate} />
                {activeMode === 'workspace' && (
                    <WorkspaceNavBar activeView={activeView} setActiveView={setActiveView} date={date}/>
                )}
                <main className="flex-1 overflow-auto">
                   {activeMode === 'workspace' && activeWorkspaceId && (
                        <DesktopLayout
                            activeView={activeView}
                            carry={carry}
                            todayBucket={todayBucket} weekBucket={weekBucket} laterBucket={laterBucket}
                            inboxTasks={inboxTasks} big3Tasks={big3Tasks} otherTasks={otherTasks}
                            doneToday={doneToday}
                            note={note} setNote={setNote}
                            quickNote={quickNote} setQuickNote={setQuickNote}
                            dailyPlanNote={dailyPlanNote} setDailyPlanNote={setDailyPlanNote}
                            dailyPlanTemplate={dailyPlanTemplate} setDailyPlanTemplate={setDailyPlanTemplate}
                            newTask={newTask} setNewTask={setNewTask}
                            onAddTask={addTask}
                            onCompleteTask={completeTask}
                            onDeleteTask={deleteTask}
                            onOpenDetails={openDetails}
                            onMoveTask={moveTask}
                            onMoveTodayTask={moveTodayTask}
                            taskSettings={taskSettings}
                            blockedTasks={blockedTasks}
                            allTasksById={allTasksById}
                            // Calendar
                            scheduledTasks={scheduledTasks} setScheduledTasks={setScheduledTasks}
                            setTodayBucket={setTodayBucket} setWeekBucket={setWeekBucket} setLaterBucket={setLaterBucket}
                            // Projects
                            projects={projects} updateProject={updateProject} addProject={addProject} deleteProject={deleteProject}
                            projectStatuses={projectStatuses} addProjectStatus={addProjectStatus} updateProjectStatus={updateProjectStatus} deleteProjectStatus={deleteProjectStatus} reorderProjectStatuses={reorderProjectStatuses}
                            onProjectMove={handleProjectMove}
                            // Notes
                            notebooks={notebooks} notes={notes} selectedSectionId={selectedSectionId} setSelectedSectionId={setSelectedSectionId}
                            selectedNoteId={selectedNoteId} setSelectedNoteId={setSelectedNoteId}
                            addNotebookItem={addNotebookItem} updateNotebookItem={updateNotebookItem} deleteNotebookItem={deleteNotebookItem}
                            addNote={addNote} updateNote={updateNote} deleteNote={deleteNote}
                            onNotebookReorder={onNotebookReorder} onNoteReorder={onNoteReorder}
                            draggedItemId={draggedItemId} setDraggedItemId={setDraggedItemId}
                            expandedNotebooks={expandedNotebooks} setExpandedNotebooks={setExpandedNotebooks}
                            onGenerateMindMap={handleGenerateMindMapFromNote}
                             // Docs
                            docItems={docItems} addDocItem={addDocItem} updateDocItem={updateDocItem} deleteDocItem={deleteDocItem}
                            selectedFolderId={selectedFolderId} setSelectedFolderId={setSelectedFolderId} handleFileUpload={handleFileUpload}
                            // Mindmap
                            mindMapData={mindMapData} addMindMapNode={addMindMapNode} updateMindMapNode={updateMindMapNode} deleteMindMapNode={deleteMindMapNode}
                        />
                   )}
                   {activeMode === 'global' && (
                        <GlobalLayout
                            activeView={activeView}
                            allData={allData}
                            workspaces={workspaces}
                            onOpenDetails={(wsId, tId) => openDetails(tId, wsId)}
                            onCompleteTask={(wsId, tId) => { console.log('global complete', wsId, tId) }}
                            onMoveTask={(wsId, tId, dest) => { console.log('global move', wsId, tId, dest) }}
                            taskSettings={taskSettings}
                            onDeleteTask={(wsId, tId) => { console.log('global delete', wsId, tId) }}
                        />
                   )}
                </main>
            </div>

            {showWorkspaceManager && (
                <WorkspaceManager 
                    workspaces={workspaces}
                    onAdd={handleAddWorkspace}
                    onUpdate={handleUpdateWorkspace}
                    onDelete={handleDeleteWorkspace}
                    onClose={() => setShowWorkspaceManager(false)}
                    taskSettings={taskSettings}
                    onUpdateTaskSettings={setTaskSettings}
                    rolloverEnabled={rolloverEnabled}
                    setRolloverEnabled={setRolloverEnabled}
                    onOpenBackup={() => setShowBackup(true)}
                    onResetDemo={() => { if(activeWorkspaceId) clearWorkspaceState(activeWorkspaceId); window.location.reload(); }}
                    device={device}
                    setDevice={setDevice}
                    theme={theme}
                    setTheme={setTheme}
                />
            )}
            
            {detailsOpen && (
                <TaskDetailsOverlay
                    task={allTasks.find(t => t.id === selectedTaskId) || null}
                    onClose={() => setDetailsOpen(false)}
                    onChange={(patch) => selectedTaskId && updateTask(selectedTaskId, patch)}
                    onMove={moveTask}
                    taskSettings={taskSettings}
                    tasksInWorkspace={allTasks}
                    onCheckCircular={checkForCircularDependency}
                    onDelete={deleteTask}
                />
            )}
            {isSearchOpen && (
                <UniversalSearch 
                    onClose={() => setIsSearchOpen(false)}
                    notes={notes}
                    projects={projects}
                    tasks={allTasks}
                    onSelectNote={(id) => { setActiveView('notes'); setSelectedNoteId(id); setIsSearchOpen(false); }}
                    onSelectProject={(id) => { setActiveView('projects'); setSelectedProjectId(id); setIsSearchOpen(false); }}
                    onSelectTask={(id) => { openDetails(id); setIsSearchOpen(false); }}
                    onNavigate={(view) => { setActiveView(view); setIsSearchOpen(false); }}
                />
            )}
            {isQuickAddOpen && (
                <QuickAddModal 
                    workspaces={workspaces}
                    onClose={() => setIsQuickAddOpen(false)}
                    onAddTask={(wsId, task) => {
                        const state = loadWorkspaceState(wsId);
                        const newInbox = [...(state?.inboxTasks || []), task];
                        saveWorkspaceState(wsId, { ...state, inboxTasks: newInbox });
                        if(wsId === activeWorkspaceId) {
                            setInboxTasks(prev => [...prev, task]);
                        }
                    }}
                />
            )}
        </div>
    );
}
