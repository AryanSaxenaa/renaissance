import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'lucide-react';
import { cn } from '@/client/lib/utils';

export interface ThoughtMessage {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface ThoughtTerminalProps {
  messages: ThoughtMessage[];
  heuristicLoad?: number;
  isProcessing?: boolean;
}

// Component for typewriter effect on individual messages
function TypewriterMessage({
  message,
  type,
  isNew,
  onComplete
}: {
  message: string;
  type: ThoughtMessage['type'];
  isNew: boolean;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState(isNew ? '' : message);
  const [isComplete, setIsComplete] = useState(!isNew);

  useEffect(() => {
    if (!isNew) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < message.length) {
        setDisplayedText(message.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, 15); // Speed of typing

    return () => clearInterval(interval);
  }, [message, isNew, onComplete]);

  return (
    <div
      className={cn(
        'transition-opacity duration-300',
        type === 'success' && 'crt-glow',
        type === 'error' && 'text-red-400',
        type === 'warning' && 'text-amber-glow opacity-60',
        type === 'info' && 'opacity-60 text-technical-white'
      )}
    >
      &gt; {displayedText}
      {!isComplete && (
        <span className="inline-block w-2 h-3 bg-amber-glow ml-0.5 animate-terminal-cursor" />
      )}
    </div>
  );
}

export default function ThoughtTerminal({
  messages,
  heuristicLoad = 0,
  isProcessing = false,
}: ThoughtTerminalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Track which messages are "new" (for typewriter effect)
  useEffect(() => {
    setLastMessageCount(messages.length);
  }, [messages.length]);

  return (
    <aside className="w-80 border-l border-technical-white/20 bg-cyanotype-dark flex flex-col z-40">
      {/* Header */}
      <div className="p-4 border-b border-technical-white/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-glow" />
          <h3 className="text-xs font-bold tracking-widest">INTELLIGENCE FEED</h3>
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <span className="text-[8px] text-amber-glow animate-pulse">PROCESSING</span>
          )}
          <div
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              isProcessing
                ? 'bg-amber-glow animate-pulse shadow-[0_0_8px_#ffb100]'
                : 'bg-technical-white/30'
            )}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[10px] leading-relaxed scrollbar-blueprint">
        {messages.length === 0 ? (
          <div className="opacity-40 text-technical-white">
            &gt; AWAITING MISSION PARAMETERS...
            <span className="inline-block w-2 h-3 bg-amber-glow/50 ml-0.5 animate-terminal-cursor" />
          </div>
        ) : (
          messages.map((msg, index) => (
            <TypewriterMessage
              key={`${index}-${msg.timestamp.getTime()}`}
              message={msg.message}
              type={msg.type}
              isNew={index >= lastMessageCount - 1 && index === messages.length - 1}
            />
          ))
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-3 bg-amber-glow animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-3 bg-amber-glow animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-3 bg-amber-glow animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* System Stats */}
      <div className="px-4 py-2 border-t border-technical-white/10 bg-black/10">
        <div className="grid grid-cols-2 gap-2 text-[8px] opacity-50">
          <div>
            <span className="opacity-60">MESSAGES:</span> {messages.length}
          </div>
          <div>
            <span className="opacity-60">STATUS:</span>{' '}
            <span className={isProcessing ? 'text-amber-glow' : 'text-green-400'}>
              {isProcessing ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
        </div>
      </div>

      {/* Heuristic Load Bar */}
      <div className="p-4 bg-black/20 border-t border-technical-white/10">
        <div className="flex justify-between text-[9px] mb-2 opacity-60">
          <span>HEURISTIC LOAD</span>
          <span>{heuristicLoad.toFixed(1)}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-glow/60 to-amber-glow transition-all duration-700"
            style={{ width: `${heuristicLoad}%` }}
          />
          {/* Animated scan line */}
          {isProcessing && (
            <div
              className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
              style={{
                left: `${heuristicLoad - 10}%`,
                animation: 'scan 1.5s ease-in-out infinite',
              }}
            />
          )}
        </div>

        {/* Load indicator labels */}
        <div className="flex justify-between mt-1 text-[7px] opacity-30">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Add keyframe animation via style tag */}
      <style>{`
        @keyframes scan {
          0%, 100% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 1; transform: translateX(100%); }
        }
      `}</style>
    </aside>
  );
}
