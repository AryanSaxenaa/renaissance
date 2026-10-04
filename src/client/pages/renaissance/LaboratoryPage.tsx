import { Link } from 'react-router-dom';
import AppLayout from '@/client/components/renaissance/AppLayout';
import ReplayBanner from '@/client/components/renaissance/ReplayBanner';

/** Legacy remix lab — superseded by dossier + cited brief workflow. */
export default function LaboratoryPage() {
  return (
    <AppLayout>
      <ReplayBanner />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-3">Brief workspace moved</h1>
        <p className="text-sm opacity-70 mb-6">
          The old remix laboratory (invented torque tables and auto LLM previews) was removed. Use patent search,
          open a dossier, and export the cited one-page brief instead.
        </p>
        <Link to="/search" className="metal-button px-6 py-3 text-xs uppercase tracking-widest">
          Go to search
        </Link>
      </div>
    </AppLayout>
  );
}
