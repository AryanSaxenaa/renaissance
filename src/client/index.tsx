import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { router } from './router';
import './index.css';
import LoadingSpinner from './components/LoadingSpinner';
import { createRoot } from 'react-dom/client';

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

