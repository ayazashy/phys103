import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from '../phys/103';
import AdminStats from './AdminStats';
import { initTelemetry } from './telemetry';

// Initialize hidden visitor & cookie telemetry
initTelemetry();

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
    <Root />
  </React.StrictMode>
);
