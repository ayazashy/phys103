import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import 'katex/dist/katex.min.css';
import './index.css';
import App from '../phys/103';
import AdminStats from './AdminStats';
import { initTelemetry } from './telemetry';

// Initialize hidden visitor & cookie telemetry safely
try {
  initTelemetry();
} catch {
  // Ignore restrictive mobile browser telemetry errors
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-md">
            <h2 className="text-base font-extrabold">حدث خطأ غير متوقع في العرض</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              يمكنك إعادة تحميل الصفحة أو إعادة ضبط البيانات المؤقتة للمتابعة.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                إعادة تحميل الصفحة
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    Object.keys(localStorage)
                      .filter((k) => k.startsWith('phys103_'))
                      .forEach((k) => localStorage.removeItem(k));
                  } catch {
                    // ignore
                  }
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                مسح المسودة وإعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Root() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
      setHash(window.location.hash);
    };

    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('hashchange', onLocationChange);
    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('hashchange', onLocationChange);
    };
  }, []);

  const normalizedPath = currentPath.replace(/\/+$/, '');
  const isStatRoute =
    normalizedPath.endsWith('/stat') ||
    hash === '#/stat' ||
    new URLSearchParams(window.location.search).get('view') === 'stat';

  if (isStatRoute) {
    return <AdminStats />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Root />
    </AppErrorBoundary>
  </React.StrictMode>
);
