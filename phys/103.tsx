import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Award,
  Shuffle,
  Table,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Eye,
  EyeOff,
  Layers,
  Play,
  ClipboardCheck,
  Lightbulb,
  Sun,
  Moon,
  Printer,
  Grid,
  Video,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Check,
  X
} from 'lucide-react';
import { EXPERIMENTS, Experiment, toLatexLabel } from './experimentsData';
import { Latex, MathText, VideoEmbedCard, LabGraphSVG, ExperimentIcon } from './LabVisuals';
import { trackExperiment, trackExamResult, trackTab } from '../src/telemetry';

type TabId = 'study' | 'tableTrainer' | 'examSim' | 'cheatSheet';

interface MasteryEntry {
  theory: boolean;
  table: boolean;
  exam: boolean;
  score: number;
}

interface TableFeedback {
  allHeadersCorrect: boolean;
  correctHeadersCount: number;
  totalHeaders: number;
  isCalcCorrect: boolean;
}

interface ExamAnswers {
  q1GoalChoice: string;
  q2FormulaChoice: string;
  q2UnitChoice: string;
  q3ColHeaderChoice: string;
  q3CalcValue: string;
  q4ChoiceA: string; // Y-Axis or conceptual choice
  q4ChoiceB: string; // X-Axis
  q4ChoiceC: string; // Origin pass
  q5Value: string;
  q5Unit: string;
  q6FinalValue: string;
  q6FinalUnit: string;
}

const KIND_LABELS: Record<Experiment['kind'], string> = {
  linear: 'رسم بياني خطي',
  vector: 'تحليل متجهات',
  calorimetry: 'توازن وحفظ طاقة'
};

const STORAGE_KEYS = {
  mastery: 'phys103_mastery_v1',
  selectedExp: 'phys103_selected_exp_v1',
  activeTab: 'phys103_active_tab_v1',
  darkMode: 'phys103_dark_mode_v1',
  hideAnswers: 'phys103_hide_answers_v1',
  tableDrafts: 'phys103_table_drafts_v1'
} as const;

interface TableDraft {
  selections: Record<string, string>;
  calcInput: string;
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota or strict privacy mode failures
  }
}

function loadInitialMastery(): Record<string, MasteryEntry> {
  const saved = readStorage<Record<string, Partial<MasteryEntry>>>(STORAGE_KEYS.mastery, {});
  const initial: Record<string, MasteryEntry> = {};
  EXPERIMENTS.forEach((e) => {
    const entry = saved && typeof saved === 'object' ? saved[e.id] : undefined;
    initial[e.id] = {
      theory: Boolean(entry?.theory),
      table: Boolean(entry?.table),
      exam: Boolean(entry?.exam),
      score: typeof entry?.score === 'number' && !isNaN(entry.score) ? entry.score : 0
    };
  });
  return initial;
}

