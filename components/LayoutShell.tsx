// components/LayoutShell.tsx
import * as React from "react";

type NavItem = { label: string; key: string };

export function LayoutShell({
  title = "Momentum",
  sidebarItems = [],
  onToggleTheme,
  children,
}: {
  title?: string;
  sidebarItems?: NavItem[];
  onToggleTheme?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-950/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-black/90 dark:bg-white/90" />
            <h1 className="font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="px-3 py-1.5 rounded-lg border border-neutral-200/70 dark:border-neutral-800/70 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
              title="Toggle theme"
            >
              Theme
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside className="md:sticky md:top-16">
          <nav className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-950/70 backdrop-blur p-2">
            <ul className="flex md:flex-col gap-2">
              {sidebarItems.map((item) => (
                <li key={item.key}>
                  <a
                    className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition text-sm"
                    href={"#"+item.key}
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <main className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-950/70 backdrop-blur p-4">
              {children}
            </section>
            <section className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-950/70 backdrop-blur p-4">
              <div className="text-sm opacity-70">Right column — great for Notes or Timer.</div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
