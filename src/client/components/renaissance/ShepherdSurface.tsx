import { createPortal } from 'react-dom';
import type { HTMLAttributes, ReactNode } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/** Escapes app dark theme; styles in index.css (.shepherd-surface). */
export function ShepherdSurface({ children, className = '', ...rest }: Props) {
  return (
    <div className={`shepherd-surface ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function ShepherdPortal({ children }: { children: ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
