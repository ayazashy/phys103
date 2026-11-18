import React, { useState, useEffect, useMemo } from 'react';
import { Video, ExternalLink, ChevronDown, ChevronUp, Flame, Zap } from 'lucide-react';
import type { Experiment } from './experimentsData';

// ==========================================
// KATEX & LATEX RENDERER
// ==========================================
function useKatexLoaded() {
  const [loaded, setLoaded] = useState(() => typeof window !== 'undefined' && !!(window as any).katex);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).katex) {
      setLoaded(true);
      return;
    }

    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link');
      link.id = 'katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      document.head.appendChild(link);
    }

    const scriptId = 'katex-js';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
      script.async = true;
      document.head.appendChild(script);
    }

    const onScriptLoad = () => setLoaded(true);
    script.addEventListener('load', onScriptLoad);
    return () => {
      script?.removeEventListener('load', onScriptLoad);
    };
  }, []);

  return loaded;
}

export interface LatexProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const Latex: React.FC<LatexProps> = ({ math, block = false, className = '' }) => {
  const katexLoaded = useKatexLoaded();

  const renderedHtml = useMemo(() => {
    if (typeof window === 'undefined' || !(window as any).katex || !math) return null;
    try {
      return (window as any).katex.renderToString(math, {
        displayMode: block,
        throwOnError: false
      });
    } catch {
      return null;
    }
  }, [math, block, katexLoaded]);

  if (renderedHtml) {
    if (block) {
      return (
        <div
          className={`latex-expr block w-full text-center my-1.5 overflow-x-auto overflow-y-visible py-1 ${className}`}
          dir="ltr"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      );
    }
    return (
      <span
        className={`latex-expr inline-block align-middle ${className}`}
        dir="ltr"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  if (block) {
    return (
      <div className={`block w-full text-center font-mono text-inherit overflow-x-auto py-1 ${className}`} dir="ltr">
        {math}
      </div>
    );
  }
  return (
    <span className={`inline-block font-mono text-inherit ${className}`} dir="ltr">
      {math}
    </span>
  );
};

// Parses inline $...$ LaTeX segments inside Arabic/English prose cleanly
export const MathText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    if (!text) return [];
    // Split on $...$ non-greedily
    return text.split(/(\$[^$]+\$)/g).filter(Boolean);
  }, [text]);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const expr = part.slice(1, -1);
          return <Latex key={idx} math={expr} className="mx-0.5 font-bold" />;
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </span>
  );
};

// ==========================================
// GOOGLE DRIVE EMBEDDED VIDEO PLAYER CARD
// ==========================================
interface VideoEmbedCardProps {
  exp: Experiment;
  defaultOpen?: boolean;
}

