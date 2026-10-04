import { Outlet } from 'react-router-dom';
import { ShepherdProvider } from '@/client/context/ShepherdContext';
import ShepherdOfferModal from '@/client/components/renaissance/ShepherdOfferModal';
import ShepherdTourPanel from '@/client/components/renaissance/ShepherdTourPanel';

export default function RootLayout() {
  return (
    <ShepherdProvider>
      <ShepherdOfferModal />
      <ShepherdTourPanel />
      <Outlet />
    </ShepherdProvider>
  );
}
