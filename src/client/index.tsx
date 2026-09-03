import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { router } from './router';
import './index.css';
import LoadingSpinner from './components/LoadingSpinner';
import { createRoot } from 'react-dom/client';

// A deployment can leave an already-open tab with an old Vite chunk map.
// Reload once so the browser requests the current deployment's chunk names.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const reloadKey = 'renaissance:stale-chunk-reloaded';
  if (!sessionStorage.getItem(reloadKey)) {
    sessionStorage.setItem(reloadKey, '1');
    window.location.reload();
  } else {
    sessionStorage.removeItem(reloadKey);
  }
});

const queryClient = new QueryClient();

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </Suspense>
  );
}

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

