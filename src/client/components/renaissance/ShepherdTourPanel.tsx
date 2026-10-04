import { Compass, X } from 'lucide-react';
import { SHEPHERD_STEPS, useShepherd } from '@/client/context/ShepherdContext';
import { ShepherdPortal, ShepherdSurface } from '@/client/components/renaissance/ShepherdSurface';

export default function ShepherdTourPanel() {
  const { active, stepIndex, step, nextStep, prevStep, exitTour } = useShepherd();

  if (!active) return null;

  const atEnd = stepIndex >= SHEPHERD_STEPS.length - 1;

  return (
    <ShepherdPortal>
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] max-w-lg w-[calc(100%-2rem)]">
        <ShepherdSurface className="rounded-md border border-slate-200 px-4 py-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <Compass className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono tracking-widest text-amber-700">
                SHEPHERD MODE · STEP {stepIndex + 1}/{SHEPHERD_STEPS.length}
              </p>
              <p className="font-bold text-sm mt-1">{step.title}</p>
              <p className="text-xs shepherd-body mt-1 leading-relaxed">{step.body}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={stepIndex === 0}
                  className="shepherd-btn-nav text-[10px] uppercase tracking-widest px-3 py-1.5 rounded disabled:opacity-30"
                >
                  Back
                </button>
                {!atEnd ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="shepherd-btn-primary text-[10px] uppercase tracking-widest px-3 py-1.5 rounded"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={exitTour}
                    className="shepherd-btn-accent text-[10px] uppercase tracking-widest px-3 py-1.5 rounded"
                  >
                    Exit tour — open live app
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={exitTour}
              className="p-1 shepherd-muted hover:opacity-80"
              aria-label="Exit guided tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </ShepherdSurface>
      </div>
      <div className="fixed inset-0 pointer-events-none z-[9998] ring-2 ring-amber-400/30 ring-inset" aria-hidden />
    </ShepherdPortal>
  );
}
