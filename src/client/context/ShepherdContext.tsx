import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { ScanResponse } from '@/client/lib/api';
import { demoScanFromPack, loadShepherdPack, type ShepherdPack } from '@/client/lib/shepherdPack';
import {
  readShepherdDecision,
  SHEPHERD_DEMO_SCAN_ID,
  writeShepherdDecision,
  type ShepherdDecision,
} from '@/client/lib/shepherdStorage';

export const SHEPHERD_STEPS = [
  {
    id: 'search',
    title: 'Candidate discovery',
    body: 'Search old patents by mechanism keywords. In this tour we use a real replay dossier—no SerpApi credits spent.',
    path: '/search',
  },
  {
    id: 'results',
    title: 'Pick a candidate',
    body: 'Open the highlighted US4085846 grant (“Speed control system for a centrifugal governor”) to see a LIKELY FREE status and cited brief.',
    path: '/search',
  },
  {
    id: 'status',
    title: 'Legal status engine',
    body: 'Rules R1–R8 derive IN FORCE / LIKELY FREE from family members and legal events—not filing-date guesses.',
    path: `/dossier/${SHEPHERD_DEMO_SCAN_ID}`,
    tab: 'Status' as const,
  },
  {
    id: 'brief',
    title: 'Cited design brief',
    body: 'Every claim ties to fact IDs. The verifier strips sentences that lack citations.',
    path: `/dossier/${SHEPHERD_DEMO_SCAN_ID}`,
    tab: 'Brief' as const,
  },
  {
    id: 'evidence',
    title: 'SerpApi receipts',
    body: 'Download the evidence bundle with call IDs and search metadata for audit.',
    path: `/dossier/${SHEPHERD_DEMO_SCAN_ID}`,
    tab: 'Evidence' as const,
  },
] as const;

type ShepherdContextValue = {
  decision: ShepherdDecision;
  active: boolean;
  pack: ShepherdPack | null;
  stepIndex: number;
  step: (typeof SHEPHERD_STEPS)[number];
  loading: boolean;
  acceptTour: () => Promise<void>;
  declineTour: () => void;
  exitTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  restartTour: () => Promise<void>;
  goToStep: (index: number) => void;
  isDemoScan: (scanId: string | undefined) => boolean;
  demoScan: ScanResponse | null;
};

const ShepherdContext = createContext<ShepherdContextValue | null>(null);

export function ShepherdProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [decision, setDecision] = useState<ShepherdDecision>(() => readShepherdDecision());
  const [active, setActive] = useState(false);
  const [pack, setPack] = useState<ShepherdPack | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const ensurePack = useCallback(async () => {
    if (pack) return pack;
    const loaded = await loadShepherdPack();
    setPack(loaded);
    return loaded;
  }, [pack]);

  const acceptTour = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await ensurePack();
      writeShepherdDecision('accepted');
      setDecision('accepted');
      setActive(true);
      setStepIndex(0);
      navigate(`/search?q=${encodeURIComponent(loaded.query)}`);
    } finally {
      setLoading(false);
    }
  }, [ensurePack, navigate]);

  const declineTour = useCallback(() => {
    writeShepherdDecision('declined');
    setDecision('declined');
    setActive(false);
  }, []);

  const exitTour = useCallback(() => {
    setActive(false);
    setStepIndex(0);
  }, []);

  const restartTour = useCallback(async () => {
    writeShepherdDecision('accepted');
    setDecision('accepted');
    await acceptTour();
  }, [acceptTour]);

  const nextStep = useCallback(() => {
    setStepIndex((i) => {
      const next = Math.min(i + 1, SHEPHERD_STEPS.length - 1);
      const target = SHEPHERD_STEPS[next];
      if (target.path) navigate(target.path);
      return next;
    });
  }, [navigate]);

  const prevStep = useCallback(() => {
    setStepIndex((i) => {
      const next = Math.max(i - 1, 0);
      const target = SHEPHERD_STEPS[next];
      if (target.path) navigate(target.path);
      return next;
    });
  }, [navigate]);

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, SHEPHERD_STEPS.length - 1));
      const target = SHEPHERD_STEPS[clamped];
      if (target.path) navigate(target.path);
      setStepIndex(clamped);
    },
    [navigate],
  );

  useEffect(() => {
    if (active && !pack) {
      void ensurePack();
    }
  }, [active, pack, ensurePack]);

  const demoScan = pack ? demoScanFromPack(pack) : null;

  const value = useMemo(
    (): ShepherdContextValue => ({
      decision,
      active,
      pack,
      stepIndex,
      step: SHEPHERD_STEPS[stepIndex],
      loading,
      acceptTour,
      declineTour,
      exitTour,
      nextStep,
      prevStep,
      restartTour,
      goToStep,
      isDemoScan: (scanId) => active && scanId === SHEPHERD_DEMO_SCAN_ID,
      demoScan,
    }),
    [
      decision,
      active,
      pack,
      stepIndex,
      loading,
      acceptTour,
      declineTour,
      exitTour,
      nextStep,
      prevStep,
      restartTour,
      goToStep,
      demoScan,
    ],
  );

  return <ShepherdContext.Provider value={value}>{children}</ShepherdContext.Provider>;
}

export function useShepherd(): ShepherdContextValue {
  const ctx = useContext(ShepherdContext);
  if (!ctx) throw new Error('useShepherd outside ShepherdProvider');
  return ctx;
}
