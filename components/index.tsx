// index.tsx — wraps <App /> with the new LayoutShell, no App.tsx edits needed.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LayoutShell } from './components/LayoutShell';

// ErrorBoundary so mistakes don't blank the page
class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, { hasError: boolean; error?: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error("App crashed:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'Inter, sans-serif' }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Something went wrong.</h1>
          <p>Try refreshing the page. If this persists, we’ll patch it.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <LayoutShell
        title="Momentum"
        sidebarItems={[
          { label: "Today", key: "today" },
          { label: "Tasks", key: "tasks" },
          { label: "Notes", key: "notes" },
          { label: "Mind Map", key: "mindmap" },
        ]}
        onToggleTheme={() => document.documentElement.classList.toggle('dark')}
      >
        <App />
      </LayoutShell>
    </ErrorBoundary>
  </React.StrictMode>
);
