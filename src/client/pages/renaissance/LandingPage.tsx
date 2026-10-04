import { useNavigate } from 'react-router-dom';
import { Building2, FolderOpen, Brain, Cog, Compass, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleEnterLab = () => {
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-primary dark:text-technical-white selection:bg-primary selection:text-white">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-technical-white/10 bg-primary/95 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="text-technical-white w-8 h-8" />
            <div className="flex flex-col">
              <span className="text-white font-bold tracking-tighter text-xl uppercase">Renaissance AI</span>
              <span className="text-[10px] text-technical-white/60 tracking-widest uppercase">The Industrial Alchemist</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-xs font-medium text-technical-white/70 hover:text-white transition-colors tracking-widest cursor-pointer" onClick={() => navigate('/archive')}>01. ARCHIVES</a>
            <a className="text-xs font-medium text-technical-white/70 hover:text-white transition-colors tracking-widest cursor-pointer" onClick={() => navigate('/search')}>02. SYNTHESIS</a>
            <a className="text-xs font-medium text-technical-white/70 hover:text-white transition-colors tracking-widest cursor-pointer" onClick={() => navigate('/archive')}>03. ARCHIVE</a>
            <a className="text-xs font-medium text-technical-white/70 hover:text-white transition-colors tracking-widest cursor-pointer" onClick={() => navigate('/settings')}>04. SETTINGS</a>
          </div>
          <button
            onClick={handleEnterLab}
            className="metal-button text-white px-6 py-2 rounded text-xs font-bold tracking-widest uppercase"
          >
            Enter Laboratory
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] bg-primary overflow-hidden flex flex-col justify-center">
        {/* Textures & Grids */}
        <div className="absolute inset-0 blueprint-grid"></div>
        <div className="absolute inset-0 vellum-texture"></div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-block border border-technical-white/20 px-3 py-1 bg-white/5">
              <span className="text-xs text-technical-white/60 font-mono tracking-[0.3em]">REF: PROJECT_ALCHEMY_2025</span>
            </div>
            <h1 className="text-white text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase max-w-xl">
              Reborn <br/>From The <br/><span className="text-technical-white/40">Archives</span>
            </h1>
            <p className="text-technical-white/80 text-lg md:text-xl max-w-md font-light leading-relaxed">
              Turn old mechanisms into cited, one-page design briefs. Legal status from patent records—not filing-date guesses—with SerpApi receipts on every claim.
            </p>
            <div className="pt-4">
              <button
                onClick={handleEnterLab}
                className="metal-button text-white px-10 py-5 rounded-lg text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-4 group"
              >
                Enter the Laboratory
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-square border border-technical-white/10 rounded-full flex items-center justify-center">
              <div className="absolute inset-0 border border-technical-white/5 rounded-full animate-pulse m-10"></div>
              {/* Blueprint SVG */}
              <svg className="w-4/5 h-4/5 text-technical-white/60" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Gear 1 - Large */}
                <g className="animate-[spin_20s_linear_infinite]" style={{ transformOrigin: '200px 200px' }}>
                  <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="2" fill="none" />
                  <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                  <circle cx="200" cy="200" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
                  {/* Gear teeth */}
                  {[...Array(12)].map((_, i) => (
                    <rect
                      key={i}
                      x="195"
                      y="110"
                      width="10"
                      height="20"
                      fill="currentColor"
                      style={{ transformOrigin: '200px 200px', transform: `rotate(${i * 30}deg)` }}
                    />
                  ))}
                </g>

                {/* Gear 2 - Small */}
                <g className="animate-[spin_10s_linear_infinite_reverse]" style={{ transformOrigin: '310px 140px' }}>
                  <circle cx="310" cy="140" r="40" stroke="currentColor" strokeWidth="2" fill="none" />
                  <circle cx="310" cy="140" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  {[...Array(8)].map((_, i) => (
                    <rect
                      key={i}
                      x="307"
                      y="95"
                      width="6"
                      height="12"
                      fill="currentColor"
                      style={{ transformOrigin: '310px 140px', transform: `rotate(${i * 45}deg)` }}
                    />
                  ))}
                </g>

                {/* Connection lines */}
                <line x1="100" y1="300" x2="300" y2="300" stroke="currentColor" strokeWidth="1" strokeDasharray="8 4" />
                <line x1="100" y1="320" x2="250" y2="320" stroke="currentColor" strokeWidth="1" strokeDasharray="8 4" />

                {/* Circuit nodes */}
                <circle cx="100" cy="300" r="4" fill="currentColor" />
                <circle cx="300" cy="300" r="4" fill="currentColor" />
                <circle cx="200" cy="300" r="6" stroke="currentColor" strokeWidth="2" fill="none" />

                {/* Measurement lines */}
                <line x1="50" y1="150" x2="50" y2="250" stroke="currentColor" strokeWidth="1" />
                <line x1="45" y1="150" x2="55" y2="150" stroke="currentColor" strokeWidth="1" />
                <line x1="45" y1="250" x2="55" y2="250" stroke="currentColor" strokeWidth="1" />
                <text x="30" y="205" fill="currentColor" fontSize="10" fontFamily="monospace">100mm</text>
              </svg>
            </div>

            {/* Compass Overlay */}
            <div className="absolute bottom-0 right-0 p-4 border border-technical-white/20 bg-primary/80 backdrop-blur-sm rounded">
              <Compass className="text-technical-white/40 w-16 h-16" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background-light dark:bg-background-dark relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-4">
              <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-primary dark:text-technical-white/60">Core Capabilities</h2>
              <p className="text-4xl font-bold tracking-tight text-primary dark:text-white uppercase">The Engineering Process</p>
            </div>
            <div className="text-sm max-w-xs text-primary/60 dark:text-technical-white/40 font-mono">
              [TRANSFORMING EXPIRED INTELLECTUAL PROPERTY INTO MODERN BREAKTHROUGHS]
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Patent Excavation */}
            <div className="bg-manila p-8 rounded shadow-xl border border-black/5 transform -rotate-1 hover:rotate-0 transition-transform cursor-default flex flex-col h-full min-h-[400px]">
              <div className="flex justify-between items-start mb-8">
                <span className="text-xs font-mono text-primary/40">INDEX: 402-A</span>
                <FolderOpen className="text-primary/20 w-10 h-10" />
              </div>
              <div className="grow flex flex-col justify-center mb-8">
                <div className="w-full h-48 bg-primary/5 rounded flex items-center justify-center border border-primary/10">
                  <svg className="w-32 h-32 text-primary/30" viewBox="0 0 100 100" fill="none">
                    <rect x="20" y="15" width="60" height="70" rx="2" stroke="currentColor" strokeWidth="2" />
                    <line x1="30" y1="30" x2="70" y2="30" stroke="currentColor" strokeWidth="1" />
                    <line x1="30" y1="40" x2="60" y2="40" stroke="currentColor" strokeWidth="1" />
                    <line x1="30" y1="50" x2="65" y2="50" stroke="currentColor" strokeWidth="1" />
                    <circle cx="50" cy="68" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M47 68 L50 71 L55 65" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-primary text-xl font-bold uppercase mb-2">Patent Excavation</h3>
                <p className="text-primary/70 text-sm leading-relaxed">
                  Deep-learning mining of centuries-old technical archives. We find the lost logic of the past.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-primary/10">
                <span className="text-[10px] font-bold tracking-widest text-primary/40 uppercase">STATUS: VERIFIED</span>
              </div>
            </div>

            {/* Card 2: AI Synthesis */}
            <div className="bg-manila p-8 rounded shadow-xl border border-black/5 transform rotate-1 hover:rotate-0 transition-transform cursor-default flex flex-col h-full min-h-[400px]">
              <div className="flex justify-between items-start mb-8">
                <span className="text-xs font-mono text-primary/40">INDEX: 402-B</span>
                <Brain className="text-primary/20 w-10 h-10" />
              </div>
              <div className="grow flex flex-col justify-center mb-8">
                <div className="w-full h-48 bg-primary/5 rounded flex items-center justify-center border border-primary/10">
                  <svg className="w-32 h-32 text-primary/30" viewBox="0 0 100 100" fill="none">
                    {/* Neural network nodes */}
                    <circle cx="20" cy="30" r="6" stroke="currentColor" strokeWidth="2" />
                    <circle cx="20" cy="50" r="6" stroke="currentColor" strokeWidth="2" />
                    <circle cx="20" cy="70" r="6" stroke="currentColor" strokeWidth="2" />
                    <circle cx="50" cy="40" r="6" stroke="currentColor" strokeWidth="2" />
                    <circle cx="50" cy="60" r="6" stroke="currentColor" strokeWidth="2" />
                    <circle cx="80" cy="50" r="6" stroke="currentColor" strokeWidth="2" />
                    {/* Connections */}
                    <line x1="26" y1="30" x2="44" y2="40" stroke="currentColor" strokeWidth="1" />
                    <line x1="26" y1="50" x2="44" y2="40" stroke="currentColor" strokeWidth="1" />
                    <line x1="26" y1="50" x2="44" y2="60" stroke="currentColor" strokeWidth="1" />
                    <line x1="26" y1="70" x2="44" y2="60" stroke="currentColor" strokeWidth="1" />
                    <line x1="56" y1="40" x2="74" y2="50" stroke="currentColor" strokeWidth="1" />
                    <line x1="56" y1="60" x2="74" y2="50" stroke="currentColor" strokeWidth="1" />
                    {/* Gear overlay */}
                    <circle cx="80" cy="50" r="15" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-primary text-xl font-bold uppercase mb-2">AI Synthesis</h3>
                <p className="text-primary/70 text-sm leading-relaxed">
                  Advanced neural remixing of mechanical engineering concepts with modern aerospace physics.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-primary/10">
                <span className="text-[10px] font-bold tracking-widest text-primary/40 uppercase">STATUS: SYNTHESIZING</span>
              </div>
            </div>

            {/* Card 3: Rapid Prototyping */}
            <div className="bg-manila p-8 rounded shadow-xl border border-black/5 transform -rotate-1 hover:rotate-0 transition-transform cursor-default flex flex-col h-full min-h-[400px]">
              <div className="flex justify-between items-start mb-8">
                <span className="text-xs font-mono text-primary/40">INDEX: 402-C</span>
                <Cog className="text-primary/20 w-10 h-10" />
              </div>
              <div className="grow flex flex-col justify-center mb-8">
                <div className="w-full h-48 bg-primary/5 rounded flex items-center justify-center border border-primary/10">
                  <svg className="w-32 h-32 text-primary/30" viewBox="0 0 100 100" fill="none">
                    {/* 3D cube wireframe */}
                    <path d="M30 40 L50 25 L70 40 L70 65 L50 80 L30 65 Z" stroke="currentColor" strokeWidth="2" fill="none" />
                    <line x1="50" y1="25" x2="50" y2="55" stroke="currentColor" strokeWidth="1" />
                    <line x1="30" y1="40" x2="50" y2="55" stroke="currentColor" strokeWidth="1" />
                    <line x1="70" y1="40" x2="50" y2="55" stroke="currentColor" strokeWidth="1" />
                    {/* Dimension lines */}
                    <line x1="25" y1="40" x2="25" y2="65" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="75" y1="40" x2="85" y2="35" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-primary text-xl font-bold uppercase mb-2">Rapid Prototyping</h3>
                <p className="text-primary/70 text-sm leading-relaxed">
                  Instant CAD generation compatible with multi-axis CNC and high-precision sintering.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-primary/10">
                <span className="text-[10px] font-bold tracking-widest text-primary/40 uppercase">STATUS: DEPLOYED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industrial Ledger Footer */}
      <footer className="bg-primary pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="bg-technical-white/95 p-1 rounded-sm shadow-2xl">
            <div className="border-2 border-primary/20 p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-primary text-4xl font-black uppercase tracking-tighter mb-4">Mission Log</h2>
                  <p className="text-primary/80 font-medium max-w-sm mb-8">
                    Subscribe to our industrial ledger for weekly technical dispatches from the archives.
                  </p>
                  <div className="flex flex-col gap-1">
                    <div className="ledger-line py-2 flex justify-between border-b border-primary/10">
                      <span className="text-[10px] font-mono text-primary/60">ENTRY_DATE</span>
                      <span className="text-[10px] font-mono text-primary">FEB_2025_Q1</span>
                    </div>
                    <div className="ledger-line py-2 flex justify-between border-b border-primary/10">
                      <span className="text-[10px] font-mono text-primary/60">LOG_STATUS</span>
                      <span className="text-[10px] font-mono text-primary">ENCRYPTED</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <label className="text-[10px] font-bold tracking-widest text-primary uppercase block">Signal Recipient (Email Address)</label>
                    <div className="flex gap-4">
                      <input
                        className="flex-1 bg-transparent border-b-2 border-primary/20 border-t-0 border-x-0 focus:ring-0 focus:border-primary text-primary font-mono placeholder:text-primary/30 uppercase px-0 py-2 outline-none"
                        placeholder="OPERATOR@FACILITY.COM"
                        type="email"
                      />
                      <button className="metal-button text-white px-8 py-3 rounded text-xs font-bold uppercase tracking-widest">
                        Log Entry
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-primary/40 italic">
                      *By entering, you agree to the protocols of the Industrial Alchemist.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-8 border-t border-technical-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 text-technical-white/40">
              <CheckCircle className="w-5 h-5" />
              <span className="text-xs font-mono uppercase tracking-widest">© 1884-2025 Renaissance AI Laboratory</span>
            </div>
            <div className="flex gap-8">
              <a className="text-xs text-technical-white/40 hover:text-white transition-colors uppercase tracking-widest cursor-pointer" onClick={() => navigate('/terms')}>Privacy Protocol</a>
              <a className="text-xs text-technical-white/40 hover:text-white transition-colors uppercase tracking-widest cursor-pointer" onClick={() => navigate('/terms')}>Terms of Service</a>
              <a className="text-xs text-technical-white/40 hover:text-white transition-colors uppercase tracking-widest cursor-pointer" onClick={() => navigate('/settings')}>Station Map</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom styles */}
      <style>{`
        .blueprint-grid {
          background-image: linear-gradient(rgba(224, 224, 224, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(224, 224, 224, 0.08) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .vellum-texture {
          background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 33, 71, 0.3) 100%);
          opacity: 0.5;
          pointer-events: none;
        }
        .metal-button {
          background: linear-gradient(145deg, #002b5c, #001d3e);
          box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3), inset 1px 1px 1px rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(224, 224, 224, 0.2);
          transition: all 0.1s ease;
        }
        .metal-button:hover {
          background: linear-gradient(145deg, #003366, #002147);
        }
        .metal-button:active {
          box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3);
          transform: translate(2px, 2px);
        }
      `}</style>
    </div>
  );
}