export const VideoEmbedCard: React.FC<VideoEmbedCardProps> = ({ exp, defaultOpen = true }) => {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-4 py-3 sm:px-5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              الشرح العملي المصور — {exp.shortTitle}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              عرض تطبيقي لخطوات التجربة وأخذ القراءات داخل المختبر
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={exp.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 transition"
          >
            <ExternalLink className="w-3 h-3" />
            <span>فتح في Drive</span>
          </a>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold transition cursor-pointer"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>طي الفيديو</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>عرض الفيديو</span>
              </>
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-3 sm:p-4 bg-slate-950">
          <div className="relative w-full aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
            <iframe
              key={exp.videoDriveId}
              src={exp.videoEmbedUrl}
              title={`فيديو شرح تجربة ${exp.title}`}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// GRAPH / VECTOR / CALORIMETRY VISUALIZER
// ==========================================
export const LabGraphSVG: React.FC<{ exp: Experiment }> = ({ exp }) => {
  const { graph } = exp;

  // 1. Calorimetry Thermal Balance Diagram (Specific Heat & Joule's Equivalent)
  if (exp.kind === 'calorimetry') {
    const isJoule = exp.id === 'joule';
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
        <div className="text-xs font-extrabold text-center text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5">
          {isJoule ? <Zap className="w-4 h-4 text-amber-500" /> : <Flame className="w-4 h-4 text-rose-500" />}
          <span>{isJoule ? 'مخطط حفظ الطاقة داخل المسعر الكهربائي' : 'مخطط التوازن الحراري داخل المسعر المعزول'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center text-center">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
            <div className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
              {isJoule ? 'الطاقة الكهربائية المبذولة' : 'الحرارة المفقودة (الكرة)'}
            </div>
            <div className="text-sm font-extrabold text-rose-900 dark:text-rose-100 mt-1" dir="ltr">
              <Latex math={isJoule ? 'W = I V t = 3744\\text{ J}' : '\\Delta Q_b = m_b C_b (T_2 - T_f)'} />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-1">
            <div className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-extrabold shadow-sm">
              {isJoule ? 'J = W / Q' : 'ΔQ_lost = ΔQ_gained'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              {isJoule ? 'جملة معزولة حرارياً' : 'نظام معزول حتى التوازن Tf'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60">
            <div className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
              {isJoule ? 'الحرارة المكتسبة (بالكالوري)' : 'الحرارة المكتسبة (الماء + المسعر)'}
            </div>
            <div className="text-sm font-extrabold text-sky-900 dark:text-sky-100 mt-1" dir="ltr">
              <Latex
                math={
                  isJoule
                    ? 'Q = (m_w C_w + M_c + M_s)\\Delta T'
                    : '\\Delta Q_w + \\Delta Q_c = (m_w C_w + m_c C_c)\\Delta T'
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Vector Polygon Diagram (Force Table - accurately proportioned 22 px/cm)
  if (exp.kind === 'vector') {
    return (
      <div className="bg-amber-50/70 dark:bg-slate-900 border border-amber-300/80 dark:border-slate-700 rounded-xl p-3.5 flex flex-col items-center">
        <div className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2 text-center">
          محاكاة الرسم البياني للمتجهات (مقياس الرسم: 1 cm = 25 gw)
        </div>
        <svg
          viewBox="0 0 360 250"
          className="w-full max-w-md bg-white dark:bg-slate-950 rounded-lg border border-amber-200 dark:border-slate-800 shadow-inner"
          style={{ direction: 'ltr' }}
        >
          <defs>
            <pattern id="grid-vec" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" />
            </pattern>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
            </marker>
            <marker id="arrow-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
            </marker>
            <marker id="arrow-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
            </marker>
          </defs>
          <rect width="360" height="250" fill="url(#grid-vec)" />
          {/* Reference Axes */}
          <line x1="35" y1="215" x2="320" y2="215" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="55" y1="235" x2="55" y2="20" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 2" />
          {/* F1: 4 cm (88px) @ 20 deg -> (55,215) to (137.7, 184.9) */}
          <line x1="55" y1="215" x2="137.7" y2="184.9" stroke="#2563eb" strokeWidth="2.8" markerEnd="url(#arrow-blue)" />
          <text x="88" y="209" fontSize="10.5" fill="#2563eb" fontWeight="bold">F₁ (4 cm, 20°)</text>
          {/* F2: 6 cm (132px) @ 80 deg -> (137.7, 184.9) to (160.6, 54.9) */}
          <line x1="137.7" y1="184.9" x2="160.6" y2="54.9" stroke="#059669" strokeWidth="2.8" markerEnd="url(#arrow-emerald)" />
          <text x="158" y="130" fontSize="10.5" fill="#059669" fontWeight="bold">F₂ (6 cm, 80°)</text>
          {/* Resultant R: 8.72 cm (8.8 cm graph) from (55,215) to (160.6, 54.9) */}
          <line x1="55" y1="215" x2="160.6" y2="54.9" stroke="#e11d48" strokeWidth="2.8" markerEnd="url(#arrow-rose)" />
          <text x="64" y="102" fontSize="11" fill="#e11d48" fontWeight="bold">R ≈ 8.8 cm (220 gw)</text>
          <text x="78" y="192" fontSize="10" fill="#e11d48" fontWeight="bold">θ_R = 36°</text>
        </svg>
      </div>
    );
  }

  // 3. Standard Millimeter Linear Graph
  const isBoyle = exp.id === 'boyle';
  const isSound = exp.id === 'sound';
  const startX = 55;
  const endX = 320;
  const originY = isSound ? 185 : 210;
  const lineStartY = isBoyle ? 135 : isSound ? 205 : originY;
  const lineEndY = 45;

  const p1X = 125;
  const p1Y = lineStartY - ((lineStartY - lineEndY) * (p1X - startX)) / (endX - startX);
  const p2X = 255;
  const p2Y = lineStartY - ((lineStartY - lineEndY) * (p2X - startX)) / (endX - startX);

  return (
    <div className="bg-amber-50/70 dark:bg-slate-900 border border-amber-300/80 dark:border-slate-700 rounded-xl p-3.5 flex flex-col items-center">
      <div className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2 flex flex-wrap items-center justify-center gap-2">
        <span>تمثيل ورقة الرسم البياني</span>
        <span className="px-2 py-0.5 rounded bg-amber-200/80 dark:bg-slate-800 text-amber-950 dark:text-amber-200 text-[11px]">
          {graph.passesOrigin ? 'يمر بنقطة الأصل (0,0)' : isBoyle ? 'يقطع محور Y الموجب (b)' : 'يقطع محور Y السالب (-0.6r)'}
        </span>
      </div>
      <svg
        viewBox="0 0 360 250"
        className="w-full max-w-md bg-white dark:bg-slate-950 rounded-lg border border-amber-200 dark:border-slate-800 shadow-inner"
        style={{ direction: 'ltr' }}
      >
        <defs>
          <pattern id={`grid-${exp.id}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M 18 0 L 0 0 0 18" fill="none" stroke="rgba(245, 158, 11, 0.22)" strokeWidth="0.9" />
          </pattern>
        </defs>
        <rect width="360" height="250" fill={`url(#grid-${exp.id})`} />

        {/* Y Axis */}
        <g className="text-slate-900 dark:text-slate-200">
          <line x1={startX} y1="235" x2={startX} y2="20" stroke="#475569" strokeWidth="2" />
          <polygon points={`${startX - 4},22 ${startX + 4},22 ${startX},14`} fill="#475569" />
          <text x={startX + 8} y="24" fontSize="11" fontWeight="bold" fill="currentColor">
            Y: {graph.yAxis}
          </text>

          {/* X Axis */}
          <line x1="25" y1={originY} x2="340" y2={originY} stroke="#475569" strokeWidth="2" />
          <polygon points={`338,${originY - 4} 338,${originY + 4} 346,${originY}`} fill="#475569" />
          <text x="215" y={originY + 22} fontSize="11" fontWeight="bold" fill="currentColor">
            X: {graph.xAxis}
          </text>
        </g>

        {/* Plotted Line */}
        <line x1={startX} y1={lineStartY} x2={endX} y2={lineEndY} stroke="#2563eb" strokeWidth="2.5" />

        {/* Slope Triangle */}
        <line x1={p1X} y1={p1Y} x2={p2X} y2={p1Y} stroke="#e11d48" strokeWidth="1.8" strokeDasharray="4 2" />
        <line x1={p2X} y1={p1Y} x2={p2X} y2={p2Y} stroke="#e11d48" strokeWidth="1.8" strokeDasharray="4 2" />

        {/* Point 1 & Point 2 */}
        <circle cx={p1X} cy={p1Y} r="4.5" fill="#e11d48" />
        <text x={p1X - 10} y={p1Y + 16} fontSize="10" fontWeight="bold" fill="#be123c">
          ({graph.samplePoints.x1}, {graph.samplePoints.y1})
        </text>

        <circle cx={p2X} cy={p2Y} r="4.5" fill="#e11d48" />
        <text x={p2X - 35} y={p2Y - 10} fontSize="10" fontWeight="bold" fill="#be123c">
          ({graph.samplePoints.x2}, {graph.samplePoints.y2})
        </text>

        {/* Intercept Highlight */}
        {!graph.passesOrigin && (
          <>
            <circle cx={startX} cy={lineStartY} r="4.5" fill="#059669" />
            <text x={startX + 6} y={lineStartY + 4} fontSize="10" fontWeight="bold" fill="#059669">
              {isBoyle ? 'b = y-intercept' : '-0.6 r (المقطع الصادي)'}
            </text>
          </>
        )}
      </svg>
    </div>
  );
};
