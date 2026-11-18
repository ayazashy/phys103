// ==========================================
// VISITOR TELEMETRY & COOKIE ANALYTICS TRACKER
// ==========================================

export function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : '';
}

export function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getAllAnalyticsCookies(): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof document === 'undefined') return result;

  const relevantKeys = [
    '_v_uid',
    '_v_first_seen',
    '_v_last_seen',
    '_v_stay_sec',
    '_v_interactions',
    '_v_experiments',
    '_v_last_score',
    '_v_device'
  ];

  relevantKeys.forEach(key => {
    const val = getCookie(key);
    if (val) result[key] = val;
  });

  return result;
}

function detectDevice(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const width = window.innerWidth || screen.width;
  const height = window.innerHeight || screen.height;

  let os = 'Unknown OS';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return `${isMobile ? 'Mobile' : 'Desktop'} (${os}) • ${width}x${height}`;
}

function generateUID(): string {
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timePart = Date.now().toString(36).substring(4);
  return `usr_${randomPart}${timePart}`;
}

function getApiUrl(endpoint: string): string {
  const base = (import.meta as any).env?.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${normalizedBase}${cleanEndpoint}`;
}

// In-memory state
let currentUID = '';
let totalStaySeconds = 0;
let interactionCount = 0;
const viewedExperiments = new Set<string>();
let latestExamScore: number | null = null;
let isInitialized = false;
let serverEndpointAvailable = true;

export function initTelemetry() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  currentUID = getCookie('_v_uid');
  if (!currentUID) {
    currentUID = generateUID();
    setCookie('_v_uid', currentUID);
  }

  let firstSeen = getCookie('_v_first_seen');
  if (!firstSeen) {
    firstSeen = new Date().toISOString();
    setCookie('_v_first_seen', firstSeen);
  }

  const prevStay = parseInt(getCookie('_v_stay_sec') || '0', 10);
  totalStaySeconds = isNaN(prevStay) ? 0 : prevStay;

  const prevInteractions = parseInt(getCookie('_v_interactions') || '0', 10);
  interactionCount = isNaN(prevInteractions) ? 0 : prevInteractions;

  const prevExps = getCookie('_v_experiments');
  if (prevExps) {
    prevExps.split(',').filter(Boolean).forEach(id => viewedExperiments.add(id));
  }

  const prevScore = getCookie('_v_last_score');
  if (prevScore) {
    const parsedScore = parseFloat(prevScore);
    if (!isNaN(parsedScore)) latestExamScore = parsedScore;
  }

  setCookie('_v_device', detectDevice());
  sendTelemetrySync();

  // Increment staying time every 5 seconds while tab is active
  setInterval(() => {
    if (typeof document !== 'undefined' && !document.hidden) {
      totalStaySeconds += 5;
      setCookie('_v_stay_sec', String(totalStaySeconds));
      setCookie('_v_last_seen', new Date().toISOString());

      if (totalStaySeconds % 10 === 0) {
        sendTelemetrySync();
      }
    }
  }, 5000);

  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  const onUserInteraction = () => {
    interactionCount++;
    if (!debounceTimeout) {
      debounceTimeout = setTimeout(() => {
        setCookie('_v_interactions', String(interactionCount));
        setCookie('_v_last_seen', new Date().toISOString());
        debounceTimeout = null;
      }, 1000);
    }
  };

  window.addEventListener('click', onUserInteraction, { passive: true });
  window.addEventListener('touchstart', onUserInteraction, { passive: true });
  window.addEventListener('keydown', onUserInteraction, { passive: true });

  const onPageExit = () => {
    setCookie('_v_stay_sec', String(totalStaySeconds));
    setCookie('_v_last_seen', new Date().toISOString());
    setCookie('_v_interactions', String(interactionCount));
    saveLocalBackup();

    if (serverEndpointAvailable && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(buildPayload())], { type: 'application/json' });
      navigator.sendBeacon(getApiUrl('api/telemetry'), blob);
    }
  };

  window.addEventListener('pagehide', onPageExit);
  window.addEventListener('beforeunload', onPageExit);
}

function buildPayload() {
  return {
    uid: currentUID || getCookie('_v_uid'),
    firstSeen: getCookie('_v_first_seen') || new Date().toISOString(),
    totalStaySeconds,
    interactions: interactionCount,
    device: detectDevice(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    experimentsViewed: Array.from(viewedExperiments),
    lastExamScore: latestExamScore
  };
}

function saveLocalBackup() {
  try {
    const payload = buildPayload();
    if (!payload.uid) return;
    const rawLocal = localStorage.getItem('_site_analytics_backup') || '{}';
    const parsed = JSON.parse(rawLocal);
    const store = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    if (!store.visitors || typeof store.visitors !== 'object') store.visitors = {};
    store.visitors[payload.uid] = {
      ...payload,
      lastSeen: new Date().toISOString()
    };
    store.totalVisitors = Object.keys(store.visitors).length;
    localStorage.setItem('_site_analytics_backup', JSON.stringify(store));
  } catch {
    // Ignore storage quota or serialization errors cleanly
  }
}

export function sendTelemetrySync() {
  if (typeof window === 'undefined') return;
  saveLocalBackup();

  if (!serverEndpointAvailable) return;

  try {
    fetch(getApiUrl('api/telemetry'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload()),
      keepalive: true
    })
      .then(res => {
        const ct = res.headers.get('content-type') || '';
        if (!res.ok || !ct.includes('application/json')) {
          // Static hosting (e.g., GitHub Pages) returns 404/HTML; rely on cookies + localStorage
          serverEndpointAvailable = false;
        }
      })
      .catch(() => {
        serverEndpointAvailable = false;
      });
  } catch {
    serverEndpointAvailable = false;
  }
}

export function trackExperiment(expId: string) {
  if (!expId) return;
  viewedExperiments.add(expId);
  setCookie('_v_experiments', Array.from(viewedExperiments).join(','));
  sendTelemetrySync();
}

export function trackExamResult(score: number) {
  if (typeof score !== 'number') return;
  latestExamScore = score;
  setCookie('_v_last_score', String(score));
  sendTelemetrySync();
}

export function trackTab(_tabId: string) {
  interactionCount += 1;
  setCookie('_v_interactions', String(interactionCount));
  sendTelemetrySync();
}

export function getVisitorSnapshot() {
  return {
    uid: currentUID || getCookie('_v_uid'),
    staySeconds: totalStaySeconds,
    interactions: interactionCount,
    device: detectDevice(),
    experimentsViewed: Array.from(viewedExperiments),
    lastExamScore: latestExamScore
  };
}
