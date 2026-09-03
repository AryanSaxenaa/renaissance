import { AlertCircle, User, Cpu } from 'lucide-react';
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
              <div className="pt-4 border-t border-technical-white/10 text-[10px] opacity-50">
                PUBLIC HACKATHON MODE — no account or session is created.
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
                  <p className="mt-1">DeepSeek V4 Flash via OpenRouter</p>
                </div>
                <div>
                  <label className="text-[10px] opacity-50 uppercase tracking-widest">Blueprint Generator</label>
                  <p className="mt-1">Gemini 2.5 Flash Image via OpenRouter</p>
                </div>
                <div>
                  <label className="text-[10px] opacity-50 uppercase tracking-widest">Patent Database</label>
                  <p className="mt-1">SerpApi Google Patents</p>
                </div>
              </div>
              <div className="pt-4 border-t border-technical-white/10">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="opacity-50">AI Core Status</span>
                  <span className="text-green-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    SERVER-CONFIGURED
                  </span>
                </div>
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
