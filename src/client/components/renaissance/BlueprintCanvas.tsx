import { cn } from '@/client/lib/utils';

interface Modernization {
  aspect: string;
  original: string;
  modernized: string;
  material?: string;
  technicalDetail?: string;
}

interface Properties {
  torque?: string;
  stress?: string;
  material?: string;
  expiryYear?: number;
}

interface BlueprintCanvasProps {
  title: string;
  subtitle?: string;
  svgContent?: string;
  blueprintImageBase64?: string;
  modernizations?: Modernization[];
  properties?: Properties;
  className?: string;
}

export default function BlueprintCanvas({
  title,
  subtitle,
  svgContent,
  blueprintImageBase64,
  modernizations = [],
  properties: _properties,
  className,
}: BlueprintCanvasProps) {
  // Default blueprint SVG if none provided
  const defaultSvg = `<svg viewBox="0 0 800 450" class="w-full h-full opacity-70">
    <g fill="none" stroke="currentColor" stroke-width="1.2" transform="translate(400, 225) scale(1.2)">
      <circle cx="0" cy="0" r="80" stroke-dasharray="8 4" opacity="0.5"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(0)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(45)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(90)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(135)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(180)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(225)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(270)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(315)"/>
      <path d="M120 -40 L160 -60 L160 20 L120 40 Z"/>
      <path d="M160 -60 L200 -40 L200 40 L160 20 Z"/>
      <path d="M-200 100 Q -100 150, 0 80" opacity="0.6" stroke-dasharray="2 2"/>
      <line class="leader-line opacity-50" x1="0" y1="0" x2="-150" y2="-120"/>
      <line class="leader-line opacity-50" x1="160" y1="-20" x2="250" y2="-100"/>
    </g>
  </svg>`;

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Title Bar */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold opacity-90">{title}</h2>
          {subtitle && (
            <p className="text-[10px] opacity-40 tracking-widest mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Blueprint Drawing Area */}
      <div className="flex-1 relative">
        <div className="w-full aspect-video relative drafting-frame bg-cyanotype-dark/50">
          {/* SVG Content */}
          {blueprintImageBase64 ? (
            <img
              src={`data:image/png;base64,${blueprintImageBase64}`}
              alt="AI Generated Blueprint"
              className="w-full h-full object-cover opacity-80 mix-blend-screen"
            />
          ) : (
            <div
              className="w-full h-full text-technical-white"
              dangerouslySetInnerHTML={{ __html: svgContent || defaultSvg }}
            />
          )}




        </div>
      </div>

      {/* Component Callouts */}
      {modernizations.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="border-l-2 border-t-2 border-technical-white/20 p-4 bg-white/5">
            <p className="font-bold text-xs text-amber-glow mb-1 tracking-widest">PRIMARY_COMPONENT_A</p>
            <p className="text-[10px] opacity-70 mb-1"><span className="opacity-40 uppercase">MAT:</span> {modernizations[0]?.modernized}</p>
            <p className="text-[10px] opacity-70"><span className="opacity-40 uppercase">SPEC:</span> {modernizations[0]?.material}</p>
          </div>
          {modernizations.length > 1 && (
            <div className="border-r-2 border-b-2 border-technical-white/20 p-4 bg-white/5 text-right">
              <p className="font-bold text-xs text-amber-glow mb-1 tracking-widest">AUX_SYSTEM_UNIT</p>
              <p className="text-[10px] opacity-70 mb-1">{modernizations[1]?.aspect}: {modernizations[1]?.modernized}</p>
              <p className="text-[10px] opacity-70"><span className="opacity-40 uppercase">REF:</span> FIG.2b</p>
            </div>
          )}
        </div>
      )}

      {/* Modernizations Table */}
      {modernizations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-bold tracking-widest opacity-60 mb-3">MODERNIZATION MATRIX</h3>
          <div className="border border-technical-white/20">
            <div className="grid grid-cols-4 gap-px bg-technical-white/10">
              <div className="bg-cyanotype-dark p-2 text-[10px] font-bold opacity-60">ASPECT</div>
              <div className="bg-cyanotype-dark p-2 text-[10px] font-bold opacity-60">ORIGINAL</div>
              <div className="bg-cyanotype-dark p-2 text-[10px] font-bold opacity-60">MODERNIZED</div>
              <div className="bg-cyanotype-dark p-2 text-[10px] font-bold opacity-60">MATERIAL</div>
            </div>
            {modernizations.map((mod, i) => (
              <div key={i} className="group border-b border-technical-white/10 last:border-0 hover:bg-white/5 transition-colors">
                <div className="grid grid-cols-4 gap-px bg-technical-white/5">
                  <div className="bg-cyanotype-dark/80 p-3 text-xs font-bold text-amber-glow">{mod.aspect}</div>
                  <div className="bg-cyanotype-dark/80 p-3 text-xs opacity-60">{mod.original}</div>
                  <div className="bg-cyanotype-dark/80 p-3 text-xs font-bold">{mod.modernized}</div>
                  <div className="bg-cyanotype-dark/80 p-3 text-xs font-mono opacity-80">{mod.material || '-'}</div>
                </div>
                {mod.technicalDetail && (
                  <div className="px-3 py-2 text-[10px] opacity-70 italic border-l-2 border-amber-glow/30 ml-3 my-1">
                    DETAIL: {mod.technicalDetail}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
