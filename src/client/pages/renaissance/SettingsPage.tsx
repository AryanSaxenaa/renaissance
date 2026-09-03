import { Link } from 'react-router-dom';
import { AlertCircle, User, Bell, Palette, Database, Cpu } from 'lucide-react';
import AppLayout from '@/client/components/renaissance/AppLayout';
import ThoughtTerminal from '@/client/components/renaissance/ThoughtTerminal';

export default function SettingsPage() {
  const user = { handle: 'PUBLIC OPERATOR' };

  // If not authenticated
  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="w-16 h-16 mb-4 opacity-30" />
          <h2 className="text-xl font-bold mb-2">AUTHENTICATION REQUIRED</h2>
          <p className="text-sm opacity-60 mb-6">Please sign in to access system configuration</p>
          <Link
            to="/login"
            className="metal-plate px-6 py-3 text-xs tracking-widest"
          >
            SIGN IN
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      sidebar={
        <ThoughtTerminal
          messages={[
            { timestamp: new Date(), message: 'CONFIGURATION MODULE LOADED', type: 'success' },
            { timestamp: new Date(), message: 'OPERATOR CREDENTIALS VERIFIED', type: 'info' },
          ]}
          heuristicLoad={8.5}
        />
      }
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SYSTEM CONFIGURATION</h1>
          <p className="text-sm opacity-60">
            Manage your laboratory settings and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Operator Profile */}
          <div className="border border-technical-white/20 bg-cyanotype-dark/80">
            <div className="p-4 border-b border-technical-white/10 flex items-center gap-3">
              <User className="w-5 h-5 text-amber-glow" />
              <h2 className="text-sm font-bold tracking-widest">OPERATOR PROFILE</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] opacity-50 uppercase tracking-widest">Operator ID</label>
                  <p className="text-sm mt-1 font-mono">{user.handle}</p>
                </div>
                <div>
                  <label className="text-[10px] opacity-50 uppercase tracking-widest">Clearance Level</label>
                  <p className="text-sm mt-1 text-amber-glow">FULL ACCESS</p>
                </div>
              </div>
              <div className="pt-4 border-t border-technical-white/10">
                <Link
                  to="/logout"
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  TERMINATE SESSION
                </Link>
              </div>
            </div>
          </div>

          {/* AI Configuration */}
          <div className="border border-technical-white/20 bg-cyanotype-dark/80">
            <div className="p-4 border-b border-technical-white/10 flex items-center gap-3">
              <Cpu className="w-5 h-5 text-amber-glow" />
              <h2 className="text-sm font-bold tracking-widest">AI ALCHEMIST CORE</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-6 text-[11px]">
                <div>
                  <label className="text-[10px] opacity-50 uppercase tracking-widest">Analysis Engine</label>
                  <p className="mt-1">Gemini 1.5 Pro (Simulated)</p>
                </div>
                <div>
                  <label className="text-[10px] opacity-50 uppercase tracking-widest">Blueprint Generator</label>
                  <p className="mt-1">Nano Banana (Simulated)</p>
                </div>
                <div>
                  <label className="text-[10px] opacity-50 uppercase tracking-widest">Patent Database</label>
                  <p className="mt-1">Google Patents BigQuery (Simulated)</p>
                </div>
                <div>
                  <label className="text-[10px] opacity-50 uppercase tracking-widest">Material Science Feed</label>
                  <p className="mt-1">ArXiv API (Simulated)</p>
                </div>
              </div>
              <div className="pt-4 border-t border-technical-white/10">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="opacity-50">AI Core Status</span>
                  <span className="text-green-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    OPERATIONAL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="border border-technical-white/20 bg-cyanotype-dark/80">
            <div className="p-4 border-b border-technical-white/10 flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-glow" />
              <h2 className="text-sm font-bold tracking-widest">NOTIFICATION MATRIX</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">ArXiv Material Updates</p>
                  <p className="text-[10px] opacity-50 mt-1">Receive alerts when new materials match your projects</p>
                </div>
                <div className="w-12 h-6 bg-amber-glow/30 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-amber-glow rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">Patent Expiry Alerts</p>
                  <p className="text-[10px] opacity-50 mt-1">Get notified when watched patents expire</p>
                </div>
                <div className="w-12 h-6 bg-technical-white/10 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-technical-white/40 rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">Remix Completion</p>
                  <p className="text-[10px] opacity-50 mt-1">Notify when AI finishes analyzing a patent</p>
                </div>
                <div className="w-12 h-6 bg-amber-glow/30 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-amber-glow rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Display Preferences */}
          <div className="border border-technical-white/20 bg-cyanotype-dark/80">
            <div className="p-4 border-b border-technical-white/10 flex items-center gap-3">
              <Palette className="w-5 h-5 text-amber-glow" />
              <h2 className="text-sm font-bold tracking-widest">DISPLAY PREFERENCES</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] opacity-50 uppercase tracking-widest">Blueprint Theme</label>
                <div className="mt-2 flex gap-3">
                  <button className="w-10 h-10 bg-cyanotype-dark border-2 border-amber-glow" title="Cyanotype (Active)" />
                  <button className="w-10 h-10 bg-[#1a1a1a] border border-technical-white/20 opacity-50" title="Dark Slate" />
                  <button className="w-10 h-10 bg-[#f5f5dc] border border-technical-white/20 opacity-50" title="Vellum" />
                </div>
              </div>
              <div>
                <label className="text-[10px] opacity-50 uppercase tracking-widest">Grid Density</label>
                <div className="mt-2 flex gap-2">
                  <button className="px-3 py-1 text-[10px] border border-technical-white/20 opacity-50">SPARSE</button>
                  <button className="px-3 py-1 text-[10px] border border-amber-glow bg-amber-glow/10">STANDARD</button>
                  <button className="px-3 py-1 text-[10px] border border-technical-white/20 opacity-50">DENSE</button>
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="border border-technical-white/20 bg-cyanotype-dark/80">
            <div className="p-4 border-b border-technical-white/10 flex items-center gap-3">
              <Database className="w-5 h-5 text-amber-glow" />
              <h2 className="text-sm font-bold tracking-widest">DATA MANAGEMENT</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">Export All Projects</p>
                  <p className="text-[10px] opacity-50 mt-1">Download your remix projects as JSON</p>
                </div>
                <button className="metal-plate px-4 py-2 text-[10px] tracking-widest">
                  EXPORT
                </button>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-technical-white/10">
                <div>
                  <p className="text-xs font-bold text-red-400">Clear Search History</p>
                  <p className="text-[10px] opacity-50 mt-1">Remove all search records from your account</p>
                </div>
                <button className="px-4 py-2 text-[10px] tracking-widest border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                  CLEAR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-8 text-center text-[10px] opacity-30">
          <p>RENAISSANCE AI v1.0.0 // INDUSTRIAL ALCHEMIST</p>
          <p className="mt-1">PATENT RECOMBINATION ENGINE // R&D DIVISION</p>
        </div>
      </div>
    </AppLayout>
  );
}
