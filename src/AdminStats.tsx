import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Clock,
  Activity,
  Award,
  RefreshCw,
  Download,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  Monitor,
  CheckCircle2,
  Radio,
  Search,
  Eye,
  Cookie,
  Lock,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { getAllAnalyticsCookies } from './telemetry';

interface VisitorRecord {
  uid: string;
  firstSeen: string;
  lastSeen: string;
  totalStaySeconds: number;
  interactions: number;
  device?: string;
  userAgent?: string;
  ip?: string;
  experimentsViewed?: string[];
  examAttempts?: number;
  lastExamScore?: number | null;
}

interface AnalyticsStore {
  visitors: Record<string, VisitorRecord>;
  totalVisitors: number;
}

export default function AdminStats() {
  const [data, setData] = useState<AnalyticsStore>({ visitors: {}, totalVisitors: 0 });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'tested'>('all');
  const [currentCookies, setCurrentCookies] = useState<Record<string, string>>({});
  const [showCookies, setShowCookies] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [storageMode, setStorageMode] = useState<'server' | 'local'>('server');

  const getApiUrl = (endpoint: string) => {
    const base = (import.meta as any).env?.BASE_URL || '/';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    return `${normalizedBase}${endpoint.replace(/^\/+/, '')}`;
  };

  // Fetch Stats from Server or Fallback to LocalStorage + Cookies
  const fetchStats = async () => {
    try {
      const res = await fetch(getApiUrl('api/stats'));
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const json = await res.json();
        setData(json);
        setStorageMode('server');
      } else {
        throw new Error('Static host or non-JSON response');
      }
    } catch {
      setStorageMode('local');
      // Fallback to localStorage backup + live browser cookies
      try {
        const raw = localStorage.getItem('_site_analytics_backup') || '{}';
        const localData = JSON.parse(raw);
        const cookies = getAllAnalyticsCookies();
        if (!localData.visitors) localData.visitors = {};
        if (cookies._v_uid && !localData.visitors[cookies._v_uid]) {
          localData.visitors[cookies._v_uid] = {
            uid: cookies._v_uid,
            firstSeen: cookies._v_first_seen || new Date().toISOString(),
            lastSeen: cookies._v_last_seen || new Date().toISOString(),
            totalStaySeconds: parseInt(cookies._v_stay_sec || '0', 10) || 0,
            interactions: parseInt(cookies._v_interactions || '0', 10) || 0,
            device: cookies._v_device || 'Current Browser',
            experimentsViewed: cookies._v_experiments ? cookies._v_experiments.split(',').filter(Boolean) : [],
            lastExamScore: cookies._v_last_score ? parseFloat(cookies._v_last_score) : null
          };
          localData.totalVisitors = Object.keys(localData.visitors).length;
        }
        setData(localData);
      } catch {}
    } finally {
      setLoading(false);
      setLastRefreshedAt(new Date());
      setCurrentCookies(getAllAnalyticsCookies());
    }
  };

  useEffect(() => {
    fetchStats();
    setCurrentCookies(getAllAnalyticsCookies());
  }, []);

  // Auto-refresh interval (every 5 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Clear Analytics
  const handleClear = async () => {
    if (!window.confirm('هل أنت متأكد من مسح جميع سجلات وإحصائيات الزوار؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }
    try {
      if (storageMode === 'server') {
        await fetch(getApiUrl('api/stats/clear'), { method: 'POST' });
      }
      localStorage.removeItem('_site_analytics_backup');
      setData({ visitors: {}, totalVisitors: 0 });
      fetchStats();
    } catch {
      localStorage.removeItem('_site_analytics_backup');
      setData({ visitors: {}, totalVisitors: 0 });
    }
  };

  // Export as CSV
  const handleExportCSV = () => {
    const list = Object.values(data.visitors || {});
    if (list.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }

    const headers = [
      'UID',
      'IP',
      'Device',
      'Total Stay Seconds',
      'Interactions',
      'Experiments Viewed',
      'Last Exam Score',
      'First Seen',
      'Last Active'
    ];

    const rows = list.map(v => [
      v.uid,
      `"${v.ip || 'N/A'}"`,
      `"${(v.device || 'Unknown').replace(/"/g, '""')}"`,
      v.totalStaySeconds,
      v.interactions,
      `"${(v.experimentsViewed || []).join('; ')}"`,
      v.lastExamScore !== null && v.lastExamScore !== undefined ? v.lastExamScore : 'N/A',
      v.firstSeen,
      v.lastSeen
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ksu_phys103_visitors_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Return to Main App (respects GitHub Pages /phys103/ base URL)
  const handleGoHome = () => {
    window.location.href = (import.meta as any).env?.BASE_URL || '/';
  };

  // Format Seconds to Readable Arabic Duration
  const formatDuration = (totalSec: number) => {
    if (!totalSec || totalSec <= 0) return '0 ثانية';
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const parts = [];
    if (hrs > 0) parts.push(`${hrs} س`);
    if (mins > 0) parts.push(`${mins} د`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} ث`);
    return parts.join(' ');
  };

  // Format Date to Local Time
  const formatDate = (isoString: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + d.toLocaleDateString('ar-SA') + ')';
    } catch {
      return isoString;
    }
  };

  // Check if visitor is currently online (active within last 2 minutes)
  const isVisitorOnline = (lastSeenIso: string) => {
    if (!lastSeenIso) return false;
    const diff = (Date.now() - new Date(lastSeenIso).getTime()) / 1000;
    return diff < 120; // 2 minutes
  };

  // Filtered & Sorted Visitors List
  const visitorsList = useMemo(() => {
    const list = Object.values(data.visitors || {});

    // Sort by lastSeen descending
    list.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

    return list.filter(v => {
      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUID = v.uid.toLowerCase().includes(q);
        const matchDevice = (v.device || '').toLowerCase().includes(q);
        const matchIp = (v.ip || '').toLowerCase().includes(q);
        if (!matchUID && !matchDevice && !matchIp) return false;
      }

      // Filter by type
      if (filterType === 'online') {
        return isVisitorOnline(v.lastSeen);
      }
      if (filterType === 'tested') {
        return typeof v.lastExamScore === 'number';
      }

      return true;
    });
  }, [data, searchQuery, filterType]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const all = Object.values(data.visitors || {});
    const totalVisitors = all.length;
    let totalStaySeconds = 0;
    let totalInteractions = 0;
    let onlineCount = 0;
    let examCount = 0;
    let sumExamScore = 0;

    all.forEach(v => {
      totalStaySeconds += v.totalStaySeconds || 0;
      totalInteractions += v.interactions || 0;
      if (isVisitorOnline(v.lastSeen)) onlineCount++;
      if (typeof v.lastExamScore === 'number') {
        examCount++;
        sumExamScore += v.lastExamScore;
      }
    });

    const avgStaySeconds = totalVisitors > 0 ? Math.round(totalStaySeconds / totalVisitors) : 0;
    const avgExamScore = examCount > 0 ? Math.round(sumExamScore / examCount) : 0;

    return {
      totalVisitors,
      onlineCount,
      totalStaySeconds,
      avgStaySeconds,
      totalInteractions,
      examCount,
      avgExamScore
    };
  }, [data]);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 font-['Tajawal',sans-serif] selection:bg-indigo-600 selection:text-white p-3 sm:p-6 pb-20">
      {/* Container */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* TOP BAR */}
        <header className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-inner shrink-0">
              <Lock className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>مسار سري خاص بالمشرف (/stat)</span>
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {storageMode === 'server'
                    ? 'متصل بقاعدة بيانات الخادم (جميع الزوار والأجهزة)'
                    : 'الاستضافة الثابتة (بيانات المتصفح والكوكيز المحلية)'}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold mt-1 text-white">
                لوحة إحصائيات تتبع الزوار ووقت البقاء والتفاعل
              </h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
              <span>{autoRefresh ? 'تحديث حي مفعل' : 'تحديث يدوي'}</span>
            </button>

            <button
              onClick={fetchStats}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
              title="تحديث البيانات الآن"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير CSV</span>
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح</span>
            </button>

            <button
              onClick={handleGoHome}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition cursor-pointer"
            >
              <span>العودة للتطبيق</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* 4 SUMMARY KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Unique Visitors */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">إجمالي الزوار الفريدين</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats.totalVisitors}
            </div>
            <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              <span>مسجلين عبر كوكيز فريدة</span>
            </div>
          </div>

          {/* Card 2: Live Online */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">المتصلون الآن (أونلاين)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {stats.onlineCount}
            </div>
            <div className="mt-1 text-xs text-emerald-400/80 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>نشطين خلال آخر دقيقتين</span>
            </div>
          </div>

          {/* Card 3: Total Stay Time */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">إجمالي وقت البقاء التراكمي</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300">
              {formatDuration(stats.totalStaySeconds)}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              متوسط الجلسة: <strong className="text-white">{formatDuration(stats.avgStaySeconds)}</strong>
            </div>
          </div>

          {/* Card 4: Total Interactions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">التفاعلات ومحاولات الاختبار</span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-300">
              {stats.totalInteractions}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              اختبارات سُلّمت: <strong className="text-emerald-400">{stats.examCount}</strong> (متوسط: {stats.avgExamScore}%)
            </div>
          </div>
        </div>

        {/* SEARCH, FILTER & REFRESH STATUS */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
            <input
              type="text"
              placeholder="ابحث بالمعرّف UID أو نوع الجهاز أو IP..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: `جميع الزوار (${stats.totalVisitors})` },
              { id: 'online', label: `المتصلون الآن (${stats.onlineCount})` },
              { id: 'tested', label: `سلّموا اختبار (${stats.examCount})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                  filterType === f.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 shrink-0">
            آخر تحديث: {lastRefreshedAt.toLocaleTimeString('ar-SA')}
          </div>
        </div>

        {/* DETAILED USERS TABLE */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                سجل الزوار الفعلي (مستخلص من الكوكيز وقاعدة بيانات الخادم)
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              عرض {visitorsList.length} من أصل {stats.totalVisitors}
            </span>
          </div>

          {visitorsList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Users className="w-8 h-8 mx-auto opacity-40" />
              <div className="font-bold text-sm">لا توجد سجلات زوار تطابق البحث حالياً</div>
              <div className="text-xs text-slate-600">
                عند دخول أي مستخدم للموقع يتم حفظ كوكيز جلسته تلقائياً وتظهر بياناته هنا فوراً.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold">
                    <th className="p-3.5 whitespace-nowrap">الزائر (Cookie UID)</th>
                    <th className="p-3.5 whitespace-nowrap">الحالة</th>
                    <th className="p-3.5 whitespace-nowrap">مدة البقاء (Stay Time)</th>
                    <th className="p-3.5 whitespace-nowrap text-center">النشاط والتفاعل</th>
                    <th className="p-3.5 whitespace-nowrap">الجهاز والمتصفح</th>
                    <th className="p-3.5 whitespace-nowrap">التجارب المذاكرة</th>
                    <th className="p-3.5 whitespace-nowrap text-center">نتيجة الاختبار</th>
                    <th className="p-3.5 whitespace-nowrap">أول دخول</th>
                    <th className="p-3.5 whitespace-nowrap">آخر ظهور</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {visitorsList.map((v, i) => {
                    const online = isVisitorOnline(v.lastSeen);
                    const isMobile = (v.device || '').includes('Mobile');
                    return (
                      <tr key={v.uid || i} className="hover:bg-slate-800/40 transition">
                        {/* UID & IP */}
                        <td className="p-3.5 font-mono">
                          <div className="flex items-center gap-1.5 font-bold text-indigo-400" dir="ltr">
                            <span>{v.uid}</span>
                          </div>
                          {v.ip && (
                            <div className="text-[10px] text-slate-500 mt-0.5" dir="ltr">
                              IP: {v.ip}
                            </div>
                          )}
                        </td>

                        {/* Online Status */}
                        <td className="p-3.5 whitespace-nowrap">
                          {online ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>متصل الآن</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px]">
                              <span>غادر</span>
                            </span>
                          )}
                        </td>

                        {/* Total Stay Time */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-extrabold text-amber-300">
                            {formatDuration(v.totalStaySeconds)}
                          </span>
                        </td>

                        {/* Interactions */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                            {v.interactions || 0} نقرة
                          </span>
                        </td>

                        {/* Device Info */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            {isMobile ? (
                              <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <Monitor className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            )}
                            <span className="truncate max-w-[180px]">{v.device || 'غير معروف'}</span>
                          </div>
                        </td>

                        {/* Experiments Viewed */}
                        <td className="p-3.5">
                          {v.experimentsViewed && v.experimentsViewed.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {v.experimentsViewed.map((exp, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                                >
                                  {exp}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </td>

                        {/* Exam Score */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          {typeof v.lastExamScore === 'number' ? (
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-xs ${
                                v.lastExamScore >= 80
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {v.lastExamScore}%
                            </span>
                          ) : (
                            <span className="text-slate-600 text-xs">لم يختبر</span>
                          )}
                        </td>

                        {/* First Seen */}
                        <td className="p-3.5 text-[11px] text-slate-400 whitespace-nowrap" dir="ltr">
                          {formatDate(v.firstSeen)}
                        </td>

                        {/* Last Seen */}
                        <td className="p-3.5 text-[11px] text-slate-400 whitespace-nowrap" dir="ltr">
                          {formatDate(v.lastSeen)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* COOKIE INSPECTOR ACCORDION */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <button
            onClick={() => setShowCookies(!showCookies)}
            className="flex items-center justify-between w-full text-right cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Cookie className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-extrabold text-white">
                فحص كوكيز المتصفح الحالي (Current Device Cookies Inspector)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {Object.keys(currentCookies).length} كوكيز نشطة
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-indigo-400 font-bold">
              {showCookies ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>إخفاء الكوكيز</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>إظهار محتوى الكوكيز</span>
                </>
              )}
            </span>
          </button>

          {showCookies && (
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <p className="text-xs text-slate-400">
                هذه هي الكوكيز المخزنة سراً في متصفحك الحالي التي تقوم بتتبع هويتك وزمن بقائك ونشاطك:
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5 overflow-x-auto" dir="ltr">
                {Object.entries(currentCookies).map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2 text-slate-300">
                    <span className="font-bold text-amber-400 shrink-0">{k}:</span>
                    <span className="text-emerald-300 break-all">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