const VALID_TABS: TabId[] = ['study', 'tableTrainer', 'examSim', 'cheatSheet'];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const saved = readStorage<string>(STORAGE_KEYS.activeTab, 'study');
    return VALID_TABS.includes(saved as TabId) ? (saved as TabId) : 'study';
  });
  const [selectedExpId, setSelectedExpId] = useState<string>(() => {
    const saved = readStorage<string>(STORAGE_KEYS.selectedExp, 'hooke');
    return EXPERIMENTS.some((e) => e.id === saved) ? saved : 'hooke';
  });
  const [showAllGrid, setShowAllGrid] = useState<boolean>(false);

  // Persist tab & experiment selection + track tab changes invisibly
  useEffect(() => {
    writeStorage(STORAGE_KEYS.activeTab, activeTab);
    trackTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.selectedExp, selectedExpId);
  }, [selectedExpId]);

  // Dark Mode State (persisted in localStorage)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = readStorage<boolean | null>(STORAGE_KEYS.darkMode, null);
    if (typeof saved === 'boolean') return saved;
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    writeStorage(STORAGE_KEYS.darkMode, darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Mastery tracking per experiment (persisted in localStorage)
  const [mastery, setMastery] = useState<Record<string, MasteryEntry>>(() => loadInitialMastery());

  useEffect(() => {
    writeStorage(STORAGE_KEYS.mastery, mastery);
  }, [mastery]);

  // Study Mode State
  const [hideAnswersInStudy, setHideAnswersInStudy] = useState<boolean>(() =>
    Boolean(readStorage<boolean>(STORAGE_KEYS.hideAnswers, false))
  );
  useEffect(() => {
    writeStorage(STORAGE_KEYS.hideAnswers, hideAnswersInStudy);
  }, [hideAnswersInStudy]);

  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});
  const [showTheoryNotes, setShowTheoryNotes] = useState<boolean>(true);
  const [showPracticalSteps, setShowPracticalSteps] = useState<boolean>(false);
  const [showLabGraph, setShowLabGraph] = useState<boolean>(true);

  // Table Trainer State (persisted per experiment in localStorage)
  const [tableDrafts, setTableDrafts] = useState<Record<string, TableDraft>>(() => {
    const saved = readStorage<Record<string, TableDraft>>(STORAGE_KEYS.tableDrafts, {});
    return saved && typeof saved === 'object' ? saved : {};
  });
  useEffect(() => {
    writeStorage(STORAGE_KEYS.tableDrafts, tableDrafts);
  }, [tableDrafts]);

  const currentDraft = tableDrafts[selectedExpId] || { selections: {}, calcInput: '' };
  const tableSelections = currentDraft.selections || {};
  const calcInput = currentDraft.calcInput || '';

  const setTableSelections = (nextSelections: Record<string, string>) => {
    setTableDrafts((prev) => {
      const next = {
        ...prev,
        [selectedExpId]: {
          selections: nextSelections,
          calcInput: prev[selectedExpId]?.calcInput || ''
        }
      };
      writeStorage(STORAGE_KEYS.tableDrafts, next);
      return next;
    });
  };

  const setCalcInput = (nextCalcInput: string) => {
    setTableDrafts((prev) => {
      const next = {
        ...prev,
        [selectedExpId]: {
          selections: prev[selectedExpId]?.selections || {},
          calcInput: nextCalcInput
        }
      };
      writeStorage(STORAGE_KEYS.tableDrafts, next);
      return next;
    });
  };

  const [tableFeedback, setTableFeedback] = useState<TableFeedback | null>(null);

  // Exam Simulator State
  const [examExp, setExamExp] = useState<Experiment>(
    () => EXPERIMENTS.find((e) => e.id === selectedExpId) || EXPERIMENTS[0]
  );
  const [examStarted, setExamStarted] = useState<boolean>(true);
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [examSaved, setExamSaved] = useState<boolean>(false);
  const [isDrawingRandom, setIsDrawingRandom] = useState<boolean>(false);

  const [examAnswers, setExamAnswers] = useState<ExamAnswers>({
    q1GoalChoice: '',
    q2FormulaChoice: '',
    q2UnitChoice: '',
    q3ColHeaderChoice: '',
    q3CalcValue: '',
    q4ChoiceA: '',
    q4ChoiceB: '',
    q4ChoiceC: '',
    q5Value: '',
    q5Unit: '',
    q6FinalValue: '',
    q6FinalUnit: ''
  });

  const currentIndex = useMemo(
    () => Math.max(0, EXPERIMENTS.findIndex((e) => e.id === selectedExpId)),
    [selectedExpId]
  );

  const currentExp = EXPERIMENTS[currentIndex] || EXPERIMENTS[0];
  const prevExp = currentIndex > 0 ? EXPERIMENTS[currentIndex - 1] : null;
  const nextExp = currentIndex < EXPERIMENTS.length - 1 ? EXPERIMENTS[currentIndex + 1] : null;

  // Overall Readiness
  const readinessStats = useMemo(() => {
    const totalPillars = EXPERIMENTS.length * 3;
    let completedPillars = 0;
    let fullyMasteredExps = 0;

    EXPERIMENTS.forEach((e) => {
      const m = mastery[e.id];
      if (m?.theory) completedPillars++;
      if (m?.table) completedPillars++;
      if (m?.exam) completedPillars++;
      if (m?.theory && m?.table && m?.exam) fullyMasteredExps++;
    });

    return {
      percentage: Math.round((completedPillars / totalPillars) * 100),
      completedPillars,
      totalPillars,
      fullyMasteredExps
    };
  }, [mastery]);

  const markPillarDone = (expId: string, pillar: keyof Omit<MasteryEntry, 'score'>, scoreVal: number | null = null) => {
    setMastery((prev) => {
      const next = {
        ...prev,
        [expId]: {
          ...prev[expId],
          [pillar]: true,
          score: scoreVal !== null ? Math.max(prev[expId]?.score ?? 0, scoreVal) : (prev[expId]?.score ?? 0)
        }
      };
      writeStorage(STORAGE_KEYS.mastery, next);
      return next;
    });
  };

  const toggleTheoryDone = (expId: string) => {
    setMastery((prev) => {
      const current = prev[expId] || { theory: false, table: false, exam: false, score: 0 };
      const next = {
        ...prev,
        [expId]: {
          ...current,
          theory: !current.theory
        }
      };
      writeStorage(STORAGE_KEYS.mastery, next);
      return next;
    });
  };

  // Reset transient per-experiment feedback & log view
  useEffect(() => {
    setTableFeedback(null);
    setRevealedCards({});
    setShowPracticalSteps(false);
    trackExperiment(selectedExpId);
  }, [selectedExpId]);

  const resetExamAnswers = () => {
    setExamSubmitted(false);
    setExamSaved(false);
    setExamAnswers({
      q1GoalChoice: '',
      q2FormulaChoice: '',
      q2UnitChoice: '',
      q3ColHeaderChoice: '',
      q3CalcValue: '',
      q4ChoiceA: '',
      q4ChoiceB: '',
      q4ChoiceC: '',
      q5Value: '',
      q5Unit: '',
      q6FinalValue: '',
      q6FinalUnit: ''
    });
  };

  const startExamSimulation = (mode: 'random' | 'selected' = 'random', targetExp: Experiment | null = null) => {
    resetExamAnswers();

    if (mode === 'random') {
      setIsDrawingRandom(true);
      setActiveTab('examSim');
      setExamStarted(false);
      let counter = 0;
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * EXPERIMENTS.length);
        setExamExp(EXPERIMENTS[randomIndex]);
        counter++;
        if (counter > 8) {
          clearInterval(interval);
          const finalPick = EXPERIMENTS[Math.floor(Math.random() * EXPERIMENTS.length)];
          setExamExp(finalPick);
          setSelectedExpId(finalPick.id);
          setIsDrawingRandom(false);
          setExamStarted(true);
        }
      }, 80);
    } else {
      const chosen = targetExp || currentExp;
      setExamExp(chosen);
      setSelectedExpId(chosen.id);
      setActiveTab('examSim');
      setIsDrawingRandom(false);
      setExamStarted(true);
    }
  };

  // Randomized MC choices for Exam Simulator
  const examOptions = useMemo(() => {
    const others = EXPERIMENTS.filter((e) => e.id !== examExp.id);
    const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    const goals = shuffle([examExp.goal, others[0].goal, others[1].goal, others[2].goal]);

    const formulas = shuffle([
      examExp.mainFormulaLatex,
      others[0].mainFormulaLatex,
      others[1].mainFormulaLatex,
      others[2].mainFormulaLatex
    ]);

    const targetSym = examExp.symbols[examExp.kind === 'calorimetry' ? examExp.symbols.length - 1 : 0];
    const unitPool = Array.from(
      new Set([targetSym.unit, 'N/m²', 'Pa·s', 'cmHg', 'J/(kg·K)', 'J/cal', 'm/s²', 'kg'])
    );
    const units = shuffle([targetSym.unit, ...unitPool.filter((u) => u !== targetSym.unit).slice(0, 3)]);

    const linearYPool = ['Δl (m) × 10⁻²', 't² × 10⁻² (s²)', 'KE × 10⁻³ (J)', 'v (m/s)', '1/l × 10⁻² (cm⁻¹)', 'Δl × 10⁻⁵ (m)'];
    const yAxes = shuffle([examExp.graph.yAxis, ...linearYPool.filter((y) => y !== examExp.graph.yAxis).slice(0, 3)]);

    const linearXPool = ['m (kg) × 10⁻³', 'S × 10⁻² (m)', 'W × 10⁻³ (J)', 'r² × 10⁻⁶ (m²)', '1/f × 10⁻³ (s)', 'h (cmHg)'];
    const xAxes = shuffle([examExp.graph.xAxis, ...linearXPool.filter((x) => x !== examExp.graph.xAxis).slice(0, 3)]);

    const q4Conceptual = examExp.graph.conceptualQ4Correct
      ? shuffle([examExp.graph.conceptualQ4Correct, ...(examExp.graph.conceptualQ4Distractors || [])])
      : [];

    const q5UnitPool = ['m/kg', 's²/m', '(m·s)⁻¹', 'ليس له وحدة (J / J)', 'm/s', 'cm⁻¹ / cmHg', 'cm', 'J', '°C'];
    const q5TargetUnit = examExp.kind === 'linear' ? examExp.graph.slopeUnit : examExp.graph.intermediateQ5Unit || examExp.graph.slopeUnit;
    const slopeUnits = shuffle([q5TargetUnit, ...q5UnitPool.filter((u) => u !== q5TargetUnit).slice(0, 3)]);

    const q6UnitPool = ['N/m', 'cmHg', 'm/s²', 'Pa·s', 'N/m²', '%', 'm/s', 'gw', 'J/(kg·K)', 'J/cal'];
    const targetUnits = shuffle([
      examExp.graph.targetUnit,
      ...q6UnitPool.filter((u) => u !== examExp.graph.targetUnit).slice(0, 3)
    ]);

    return {
      goals,
      formulas,
      targetSym,
      units,
      yAxes,
      xAxes,
      q4Conceptual,
      q5TargetUnit,
      slopeUnits,
      targetUnits
    };
  }, [examExp]);

  // Evaluate Exam Submission
  const examEvaluation = useMemo(() => {
    if (!examSubmitted) return null;

    const results: { qNum: number; title: string; isCorrect: boolean; userAns: React.ReactNode; correctAns: React.ReactNode }[] = [];
    let score = 0;

    // Q1: Goal (15 pts)
    const q1Correct = examAnswers.q1GoalChoice === examExp.goal;
    if (q1Correct) score += 15;
    results.push({
      qNum: 1,
      title: 'س1: الهدف من التجربة',
      isCorrect: q1Correct,
      userAns: examAnswers.q1GoalChoice ? <MathText text={examAnswers.q1GoalChoice} /> : 'لم يتم الاختيار',
      correctAns: <MathText text={examExp.goal} />
    });

    // Q2: Main Law & Symbol Unit (15 pts)
    const q2LawCorrect = examAnswers.q2FormulaChoice === examExp.mainFormulaLatex;
    const q2UnitCorrect = examAnswers.q2UnitChoice === examOptions.targetSym?.unit;
    if (q2LawCorrect) score += 10;
    if (q2UnitCorrect) score += 5;
    results.push({
      qNum: 2,
      title: 'س2: القانون الرئيسي ووحدات الرموز',
      isCorrect: q2LawCorrect && q2UnitCorrect,
      userAns: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          {examAnswers.q2FormulaChoice ? <Latex math={examAnswers.q2FormulaChoice} /> : '-'}
          <span className="text-slate-400">|</span>
          <span>وحدة (<Latex math={examOptions.targetSym?.symLatex || examOptions.targetSym?.sym} />):</span>
          {examAnswers.q2UnitChoice ? <Latex math={toLatexLabel(examAnswers.q2UnitChoice)} /> : '-'}
        </span>
      ),
      correctAns: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <Latex math={examExp.mainFormulaLatex} />
          <span className="text-slate-400">|</span>
          <span>وحدة (<Latex math={examOptions.targetSym?.symLatex || examOptions.targetSym?.sym} />):</span>
          <Latex math={examOptions.targetSym?.unitLatex || toLatexLabel(examOptions.targetSym?.unit || '')} />
        </span>
      )
    });

    // Q3: Table & Calc (25 pts)
    const targetCol = examExp.tableConfig.missingColumns[0];
    const q3HeaderCorrect = examAnswers.q3ColHeaderChoice === targetCol.correctHeader;
    const userCalcNum = parseFloat(examAnswers.q3CalcValue);
    const q3CalcCorrect =
      !isNaN(userCalcNum) &&
      Math.abs(userCalcNum - examExp.tableConfig.calcDrill.correctValue) <= examExp.tableConfig.calcDrill.tolerance;
    if (q3HeaderCorrect) score += 10;
    if (q3CalcCorrect) score += 15;
    results.push({
      qNum: 3,
      title: 'س3: الجدول العملي والحسابات',
      isCorrect: q3HeaderCorrect && q3CalcCorrect,
      userAns: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span>العمود:</span>
          {examAnswers.q3ColHeaderChoice ? <Latex math={toLatexLabel(examAnswers.q3ColHeaderChoice)} /> : '-'}
          <span className="text-slate-400">|</span>
          <span>الناتج: {examAnswers.q3CalcValue || '-'}</span>
        </span>
      ),
      correctAns: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span>العمود:</span>
          <Latex math={targetCol.headerLatex || toLatexLabel(targetCol.correctHeader)} />
          <span className="text-slate-400">|</span>
          <span>الناتج: {examExp.tableConfig.calcDrill.correctValue} -</span>
          <MathText text={examExp.tableConfig.calcDrill.explanation} />
        </span>
      )
    });

    // Q4: Graph Axes OR Conceptual Principle (15 pts)
    if (examExp.kind === 'linear') {
      const q4YCorrect = examAnswers.q4ChoiceA === examExp.graph.yAxis;
      const q4XCorrect = examAnswers.q4ChoiceB === examExp.graph.xAxis;
      const expectedOriginStr = examExp.graph.passesOrigin ? 'نعم، يمر بنقطة الأصل' : 'لا يمر بنقطة الأصل (له مقطع صادي)';
      const q4OriginCorrect = examAnswers.q4ChoiceC === expectedOriginStr;
      if (q4YCorrect && q4XCorrect) score += 10;
      if (q4OriginCorrect) score += 5;
      results.push({
        qNum: 4,
        title: 'س4: محاور الرسم البياني ونقطة الأصل',
        isCorrect: q4YCorrect && q4XCorrect && q4OriginCorrect,
        userAns: (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span>Y: {examAnswers.q4ChoiceA ? <Latex math={toLatexLabel(examAnswers.q4ChoiceA)} /> : '-'}</span>
            <span className="text-slate-400">|</span>
            <span>X: {examAnswers.q4ChoiceB ? <Latex math={toLatexLabel(examAnswers.q4ChoiceB)} /> : '-'}</span>
            <span className="text-slate-400">|</span>
            <span>{examAnswers.q4ChoiceC || '-'}</span>
          </span>
        ),
        correctAns: (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span>Y: <Latex math={examExp.graph.yAxisLatex} /></span>
            <span className="text-slate-400">|</span>
            <span>X: <Latex math={examExp.graph.xAxisLatex} /></span>
            <span className="text-slate-400">|</span>
            <span>{expectedOriginStr}</span>
          </span>
        )
      });
    } else {
      const q4ConceptCorrect = examAnswers.q4ChoiceA === examExp.graph.conceptualQ4Correct;
      if (q4ConceptCorrect) score += 15;
      results.push({
        qNum: 4,
        title: examExp.kind === 'vector' ? 'س4: قاعدة الرسم البياني للمتجهات' : 'س4: المبدأ الفيزيائي للتجربة الحرارية',
        isCorrect: q4ConceptCorrect,
        userAns: examAnswers.q4ChoiceA ? <MathText text={examAnswers.q4ChoiceA} /> : 'لم يتم الاختيار',
        correctAns: <MathText text={examExp.graph.conceptualQ4Correct || ''} />
      });
    }

    // Q5: Slope OR Intermediate Quantity (15 pts)
    const userQ5 = parseFloat(examAnswers.q5Value);
    const expectedQ5 = examExp.kind === 'linear' ? examExp.graph.expectedSlope : (examExp.graph.intermediateQ5CorrectVal ?? 0);
    const tolQ5 = examExp.kind === 'linear' ? Math.max(0.0001, expectedQ5 * 0.08) : (examExp.graph.intermediateQ5Tolerance ?? 0.5);
    const q5ValCorrect = !isNaN(userQ5) && Math.abs(userQ5 - expectedQ5) <= tolQ5;
    const q5UnitCorrect = examAnswers.q5Unit === examOptions.q5TargetUnit;
    if (q5ValCorrect) score += 10;
    if (q5UnitCorrect) score += 5;
    results.push({
      qNum: 5,
      title:
        examExp.kind === 'linear'
          ? 'س5: حساب ميل الخط المستقيم ووحدته'
          : examExp.kind === 'vector'
            ? 'س5: طول سهم المحصلة بالرسم البياني'
            : 'س5: حساب الكمية المرحلية (الطاقة / فرق الحرارة)',
      isCorrect: q5ValCorrect && q5UnitCorrect,
      userAns: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span>القيمة: {examAnswers.q5Value || '-'}</span>
          <span className="text-slate-400">|</span>
          <span>الوحدة: {examAnswers.q5Unit ? <Latex math={toLatexLabel(examAnswers.q5Unit)} /> : '-'}</span>
        </span>
      ),
      correctAns: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span>القيمة: <Latex math={String(expectedQ5)} /></span>
          <span className="text-slate-400">|</span>
          <span>الوحدة: <Latex math={toLatexLabel(examOptions.q5TargetUnit)} /></span>
        </span>
      )
    });

    // Q6: Final Physical Constant & Unit (15 pts)
    const userFinal = parseFloat(examAnswers.q6FinalValue);
    const normExpectedFinal = examExp.id === 'young' ? 2.23 : examExp.graph.expectedTarget;
    const finalTol = Math.max(0.1, normExpectedFinal * 0.08);
    const q6ValCorrect =
      !isNaN(userFinal) &&
      (Math.abs(userFinal - normExpectedFinal) <= finalTol ||
        Math.abs(userFinal - examExp.graph.expectedTarget) <= examExp.graph.expectedTarget * 0.08);
    const q6UnitCorrect = examAnswers.q6FinalUnit === examExp.graph.targetUnit;
    if (q6ValCorrect) score += 10;
    if (q6UnitCorrect) score += 5;
    results.push({
      qNum: 6,
      title: `س6: حساب ${examExp.graph.targetName} مع الوحدة`,
      isCorrect: q6ValCorrect && q6UnitCorrect,
      userAns: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span>الناتج: {examAnswers.q6FinalValue || '-'}</span>
          <span className="text-slate-400">|</span>
          <span>الوحدة: {examAnswers.q6FinalUnit ? <Latex math={toLatexLabel(examAnswers.q6FinalUnit)} /> : '-'}</span>
        </span>
      ),
      correctAns: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span>الناتج: <Latex math={examExp.id === 'young' ? '2.23 \\times 10^{11}' : String(normExpectedFinal)} /></span>
          <span className="text-slate-400">|</span>
          <span>الوحدة: <Latex math={examExp.graph.targetUnitLatex} /></span>
        </span>
      )
    });

    return { score, results };
  }, [examSubmitted, examExp, examAnswers, examOptions]);

  // Properly track exam submission after examEvaluation resolves
  useEffect(() => {
    if (examSubmitted && examEvaluation) {
      trackExamResult(examEvaluation.score);
    }
  }, [examSubmitted, examEvaluation]);

  // Verify Table Trainer
  const handleVerifyTable = () => {
    const missingCols = currentExp.tableConfig.missingColumns;
    let correctHeadersCount = 0;
    missingCols.forEach((col) => {
      if (tableSelections[col.id] === col.correctHeader) {
        correctHeadersCount++;
      }
    });

    const userNum = parseFloat(calcInput);
    const calcDrill = currentExp.tableConfig.calcDrill;
    const isCalcCorrect = !isNaN(userNum) && Math.abs(userNum - calcDrill.correctValue) <= calcDrill.tolerance;
    const allHeadersCorrect = correctHeadersCount === missingCols.length;

    setTableFeedback({
      allHeadersCorrect,
      correctHeadersCount,
      totalHeaders: missingCols.length,
      isCalcCorrect
    });

    if (allHeadersCorrect && isCalcCorrect) {
      markPillarDone(currentExp.id, 'table');
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Tajawal',sans-serif] selection:bg-indigo-500 selection:text-white pb-20 transition-colors"
    >
      {/* HEADER */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* University Identity & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 to-sky-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 truncate">
                <span>جامعة الملك سعود</span>
                <span className="text-slate-400">•</span>
                <span className="hidden sm:inline">كلية العلوم - قسم الفيزياء والفلك</span>
                <span className="sm:hidden">قسم الفيزياء والفلك</span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                مراجعة التجارب العملية - مقرر 103 فيز
              </h1>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              title="نسبة إتمام مراجعة التجارب العشر"
            >
              <span className="text-slate-500 dark:text-slate-400">الإنجاز:</span>
              <span className="text-indigo-600 dark:text-indigo-400">{readinessStats.fullyMasteredExps}/10</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className={readinessStats.percentage >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {readinessStats.percentage}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => startExamSimulation('random')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition shadow-sm cursor-pointer"
              title="اختيار تجربة عشوائية للتقييم"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تقييم عشوائي</span>
              <span className="sm:hidden">اختبار</span>
            </button>

            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              aria-label="تبديل المظهر"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-2 sm:px-6 flex overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'study' as const, label: 'دليل التجارب والشرح (10)', icon: BookOpen },
            { id: 'tableTrainer' as const, label: 'التدريب على الجداول والحسابات', icon: Table },
            { id: 'examSim' as const, label: 'نموذج التقييم العملي', icon: ClipboardCheck },
            { id: 'cheatSheet' as const, label: 'مصفوفة القوانين الشاملة', icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowAllGrid(false);
                }}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${active
                    ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* HORIZONTAL EXPERIMENT SELECTOR + ALL-10 INDEX TOGGLE */}
      {activeTab !== 'cheatSheet' && (
        <div className="no-print bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 py-2 px-3 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAllGrid((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap border transition cursor-pointer shrink-0 ${showAllGrid
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                  }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>الفهرس (10)</span>
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 flex-1 min-w-0">
                {EXPERIMENTS.map((exp) => {
                  const isSelected = exp.id === (activeTab === 'examSim' && examStarted ? examExp.id : selectedExpId);
                  const m = mastery[exp.id];
                  const doneCount = (m?.theory ? 1 : 0) + (m?.table ? 1 : 0) + (m?.exam ? 1 : 0);
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => {
                        setSelectedExpId(exp.id);
                        setShowAllGrid(false);
                        if (activeTab === 'examSim') {
                          startExamSimulation('selected', exp);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 border ${isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600'
                        }`}
                    >
                      <ExperimentIcon icon={exp.icon} className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {exp.number}. {exp.shortTitle}
                      </span>
                      {doneCount === 3 && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expandable Academic Overview Grid of All 10 Experiments */}
            {showAllGrid && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {EXPERIMENTS.map((exp) => {
                  const isSelected = exp.id === selectedExpId;
                  const m = mastery[exp.id];
                  const pillarsDone = (m?.theory ? 1 : 0) + (m?.table ? 1 : 0) + (m?.exam ? 1 : 0);
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => {
                        setSelectedExpId(exp.id);
                        setShowAllGrid(false);
                        if (activeTab === 'examSim') {
                          startExamSimulation('selected', exp);
                        }
                      }}
                      className={`p-3 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between gap-2 min-w-0 ${isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 ring-1 ring-indigo-500'
                          : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <ExperimentIcon icon={exp.icon} className="w-4 h-4" />
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                            {KIND_LABELS[exp.kind]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {exp.number}. {exp.shortTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {exp.badge}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/70 dark:border-slate-700/70 text-[10px]">
                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                          <Video className="w-3 h-3" /> فيديو شرح
                        </span>
                        <span className={pillarsDone === 3 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                          {pillarsDone}/3
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="w-full max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 overflow-x-clip min-w-0">
        {/* ==========================================
            TAB 1: PRACTICAL LAB REVIEW (ALL 10 EXPERIMENTS)
           ========================================== */}
        {activeTab === 'study' && (
          <div className="space-y-4 min-w-0">
            {/* Experiment Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 min-w-0">
              <div className="flex items-center gap-3 w-full md:w-auto md:flex-1 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <ExperimentIcon icon={currentExp.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      التجربة {currentExp.number} من 10
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {KIND_LABELS[currentExp.kind]}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {currentExp.badge}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {currentExp.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setHideAnswersInStudy(!hideAnswersInStudy);
                    setRevealedCards({});
                  }}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${hideAnswersInStudy
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                >
                  {hideAnswersInStudy ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{hideAnswersInStudy ? 'وضع الشرح' : 'تسميع ذاتي'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleTheoryDone(currentExp.id)}
                  aria-pressed={Boolean(mastery[currentExp.id]?.theory)}
                  title="توثيق أو إلغاء توثيق مراجعة هذه التجربة (محفوظ تلقائياً في المتصفح)"
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${mastery[currentExp.id]?.theory
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                    }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{mastery[currentExp.id]?.theory ? 'تمت المراجعة' : 'توثيق المراجعة'}</span>
                </button>
              </div>
            </div>

            {/* Embedded Practical Lab Video */}
            <VideoEmbedCard exp={currentExp} defaultOpen={true} />

            {/* Goal + Theory & Equations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Goal & Theory Notes */}
              <div className="min-w-0 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-bold">
                      1
                    </span>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      الهدف من التجربة والملخص النظري
                    </h3>
                  </div>
                </div>

                {hideAnswersInStudy && !revealedCards['q1'] ? (
                  <button
                    type="button"
                    onClick={() => setRevealedCards({ ...revealedCards, q1: true })}
                    className="w-full py-6 px-3 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm hover:bg-indigo-50/50 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4 shrink-0" />
                    <span>اضغط هنا لكشف الهدف والملخص النظري</span>
                  </button>
                ) : (
                  <div className="space-y-3 min-w-0">
                    <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                      <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">الغرض / الهدف الرسمي:</div>
                      <p className="text-sm sm:text-base font-extrabold text-indigo-950 dark:text-indigo-100 leading-relaxed">
                        <MathText text={currentExp.goal} />
                      </p>
                    </div>

                    {/* Theory Summary Cards from Lab Manual */}
                    <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowTheoryNotes(!showTheoryNotes)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <span>المفاهيم النظرية الأساسية (من مذكرة التجارب)</span>
                        {showTheoryNotes ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                      {showTheoryNotes && (
                        <div className="p-3 space-y-2.5 text-xs">
                          {currentExp.theorySummary.map((note, idx) => (
                            <div key={idx} className="space-y-1 min-w-0">
                              <div className="font-extrabold text-slate-900 dark:text-slate-100">{note.title}</div>
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                <MathText text={note.body} />
                              </p>
                              {note.formulaLatex && (
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-indigo-700 dark:text-indigo-300 overflow-x-auto">
                                  <Latex math={note.formulaLatex} block={true} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Practical Steps Toggle */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowPracticalSteps(!showPracticalSteps)}
                    className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 py-1 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>خطوات العمل المعملي وأخذ القراءات</span>
                    </span>
                    <span className="inline-flex items-center gap-1 shrink-0">
                      {showPracticalSteps ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>إخفاء</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>عرض الخطوات</span>
                        </>
                      )}
                    </span>
                  </button>
                  {showPracticalSteps && (
                    <ol className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside pr-1">
                      {currentExp.practicalSteps.map((step, i) => (
                        <li key={i} className="leading-relaxed">
                          <MathText text={step} />
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>

              {/* Law, Symbols & SI Units */}
              <div className="min-w-0 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-bold">
                      2
                    </span>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      العلاقات الرياضية وشرح الرموز والوحدات
                    </h3>
                  </div>
                </div>

                {hideAnswersInStudy && !revealedCards['q2'] ? (
                  <button
                    type="button"
                    onClick={() => setRevealedCards({ ...revealedCards, q2: true })}
                    className="w-full py-10 px-3 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm hover:bg-indigo-50/50 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4 shrink-0" />
                    <span>اضغط لكشف القانون الرئيسي والرموز والوحدات</span>
                  </button>
                ) : (
                  <div className="space-y-3 min-w-0">
                    <div className="p-3 sm:p-4 rounded-xl bg-slate-900 text-amber-300 dark:bg-slate-950 border border-slate-800 shadow-sm text-center overflow-hidden">
                      <div className="text-[11px] text-slate-400 font-bold mb-1">الصيغة الرياضية المعتمدة:</div>
                      <div className="overflow-x-auto overflow-y-visible py-1">
                        <Latex math={currentExp.mainFormulaLatex} block={true} className="text-base sm:text-lg font-bold text-amber-300" />
                      </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                            <th className="p-2 border border-slate-200 dark:border-slate-800 text-center font-bold">الرمز</th>
                            <th className="p-2 border border-slate-200 dark:border-slate-800 text-right font-bold">المعنى الفيزيائي</th>
                            <th className="p-2 border border-slate-200 dark:border-slate-800 text-center font-bold">الوحدة</th>
                            {currentExp.kind === 'calorimetry' && (
                              <th className="p-2 border border-slate-200 dark:border-slate-800 text-center font-bold">القيمة بالتقرير</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {currentExp.symbols.map((s, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                            >
                              <td className="p-2 font-bold text-indigo-600 dark:text-indigo-400 text-center" dir="ltr">
                                <Latex math={s.symLatex || s.sym} />
                              </td>
                              <td className="p-2 font-medium text-slate-800 dark:text-slate-200">{s.name}</td>
                              <td className="p-2 font-bold text-emerald-600 dark:text-emerald-400 text-center" dir="ltr">
                                <Latex math={s.unitLatex || `\\text{${s.unit}}`} />
                              </td>
                              {currentExp.kind === 'calorimetry' && (
                                <td className="p-2 font-mono text-center text-slate-700 dark:text-slate-300" dir="ltr">
                                  {s.sampleVal || '-'}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lab Table & Values */}
            <div className="min-w-0 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold">
                    3
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    جدول القراءات العملية والتحويلات
                  </h3>
                </div>
                <div className="max-w-full overflow-x-auto text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg self-start sm:self-auto" dir="ltr">
                  <Latex math={currentExp.givensOnExamLatex || currentExp.givensOnExam} />
                </div>
              </div>

              {hideAnswersInStudy && !revealedCards['q3'] ? (
                <button
                  type="button"
                  onClick={() => setRevealedCards({ ...revealedCards, q3: true })}
                  className="w-full py-8 px-3 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm hover:bg-emerald-50/50 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>اضغط لكشف جدول القراءات وأعمدة الحساب</span>
                </button>
              ) : (
                <div className="space-y-3 min-w-0">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm border-collapse text-center" dir="ltr">
                      <thead>
                        <tr>
                          <th className="p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200">
                            <div>
                              <Latex math={currentExp.tableConfig.givenColumn.headerLatex || currentExp.tableConfig.givenColumn.header} />
                            </div>
                          </th>
                          {currentExp.tableConfig.missingColumns.map((col) => (
                            <th
                              key={col.id}
                              className="p-2.5 bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-400/60 font-extrabold text-emerald-900 dark:text-emerald-200"
                            >
                              <div>
                                <Latex math={col.headerLatex || col.correctHeader} />
                              </div>
                              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-normal mt-0.5" dir="rtl">
                                ({col.labelAr})
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentExp.tableConfig.givenColumn.values.map((val, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2 border border-slate-200 dark:border-slate-700/60 font-mono font-bold bg-slate-50 dark:bg-slate-900/60">
                              {val}
                            </td>
                            {currentExp.tableConfig.missingColumns.map((col) => (
                              <td
                                key={col.id}
                                className="p-2 border border-slate-200 dark:border-slate-700/60 font-mono text-slate-700 dark:text-slate-300"
                              >
                                {col.sampleValues[rowIdx] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('tableTrainer')}
                      className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>التدريب التفاعلي على جدول هذه التجربة</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis, Graph / Vector / Thermal Balance & Target Calculation */}
            <div className="min-w-0 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-xs font-bold">
                    4
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    {currentExp.kind === 'linear'
                      ? 'التحليل البياني، حساب الميل، واستنتاج النتيجة النهائية'
                      : currentExp.kind === 'vector'
                        ? 'مقارنة الطرق الثلاث والرسم البياني للمتجهات'
                        : 'التطبيق الحسابي لمبدأ حفظ الطاقة والنتيجة النهائية'}
                  </h3>
                </div>
              </div>

              {hideAnswersInStudy && !revealedCards['q456'] ? (
                <button
                  type="button"
                  onClick={() => setRevealedCards({ ...revealedCards, q456: true })}
                  className="w-full py-8 px-3 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold text-xs sm:text-sm hover:bg-amber-50/50 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>اضغط لكشف التحليل الرياضي والميل والنتيجة النهائية</span>
                </button>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div className="lg:col-span-7 space-y-3 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="min-w-0 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {currentExp.kind === 'linear' ? 'محاور الرسم البياني' : currentExp.kind === 'vector' ? 'مرجعية الرسم البياني' : 'المبدأ الفيزيائي'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <strong>{currentExp.kind === 'linear' ? 'محور Y: ' : 'المرجع: '}</strong>
                          <span dir="ltr" className="font-bold text-slate-900 dark:text-white">
                            <Latex math={currentExp.graph.yAxisLatex} />
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <strong>{currentExp.kind === 'linear' ? 'محور X: ' : 'العلاقة: '}</strong>
                          <span dir="ltr" className="font-bold text-slate-900 dark:text-white">
                            <Latex math={currentExp.graph.xAxisLatex} />
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium pt-1 border-t border-slate-200 dark:border-slate-700">
                          <MathText text={currentExp.graph.originReason} />
                        </div>
                      </div>

                      <div className="min-w-0 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                          {currentExp.kind === 'linear' ? 'الميل (Slope) ووحدته' : currentExp.kind === 'vector' ? 'مقياس المحصلة البياني' : 'الكمية المرحلية'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <span dir="ltr" className="font-bold text-slate-900 dark:text-white">
                            <Latex math={currentExp.graph.slopeLatex} />
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <strong>الوحدة: </strong>
                          <span dir="ltr" className="font-bold text-rose-600 dark:text-rose-400">
                            <Latex math={currentExp.graph.slopeUnitLatex} />
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                          قيمة التقرير: <span dir="ltr" className="font-mono font-bold text-slate-800 dark:text-slate-200">{currentExp.graph.expectedSlope}</span>
                        </div>
                      </div>

                      <div className="min-w-0 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          حساب {currentExp.graph.targetName}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <div dir="ltr" className="font-bold text-emerald-700 dark:text-emerald-400 py-0.5 overflow-x-auto">
                            <Latex math={currentExp.graph.targetFormulaLatex} />
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <strong>الوحدة النهائية: </strong>
                          <span dir="ltr" className="font-bold text-emerald-600 dark:text-emerald-400">
                            <Latex math={currentExp.graph.targetUnitLatex} />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                      <strong>المثال المحلول من التقارير المعتمدة: </strong>
                      <MathText text={currentExp.graph.reportExampleNote} />
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">ملاحظة قياس ودقة حسابية: </span>
                        <MathText text={currentExp.precisionNote} />
                      </div>
                    </div>
                  </div>

                  {/* Visualizer Column */}
                  <div className="lg:col-span-5 space-y-2 min-w-0">
                    <div className="flex items-center justify-between lg:hidden">
                      <button
                        type="button"
                        onClick={() => setShowLabGraph(!showLabGraph)}
                        className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-slate-300 py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-amber-500" />
                          <span>{currentExp.kind === 'calorimetry' ? 'مخطط التوازن الحراري' : 'عرض الرسم البياني'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          {showLabGraph ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span>إخفاء</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span>عرض</span>
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                    <div className={`${showLabGraph ? 'block' : 'hidden'} lg:block`}>
                      <LabGraphSVG exp={currentExp} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Quick Prev / Next Navigation */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {prevExp ? (
                <button
                  type="button"
                  onClick={() => setSelectedExpId(prevExp.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-xs font-bold text-slate-700 dark:text-slate-200 transition shadow-sm cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                  <span>
                    السابقة: {prevExp.number}. {prevExp.shortTitle}
                  </span>
                </button>
              ) : (
                <div />
              )}

              {nextExp ? (
                <button
                  type="button"
                  onClick={() => setSelectedExpId(nextExp.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <span>
                    التالية: {nextExp.number}. {nextExp.shortTitle}
                  </span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('cheatSheet')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <span>مصفوفة الملخص الشامل</span>
                  <Layers className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: TABLE & CALCULATION TRAINER
           ========================================== */}
        {activeTab === 'tableTrainer' && (
          <div className="space-y-4 w-full min-w-0">
            <div className="w-full max-w-full min-w-0 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 min-w-0">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    التدريب التفاعلي على الجداول والوحدات
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold mt-1 text-slate-900 dark:text-white">
                    إكمال الجدول والعمليات الحسابية - {currentExp.number}. {currentExp.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    حدد العنوان والوحدة الصحيحة لكل عمود، ثم أدخل الناتج العددي في فقرة التطبيق الحسابي أدناه:
                  </p>
                </div>
                <div className="max-w-full overflow-x-auto text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg self-start md:self-auto" dir="ltr">
                  <Latex math={currentExp.givensOnExamLatex || currentExp.givensOnExam} />
                </div>
              </div>

              <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800" dir="ltr">
                <table className="w-full text-xs sm:text-sm border-collapse text-center" dir="ltr">
                  <thead>
                    <tr>
                      <th className="p-2.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold min-w-[130px]">
                        <div>
                          <Latex math={currentExp.tableConfig.givenColumn.headerLatex || currentExp.tableConfig.givenColumn.header} />
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5" dir="rtl">
                          (العمود الأساسي)
                        </div>
                      </th>
                      {currentExp.tableConfig.missingColumns.map((col, idx) => {
                        const selectedVal = tableSelections[col.id] || '';
                        const isSubmittedAndCorrect = tableFeedback && selectedVal === col.correctHeader;
                        const isSubmittedAndWrong = tableFeedback && selectedVal !== col.correctHeader;

                        return (
                          <th
                            key={col.id}
                            className={`p-2.5 border-2 transition min-w-[190px] ${isSubmittedAndCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500'
                                : isSubmittedAndWrong
                                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500'
                                  : 'bg-indigo-50/50 dark:bg-slate-800/80 border-indigo-300 dark:border-slate-700'
                              }`}
                          >
                            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300 mb-2" dir="rtl">
                              المطلوب ({idx + 1}): {col.labelAr}
                            </div>
                            <div className="space-y-1.5">
                              {col.options.map((opt, i) => {
                                const isChosen = selectedVal === opt;
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setTableSelections({ ...tableSelections, [col.id]: opt })}
                                    className={`w-full px-2 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer flex items-center justify-center ${isChosen
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                      }`}
                                    dir="ltr"
                                  >
                                    <Latex math={toLatexLabel(opt)} />
                                  </button>
                                );
                              })}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {currentExp.tableConfig.givenColumn.values.slice(0, 5).map((val, rIdx) => (
                      <tr key={rowIdxOrVal(rIdx)}>
                        <td className="p-2 border border-slate-200 dark:border-slate-800 font-mono font-bold bg-slate-50 dark:bg-slate-900">
                          {val}
                        </td>
                        {currentExp.tableConfig.missingColumns.map((col) => (
                          <td
                            key={col.id}
                            className="p-2 border border-slate-200 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-300"
                          >
                            {tableSelections[col.id] === col.correctHeader ? col.sampleValues[rIdx] : '؟؟؟'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="min-w-0 max-w-full overflow-hidden p-4 rounded-xl bg-indigo-50/70 dark:bg-slate-800/60 border border-indigo-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-extrabold text-xs sm:text-sm">
                  <Calculator className="w-4 h-4" />
                  <span>التطبيق الحسابي على بيانات التجربة:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  <MathText text={currentExp.tableConfig.calcDrill.question} />
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                  <input
                    type="number"
                    step="any"
                    placeholder="أدخل القيمة العددية..."
                    value={calcInput}
                    onChange={(e) => setCalcInput(e.target.value)}
                    className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-mono font-bold w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyTable}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm transition shadow cursor-pointer"
                  >
                    تحقق من الإجابات
                  </button>
                </div>

                {tableFeedback && (
                  <div
                    className={`p-3 rounded-lg border text-xs sm:text-sm space-y-1 ${tableFeedback.allHeadersCorrect && tableFeedback.isCalcCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                        : 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-900 dark:text-amber-200'
                      }`}
                  >
                    <div className="font-extrabold flex items-center gap-2">
                      {tableFeedback.allHeadersCorrect && tableFeedback.isCalcCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>أحسنت! جميع الأعمدة والحسابات صحيحة 100%.</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span className="inline-flex flex-wrap items-center gap-1.5">
                            <span>تم اختيار {tableFeedback.correctHeadersCount} من {tableFeedback.totalHeaders} أعمدة صحيحة | الناتج الحسابي:</span>
                            <span className="inline-flex items-center gap-1">
                              {tableFeedback.isCalcCorrect ? (
                                <>
                                  <span>صحيح</span>
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                </>
                              ) : (
                                <>
                                  <span>يحتاج مراجعة</span>
                                  <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                </>
                              )}
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-xs opacity-90 pt-0.5">
                      <strong>خطوات الحل: </strong>
                      <MathText text={currentExp.tableConfig.calcDrill.explanation} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: REALISTIC EVALUATION PAPER SIMULATOR
           ========================================== */}
        {activeTab === 'examSim' && (
          <div className="space-y-4">
            <div className="no-print bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                  <ClipboardCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>نموذج التقييم العملي - قسم الفيزياء والفلك</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ورقة تقييم تفاعلية مطابقة لهيكلة الاختبار العملي لجميع التجارب العشر.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={examExp.id}
                  onChange={(e) => {
                    const found = EXPERIMENTS.find((x) => x.id === e.target.value);
                    if (found) startExamSimulation('selected', found);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  {EXPERIMENTS.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.number}. {e.shortTitle}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => startExamSimulation('random')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>اختيار عشوائي</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">طباعة الورقة</span>
                </button>
              </div>
            </div>

            {isDrawingRandom && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center animate-bounce">
                  <ExperimentIcon icon={examExp.icon} className="w-7 h-7" />
                </div>
                <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                  جاري اختيار تجربة التقييم...
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">{examExp.title}</div>
              </div>
            )}

            {!isDrawingRandom && examStarted && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md overflow-hidden">
                {/* Official KSU Header */}
                <div className="bg-slate-100 dark:bg-slate-800/90 p-4 border-b border-slate-300 dark:border-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="text-right">كلية العلوم • قسم الفيزياء والفلك</div>
                    <div className="text-center sm:text-base font-extrabold text-indigo-950 dark:text-white">
                      جامعة الملك سعود - الاختبار العملي
                    </div>
                    <div className="sm:text-left" dir="rtl">
                      المقرر: 103 فيز • المدة: ساعة ونصف
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 text-center">
                    <span className="inline-block px-4 py-1 rounded-lg bg-indigo-900 text-white font-extrabold text-xs sm:text-sm">
                      تجربة {examExp.number}: {examExp.title}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {/* Q1 */}
                  <div className="space-y-2">
                    <label className="block font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      (1) ما هو الهدف الرئيسي من التجربة؟
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {examOptions.goals.map((g, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setExamAnswers({ ...examAnswers, q1GoalChoice: g })}
                          className={`p-2.5 rounded-lg border text-right text-xs font-medium transition cursor-pointer min-h-[44px] ${examAnswers.q1GoalChoice === g
                              ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                            }`}
                        >
                          <MathText text={g} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q2 */}
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <label className="block font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      (2) اختر القانون الرئيسي للتجربة ووحدة الرمز الأساسي:
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-500 mb-1">أ) الصيغة الرياضية:</div>
                        <div className="space-y-2 min-w-0">
                          {examOptions.formulas.map((f, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setExamAnswers({ ...examAnswers, q2FormulaChoice: f })}
                              className={`w-full max-w-full overflow-x-auto p-2.5 rounded-lg border text-xs text-center transition cursor-pointer min-h-[44px] flex items-center justify-center ${examAnswers.q2FormulaChoice === f
                                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                }`}
                              dir="ltr"
                            >
                              <Latex math={f} block={true} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-500 mb-1">
                          ب) الوحدة للرمز (<Latex math={examOptions.targetSym?.symLatex || examOptions.targetSym?.sym} /> : {examOptions.targetSym?.name}):
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {examOptions.units.map((u, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setExamAnswers({ ...examAnswers, q2UnitChoice: u })}
                              className={`p-2.5 rounded-lg border text-xs text-center transition cursor-pointer min-h-[44px] flex items-center justify-center ${examAnswers.q2UnitChoice === u
                                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                }`}
                              dir="ltr"
                            >
                              <Latex math={toLatexLabel(u)} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Q3 */}
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 min-w-0">
                      <label className="block font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                        (3) استكمال جدول التجربة والعمليات الحسابية:
                      </label>
                      <span className="max-w-full overflow-x-auto text-[11px] bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded self-start sm:self-auto" dir="ltr">
                        <Latex math={examExp.givensOnExamLatex || examExp.givensOnExam} />
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 min-w-0">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2">
                          أ) اختر عنوان العمود/الوحدة الصحيح ({examExp.tableConfig.missingColumns[0].labelAr}):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {examExp.tableConfig.missingColumns[0].options.map((opt, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setExamAnswers({ ...examAnswers, q3ColHeaderChoice: opt })}
                              className={`p-2 rounded-lg border text-xs font-bold transition cursor-pointer min-h-[42px] flex items-center justify-center ${examAnswers.q3ColHeaderChoice === opt
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                }`}
                              dir="ltr"
                            >
                              <Latex math={toLatexLabel(opt)} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                          ب) <MathText text={examExp.tableConfig.calcDrill.question} />
                        </div>
                        <input
                          type="number"
                          step="any"
                          placeholder="أدخل القيمة العددية..."
                          value={examAnswers.q3CalcValue}
                          onChange={(e) => setExamAnswers({ ...examAnswers, q3CalcValue: e.target.value })}
                          className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-mono font-bold"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Q4 */}
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    {examExp.kind === 'linear' ? (
                      <>
                        <label className="block font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                          (4) حدد محاور الرسم البياني المناسب وخصائص الخط المستقيم:
                        </label>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-500">المحور الرأسي (<Latex math={'Y\\text{-Axis}'} />):</div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {examOptions.yAxes.map((y, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setExamAnswers({ ...examAnswers, q4ChoiceA: y })}
                                  className={`p-2 rounded-lg border text-xs font-bold transition cursor-pointer min-h-[40px] flex items-center justify-center ${examAnswers.q4ChoiceA === y
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                    }`}
                                  dir="ltr"
                                >
                                  <Latex math={toLatexLabel(y)} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-500">المحور الأفقي (<Latex math={'X\\text{-Axis}'} />):</div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {examOptions.xAxes.map((x, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setExamAnswers({ ...examAnswers, q4ChoiceB: x })}
                                  className={`p-2 rounded-lg border text-xs font-bold transition cursor-pointer min-h-[40px] flex items-center justify-center ${examAnswers.q4ChoiceB === x
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                    }`}
                                  dir="ltr"
                                >
                                  <Latex math={toLatexLabel(x)} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-500">المرور بنقطة الأصل <Latex math={'(0,0)'} />:</div>
                            <div className="grid grid-cols-1 gap-1.5">
                              {['نعم، يمر بنقطة الأصل', 'لا يمر بنقطة الأصل (له مقطع صادي)'].map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setExamAnswers({ ...examAnswers, q4ChoiceC: opt })}
                                  className={`p-2 rounded-lg border text-xs font-bold transition cursor-pointer min-h-[40px] text-center ${examAnswers.q4ChoiceC === opt
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                    }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="block font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                          (4) <MathText text={examExp.graph.conceptualQ4Prompt || ''} />
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {examOptions.q4Conceptual.map((choice, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setExamAnswers({ ...examAnswers, q4ChoiceA: choice })}
                              className={`p-2.5 rounded-lg border text-right text-xs font-medium transition cursor-pointer min-h-[44px] ${examAnswers.q4ChoiceA === choice
                                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                }`}
                            >
                              <MathText text={choice} />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Q5 & Q6 + Visual Aid */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    <div className="lg:col-span-7 space-y-4">
                      {/* Q5 */}
                      <div className="space-y-2">
                        <label className="block font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {examExp.kind === 'linear' ? (
                            '(5) احسب ميل الخط المستقيم (مع مراعاة قوى العشرة على المحاور) واختر وحدته:'
                          ) : (
                            <>
                              (5) <MathText text={examExp.graph.intermediateQ5Prompt || ''} />
                            </>
                          )}
                        </label>
                        {examExp.kind === 'linear' && (
                          <p className="text-[11px] text-slate-500">
                            النقطتان على الرسم:{' '}
                            <span className="font-bold text-rose-600 dark:text-rose-400" dir="ltr">
                              <Latex math={`(x_1 = ${examExp.graph.samplePoints.x1}, \\, y_1 = ${examExp.graph.samplePoints.y1})`} />
                            </span>{' '}
                            و{' '}
                            <span className="font-bold text-rose-600 dark:text-rose-400" dir="ltr">
                              <Latex math={`(x_2 = ${examExp.graph.samplePoints.x2}, \\, y_2 = ${examExp.graph.samplePoints.y2})`} />
                            </span>
                          </p>
                        )}
                        <div className="space-y-2 pt-1">
                          <input
                            type="number"
                            step="any"
                            placeholder={examExp.kind === 'linear' ? 'قيمة الميل...' : 'القيمة المحسوبة...'}
                            value={examAnswers.q5Value}
                            onChange={(e) => setExamAnswers({ ...examAnswers, q5Value: e.target.value })}
                            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold"
                            dir="ltr"
                          />
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {examOptions.slopeUnits.map((u, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setExamAnswers({ ...examAnswers, q5Unit: u })}
                                className={`p-2 rounded-lg border text-xs font-bold transition cursor-pointer min-h-[38px] flex items-center justify-center ${examAnswers.q5Unit === u
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                  }`}
                                dir="ltr"
                              >
                                <Latex math={toLatexLabel(u)} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Q6 */}
                      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <label className="block font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                          (6) أوجد قيمة {examExp.graph.targetName} مع تحديد الوحدة:
                        </label>
                        {examExp.id === 'young' && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400">
                            ملاحظة لمعامل يونج: أدخل المعامل المضروب في <Latex math={'10^{11}'} /> مباشرة (مثلاً <Latex math={'2.23'} />).
                          </div>
                        )}
                        <div className="space-y-2 pt-1">
                          <input
                            type="number"
                            step="any"
                            placeholder={`قيمة ${examExp.graph.targetName}...`}
                            value={examAnswers.q6FinalValue}
                            onChange={(e) => setExamAnswers({ ...examAnswers, q6FinalValue: e.target.value })}
                            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold"
                            dir="ltr"
                          />
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {examOptions.targetUnits.map((u, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setExamAnswers({ ...examAnswers, q6FinalUnit: u })}
                                className={`p-2 rounded-lg border text-xs font-bold transition cursor-pointer min-h-[38px] flex items-center justify-center ${examAnswers.q6FinalUnit === u
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                  }`}
                                dir="ltr"
                              >
                                <Latex math={toLatexLabel(u)} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 max-w-sm sm:max-w-md mx-auto w-full">
                      <LabGraphSVG exp={examExp} />
                    </div>
                  </div>

                  {/* Submit Exam Paper */}
                  <div className="no-print pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">راجع إجاباتك من (1) إلى (6) ثم اضغط للتصحيح الفوري.</div>
                    <button
                      type="button"
                      onClick={() => {
                        setExamSubmitted(true);
                        setExamSaved(false);
                        setTimeout(() => {
                          const el = document.getElementById('exam-grading-report');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow transition cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>اعتماد الإجابات والتصحيح الفوري</span>
                    </button>
                  </div>
                </div>

                {/* Grading Report */}
                {examSubmitted && examEvaluation && (
                  <div id="exam-grading-report" className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 border-t-2 border-indigo-600 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          نتيجة التقييم - {examExp.title}
                        </div>
                        <h3 className="text-xl font-black mt-0.5">الدرجة: {examEvaluation.score} / 100</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {examEvaluation.score >= 80
                            ? 'أداء متميز وإتقان تام لخطوات التحليل والوحدات.'
                            : 'راجع الأسئلة غير المكتملة مع التحقق من التحويلات والوحدات الدولية.'}
                        </p>
                      </div>

                      <div className="no-print flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            markPillarDone(examExp.id, 'exam', examEvaluation.score);
                            if (examEvaluation.score >= 75) {
                              markPillarDone(examExp.id, 'theory');
                              markPillarDone(examExp.id, 'table');
                            }
                            setExamSaved(true);
                          }}
                          className={`px-3.5 py-2 rounded-lg text-white font-bold text-xs shadow cursor-pointer inline-flex items-center gap-1 transition ${
                            examSaved ? 'bg-emerald-700 ring-2 ring-emerald-400' : 'bg-emerald-600 hover:bg-emerald-500'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{examSaved ? 'تم حفظ النتيجة' : 'حفظ النتيجة'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => startExamSimulation('random')}
                          className="px-3.5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow cursor-pointer"
                        >
                          تجربة أخرى
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {examEvaluation.results.map((r) => (
                        <div
                          key={r.qNum}
                          className={`p-3 rounded-lg border text-xs ${r.isCorrect
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                            }`}
                        >
                          <div className="flex items-center justify-between font-extrabold mb-1">
                            <span>{r.title}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1 ${r.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                }`}
                            >
                              {r.isCorrect ? (
                                <>
                                  <span>صحيح</span>
                                  <Check className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  <span>يحتاج مراجعة</span>
                                  <X className="w-3 h-3" />
                                </>
                              )}
                            </span>
                          </div>
                          <div className="text-slate-600 dark:text-slate-300">
                            <strong>إجابتك: </strong>
                            <span>{r.userAns}</span>
                          </div>
                          {!r.isCorrect && (
                            <div className="text-emerald-800 dark:text-emerald-300 mt-1 font-medium">
                              <strong>الإجابة النموذجية: </strong>
                              <span>{r.correctAns}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 4: ALL 10 EXPERIMENTS SUMMARY MATRIX
           ========================================== */}
        {activeTab === 'cheatSheet' && (
          <div className="space-y-4 w-full min-w-0">
            <div className="w-full max-w-full min-w-0 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    الملخص الشامل لجميع التجارب المقررة (10 تجارب)
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold mt-1 text-slate-900 dark:text-white">
                    مصفوفة مقارنة التجارب العشر - مقرر 103 فيز
                  </h2>
                </div>
                <div className="no-print flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة الملخص</span>
                  </button>
                </div>
              </div>

              <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs border-collapse text-right">
                  <thead>
                    <tr className="bg-slate-900 text-white dark:bg-slate-800">
                      <th className="p-2.5 border border-slate-700 whitespace-nowrap">التجربة</th>
                      <th className="p-2.5 border border-slate-700 text-center whitespace-nowrap">القانون الأساسي</th>
                      <th className="p-2.5 border border-slate-700 text-center whitespace-nowrap">المحور Y / المرجع</th>
                      <th className="p-2.5 border border-slate-700 text-center whitespace-nowrap">المحور X / العلاقة</th>
                      <th className="p-2.5 border border-slate-700 text-center whitespace-nowrap">نقطة الأصل</th>
                      <th className="p-2.5 border border-slate-700 text-center whitespace-nowrap">الميل / الوحدة</th>
                      <th className="p-2.5 border border-slate-700 text-center whitespace-nowrap">المطلوب النهائي ووحدته</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXPERIMENTS.map((exp, idx) => (
                      <tr
                        key={exp.id}
                        onClick={() => {
                          setSelectedExpId(exp.id);
                          setActiveTab('study');
                        }}
                        className={`border-b border-slate-200 dark:border-slate-800 hover:bg-indigo-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/60 dark:bg-slate-900/50'
                          }`}
                      >
                        <td className="p-2.5 font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <ExperimentIcon icon={exp.icon} className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>
                              {exp.number}. {exp.shortTitle}
                            </span>
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-indigo-700 dark:text-indigo-300 text-center" dir="ltr">
                          <Latex math={exp.mainFormulaLatex} />
                        </td>
                        <td className="p-2.5 font-bold text-rose-600 dark:text-rose-400 text-center" dir="ltr">
                          <Latex math={exp.graph.yAxisLatex} />
                        </td>
                        <td className="p-2.5 font-bold text-sky-600 dark:text-sky-400 text-center" dir="ltr">
                          <Latex math={exp.graph.xAxisLatex} />
                        </td>
                        <td className="p-2.5 font-bold text-center whitespace-nowrap">
                          {exp.kind === 'calorimetry' ? (
                            <span className="text-slate-500">حساب مباشر</span>
                          ) : exp.graph.passesOrigin ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">نعم (0,0)</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-bold">لا (مقطع صادي)</span>
                          )}
                        </td>
                        <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300 text-center" dir="ltr">
                          <Latex math={exp.graph.slopeUnitLatex} />
                        </td>
                        <td className="p-2.5">
                          <div className="font-extrabold text-emerald-700 dark:text-emerald-400 text-center" dir="ltr">
                            <Latex math={exp.graph.targetFormulaLatex} />
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 text-center" dir="ltr">
                            <Latex math={exp.graph.targetUnitLatex} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Golden Rules - Fixed LaTeX string expressions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5">
                <div className="font-extrabold text-amber-900 dark:text-amber-300 text-xs sm:text-sm mb-1 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>التحويلات وقوى العشرة عند حساب الميل</span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  عند حساب <Latex math={'\\text{slope} = \\frac{\\Delta Y}{\\Delta X}'} /> يجب مراعاة معامل التحويل المرفق على المحورين؛ مثل{' '}
                  <Latex math={'\\times 10^{-2}'} /> أو <Latex math={'\\times 10^{-5}'} /> في البسط، و{' '}
                  <Latex math={'r^2 \\times 10^{-6}'} /> في مقام اللزوجة.
                </p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3.5">
                <div className="font-extrabold text-indigo-900 dark:text-indigo-300 text-xs sm:text-sm mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>الخطوط ذات المقطع الصادي</span>
                </div>
                <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">
                  تمر جميع العلاقات البيانية الخطية بنقطة الأصل ما عدا: <strong>قانون بويل</strong> (مقطع صادي موجب{' '}
                  <Latex math={'b'} /> ومنه <Latex math={'P_0 = \\frac{b}{a}'} />) و<strong>سرعة الصوت</strong> (مقطع صادي سالب عند{' '}
                  <Latex math={'-0.6r'} /> لتصحيح الفوهة).
                </p>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5">
                <div className="font-extrabold text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm mb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>ثوابت الحرارية والسرعات</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  في <strong>الحرارة النوعية ومكافئ جول</strong> نطبق حفظ الطاقة (<Latex math={'1\\text{ cal} \\approx 4.18\\text{ J}'} />). وفي{' '}
                  <strong>اللزوجة</strong> السرعة ثابتة <Latex math={'v = \\frac{d}{t}'} /> بينما في{' '}
                  <strong>العربة الهوائية</strong> متسارعة من السكون <Latex math={'v = \\frac{2s}{t}'} />.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function rowIdxOrVal(rIdx: number): string {
  return `row-${rIdx}`;
}
