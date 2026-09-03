import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Database,
  FlaskConical,
  BookOpen,
  Settings,
  Search,
  PlusSquare,
  Cpu,
} from 'lucide-react';
import { cn } from '@/client/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'PATENT SEARCH', icon: Database },
  { path: '/laboratory', label: 'REMIX LABORATORY', icon: FlaskConical },
  { path: '/archive', label: 'ARCHIVE LIBRARY', icon: BookOpen },
];

const subNavItems = [
  { path: '/settings', label: 'CONFIGURATION', icon: Settings },
];

export default function AppLayout({ children, sidebar }: AppLayoutProps) {
  const user = { handle: 'PUBLIC OPERATOR' };
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="app-shell fixed inset-0 h-[100dvh] min-h-screen overflow-hidden flex flex-col bg-cyanotype-dark text-technical-white">
      {/* Vellum overlay for texture */}
      <div className="vellum-overlay" />

      {/* Header */}
      <header className="h-16 border-b border-technical-white/20 flex items-center justify-between px-6 z-40 bg-cyanotype-dark">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-technical-white/40">
            <Cpu className="w-5 h-5 text-technical-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">Renaissance AI</h1>
            <p className="text-[10px] opacity-60 tracking-[0.2em]">INDUSTRIAL ALCHEMIST // R&D DIVISION</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-12">
          <div className="relative">
            <input
              type="text"
              className="w-full bg-transparent border border-technical-white/30 px-4 py-2 text-xs focus:ring-1 focus:ring-technical-white placeholder:opacity-30 focus:outline-none"
              placeholder="QUERY PATENT ARCHIVE [ID / DESCRIPTION]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  if (value) {
                    navigate(`/?q=${encodeURIComponent(value)}`);
                  }
                }
              }}
            />
            <Search className="absolute right-3 top-2 w-4 h-4 opacity-50" />
          </div>
        </div>

        {/* Public demo status */}
        <div className="text-right text-[10px] tracking-widest">
          <p className="opacity-40">DEMO ACCESS</p>
          <p className="text-amber-glow">{user.handle}</p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-technical-white/20 p-6 flex flex-col bg-cyanotype-dark z-40">
          <nav className="space-y-6 flex-1">
            <div className="space-y-1">
              <p className="text-[9px] opacity-40 mb-2 tracking-[0.2em]">OPERATIONS</p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path === '/laboratory' && location.pathname.startsWith('/laboratory'));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 py-2 px-3 border border-transparent hover:border-technical-white/20 hover:bg-white/5 transition-all text-xs',
                      isActive && 'bg-white/5 border-technical-white/20'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="space-y-1">
              <p className="text-[9px] opacity-40 mb-2 tracking-[0.2em]">SUBSYSTEMS</p>
              {subNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 py-2 px-3 border border-transparent hover:border-technical-white/20 hover:bg-white/5 transition-all text-xs',
                      isActive && 'bg-white/5 border-technical-white/20'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* New Mission Button */}
          {user && (
            <div className="pt-6 border-t border-technical-white/10">
              <Link
                to="/"
                className="metal-plate w-full py-3 text-xs tracking-widest flex items-center justify-center gap-2"
              >
                <PlusSquare className="w-4 h-4" />
                NEW MISSION
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative flex flex-col bg-cyanotype-dark blueprint-grid overflow-hidden">
          {/* Rulers */}
          <div className="absolute top-0 left-0 right-0 h-6 ruler-x border-b border-technical-white/30 z-10 flex items-center px-8 text-[8px] opacity-50 justify-between">
            <span>00.00</span><span>10.00</span><span>20.00</span><span>30.00</span><span>40.00</span><span>50.00</span><span>60.00</span><span>70.00</span>
          </div>
          <div className="absolute top-0 left-0 bottom-0 w-6 ruler-y border-r border-technical-white/30 z-10 flex flex-col items-center py-8 text-[8px] opacity-50 justify-between">
            <span>00</span><span>10</span><span>20</span><span>30</span><span>40</span><span>50</span><span>60</span><span>70</span>
          </div>

          {/* Content Area */}
          <div className="flex-1 relative p-8 pl-10 pt-10 overflow-auto scrollbar-blueprint">
            {children}
          </div>
        </main>

        {/* Right Sidebar (Thought Terminal) */}
        {sidebar}
      </div>
    </div>
  );
}
