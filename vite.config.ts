import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

const ALLOWED_VIDEO_IDS = new Set([
  '1GJcBNXuujBmKUGnc9jEQp-VXVfN1eOGy', // hooke
  '1NaIgDhlKJnsJPKGqKRCU91wyzKHMoI6q', // boyle
  '1PcPuK2JBuNswXKjhOOWs9uVAyT1Q1Fb1', // freefall
  '1uYCq4NODZgiwZwyQFENdYhLFjKPzVyUx', // viscosity
  '1muNa4ov8Ck-yXV9al2KvV9nTVaxlWH29', // forcetable
  '1pJQ5zLwImNckrozKW5Ad0uWTZA9mkZsL', // young
  '13tm0T5POl2eoLT-z2m66z3kxfJIM2iAB', // airtrack
  '1RtuDZgdGOQBagU5YB6JxraWyohhQQRo4', // specificheat
  '1sNF2JUqokEgXeXPCWRF0U23WOmhhEruc', // joule
  '1pxSKznbGZ1S8kna0SbCCMu-kTqMnhLb0'  // sound
]);

async function handleVideoProxy(driveId: string, req: IncomingMessage, res: ServerResponse) {
  if (!ALLOWED_VIDEO_IDS.has(driveId)) {
    res.statusCode = 404;
    res.end('Unknown video ID');
    return;
  }

  const controller = new AbortController();
  req.on('close', () => controller.abort());

  try {
    const upstreamHeaders: Record<string, string> = {};
    if (typeof req.headers.range === 'string') {
      upstreamHeaders.Range = req.headers.range;
    }

    const upstream = await fetch(
      `https://drive.usercontent.google.com/download?id=${driveId}&export=download`,
      { headers: upstreamHeaders, signal: controller.signal }
    );

    res.statusCode = upstream.status;
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const len = upstream.headers.get('content-length');
    if (len) res.setHeader('Content-Length', len);

    const range = upstream.headers.get('content-range');
    if (range) res.setHeader('Content-Range', range);

    if (req.method === 'HEAD' || !upstream.body) {
      res.end();
      return;
    }

    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!res.writableEnded) {
        const ok = res.write(Buffer.from(value));
        if (!ok) {
          await new Promise<void>(resolve => res.once('drain', resolve));
        }
      }
    }
    res.end();
  } catch (err: any) {
    if (err?.name !== 'AbortError') {
      if (!res.headersSent) res.statusCode = 502;
      if (!res.writableEnded) res.end('Video stream error');
    }
  }
}

function analyticsAndVideoPlugin(): Plugin {
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

  const attachMiddlewares = (middlewares: any) => {
    middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
      const url = req.url?.split('?')[0] || '';

      // Same-origin video streaming proxy for dev/preview
      const videoMatch = url.match(/(?:^|\/)api\/video\/([A-Za-z0-9_-]+)$/);
      if (videoMatch && (req.method === 'GET' || req.method === 'HEAD')) {
        void handleVideoProxy(videoMatch[1], req, res);
        return;
      }

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
        req.on('data', chunk => {
          body += chunk;
        });
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
  };

  return {
    name: 'analytics-and-video-backend',
    configureServer(server) {
      attachMiddlewares(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddlewares(server.middlewares);
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
  plugins: [react(), analyticsAndVideoPlugin()],
  server: {
    port: 3000,
    open: true,
    allowedHosts: ['impavidly-unodoriferous-kiara.ngrok-free.dev']
  }
}));
