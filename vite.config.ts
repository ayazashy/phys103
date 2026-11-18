import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function analyticsPlugin(): Plugin {
  const dataDir = path.resolve(__dirname, 'data');
  const dataFile = path.resolve(dataDir, 'analytics.json');

  function getStore() {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (!fs.existsSync(dataFile)) {
        const initial = { visitors: {}, totalVisitors: 0 };
        fs.writeFileSync(dataFile, JSON.stringify(initial, null, 2), 'utf-8');
        return initial;
      }
      const raw = fs.readFileSync(dataFile, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading analytics store:', e);
      return { visitors: {}, totalVisitors: 0 };
    }
  }

  function saveStore(data: any) {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving analytics store:', e);
    }
  }

  return {
    name: 'analytics-backend',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || '';

        if ((url === '/api/stats' || url.endsWith('/api/stats')) && req.method === 'GET') {
          const store = getStore();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(store));
          return;
        }

        if ((url === '/api/stats/clear' || url.endsWith('/api/stats/clear')) && req.method === 'POST') {
          const fresh = { visitors: {}, totalVisitors: 0 };
          saveStore(fresh);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        if ((url === '/api/telemetry' || url.endsWith('/api/telemetry')) && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const uid = payload.uid;
              if (uid) {
                const store = getStore();
                if (!store.visitors) store.visitors = {};

                const now = new Date().toISOString();
                const clientIp =
                  (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                  req.socket.remoteAddress ||
                  'unknown';

                const existing = store.visitors[uid] || {
                  uid,
                  firstSeen: now,
                  totalStaySeconds: 0,
                  interactions: 0,
                  experimentsViewed: [],
                  examAttempts: 0,
                  lastExamScore: null
                };

                existing.lastSeen = now;
                existing.ip = clientIp;
                if (payload.device) existing.device = payload.device;
                if (payload.userAgent) existing.userAgent = payload.userAgent;
                if (typeof payload.totalStaySeconds === 'number') {
                  existing.totalStaySeconds = Math.max(existing.totalStaySeconds, payload.totalStaySeconds);
                }
                if (typeof payload.interactions === 'number') {
                  existing.interactions = Math.max(existing.interactions, payload.interactions);
                }
                if (Array.isArray(payload.experimentsViewed)) {
                  existing.experimentsViewed = Array.from(
                    new Set([...(existing.experimentsViewed || []), ...payload.experimentsViewed])
                  );
                }
                if (typeof payload.lastExamScore === 'number') {
                  existing.lastExamScore = payload.lastExamScore;
                  existing.examAttempts = (existing.examAttempts || 0) + 1;
                }

                store.visitors[uid] = existing;
                store.totalVisitors = Object.keys(store.visitors).length;
                saveStore(store);
              }
            } catch (err) {
              console.error('Failed to parse telemetry payload:', err);
            }
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ ok: true }));
          });
          return;
        }

        next();
      });
    },
    closeBundle() {
      // GitHub Pages SPA fallback so /phys103/stat loads cleanly
      const distDir = path.resolve(__dirname, 'dist');
      const indexFile = path.resolve(distDir, 'index.html');
      const notFoundFile = path.resolve(distDir, '404.html');
      if (fs.existsSync(indexFile)) {
        fs.copyFileSync(indexFile, notFoundFile);
      }
    }
  };
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/phys103/' : '/',
  plugins: [react(), analyticsPlugin()],
  server: {
    port: 3000,
    open: true,
    allowedHosts: [
      'impavidly-unodoriferous-kiara.ngrok-free.dev'
    ]
  }
}));
