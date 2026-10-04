import { Compass, X } from 'lucide-react';
import { SHEPHERD_STEPS, useShepherd } from '@/client/context/ShepherdContext';

export default function ShepherdTourPanel() {
  const { active, stepIndex, step, nextStep, prevStep, exitTour } = useShepherd();

  if (!active) return null;

  const atEnd = stepIndex >= SHEPHERD_STEPS.length - 1;

  return (
    <>
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] max-w-lg w-[calc(100%-2rem)] border border-amber-400/40 bg-primary/95 backdrop-blur px-4 py-3 shadow-lg">
        <div className="flex items-start gap-3">
          <Compass className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono tracking-widest text-amber-200/80">
              SHEPHERD MODE · STEP {stepIndex + 1}/{SHEPHERD_STEPS.length}
            </p>
            <p className="font-bold text-sm mt-1">{step.title}</p>
            <p className="text-xs opacity-80 mt-1 leading-relaxed">{step.body}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={stepIndex === 0}
                className="text-[10px] uppercase tracking-widest border border-technical-white/30 px-3 py-1 disabled:opacity-30"
              >
                Back
              </button>
              {!atEnd ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="text-[10px] uppercase tracking-widest bg-amber-500/20 border border-amber-400/50 px-3 py-1"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={exitTour}
                  className="text-[10px] uppercase tracking-widest bg-emerald-500/20 border border-emerald-400/50 px-3 py-1"
                >
                  Exit tour — open live app
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={exitTour}
            className="p-1 opacity-60 hover:opacity-100"
            aria-label="Exit guided tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="fixed inset-0 pointer-events-none z-[80] ring-2 ring-amber-400/20 ring-inset" aria-hidden />
    </>
  );
}
