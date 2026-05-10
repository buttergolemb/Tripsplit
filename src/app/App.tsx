import { RouterProvider } from 'react-router';
import { IPhoneMockup } from './components/IPhoneMockup';
import { AppErrorBoundary } from './components/ErrorBoundary';
import { ToastHost } from './components/ToastHost';
import { router } from './routes';

export default function App() {
  return (
    <IPhoneMockup>
      <AppErrorBoundary>
        <ToastHost>
          <RouterProvider router={router} />
        </ToastHost>
      </AppErrorBoundary>
    </IPhoneMockup>
  );
}