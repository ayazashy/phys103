export type ExperimentKind = 'linear' | 'vector' | 'calorimetry';

export type ExperimentIconKey =
  | 'spring'
  | 'gauge'
  | 'freefall'
  | 'fluid'
  | 'vector'
  | 'ruler'
  | 'airtrack'
  | 'flame'
  | 'zap'
  | 'sound';

export interface ExperimentSymbol {
  sym: string;
  symLatex: string;
  name: string;
  unit: string;
  unitLatex: string;
  sampleVal?: string;
}

export interface MissingColumn {
  id: string;
  correctHeader: string;
  headerLatex: string;
  labelAr: string;
  options: string[];
  sampleValues: string[];
}

export interface TheoryNote {
  title: string;
  body: string;
  formulaLatex?: string;
}

export interface Experiment {
  id: string;
  number: number;
  kind: ExperimentKind;
  title: string;
  shortTitle: string;
  badge: string;
  icon: ExperimentIconKey;
  videoDriveId: string;
  videoUrl: string;
  videoEmbedUrl: string;
  goal: string;
  goalKeywords: string[];
  theorySummary: TheoryNote[];
  mainFormulaLatex: string;
  mainFormulaText: string;
  symbols: ExperimentSymbol[];
  givensOnExam: string;
  givensOnExamLatex: string;
  practicalSteps: string[];
  tableConfig: {
    givenColumn: {
      header: string;
      headerLatex: string;
      values: string[];
    };
    missingColumns: MissingColumn[];
    calcDrill: {
      question: string;
      correctValue: number;
      tolerance: number;
      explanation: string;
    };
  };
  graph: {
    hasGraph: boolean;
    yAxis: string;
    yAxisLatex: string;
    xAxis: string;
    xAxisLatex: string;
    passesOrigin: boolean;
    originReason: string;
    slopeFormula: string;
    slopeLatex: string;
    slopeUnit: string;
    slopeUnitLatex: string;
    targetName: string;
    targetFormula: string;
    targetFormulaLatex: string;
    targetUnit: string;
    targetUnitLatex: string;
    samplePoints: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      xFactor: number;
      yFactor: number;
      yIntercept?: number;
      isVector?: boolean;
    };
    expectedSlope: number;
    expectedTarget: number;
    reportExampleNote: string;
    conceptualQ4Prompt?: string;
    conceptualQ4Correct?: string;
    conceptualQ4Distractors?: string[];
    intermediateQ5Prompt?: string;
    intermediateQ5CorrectVal?: number;
    intermediateQ5Tolerance?: number;
    intermediateQ5Unit?: string;
    intermediateQ5UnitLatex?: string;
  };
  precisionNote: string;
}

const makeDriveVideo = (id: string) => ({
  videoDriveId: id,
  videoUrl: `https://drive.google.com/file/d/${id}/view?usp=drive_link`,
  videoEmbedUrl: `https://drive.google.com/file/d/${id}/preview`
});

// ==========================================
// DATA: ALL 10 CURRICULUM KSU PHYS 103 EXPERIMENTS
// ==========================================
export const EXPERIMENTS: Experiment[] = [
  {
    id: 'hooke',
    number: 1,
    kind: 'linear',
    title: "قانون هوك (Hooke's Law)",
    shortTitle: 'قانون هوك',
    badge: 'المرونة والنابض',
    icon: 'spring',
    ...makeDriveVideo('1GJcBNXuujBmKUGnc9jEQp-VXVfN1eOGy'),
    goal: 'تحقيق قانون هوك وإيجاد ثابت النابض ($k$).',
    goalKeywords: ['قانون هوك', 'ثابت النابض'],
    theorySummary: [
      {
        title: 'تعريف المرونة وتصنيف الأجسام',
        body: 'المرونة هي ميل الأجسام للعودة إلى حالتها الأصلية بعد زوال القوى المؤثرة عليها. وتُصنف إلى أجسام مرنة (مثل النابض وكرة التنس) وأجسام غير مرنة تحتفظ بالتشوه (مثل الصلصال وعجينة الخبز).'
      },
      {
        title: 'نص قانون هوك وحد المرونة',
        body: 'تحت حد المرونة، تتناسب الاستطالة الحادثة للنابض طردياً مع قوة الشد المؤثرة عليه. وتفسر الإشارة السالبة في $F = -k \\Delta l$ بأنها قوة إرجاع النابض لأعلى المعاكسة لاتجاه الشد لأسفل.',
        formulaLatex: 'F_1 + F_2 = 0 \\implies mg - k \\Delta l = 0 \\implies \\Delta l = \\left(\\frac{g}{k}\\right) m'
      }
    ],
    mainFormulaLatex: 'F = -k \\Delta l \\implies mg = k \\Delta l \\implies \\Delta l = \\left(\\frac{g}{k}\\right) m',
    mainFormulaText: 'mg = k · Δl   أو   Δl = (g / k) · m',
    symbols: [
      { sym: 'm', symLatex: 'm', name: 'الكتلة المعلقة', unit: 'kg', unitLatex: '\\text{kg}' },
      { sym: 'g', symLatex: 'g', name: 'تسارع الجاذبية الأرضية (9.8)', unit: 'm/s²', unitLatex: '\\text{m/s}^2' },
      { sym: 'k', symLatex: 'k', name: 'ثابت النابض (ثابت هوك)', unit: 'N/m', unitLatex: '\\text{N/m}' },
      { sym: 'Δl', symLatex: '\\Delta l', name: 'مقدار الاستطالة الحادثة للنابض', unit: 'm', unitLatex: '\\text{m}' }
    ],
    givensOnExam: 'g = 9.8 m/s²',
    givensOnExamLatex: 'g = 9.8 \\text{ m/s}^2',
    practicalSteps: [
      'نحدد موضع المؤشر عند السكون (الصفر) قبل تعليق أي كتلة.',
      'نعلق الكتل تدريجياً (زيادة: $20\\text{ g}$ إلى $120\\text{ g}$) ونسجل الاستطالة $\\Delta l_{\\text{inc}}$ بالسنتيمتر ($\\times 10^{-2}\\text{ m}$).',
      'ننقص الكتل تدريجياً ونسجل الاستطالة $\\Delta l_{\\text{dec}}$ لكل كتلة ثم نحسب المتوسط $\\Delta l_{\\text{avg}}$.'
    ],
    tableConfig: {
      givenColumn: {
        header: 'm (kg) × 10⁻³',
        headerLatex: 'm \\times 10^{-3} \\text{ (kg)}',
        values: ['20', '40', '60', '80', '100', '120']
      },
      missingColumns: [
        {
          id: 'c1',
          correctHeader: 'Δl_inc (m) × 10⁻²',
          headerLatex: '\\Delta l_{\\text{inc}} \\times 10^{-2} \\text{ (m)}',
          labelAr: 'الاستطالة عند الزيادة',
          options: ['Δl_inc (m) × 10⁻²', 'W = mgs (J)', 't₁ (s)', 'l = |A - X| (cm)'],
          sampleValues: ['0.3', '0.6', '1.4', '2.0', '2.8', '3.3']
        },
        {
          id: 'c2',
          correctHeader: 'Δl_dec (m) × 10⁻²',
          headerLatex: '\\Delta l_{\\text{dec}} \\times 10^{-2} \\text{ (m)}',
          labelAr: 'الاستطالة عند النقصان',
          options: ['Δl_dec (m) × 10⁻²', 't₂ (s)', 'v = 2s/t (m/s)', '1/l (cm⁻¹)'],
          sampleValues: ['0.2', '0.5', '1.3', '1.9', '2.7', '3.3']
        },
        {
          id: 'c3',
          correctHeader: 'Δl_avg (m) × 10⁻²',
          headerLatex: '\\Delta l_{\\text{avg}} \\times 10^{-2} \\text{ (m)}',
          labelAr: 'متوسط الاستطالة',
          options: ['Δl_avg (m) × 10⁻²', 'KE (J)', 't_avg (s)', 'r² × 10⁻⁶ (m²)'],
          sampleValues: ['0.25', '0.55', '1.35', '1.95', '2.75', '3.30']
        }
      ],
      calcDrill: {
        question: 'إذا كانت قراءة الاستطالة عند الزيادة $2.0\\text{ cm}$ وعند النقصان $1.9\\text{ cm}$ لكتلة $80 \\times 10^{-3}\\text{ kg}$، فما قيمة $\\Delta l_{\\text{avg}}$ في الجدول ($\\times 10^{-2}\\text{ m}$)؟',
        correctValue: 1.95,
        tolerance: 0.05,
        explanation: 'نجمع القراءتين ونقسم على 2: $\\Delta l_{\\text{avg}} = \\frac{2.0 + 1.9}{2} = 1.95 \\times 10^{-2}\\text{ m}$.'
      }
    },
    graph: {
      hasGraph: true,
      yAxis: 'Δl (m) × 10⁻²',
      yAxisLatex: '\\Delta l \\times 10^{-2} \\text{ (m)}',
      xAxis: 'm (kg) × 10⁻³',
      xAxisLatex: 'm \\times 10^{-3} \\text{ (kg)}',
      passesOrigin: true,
      originReason: 'يمر بأصل المحورين لأنه عند عدم تعليق كتلة ($m = 0$) لا تحدث استطالة للنابض ($\\Delta l = 0$).',
      slopeFormula: 'slope = Δ(Δl) / Δm',
      slopeLatex: '\\text{slope} = \\frac{\\Delta(\\Delta l)}{\\Delta m} = \\frac{g}{k}',
      slopeUnit: 'm/kg',
      slopeUnitLatex: '\\text{m/kg}',
      targetName: 'ثابت النابض (k)',
      targetFormula: 'k = g / slope',
      targetFormulaLatex: 'k = \\frac{g}{\\text{slope}}',
      targetUnit: 'N/m',
      targetUnitLatex: '\\text{N/m}',
      samplePoints: { x1: 65, y1: 1.6, x2: 130, y2: 3.2, xFactor: 1e-3, yFactor: 1e-2 },
      expectedSlope: 0.246,
      expectedTarget: 39.8,
      reportExampleNote: 'في التقرير: النقطتان $(65, 1.6)$ و $(130, 3.2)$ تعطي $\\text{slope} = \\frac{(3.2 - 1.6)\\times 10^{-2}}{(130 - 65)\\times 10^{-3}} \\approx 0.246\\text{ m/kg}$، ومنها $k = \\frac{9.8}{0.246} \\approx 39.8\\text{ N/m}$.'
    },
    precisionNote: 'مراعاة قوى العشرة عند حساب الميل: البسط $\\Delta l$ مضروب في $10^{-2}$ للتحويل للمتر، والمقام $\\Delta m$ مضروب في $10^{-3}$ للتحويل للكيلوغرام.'
  },
  {
    id: 'boyle',
    number: 2,
    kind: 'linear',
    title: "قانون بويل (Boyle's Law)",
    shortTitle: 'قانون بويل',
    badge: 'الغازات والضغط الجوي',
    icon: 'gauge',
    ...makeDriveVideo('1NaIgDhlKJnsJPKGqKRCU91wyzKHMoI6q'),
    goal: '1) تحقيق قانون بويل للغازات. 2) قياس الضغط الجوي في المختبر ($P_0$).',
    goalKeywords: ['قانون بويل', 'الضغط الجوي'],
    theorySummary: [
      {
        title: 'الضغط الجوي ونص قانون بويل',
        body: 'الضغط الجوي هو وزن عمود من الهواء مقطعه وحدة المساحات وارتفاعه حتى نهاية الغلاف الجوي (ويكافئ عمود زئبق ارتفاعه $76\\text{ cmHg}$ عند سطح البحر). وينص قانون بويل على أنه عند ثبوت درجة الحرارة يتناسب حجم الغاز المحصور عكسياً مع ضغطه ($PV = C$).'
      },
      {
        title: 'استنتاج معادلة الخط المستقيم',
        body: 'حجم الأنبوب الأسطواني $V = \\pi r^2 l$ وضغط الغاز $P = h + P_0$. بالتعويض في قانون بويل نحصل على علاقة خطية ذات مقطع صادي موجب $b = D P_0$:',
        formulaLatex: '\\frac{1}{l} = D h + D P_0 \\quad \\left(D = \\frac{\\pi r^2}{C}, \\; P_0 = \\frac{\\text{y-intercept}}{\\text{slope}}\\right)'
      }
    ],
    mainFormulaLatex: 'PV = C, \\quad P = h + P_0 \\implies \\frac{1}{l} = D h + D P_0 \\implies P_0 = \\frac{\\text{y-intercept}}{\\text{slope}}',
    mainFormulaText: '1/l = D·h + D·P₀   حيث   P = h + P₀',
    symbols: [
      { sym: 'l', symLatex: 'l', name: 'طول عمود الهواء المحصور |A - X|', unit: 'cm', unitLatex: '\\text{cm}' },
      { sym: 'h', symLatex: 'h', name: 'فرق ارتفاع الزئبق بين الأنبوبين |Y - X|', unit: 'cmHg', unitLatex: '\\text{cmHg}' },
      { sym: 'P₀', symLatex: 'P_0', name: 'الضغط الجوي في المختبر', unit: 'cmHg', unitLatex: '\\text{cmHg}' },
      { sym: 'P', symLatex: 'P', name: 'ضغط الغاز المحصور', unit: 'cmHg', unitLatex: '\\text{cmHg}' },
      { sym: 'D', symLatex: 'D', name: 'ثابت التناسب (πr² / C) ويساوي الميل', unit: 'cm⁻¹/cmHg', unitLatex: '\\text{cm}^{-1}/\\text{cmHg}' }
    ],
    givensOnExam: 'A = 50 cm (موضع نهاية الطرف المغلق)',
    givensOnExamLatex: 'A = 50 \\text{ cm}',
    practicalSteps: [
      'نسجل موضع نهاية الأنبوب المغلق الثابت $A = 50\\text{ cm}$.',
      'نغير ارتفاع الأنبوب المفتوح ونسجل مستوى الزئبق في الطرف المغلق ($X$) والطرف المفتوح ($Y$).',
      'نحسب فرق ارتفاع الزئبق $h = |Y - X|$ ($\\text{cmHg}$) وطول عمود الهواء $l = |A - X|$ ($\\text{cm}$).',
      'نحسب مقلوب الطول $\\frac{1}{l}$ ونكتبه بدلالة $\\times 10^{-2}\\text{ cm}^{-1}$ للرسم البياني.'
    ],
    tableConfig: {
      givenColumn: {
        header: 'X (cm)',
        headerLatex: 'X \\text{ (cm)}',
        values: ['66.7', '66.0', '65.3', '64.6', '64.0']
      },
      missingColumns: [
        {
          id: 'c1',
          correctHeader: 'Y (cm)',
          headerLatex: 'Y \\text{ (cm)}',
          labelAr: 'مستوى الزئبق بالطرف المفتوح',
          options: ['Y (cm)', 't₁ (s)', 'Δl_inc (m)', 'W (J)'],
          sampleValues: ['66.7', '62.7', '58.7', '54.7', '50.7']
        },
        {
          id: 'c2',
          correctHeader: 'h = |Y - X| (cmHg)',
          headerLatex: 'h = |Y - X| \\text{ (cmHg)}',
          labelAr: 'فرق ارتفاع الزئبق',
          options: ['h = |Y - X| (cmHg)', 'l = |A - X| (cm)', 'v (m/s)', 'KE (J)'],
          sampleValues: ['0', '3.3', '6.6', '9.9', '13.3']
        },
        {
          id: 'c3',
          correctHeader: 'l = |A - X| (cm)',
          headerLatex: 'l = |A - X| \\text{ (cm)}',
          labelAr: 'طول عمود الهواء المحصور',
          options: ['l = |A - X| (cm)', 'h = |Y - X| (cmHg)', 'r² (m²)', '1/f (s)'],
          sampleValues: ['16.7', '16.0', '15.3', '14.6', '14.0']
        },
        {
          id: 'c4',
          correctHeader: '1/l × 10⁻² (cm⁻¹)',
          headerLatex: '\\frac{1}{l} \\times 10^{-2} \\text{ (cm}^{-1}\\text{)}',
          labelAr: 'مقلوب طول عمود الهواء',
          options: ['1/l × 10⁻² (cm⁻¹)', 't² (s²)', 'Δl_avg (m)', 'W = mgs (J)'],
          sampleValues: ['5.9', '6.2', '6.5', '6.8', '7.1']
        }
      ],
      calcDrill: {
        question: 'إذا كان $A = 50\\text{ cm}$، وقراءة مستوى الزئبق في الطرف المغلق $X = 66.0\\text{ cm}$، فما طول عمود الهواء المحصور $l$ بوحدة $\\text{cm}$؟',
        correctValue: 16.0,
        tolerance: 0.1,
        explanation: '$l = |A - X| = |50 - 66.0| = 16.0\\text{ cm}$، ومنها $\\frac{1}{l} = \\frac{1}{16} = 0.0625 \\approx 6.2 \\times 10^{-2}\\text{ cm}^{-1}$.'
      }
    },
    graph: {
      hasGraph: true,
      yAxis: '1/l × 10⁻² (cm⁻¹)',
      yAxisLatex: '\\frac{1}{l} \\times 10^{-2} \\text{ (cm}^{-1}\\text{)}',
      xAxis: 'h (cmHg)',
      xAxisLatex: 'h \\text{ (cmHg)}',
      passesOrigin: false,
      originReason: 'لا يمر بنقطة الأصل بل يقطع محور $Y$ الموجب في نقطة ($b = \\text{y-intercept}$) بسبب وجود الضغط الجوي $P_0$ عندما $h = 0$.',
      slopeFormula: 'slope = Δ(1/l) / Δh = D',
      slopeLatex: 'D = \\text{slope} = \\frac{\\Delta(1/l)}{\\Delta h}',
      slopeUnit: 'cm⁻¹ / cmHg',
      slopeUnitLatex: '\\text{cm}^{-1}/\\text{cmHg}',
      targetName: 'الضغط الجوي (P₀)',
      targetFormula: 'P₀ = y-intercept / slope = b / a',
      targetFormulaLatex: 'P_0 = \\frac{\\text{y-intercept}}{\\text{slope}} = \\frac{b}{a}',
      targetUnit: 'cmHg',
      targetUnitLatex: '\\text{cmHg}',
      samplePoints: { x1: 1.0, y1: 6.0, x2: 12.3, y2: 7.0, xFactor: 1, yFactor: 1e-2, yIntercept: 5.9e-2 },
      expectedSlope: 0.000885,
      expectedTarget: 66.7,
      reportExampleNote: 'المقطع الصادي من الرسم $b = 5.9 \\times 10^{-2}\\text{ cm}^{-1}$، والميل $a = \\frac{(7 - 6)\\times 10^{-2}}{12.3 - 1} = 8.84 \\times 10^{-4}\\text{ cm}^{-1}/\\text{cmHg}$، فتكون $P_0 = \\frac{b}{a} = 66.74\\text{ cmHg}$.'
    },
    precisionNote: 'عند حساب الضغط الجوي $P_0 = \\frac{b}{\\text{slope}}$ يجب ضرب كل من المقطع الصادي ($b$) والبسط في الميل بالمعامل $10^{-2}$ الموضح على المحور الرأسي.'
  },
  {
    id: 'freefall',
    number: 3,
    kind: 'linear',
    title: 'السقوط الحر (Free Fall)',
    shortTitle: 'السقوط الحر',
    badge: 'تسارع الجاذبية g',
    icon: 'freefall',
    ...makeDriveVideo('1PcPuK2JBuNswXKjhOOWs9uVAyT1Q1Fb1'),
    goal: 'إيجاد تسارع الجاذبية الأرضية ($g$) بطريقة السقوط الحر.',
    goalKeywords: ['تسارع الجاذبية', 'السقوط الحر'],
    theorySummary: [
      {
        title: 'حركة السقوط الحر',
        body: 'في حال إهمال مقاومة الهواء، تسقط جميع الأجسام مهما اختلفت كتلتها أو حجمها بتسارع ثابت نحو مركز الأرض يُسمى تسارع الجاذبية الأرضية ($g \\approx 9.8\\text{ m/s}^2$)، أي أن سرعة الجسم تزداد بمقدار $9.8\\text{ m/s}$ كل ثانية.'
      },
      {
        title: 'معادلة الحركة من السكون',
        body: 'بما أن الكرة تنطلق من السكون ($v_0 = 0$) تختزل معادلة الإزاحة إلى علاقة خطية بين مربع الزمن والإزاحة:',
        formulaLatex: 'S = v_0 t + \\frac{1}{2} g t^2 \\xrightarrow{v_0=0} S = \\frac{1}{2} g t^2 \\implies t^2 = \\left(\\frac{2}{g}\\right) S'
      }
    ],
    mainFormulaLatex: 'S = v_0 t + \\frac{1}{2} g t^2 \\quad (v_0 = 0) \\implies S = \\frac{1}{2} g t^2 \\implies t^2 = \\left(\\frac{2}{g}\\right) S',
    mainFormulaText: 'S = ½ g t²   ومنها   t² = (2 / g) · S',
    symbols: [
      { sym: 'S', symLatex: 'S', name: 'الإزاحة العمودية (ارتفاع السقوط)', unit: 'm', unitLatex: '\\text{m}' },
      { sym: 't', symLatex: 't', name: 'زمن السقوط الحر', unit: 's', unitLatex: '\\text{s}' },
      { sym: 'g', symLatex: 'g', name: 'تسارع الجاذبية الأرضية', unit: 'm/s²', unitLatex: '\\text{m/s}^2' },
      { sym: 'v₀', symLatex: 'v_0', name: 'السرعة الابتدائية (تساوي صفر)', unit: 'm/s', unitLatex: '\\text{m/s}' }
    ],
    givensOnExam: 'v₀ = 0 m/s',
    givensOnExamLatex: 'v_0 = 0 \\text{ m/s}',
    practicalSteps: [
      'نثبت الكرة المعدنية عند ارتفاع محدد $S$ (مثلاً $80\\text{ cm} = 80 \\times 10^{-2}\\text{ m}$).',
      'نسقط الكرة 3 مرات لكل ارتفاع ونسجل الأزمنة $t_1, t_2, t_3$ من العداد الرقمي بوحدة $\\text{ms}$ (أي $\\times 10^{-3}\\text{ s}$).',
      'نحسب المتوسط $t_{\\text{avg}}$ ثم نربعه للحصول على $t^2$ بوحدة $\\times 10^{-2}\\text{ s}^2$.'
    ],
    tableConfig: {
      givenColumn: {
        header: 'S × 10⁻² (m)',
        headerLatex: 'S \\times 10^{-2} \\text{ (m)}',
        values: ['80', '70', '60', '50', '40']
      },
      missingColumns: [
        {
          id: 'c1',
          correctHeader: 't₁, t₂, t₃ × 10⁻³ (s)',
          headerLatex: 't_1, t_2, t_3 \\times 10^{-3} \\text{ (s)}',
          labelAr: 'أزمنة السقوط الثلاثة',
          options: ['t₁, t₂, t₃ × 10⁻³ (s)', 'Δl_inc (m)', 'W = mgs (J)', 'Y (cm)'],
          sampleValues: ['404, 404, 404', '375, 376, 375', '346, 349, 350', '321, 321, 320', '285, 285, 285']
        },
        {
          id: 'c2',
          correctHeader: 't_avg × 10⁻³ (s)',
          headerLatex: 't_{\\text{avg}} \\times 10^{-3} \\text{ (s)}',
          labelAr: 'متوسط الزمن',
          options: ['t_avg × 10⁻³ (s)', 'v = d/t (m/s)', 'l = |A - X| (cm)', 'Δl_avg (m)'],
          sampleValues: ['404', '375.33', '348.33', '320.33', '285']
        },
        {
          id: 'c3',
          correctHeader: 't² × 10⁻² (s²)',
          headerLatex: 't^2 \\times 10^{-2} \\text{ (s}^2\\text{)}',
          labelAr: 'مربع الزمن المتوسط',
          options: ['t² × 10⁻² (s²)', 'KE × 10⁻³ (J)', '1/l (cm⁻¹)', 'r² × 10⁻⁶ (m²)'],
          sampleValues: ['16.32', '14.08', '12.13', '10.26', '8.12']
        }
      ],
      calcDrill: {
        question: 'إذا كان متوسط زمن السقوط $t_{\\text{avg}} = 404 \\times 10^{-3}\\text{ s}$ (أي $0.404\\text{ s}$)، فكم قيمة $t^2$ مكتوبة بصيغة ($\\times 10^{-2}\\text{ s}^2$)؟',
        correctValue: 16.32,
        tolerance: 0.1,
        explanation: '$(0.404)^2 = 0.1632\\text{ s}^2 = 16.32 \\times 10^{-2}\\text{ s}^2$.'
      }
    },
    graph: {
      hasGraph: true,
      yAxis: 't² × 10⁻² (s²)',
      yAxisLatex: 't^2 \\times 10^{-2} \\text{ (s}^2\\text{)}',
      xAxis: 'S × 10⁻² (m)',
      xAxisLatex: 'S \\times 10^{-2} \\text{ (m)}',
      passesOrigin: true,
      originReason: 'يمر بأصل المحورين لأنه عندما تكون الإزاحة $S = 0$ يكون زمن السقوط $t = 0$.',
      slopeFormula: 'slope = Δt² / ΔS',
      slopeLatex: '\\text{slope} = \\frac{\\Delta t^2}{\\Delta S} = \\frac{2}{g}',
      slopeUnit: 's²/m',
      slopeUnitLatex: '\\text{s}^2/\\text{m}',
      targetName: 'تسارع الجاذبية الأرضية (g)',
      targetFormula: 'g = 2 / slope',
      targetFormulaLatex: 'g = \\frac{2}{\\text{slope}}',
      targetUnit: 'm/s²',
      targetUnitLatex: '\\text{m/s}^2',
      samplePoints: { x1: 42.5, y1: 8.5, x2: 77.2, y2: 15.5, xFactor: 1e-2, yFactor: 1e-2 },
      expectedSlope: 0.2017,
      expectedTarget: 9.91,
      reportExampleNote: 'بما أن المحورين $Y$ و $X$ مضروبان في $10^{-2}$ يُختصران معاً: $\\text{slope} = \\frac{15.5 - 8.5}{77.2 - 42.5} \\approx 0.2017\\text{ s}^2/\\text{m}$، ومنها $g = \\frac{2}{0.201} \\approx 9.95\\text{ m/s}^2$.'
    },
    precisionNote: 'يُحوَّل الزمن من الميلي ثانية ($\\times 10^{-3}\\text{ s}$) إلى الثواني قبل التربيع لتفادي أخطاء الأسس، ثم يُضرب في $10^{-2}$ لمطابقة مقياس المحور الرأسي $t^2$.'
  },
  {
    id: 'viscosity',
    number: 4,
    kind: 'linear',
    title: 'معامل اللزوجة - ستوكس (Viscosity)',
    shortTitle: 'معامل اللزوجة',
    badge: 'قانون ستوكس',
    icon: 'fluid',
    ...makeDriveVideo('1uYCq4NODZgiwZwyQFENdYhLFjKPzVyUx'),
    goal: 'إيجاد قيمة معامل اللزوجة ($\\eta$) لسائل شفاف لزج بطريقة ستوكس.',
    goalKeywords: ['معامل اللزوجة', 'ستوكس'],
    theorySummary: [
      {
        title: 'توازن القوى الثلاث على الكرة',
        body: 'تخضع الكرة الساقطة في السائل لوزنها لأسفل $F_1 = \\rho_s V g$، وقوة دفع أرخميدس لأعلى $F_2 = \\rho_l V g$، وقوة احتكاك ستوكس اللزجة لأعلى $F_3 = 6\\pi\\eta r v$. تصل الكرة للسرعة المنتظمة الحدية بعد نحو $10\\text{ cm}$ فتصبح محصلة القوى صفراً ($F_1 = F_2 + F_3$).',
        formulaLatex: '\\eta = \\frac{2}{9} \\left(\\frac{r^2}{v}\\right) g (\\rho_s - \\rho_l)'
      },
      {
        title: 'أثر درجة الحرارة على اللزوجة',
        body: 'ملاحظة هامة في المذكرة: تقل لزوجة السوائل بزيادة درجة الحرارة، بينما تزداد لزوجة الغازات بزيادة درجة الحرارة.'
      }
    ],
    mainFormulaLatex: '\\eta = \\frac{2}{9} \\left(\\frac{r^2}{v}\\right) g (\\rho_s - \\rho_l)',
    mainFormulaText: 'η = (2/9) · (r² / v) · g · (ρ_s - ρ_l)',
    symbols: [
      { sym: 'η', symLatex: '\\eta', name: 'معامل اللزوجة للسائل', unit: 'Pa·s (أو N·s/m²)', unitLatex: '\\text{Pa}\\cdot\\text{s}' },
      { sym: 'ρ_s', symLatex: '\\rho_s', name: 'كثافة مادة الكرة المعدنية', unit: 'kg/m³', unitLatex: '\\text{kg/m}^3' },
      { sym: 'ρ_l', symLatex: '\\rho_l', name: 'كثافة السائل اللزج', unit: 'kg/m³', unitLatex: '\\text{kg/m}^3' },
      { sym: 'v', symLatex: 'v', name: 'السرعة الحدية المنتظمة للكرة (d/t)', unit: 'm/s', unitLatex: '\\text{m/s}' },
      { sym: 'r', symLatex: 'r', name: 'نصف قطر الكرة', unit: 'm', unitLatex: '\\text{m}' },
      { sym: 'g', symLatex: 'g', name: 'تسارع الجاذبية الأرضية', unit: 'm/s²', unitLatex: '\\text{m/s}^2' }
    ],
    givensOnExam: 'd = 70 × 10⁻² m, ρ_s = 7800 kg/m³, ρ_l = 1260 kg/m³, g = 9.8 m/s²',
    givensOnExamLatex: 'd = 70 \\times 10^{-2} \\text{ m}, \\; \\rho_s = 7800 \\text{ kg/m}^3, \\; \\rho_l = 1260 \\text{ kg/m}^3, \\; g = 9.8 \\text{ m/s}^2',
    practicalSteps: [
      'نقيس قطر كل كرة ($D$) بالمايكرومتر بوحدة $\\text{mm}$ ($\\times 10^{-3}\\text{ m}$)، ثم نحسب نصف القطر $r = \\frac{D}{2}$ ومربعه $r^2 \\times 10^{-6}\\text{ m}^2$.',
      'نسقط الكرات في السائل ونقيس زمن قطع المسافة المحددة $d = 0.70\\text{ m}$ ثلاث مرات لكل قطر.',
      'نحسب المتوسط $t_{\\text{avg}}$ ثم نحسب السرعة المنتظمة $v = \\frac{d}{t_{\\text{avg}}}$.'
    ],
    tableConfig: {
      givenColumn: {
        header: 'D × 10⁻³ (m)',
        headerLatex: 'D \\times 10^{-3} \\text{ (m)}',
        values: ['3.17', '3.97', '4.76', '6.34']
      },
      missingColumns: [
        {
          id: 'c1',
          correctHeader: 'r × 10⁻³ (m)',
          headerLatex: 'r = \\frac{D}{2} \\times 10^{-3} \\text{ (m)}',
          labelAr: 'نصف قطر الكرة (D/2)',
          options: ['r × 10⁻³ (m)', 'W = mgs (J)', 'l = |A - X| (cm)', 'Δl (m)'],
          sampleValues: ['1.585', '1.985', '2.380', '3.170']
        },
        {
          id: 'c2',
          correctHeader: 'r² × 10⁻⁶ (m²)',
          headerLatex: 'r^2 \\times 10^{-6} \\text{ (m}^2\\text{)}',
          labelAr: 'مربع نصف القطر',
          options: ['r² × 10⁻⁶ (m²)', 't² × 10⁻² (s²)', '1/l (cm⁻¹)', 'KE (J)'],
          sampleValues: ['2.512', '3.94', '5.66', '10.04']
        },
        {
          id: 'c3',
          correctHeader: 't_avg (s)',
          headerLatex: 't_{\\text{avg}} \\text{ (s)}',
          labelAr: 'متوسط زمن السقوط',
          options: ['t_avg (s)', 'v = 2s/t (m/s)', 'h (cmHg)', '1/f (s)'],
          sampleValues: ['24.12', '15.66', '11.43', '7.02']
        },
        {
          id: 'c4',
          correctHeader: 'v = d / t_avg (m/s)',
          headerLatex: 'v = \\frac{d}{t_{\\text{avg}}} \\text{ (m/s)}',
          labelAr: 'سرعة الكرة الحدية',
          options: ['v = d / t_avg (m/s)', 'v = 2s / t_avg (m/s)', 'KE = ½Mv² (J)', 'Δl_avg (m)'],
          sampleValues: ['0.029', '0.0446', '0.062', '0.0997']
        }
      ],
      calcDrill: {
        question: 'إذا كانت المسافة المحددة $d = 0.70\\text{ m}$، ومتوسط زمن سقوط الكرة $t_{\\text{avg}} = 15.66\\text{ s}$، فما السرعة الحدية $v$ ($\\text{m/s}$)؟',
        correctValue: 0.0447,
        tolerance: 0.003,
        explanation: 'بما أن الكرة تتحرك بسرعة حدية منتظمة فإن $v = \\frac{d}{t_{\\text{avg}}} = \\frac{0.70}{15.66} \\approx 0.0447\\text{ m/s}$.'
      }
    },
    graph: {
      hasGraph: true,
      yAxis: 'v (m/s)',
      yAxisLatex: 'v \\text{ (m/s)}',
      xAxis: 'r² × 10⁻⁶ (m²)',
      xAxisLatex: 'r^2 \\times 10^{-6} \\text{ (m}^2\\text{)}',
      passesOrigin: true,
      originReason: 'يمر بأصل المحورين لأنه نظرياً عندما $r^2 = 0$ تكون السرعة الحدية $v = 0$.',
      slopeFormula: 'slope = Δv / Δ(r²)',
      slopeLatex: '\\text{slope} = \\frac{\\Delta v}{\\Delta(r^2)}',
      slopeUnit: '(m·s)⁻¹',
      slopeUnitLatex: '(\\text{m}\\cdot\\text{s})^{-1}',
      targetName: 'معامل اللزوجة (η)',
      targetFormula: 'η = (2/9) · (1 / slope) · g · (ρ_s - ρ_l)',
      targetFormulaLatex: '\\eta = \\frac{2}{9} \\left(\\frac{1}{\\text{slope}}\\right) g (\\rho_s - \\rho_l)',
      targetUnit: 'Pa·s',
      targetUnitLatex: '\\text{Pa}\\cdot\\text{s}',
      samplePoints: { x1: 3, y1: 0.032, x2: 8, y2: 0.083, xFactor: 1e-6, yFactor: 1 },
      expectedSlope: 10200,
      expectedTarget: 1.396,
      reportExampleNote: '$\\text{slope} = \\frac{0.083 - 0.032}{(8 - 3)\\times 10^{-6}} = 10200\\text{ (m}\\cdot\\text{s})^{-1}$، وبالتعويض نحصل على $\\eta = \\frac{2}{9}\\left(\\frac{1}{10200}\\right)(9.8)(7800 - 1260) \\approx 1.39\\text{ Pa}\\cdot\\text{s}$.'
    },
    precisionNote: 'تُضرب قراءات المحور السيني $\\Delta r^2$ في المعامل $10^{-6}$ للتحويل من $\\text{mm}^2$ إلى $\\text{m}^2$ عند حساب الميل؛ وإهمالها يغير الناتج بمعامل مليون.'
  },
  {
    id: 'forcetable',
    number: 5,
    kind: 'vector',
    title: 'طاولة القوى (Force Table)',
    shortTitle: 'طاولة القوى',
    badge: 'تحليل المتجهات',
    icon: 'vector',
    ...makeDriveVideo('1muNa4ov8Ck-yXV9al2KvV9nTVaxlWH29'),
    goal: 'تعيين محصلة قوتين مقداراً واتجاهاً بثلاث طرق: عملية، وبيانية، وتحليلية.',
    goalKeywords: ['محصلة قوتين', 'مقداراً واتجاهاً', 'ثلاث طرق'],
    theorySummary: [
      {
        title: 'الطريقة العملية (الاتزان على القرص)',
        body: 'تُعلق القوتان $F_1$ و $F_2$ عند الزاويتين $\\theta_1$ و $\\theta_2$، ثم نبحث عن القوة الثالثة الموازنة $F_3$ التي تجعل الحلقة تتمركز في وسط القرص تماماً. فتكون المحصلة مساوية لها مقداراً ومعاكسة لها بالاتجاه: $R = F_3$ و $\\theta_R = \\theta_3 - 180^\\circ - \\theta_1$.'
      },
      {
        title: 'الطريقتان البيانية والتحليلية',
        body: 'بيانياً نختار مقياس رسم مناسب (مثل $1\\text{ cm} = 25\\text{ gw}$) ونرسم المتجهين متتاليين. وتحليلياً نستخدم الزاوية المحصورة $\\theta = \\theta_2 - \\theta_1$ وقانون جيب التمام وقانون الظل:',
        formulaLatex: 'R = \\sqrt{F_1^2 + F_2^2 + 2 F_1 F_2 \\cos\\theta}, \\quad \\theta_R = \\tan^{-1}\\left(\\frac{F_2 \\sin\\theta}{F_1 + F_2 \\cos\\theta}\\right)'
      }
    ],
    mainFormulaLatex: 'R = \\sqrt{F_1^2 + F_2^2 + 2 F_1 F_2 \\cos\\theta}, \\quad \\theta_R = \\tan^{-1}\\left(\\frac{F_2 \\sin\\theta}{F_1 + F_2 \\cos\\theta}\\right)',
    mainFormulaText: 'العملية: R = F₃ و θ_R = θ₃ - 180° - θ₁ | التحليلية: قانون جيب التمام والظل',
    symbols: [
      { sym: 'F₁, F₂', symLatex: 'F_1, F_2', name: 'مقدار القوتين الأولى والثانية', unit: 'gw', unitLatex: '\\text{gw}' },
      { sym: 'θ₁, θ₂', symLatex: '\\theta_1, \\theta_2', name: 'زاوية القوة الأولى والثانية على القرص', unit: '°', unitLatex: '^\\circ' },
      { sym: 'θ', symLatex: '\\theta', name: 'الزاوية بين القوتين (θ₂ - θ₁)', unit: '°', unitLatex: '^\\circ' },
      { sym: 'F₃, θ₃', symLatex: 'F_3, \\theta_3', name: 'القوة الموازنة وزاويتها عملياً', unit: 'gw, °', unitLatex: '\\text{gw}, ^\\circ' },
      { sym: 'R, θ_R', symLatex: 'R, \\theta_R', name: 'مقدار المحصلة وزاويتها مع F₁', unit: 'gw, °', unitLatex: '\\text{gw}, ^\\circ' }
    ],
    givensOnExam: 'F₁ = 100 gw, θ₁ = 20°, F₂ = 150 gw, θ₂ = 80°',
    givensOnExamLatex: 'F_1 = 100 \\text{ gw}, \\; \\theta_1 = 20^\\circ, \\; F_2 = 150 \\text{ gw}, \\; \\theta_2 = 80^\\circ',
    practicalSteps: [
      'الطريقة العملية: نوازن الحلقة في المركز بوضع قوة ثالثة $F_3$ عند $\\theta_3$ ثم نحسب $\\theta_R = \\theta_3 - 180^\\circ - \\theta_1$.',
      'الطريقة التحليلية: نحسب $\\theta = \\theta_2 - \\theta_1$ ثم نعوض في قانون الجذر التربيعي لإيجاد $R$ و $\\tan^{-1}$ لإيجاد $\\theta_R$.',
      'الطريقة البيانية: بمقياس $1\\text{ cm} = 25\\text{ gw}$ نرسم $F_1$ بطول $4\\text{ cm}$ وزاوية $20^\\circ$ ومن رأسه $F_2$ بطول $6\\text{ cm}$ وزاوية $80^\\circ$ ثم نقيس سهم المحصلة.'
    ],
    tableConfig: {
      givenColumn: {
        header: 'المعطيات (F₁, θ₁, F₂, θ₂)',
        headerLatex: 'F_1, \\theta_1, F_2, \\theta_2',
        values: ['F₁ = 100 gw, θ₁ = 20°', 'F₂ = 150 gw, θ₂ = 80°']
      },
      missingColumns: [
        {
          id: 'c1',
          correctHeader: 'الطريقة العملية (F₃, θ₃ → R, θ_R)',
          headerLatex: '\\text{العملية: } R = F_3, \\; \\theta_R = \\theta_3 - 180^\\circ - \\theta_1',
          labelAr: 'نتائج الموازنة العملية',
          options: ['الطريقة العملية (F₃, θ₃ → R, θ_R)', 'W = mgs (J)', 'Δl_avg (m)', '1/l (cm⁻¹)'],
          sampleValues: ['F₃ = 220 gw, θ₃ = 237°', 'R = 220 gw, θ_R = 37°']
        },
        {
          id: 'c2',
          correctHeader: 'الطريقة الحسابية (R, θ_R)',
          headerLatex: '\\text{الحسابية: } R = \\sqrt{F_1^2 + F_2^2 + 2F_1F_2\\cos\\theta}',
          labelAr: 'نتائج القوانين التحليلية',
          options: ['الطريقة الحسابية (R, θ_R)', 'KE = ½Mv²', 'v = d/t', 't² (s²)'],
          sampleValues: ['θ = 80° - 20° = 60°', 'R = 217.94 gw, θ_R = 36.5°']
        },
        {
          id: 'c3',
          correctHeader: 'الطريقة البيانية (1cm = 25gw)',
          headerLatex: '\\text{البيانية: } 1\\text{ cm} = 25\\text{ gw}',
          labelAr: 'نتائج الرسم بالمسطرة والمنقلة',
          options: ['الطريقة البيانية (1cm = 25gw)', 'slope = Δy/Δx', 'P₀ = b/a', 'η (Pa·s)'],
          sampleValues: ['طول المحصلة = 8.8 cm', 'R = 8.8 × 25 = 220 gw, θ_R = 36°']
        }
      ],
      calcDrill: {
        question: 'إذا كانت $F_1 = 100\\text{ gw}$ عند $\\theta_1 = 20^\\circ$، و $F_2 = 150\\text{ gw}$ عند $\\theta_2 = 80^\\circ$ ($\\theta = 60^\\circ$)، فما مقدار المحصلة $R$ حسابياً بوحدة $\\text{gw}$؟',
        correctValue: 217.94,
        tolerance: 1.5,
        explanation: '$R = \\sqrt{100^2 + 150^2 + 2(100)(150)\\cos 60^\\circ} = \\sqrt{47500} \\approx 217.94\\text{ gw}$.'
      }
    },
    graph: {
      hasGraph: true,
      yAxis: 'تمثيل متجهات (1 cm = 25 gw)',
      yAxisLatex: '1\\text{ cm} = 25\\text{ gw}',
      xAxis: 'المحور الأفقي المرجعي (0°)',
      xAxisLatex: '\\text{المحور المرجعي } (0^\\circ)',
      passesOrigin: true,
      originReason: 'تبدأ طريقة المضلع برسم المتجه الأول $F_1$ من نقطة الأصل بزاوية $\\theta_1 = 20^\\circ$، ومن نهايته نرسم $F_2$ بزاوية $80^\\circ$.',
      slopeFormula: 'R = Length (cm) × Scale (25 gw/cm)',
      slopeLatex: 'R = \\text{Length (cm)} \\times 25\\text{ gw/cm}',
      slopeUnit: 'cm',
      slopeUnitLatex: '\\text{cm}',
      targetName: 'مقدار المحصلة (R)',
      targetFormula: 'R = Length × Scale , θ_R = θ_total - θ₁',
      targetFormulaLatex: 'R = \\text{Length} \\times \\text{Scale}, \\quad \\theta_R = \\theta_{\\text{total}} - \\theta_1',
      targetUnit: 'gw',
      targetUnitLatex: '\\text{gw}',
      samplePoints: { x1: 0, y1: 0, x2: 8.8, y2: 220, xFactor: 1, yFactor: 1, isVector: true },
      expectedSlope: 8.8,
      expectedTarget: 217.94,
      reportExampleNote: 'في التقرير: طول سهم المحصلة بالمسطرة $8.8\\text{ cm}$ وبضربه في مقياس الرسم نحصل على $R = 8.8 \\times 25 = 220\\text{ gw}$، والزاوية مع $F_1$ هي $\\theta_R = 56^\\circ - 20^\\circ = 36^\\circ$ مقارنة بـ $217.94\\text{ gw}$ و $36.5^\\circ$ حسابياً.',
      conceptualQ4Prompt: 'كيف يُرسم متجه القوة الثانية $F_2$ في الطريقة البيانية (رسم المتجهات)؟',
      conceptualQ4Correct: 'يُرسم من رأس المتجه الأول F₁ بزاوية θ₂ مع المحور الأفقي',
      conceptualQ4Distractors: [
        'يُرسم مباشرة من نقطة الأصل دون ربطه بنهاية F₁',
        'يُرسم عمودياً دائماً على محور الصادات',
        'تُجمع القوتان جبرياً دون اعتبار للزاوية'
      ],
      intermediateQ5Prompt: 'من الرسم البياني (بمقياس $1\\text{ cm} = 25\\text{ gw}$)، كم يبلغ طول سهم المحصلة $R$ بالمسطرة ($\\text{cm}$)؟',
      intermediateQ5CorrectVal: 8.8,
      intermediateQ5Tolerance: 0.3,
      intermediateQ5Unit: 'cm',
      intermediateQ5UnitLatex: '\\text{cm}'
    },
    precisionNote: 'تُقاس زاوية المحصلة $\\theta_R$ دائماً بالنسبة لاتجاه القوة الأولى $F_1$؛ لذلك عملياً $\\theta_R = \\theta_3 - 180^\\circ - \\theta_1$ وبيانياً $\\theta_R = \\theta_{\\text{total}} - \\theta_1$.'
  },
  {
    id: 'young',
    number: 6,
    kind: 'linear',
    title: "معامل يونج (Young's Modulus)",
    shortTitle: 'معامل يونج',
    badge: 'طريقة سريل',
    icon: 'ruler',
    ...makeDriveVideo('1pJQ5zLwImNckrozKW5Ad0uWTZA9mkZsL'),
    goal: 'تعيين معامل يونج ($Y$) لسلك معدني بطريقة سريل.',
    goalKeywords: ['معامل يونج', 'سلك معدني', 'سريل'],
    theorySummary: [
      {
        title: 'الإجهاد والانفعال ومعامل يونج',
        body: 'الإجهاد (Stress) هو القوة المؤثرة عمودياً على وحدة المساحات ($\\text{N/m}^2$). والانفعال (Strain) هو مقدار الاستطالة لوحدة الطول وهو كمية عديمة الوحدة؛ لذا فإن وحدة معامل يونج هي نفس وحدة الإجهاد ($\\text{N/m}^2$).'
      },
      {
        title: 'الصيغة الرياضية وطريقة سريل',
        body: 'نظراً لدقة الاستطالة في الأسلاك المعدنية يُستخدم المايكرومتر لقياس $\\Delta l$ ($\\times 10^{-5}\\text{ m}$):',
        formulaLatex: 'Y = \\frac{\\text{Stress}}{\\text{Strain}} = \\frac{F/A}{\\Delta l / L_0} = \\frac{Mg L_0}{\\Delta l \\cdot \\pi r^2} = \\frac{g L_0}{\\pi r^2 \\cdot \\text{slope}}'
      }
    ],
    mainFormulaLatex: 'Y = \\frac{M g L_0}{\\Delta l \\cdot \\pi r^2} \\implies Y = \\frac{g L_0}{\\pi r^2 \\cdot \\text{slope}}',
    mainFormulaText: 'Y = (m · g · L₀) / (Δl · π · r²)',
    symbols: [
      { sym: 'Y', symLatex: 'Y', name: 'معامل يونج للمادة', unit: 'N/m²', unitLatex: '\\text{N/m}^2' },
      { sym: 'L₀', symLatex: 'L_0', name: 'طول السلك الأصلي', unit: 'm', unitLatex: '\\text{m}' },
      { sym: 'r', symLatex: 'r', name: 'نصف قطر مقطع السلك (D/2)', unit: 'm', unitLatex: '\\text{m}' },
      { sym: 'M', symLatex: 'M', name: 'الكتلة المعلقة في السلك', unit: 'kg', unitLatex: '\\text{kg}' },
      { sym: 'Δl', symLatex: '\\Delta l', name: 'مقدار الاستطالة في السلك', unit: 'm', unitLatex: '\\text{m}' },
      { sym: 'g', symLatex: 'g', name: 'تسارع الجاذبية الأرضية (9.8)', unit: 'm/s²', unitLatex: '\\text{m/s}^2' }
    ],
    givensOnExam: 'L₀ = 90 cm = 0.90 m, D = 0.7 mm ⇒ r = 0.35 × 10⁻³ m, g = 9.8 m/s²',
    givensOnExamLatex: 'L_0 = 0.90 \\text{ m}, \\; D = 0.7 \\text{ mm} \\implies r = 0.35 \\times 10^{-3} \\text{ m}, \\; g = 9.8 \\text{ m/s}^2',
    practicalSteps: [
      'نقيس طول السلك الأصلي $L_0$ بالمتر وقطره $D$ بالمايكرومتر ونقسم على 2 لإيجاد $r$ ($\\times 10^{-3}\\text{ m}$).',
      'نعلق الكتل $M$ (من $1\\text{ kg}$ إلى $6\\text{ kg}$) ونضبط فقاعة ميزان التسوية لقياس $\\Delta l_{\\text{inc}}$ بوحدة $\\times 10^{-5}\\text{ m}$.',
      'ننقص الكتل ونسجل $\\Delta l_{\\text{dec}}$ ثم نحسب المتوسط $\\Delta l_{\\text{avg}} \\times 10^{-5}\\text{ m}$.'
    ],
    tableConfig: {
      givenColumn: {
        header: 'M (kg)',
        headerLatex: 'M \\text{ (kg)}',
        values: ['1', '2', '3', '4', '5', '6']
      },
      missingColumns: [
        {
          id: 'c1',
          correctHeader: 'Δl_inc × 10⁻⁵ (m)',
          headerLatex: '\\Delta l_{\\text{inc}} \\times 10^{-5} \\text{ (m)}',
          labelAr: 'الاستطالة عند زيادة الأثقال',
          options: ['Δl_inc × 10⁻⁵ (m)', 'Δl_inc (m) × 10⁻²', 'W = mgs (J)', 't₁ (s)'],
          sampleValues: ['11', '21', '33', '42', '51', '62']
        },
        {
          id: 'c2',
          correctHeader: 'Δl_dec × 10⁻⁵ (m)',
          headerLatex: '\\Delta l_{\\text{dec}} \\times 10^{-5} \\text{ (m)}',
          labelAr: 'الاستطالة عند إنقاص الأثقال',
          options: ['Δl_dec × 10⁻⁵ (m)', 'v = 2s/t (m/s)', 'l = |A - X| (cm)', 'r² × 10⁻⁶'],
          sampleValues: ['9', '20', '30', '40', '49', '62']
        },
        {
          id: 'c3',
          correctHeader: 'Δl_avg × 10⁻⁵ (m)',
          headerLatex: '\\Delta l_{\\text{avg}} \\times 10^{-5} \\text{ (m)}',
          labelAr: 'متوسط الاستطالة',
          options: ['Δl_avg × 10⁻⁵ (m)', 'KE × 10⁻³ (J)', '1/l × 10⁻²', 't² × 10⁻² (s²)'],
          sampleValues: ['10', '20.5', '31.5', '41', '50', '62']
        }
      ],
      calcDrill: {
        question: 'إذا كان $L_0 = 0.90\\text{ m}$، ونصف القطر $r = 0.35 \\times 10^{-3}\\text{ m}$، والميل $\\text{slope} = 1.025 \\times 10^{-4}\\text{ m/kg}$، فكم قيمة معامل يونج $Y$ بوحدة ($\\times 10^{11}\\text{ N/m}^2$)؟',
        correctValue: 2.23,
        tolerance: 0.1,
        explanation: '$Y = \\frac{9.8 \\times 0.90}{\\pi \\times (0.35 \\times 10^{-3})^2 \\times (1.025 \\times 10^{-4})} \\approx 2.23 \\times 10^{11}\\text{ N/m}^2$.'
      }
    },
    graph: {
      hasGraph: true,
      yAxis: 'Δl × 10⁻⁵ (m)',
      yAxisLatex: '\\Delta l \\times 10^{-5} \\text{ (m)}',
      xAxis: 'M (kg)',
      xAxisLatex: 'M \\text{ (kg)}',
      passesOrigin: true,
      originReason: 'يمر بأصل المحورين لأنه منطقياً عند عدم تعليق كتلة ($M = 0$) لا توجد استطالة في السلك ($\\Delta l = 0$).',
      slopeFormula: 'slope = Δ(Δl) / ΔM',
      slopeLatex: '\\text{slope} = \\frac{\\Delta(\\Delta l)}{\\Delta M}',
      slopeUnit: 'm/kg',
      slopeUnitLatex: '\\text{m/kg}',
      targetName: 'معامل يونج (Y)',
      targetFormula: 'Y = (g · L₀) / (π · r² · slope)',
      targetFormulaLatex: 'Y = \\frac{g L_0}{\\pi r^2 \\cdot \\text{slope}}',
      targetUnit: 'N/m²',
      targetUnitLatex: '\\text{N/m}^2',
      samplePoints: { x1: 1.5, y1: 15, x2: 5.5, y2: 56, xFactor: 1, yFactor: 1e-5 },
      expectedSlope: 0.0001025,
      expectedTarget: 2.23e11,
      reportExampleNote: '$\\text{slope} = \\frac{(56 - 15)\\times 10^{-5}}{5.5 - 1.5} = 1.025 \\times 10^{-4}\\text{ m/kg}$. وبالتعويض مع $L_0 = 90\\times 10^{-2}\\text{ m}$ و $r = 0.35\\times 10^{-3}\\text{ m}$ نحصل على $Y = 2.23 \\times 10^{11}\\text{ N/m}^2$.'
    },
    precisionNote: 'ثلاث تحويلات أساسية: الاستطالة $\\Delta l \\times 10^{-5}\\text{ m}$، طول السلك $L_0 \\times 10^{-2}\\text{ m}$، ونصف القطر $r = \\frac{D}{2} \\times 10^{-3}\\text{ m}$ مع تربيعه في المقام $r^2$.'
  },
  {
    id: 'airtrack',
    number: 7,
    kind: 'linear',
    title: 'العربة الهوائية (Air Track)',
    shortTitle: 'العربة الهوائية',
    badge: 'مردود الطاقة',
    icon: 'airtrack',
    ...makeDriveVideo('13tm0T5POl2eoLT-z2m66z3kxfJIM2iAB'),
    goal: '1) إيجاد مردود الطاقة من خلال تحويل الشغل المبذول بفعل الجاذبية إلى طاقة حركية. 2) إيجاد النسبة المئوية للطاقة المفقودة.',
    goalKeywords: ['مردود الطاقة', 'الشغل المبذول', 'الطاقة المفقودة'],
    theorySummary: [
      {
        title: 'حساب السرعة النهائية والطاقة الحركية',
        body: 'تنطلق العربة من السكون ($v_0 = 0$) بتسارع منتظم؛ لذا فإن السرعة النهائية تساوي ضعف السرعة المتوسطة: $v = \\frac{2s}{t_{\\text{avg}}}$. كما نستخدم كتلة العربة $M$ (وليس الكتلة المعلقة $m$) عند حساب $KE$.',
        formulaLatex: 'W = mgs, \\quad v = \\frac{2s}{t_{\\text{avg}}}, \\quad KE = \\frac{1}{2} M v^2'
      },
      {
        title: 'لماذا الميل دائماً أقل من 1؟',
        body: 'ميل الخط ($\\frac{\\Delta KE}{\\Delta W}$) يمثل كفاءة (مردود) تحويل الطاقة، ويستحيل عملياً أن يساوي أو يتجاوز 1؛ لأن جزءاً من الطاقة يُفقد بسبب الاحتكاك المتبقي ومقاومة الهواء.'
      }
    ],
    mainFormulaLatex: 'W = m g s, \\quad v = \\frac{2s}{t_{\\text{avg}}}, \\quad KE = \\frac{1}{2} M v^2',
    mainFormulaText: 'W = m·g·s  ,  v = 2s / t_avg  ,  KE = ½ M v²',
    symbols: [
      { sym: 'W', symLatex: 'W', name: 'الشغل المبذول بفعل الجاذبية', unit: 'J', unitLatex: '\\text{J}' },
      { sym: 'm', symLatex: 'm', name: 'الكتلة المعلقة على البكرة', unit: 'kg', unitLatex: '\\text{kg}' },
      { sym: 'M', symLatex: 'M', name: 'كتلة العربة الهوائية', unit: 'kg', unitLatex: '\\text{kg}' },
      { sym: 's', symLatex: 's', name: 'الإزاحة التي تقطعها العربة', unit: 'm', unitLatex: '\\text{m}' },
      { sym: 't', symLatex: 't', name: 'الزمن المستغرق لقطع الإزاحة', unit: 's', unitLatex: '\\text{s}' },
      { sym: 'v', symLatex: 'v', name: 'السرعة النهائية للعربة (2s/t)', unit: 'm/s', unitLatex: '\\text{m/s}' },
      { sym: 'KE', symLatex: 'KE', name: 'الطاقة الحركية المكتسبة للعربة', unit: 'J', unitLatex: '\\text{J}' }
    ],
    givensOnExam: 'g = 9.8 m/s², M = 303 × 10⁻³ kg (أو 235 g في النموذج), s = 1 m',
    givensOnExamLatex: 'g = 9.8 \\text{ m/s}^2, \\; M = 303 \\times 10^{-3} \\text{ kg}, \\; s = 1 \\text{ m}',
    practicalSteps: [
      'نثبت المسافة $s = 1\\text{ m}$ ونسجل كتلة العربة $M$ بالكيلوغرام ($303 \\times 10^{-3}\\text{ kg}$ في التقرير، أو $235\\text{ g}$ في نموذج الاختبار).',
      'نعلق الكتل $m$ (من $20\\text{ g}$ إلى $60\\text{ g}$) ونحسب الشغل المبذول $W = mgs$ ($\\times 10^{-3}\\text{ J}$).',
      'نسجل زمن الحركة 3 مرات ($t_1, t_2, t_3$) ونوجد $t_{\\text{avg}}$ ثم السرعة $v = \\frac{2s}{t_{\\text{avg}}}$ ثم الطاقة الحركية $KE = \\frac{1}{2} M v^2$.'
    ],
    tableConfig: {
      givenColumn: {
        header: 'm (kg) × 10⁻³',
        headerLatex: 'm \\times 10^{-3} \\text{ (kg)}',
        values: ['20', '30', '40', '50', '60']
      },
      missingColumns: [
        {
          id: 'c1',
          correctHeader: 'W = mgs × 10⁻³ (J)',
          headerLatex: 'W = m g s \\times 10^{-3} \\text{ (J)}',
          labelAr: 'الشغل المبذول',
          options: ['W = mgs × 10⁻³ (J)', 'Δl_inc (m)', 'h = |Y - X| (cmHg)', 'r² × 10⁻⁶ (m²)'],
          sampleValues: ['196', '294', '392', '490', '588']
        },
        {
          id: 'c2',
          correctHeader: 't₁, t₂, t₃ (s)',
          headerLatex: 't_1, t_2, t_3 \\text{ (s)}',
          labelAr: 'الأزمنة الثلاثة',
          options: ['t₁, t₂, t₃ (s)', 'Δl_dec (m)', '1/l (cm⁻¹)', '1/f (s)'],
          sampleValues: ['2.22, 2.21, 2.19', '1.83, 1.83, 1.81', '1.60, 1.60, 1.58', '1.46, 1.46, 1.44', '1.33, 1.33, 1.32']
        },
        {
          id: 'c3',
          correctHeader: 't_avg (s)',
          headerLatex: 't_{\\text{avg}} \\text{ (s)}',
          labelAr: 'متوسط الزمن',
          options: ['t_avg (s)', 't² (s²)', 'l = |A - X| (cm)', 'v = d/t (m/s)'],
          sampleValues: ['2.20', '1.82', '1.59', '1.45', '1.32']
        },
        {
          id: 'c4',
          correctHeader: 'v = 2s / t_avg (m/s)',
          headerLatex: 'v = \\frac{2s}{t_{\\text{avg}}} \\text{ (m/s)}',
          labelAr: 'السرعة النهائية للعربة',
          options: ['v = 2s / t_avg (m/s)', 'v = s / t_avg (m/s)', 'W = Fs (J)', 'Δl_avg (m)'],
          sampleValues: ['0.90', '1.09', '1.25', '1.37', '1.51']
        },
        {
          id: 'c5',
          correctHeader: 'KE = ½ M v² × 10⁻³ (J)',
          headerLatex: 'KE = \\frac{1}{2} M v^2 \\times 10^{-3} \\text{ (J)}',
          labelAr: 'الطاقة الحركية للعربة',
          options: ['KE = ½ M v² × 10⁻³ (J)', 'KE = ½ m v² (J)', 'P₀ (cmHg)', 'Y (N/m²)'],
          sampleValues: ['122', '179', '236', '284', '345']
        }
      ],
      calcDrill: {
        question: 'إذا كانت الإزاحة $s = 1\\text{ m}$، ومتوسط الزمن $t_{\\text{avg}} = 1.60\\text{ s}$، فما السرعة النهائية للعربة $v$ (بوحدة $\\text{m/s}$)؟',
        correctValue: 1.25,
        tolerance: 0.03,
        explanation: 'لأن العربة تتسارع بانتظام من السكون فإن $v = \\frac{2s}{t_{\\text{avg}}} = \\frac{2 \\times 1}{1.60} = 1.25\\text{ m/s}$.'
      }
    },
    graph: {
      hasGraph: true,
      yAxis: 'KE × 10⁻³ (J)',
      yAxisLatex: 'KE \\times 10^{-3} \\text{ (J)}',
      xAxis: 'W × 10⁻³ (J)',
      xAxisLatex: 'W \\times 10^{-3} \\text{ (J)}',
      passesOrigin: true,
      originReason: 'يمر بأصل المحورين لأنه عند عدم بذل شغل ($W = 0$) لا تكتسب العربة طاقة حركية ($KE = 0$)، والميل دائماً أقل من $1$.',
      slopeFormula: 'slope = ΔKE / ΔW',
      slopeLatex: '\\text{slope} = \\frac{\\Delta KE}{\\Delta W}',
      slopeUnit: 'ليس له وحدة (J / J)',
      slopeUnitLatex: '\\text{عديم الوحدة } (\\text{J/J})',
      targetName: 'النسبة المئوية للطاقة المفقودة (Lost Energy %)',
      targetFormula: 'Lost Energy % = (1 - slope) × 100%',
      targetFormulaLatex: '\\text{Lost Energy \\%} = (1 - \\text{slope}) \\times 100\\%',
      targetUnit: '%',
      targetUnitLatex: '\\%',
      samplePoints: { x1: 275, y1: 160, x2: 575, y2: 340, xFactor: 1e-3, yFactor: 1e-3 },
      expectedSlope: 0.6,
      expectedTarget: 40,
      reportExampleNote: '$\\text{slope} = \\frac{340 - 160}{575 - 275} = \\frac{180}{300} = 0.6$ (يمثل مردود الطاقة $60\\%$). ومنه $\\text{Lost Energy \\%} = (1 - 0.6)\\times 100\\% = 40\\%$.'
    },
    precisionNote: 'ثلاث قواعد جوهرية: $v = \\frac{2s}{t_{\\text{avg}}}$ (معامل 2 للتسارع من السكون)، استخدام كتلة العربة $M$ في حساب $KE$، وميل المنحنى عديم الوحدة لأن المحورين بوحدة الجول.'
  },
  {
    id: 'specificheat',
    number: 8,
    kind: 'calorimetry',
    title: 'الحرارة النوعية (Specific Heat)',
    shortTitle: 'الحرارة النوعية',
    badge: 'التوازن الحراري',
    icon: 'flame',
    ...makeDriveVideo('1RtuDZgdGOQBagU5YB6JxraWyohhQQRo4'),
    goal: 'إيجاد الحرارة النوعية ($C_b$) لكرة صلبة باستخدام المسعر الحراري.',
    goalKeywords: ['الحرارة النوعية', 'كرة صلبة', 'المسعر'],
    theorySummary: [
      {
        title: 'تعريف الحرارة النوعية',
        body: 'الحرارة النوعية لمادة هي كمية الحرارة اللازمة لرفع درجة حرارة وحدة الكتلة ($1\\text{ kg}$) منها بمقدار درجة مئوية واحدة (أو كلفن واحد)، ووحدتها الدولية $\\text{J/(kg}\\cdot\\text{K)}$.'
      },
      {
        title: 'مبدأ التوازن الحراري في المسعر المعزول',
        body: 'كمية الحرارة المفقودة من الجسم الحار (الكرة المسخنة إلى $T_2$) تساوي كمية الحرارة المكتسبة بواسطة الجسم البارد (الماء والمسعر عند $T_1$) عند الوصول لدرجة التوازن $T_f$:',
        formulaLatex: '\\Delta Q_b = \\Delta Q_w + \\Delta Q_c \\implies m_b C_b (T_2 - T_f) = (m_w C_w + m_c C_c)(T_f - T_1)'
      }
    ],
    mainFormulaLatex: 'Q = m C \\Delta T \\implies C_b = \\frac{(m_w C_w + m_c C_c)(T_f - T_1)}{m_b (T_2 - T_f)}',
    mainFormulaText: 'C_b = ((m_w·C_w + m_c·C_c)(T_f - T₁)) / (m_b·(T₂ - T_f))',
    symbols: [
      { sym: 'm_b', symLatex: 'm_b', name: 'كتلة الكرة الصلبة', unit: 'kg', unitLatex: '\\text{kg}', sampleVal: '62 g (62×10⁻³ kg)' },
      { sym: 'm_c', symLatex: 'm_c', name: 'كتلة المسعر فارغاً', unit: 'kg', unitLatex: '\\text{kg}', sampleVal: '100 g (100×10⁻³ kg)' },
      { sym: 'm_cw', symLatex: 'm_{cw}', name: 'كتلة المسعر والماء معاً', unit: 'kg', unitLatex: '\\text{kg}', sampleVal: '140 g' },
      { sym: 'm_w', symLatex: 'm_w', name: 'كتلة الماء (m_cw - m_c)', unit: 'kg', unitLatex: '\\text{kg}', sampleVal: '40 g (40×10⁻³ kg)' },
      { sym: 'C_w', symLatex: 'C_w', name: 'الحرارة النوعية للماء', unit: 'J/(kg·K)', unitLatex: '\\text{J/(kg}\\cdot\\text{K)}', sampleVal: '4180' },
      { sym: 'C_c', symLatex: 'C_c', name: 'الحرارة النوعية لمادة المسعر', unit: 'J/(kg·K)', unitLatex: '\\text{J/(kg}\\cdot\\text{K)}', sampleVal: '906' },
      { sym: 'T₁', symLatex: 'T_1', name: 'درجة الحرارة الابتدائية للماء والمسعر', unit: '°C', unitLatex: '^\\circ\\text{C}', sampleVal: '22 °C' },
      { sym: 'T₂', symLatex: 'T_2', name: 'درجة حرارة الكرة بعد التسخين', unit: '°C', unitLatex: '^\\circ\\text{C}', sampleVal: '97 °C' },
      { sym: 'T_f', symLatex: 'T_f', name: 'درجة الحرارة النهائية بعد الخلط (التوازن)', unit: '°C', unitLatex: '^\\circ\\text{C}', sampleVal: '29 °C' },
      { sym: 'C_b', symLatex: 'C_b', name: 'الحرارة النوعية للكرة (المطلوب)', unit: 'J/(kg·K)', unitLatex: '\\text{J/(kg}\\cdot\\text{K)}', sampleVal: '428.03' }
    ],
    givensOnExam: 'C_w = 4180 J/(kg·K), C_c = 906 J/(kg·K), m_b = 62 g, m_c = 100 g, m_cw = 140 g, T₁ = 22 °C, T₂ = 97 °C, T_f = 29 °C',
    givensOnExamLatex: 'C_w = 4180\\text{ J/(kg}\\cdot\\text{K)}, \\; C_c = 906\\text{ J/(kg}\\cdot\\text{K)}',
    practicalSteps: [
      'نزن المسعر فارغاً ($m_c = 100\\text{ g}$) ثم نضيف ماءً ونزن المسعر مع الماء ($m_{cw} = 140\\text{ g}$) لنستنتج كتلة الماء $m_w = m_{cw} - m_c = 40\\text{ g}$.',
      'نقيس درجة الحرارة الابتدائية للماء والمسعر ($T_1 = 22^\\circ\\text{C}$).',
      'نسخن الكرة ($m_b = 62\\text{ g}$) في حمام مائي مغلي حتى تستقر عند $T_2 = 97^\\circ\\text{C}$ ثم ننقلها بسرعة إلى المسعر.',
      'نحرك الماء بهدوء ونسجل أعلى درجة حرارة يتوازن عندها النظام ($T_f = 29^\\circ\\text{C}$) ثم نعوض في قانون الاتزان.'
    ],
    tableConfig: {
      givenColumn: {
        header: 'الرمز الفيزيائي',
        headerLatex: '\\text{الكمية والرمز}',
        values: ['m_b (كتلة الكرة)', 'm_c (كتلة المسعر)', 'm_cw (المسعر والماء)', 'm_w (كتلة الماء)', 'T₁ / T₂ / T_f (°C)']
      },
      missingColumns: [
        {
          id: 'c1',
          correctHeader: 'm_w = m_cw - m_c | تحويل الكتل × 10⁻³ (kg)',
          headerLatex: 'm_w = m_{cw} - m_c \\; (\\times 10^{-3}\\text{ kg})',
          labelAr: 'استنتاج كتلة الماء وتحويل الوحدات',
          options: ['m_w = m_cw - m_c | تحويل الكتل × 10⁻³ (kg)', 'v = 2s / t_avg (m/s)', '1/l × 10⁻² (cm⁻¹)', 'r² × 10⁻⁶ (m²)'],
          sampleValues: ['62 × 10⁻³ kg', '100 × 10⁻³ kg', '140 × 10⁻³ kg', '140 - 100 = 40 g', '22 / 97 / 29 °C']
        },
        {
          id: 'c2',
          correctHeader: 'C_b (J/(kg·K))',
          headerLatex: 'C_b \\text{ (J/(kg}\\cdot\\text{K))}',
          labelAr: 'الحرارة النوعية للكرة ووحدتها',
          options: ['C_b (J/(kg·K))', 'J (J/cal)', 'k (N/m)', 'η (Pa·s)'],
          sampleValues: ['C_w = 4180 J/(kg·K)', 'C_c = 906 J/(kg·K)', 'ΔT_w = 7 °C', 'ΔT_b = 68 °C', 'C_b = 428.03 J/(kg·K)']
        }
      ],
      calcDrill: {
        question: 'بالتعويض في بيانات التقرير: $m_w = 40\\text{ g}, \\; m_c = 100\\text{ g}, \\; m_b = 62\\text{ g}, \\; C_w = 4180, \\; C_c = 906, \\; T_1 = 22^\\circ\\text{C}, \\; T_2 = 97^\\circ\\text{C}, \\; T_f = 29^\\circ\\text{C}$، احسب $C_b$ بوحدة $\\text{J/(kg}\\cdot\\text{K)}$:',
        correctValue: 428.03,
        tolerance: 2.0,
        explanation: '$C_b = \\frac{(40\\times 10^{-3}\\times 4180 + 100\\times 10^{-3}\\times 906)(29 - 22)}{62\\times 10^{-3}(97 - 29)} = \\frac{257.8 \\times 7}{0.062 \\times 68} = \\frac{1804.6}{4.216} \\approx 428.04\\text{ J/(kg}\\cdot\\text{K)}$.'
      }
    },
    graph: {
      hasGraph: false,
      yAxis: 'لا يوجد رسم بياني (توازن حراري)',
      yAxisLatex: '\\text{حساب مباشر (بدون رسم)}',
      xAxis: 'ΔQ_b = ΔQ_w + ΔQ_c',
      xAxisLatex: '\\Delta Q_b = \\Delta Q_w + \\Delta Q_c',
      passesOrigin: true,
      originReason: 'هذه التجربة تعتمد على جدول القراءات والتوازن الحراري المباشر دون رسم بياني.',
      slopeFormula: 'ΔQ = m · C · ΔT',
      slopeLatex: '\\Delta Q = m C \\Delta T',
      slopeUnit: 'J',
      slopeUnitLatex: '\\text{J}',
      targetName: 'الحرارة النوعية للكرة (C_b)',
      targetFormula: 'C_b = ((m_w·C_w + m_c·C_c)(T_f - T₁)) / (m_b·(T₂ - T_f))',
      targetFormulaLatex: 'C_b = \\frac{(m_w C_w + m_c C_c)(T_f - T_1)}{m_b(T_2 - T_f)}',
      targetUnit: 'J/(kg·K)',
      targetUnitLatex: '\\text{J/(kg}\\cdot\\text{K)}',
      samplePoints: { x1: 22, y1: 29, x2: 97, y2: 428, xFactor: 1, yFactor: 1 },
      expectedSlope: 1804.6,
      expectedTarget: 428.03,
      reportExampleNote: 'في التقرير المحلول: $m_w = 140 - 100 = 40\\text{ g}$، وبتحويل جميع الكتل إلى $\\text{kg}$ ($\\times 10^{-3}$): $C_b = \\frac{(0.04\\times 4180 + 0.1\\times 906)(29 - 22)}{0.062\\times (97 - 29)} = 428.03\\text{ J/(kg}\\cdot\\text{K)}$.',
      conceptualQ4Prompt: 'ما المبدأ الفيزيائي الذي تُبنى عليه معادلة تجربة الحرارة النوعية داخل المسعر؟',
      conceptualQ4Correct: 'مبدأ التوازن الحراري: الحرارة المفقودة من الكرة تساوي الحرارة المكتسبة للماء والمسعر',
      conceptualQ4Distractors: [
        'تناسب الحجم عكسياً مع الضغط عند ثبوت الحرارة',
        'قانون ستوكس لتوازن القوى اللزجة في السائل',
        'تحويل الطاقة الكهربائية بالكامل إلى طاقة حركية'
      ],
      intermediateQ5Prompt: 'احسب فرق درجة الحرارة الذي اكتسبه الماء والمسعر $\\Delta T_w = T_f - T_1$ (بوحدة $^\\circ\\text{C}$):',
      intermediateQ5CorrectVal: 7,
      intermediateQ5Tolerance: 0.1,
      intermediateQ5Unit: '°C',
      intermediateQ5UnitLatex: '^\\circ\\text{C}'
    },
    precisionNote: 'يُلاحظ أن الفرق $(T_f - T_1)$ بالكلفن يساوي الفرق بالدرجة المئوية تماماً؛ لأن التدرجين متساويان في المقدار ($1\\text{ K} = 1^\\circ\\text{C}$ في فروق الحرارة).'
  },
  {
    id: 'joule',
    number: 9,
    kind: 'calorimetry',
    title: 'مكافئ جول (Joule’s Equivalent)',
    shortTitle: 'مكافئ جول',
    badge: 'حفظ الطاقة الحرارية',
    icon: 'zap',
    ...makeDriveVideo('1sNF2JUqokEgXeXPCWRF0U23WOmhhEruc'),
    goal: 'تعيين قيمة مكافئ جول ($J$) باستخدام مبدأ حفظ الطاقة.',
    goalKeywords: ['مكافئ جول', 'حفظ الطاقة'],
    theorySummary: [
      {
        title: 'العلاقة بين الجول والسعر الحراري (الكالوري)',
        body: 'تقاس الطاقة الكهربائية والميكانيكية بوحدة الجول ($\\text{J}$)، بينما تقاس الطاقة الحرارية أحياناً بوحدة السعر الحراري الكالوري ($\\text{cal}$). ويمثل مكافئ جول نسبة الطاقة الكهربائية المطبقة بوحدة الجول إلى الطاقة الحرارية الناتجة بوحدة السعر (والقيمة المعيارية $\\approx 4.18\\text{ J/cal}$، أي $1\\text{ kcal} = 4.18\\text{ kJ}$).'
      },
      {
        title: 'معادلة حفظ الطاقة في المسعر الكهربائي',
        body: 'تتحول الطاقة الكهربائية المبذولة على ملف التسخين ($W = I V t$) إلى طاقة حرارية تسخن الماء والمسعر والملف والمحرك:',
        formulaLatex: 'J = \\frac{W}{Q} = \\frac{I V t}{(m_w C_w + M_c + M_s)(T_f - T_i)}'
      }
    ],
    mainFormulaLatex: 'J = \\frac{W}{Q} = \\frac{I V t}{(m_w C_w + M_c + M_s)(T_f - T_i)}',
    mainFormulaText: 'J = (I · V · t) / ((m_w·C_w + M_c + M_s)(T_f - T_i))',
    symbols: [
      { sym: 'I', symLatex: 'I', name: 'شدة التيار الكهربائي المار في ملف التسخين', unit: 'A', unitLatex: '\\text{A}', sampleVal: '1.95 A' },
      { sym: 'V', symLatex: 'V', name: 'فرق الجهد بين طرفي الملف', unit: 'V', unitLatex: '\\text{V}', sampleVal: '4 V' },
      { sym: 't', symLatex: 't', name: 'زمن التسخين الكهربائي', unit: 's', unitLatex: '\\text{s}', sampleVal: '480 s' },
      { sym: 'm_c', symLatex: 'm_c', name: 'كتلة المسعر فارغاً', unit: 'g', unitLatex: '\\text{g}', sampleVal: '242 g' },
      { sym: 'm_cw', symLatex: 'm_{cw}', name: 'كتلة المسعر والماء معاً', unit: 'g', unitLatex: '\\text{g}', sampleVal: '406.2 g' },
      { sym: 'm_w', symLatex: 'm_w', name: 'كتلة الماء (m_cw - m_c)', unit: 'g', unitLatex: '\\text{g}', sampleVal: '164.2 g' },
      { sym: 'C_w', symLatex: 'C_w', name: 'الحرارة النوعية للماء', unit: 'cal/(g·°C)', unitLatex: '\\text{cal/(g}\\cdot^\\circ\\text{C)}', sampleVal: '1' },
      { sym: 'M_c', symLatex: 'M_c', name: 'المكافئ المائي للمسعر', unit: 'cal/°C', unitLatex: '\\text{cal/}^\\circ\\text{C}', sampleVal: '24' },
      { sym: 'M_s', symLatex: 'M_s', name: 'المكافئ المائي للمحرك والملف', unit: 'cal/°C', unitLatex: '\\text{cal/}^\\circ\\text{C}', sampleVal: '3.9' },
      { sym: 'T_i / T_f', symLatex: 'T_i, T_f', name: 'درجة الحرارة الابتدائية والنهائية للنظام', unit: '°C', unitLatex: '^\\circ\\text{C}', sampleVal: '18.6°C → 23.6°C' },
      { sym: 'J', symLatex: 'J', name: 'مكافئ جول الميكانيكي للحرارة', unit: 'J/cal', unitLatex: '\\text{J/cal}', sampleVal: '3.89 - 3.90' }
    ],
    givensOnExam: 'I = 1.95 A, V = 4 V, t = 480 s, m_c = 242 g, m_cw = 406.2 g, C_w = 1 cal/(g·°C), M_c = 24 cal/°C, M_s = 3.9 cal/°C, T_i = 18.6 °C, T_f = 23.6 °C',
    givensOnExamLatex: 'I = 1.95\\text{ A}, \\; V = 4\\text{ V}, \\; t = 480\\text{ s}, \\; M_c = 24\\text{ cal/}^\\circ\\text{C}, \\; M_s = 3.9\\text{ cal/}^\\circ\\text{C}',
    practicalSteps: [
      'نزن المسعر فارغاً ($m_c = 242\\text{ g}$) ثم مع الماء ($m_{cw} = 406.2\\text{ g}$) لنحسب كتلة الماء $m_w = 164.2\\text{ g}$.',
      'نسجل درجة الحرارة الابتدائية $T_i = 18.6^\\circ\\text{C}$، ثم نغلق الدائرة ونضبط التيار $I = 1.95\\text{ A}$ والجهد $V = 4\\text{ V}$.',
      'نحرك الماء باستمرار لمدة $t = 480\\text{ s}$ (8 دقائق) ثم نفصل التيار ونسجل درجة الحرارة النهائية $T_f = 23.6^\\circ\\text{C}$.',
      'نحسب الشغل الكهربائي $W = IVt$ (بالجول) والطاقة الحرارية $Q$ (بالكالوري) ثم نقسم $\\frac{W}{Q}$.'
    ],
    tableConfig: {
      givenColumn: {
        header: 'المعطيات والكميات',
        headerLatex: '\\text{الكميات الكهربائية والحرارية}',
        values: ['I, V, t (التيار والجهد والزمن)', 'm_c , m_cw (كتلة المسعر والماء)', 'm_w = m_cw - m_c', 'C_w, M_c, M_s', 'T_i → T_f (°C)']
      },
      missingColumns: [
        {
          id: 'c1',
          correctHeader: 'm_w = m_cw - m_c (g) | W = IVt (J)',
          headerLatex: 'm_w = m_{cw} - m_c \\text{ (g)} \\; | \\; W = IVt \\text{ (J)}',
          labelAr: 'حساب كتلة الماء والشغل الكهربائي',
          options: ['m_w = m_cw - m_c (g) | W = IVt (J)', 'v = 2s / t_avg (m/s)', '1/l × 10⁻² (cm⁻¹)', 'Δl_avg × 10⁻⁵ (m)'],
          sampleValues: ['1.95 A, 4 V, 480 s', '242 g , 406.2 g', '164.2 g', '1, 24, 3.9 cal/°C', '18.6 → 23.6 °C']
        },
        {
          id: 'c2',
          correctHeader: 'J = W / Q (J/cal)',
          headerLatex: 'J = \\frac{W}{Q} \\text{ (J/cal)}',
          labelAr: 'مكافئ جول ووحدته النهائية',
          options: ['J = W / Q (J/cal)', 'C_b (J/(kg·K))', 'k (N/m)', 'v (m/s)'],
          sampleValues: ['W = 3744 J', 'Δm = 164.2 g', 'Q = 960.5 cal', 'ΔT = 5.0 °C', 'J = 3.89 J/cal']
        }
      ],
      calcDrill: {
        question: 'بالتعويض في قراءات التقرير: $I = 1.95\\text{ A}, \\; V = 4\\text{ V}, \\; t = 480\\text{ s}, \\; m_w = 164.2\\text{ g}, \\; C_w = 1, \\; M_c = 24, \\; M_s = 3.9, \\; T_i = 18.6^\\circ\\text{C}, \\; T_f = 23.6^\\circ\\text{C}$، احسب $J$ بوحدة $\\text{J/cal}$:',
        correctValue: 3.90,
        tolerance: 0.08,
        explanation: 'الشغل الكهربائي $W = 1.95\\times 4\\times 480 = 3744\\text{ J}$، والحرارة $Q = (164.2\\times 1 + 24 + 3.9)(23.6 - 18.6) = 960.5\\text{ cal}$، ومنها $J = \\frac{3744}{960.5} \\approx 3.90\\text{ J/cal}$.'
      }
    },
    graph: {
      hasGraph: false,
      yAxis: 'لا يوجد رسم بياني (حفظ الطاقة)',
      yAxisLatex: '\\text{حساب مباشر (بدون رسم)}',
      xAxis: 'J = W / Q',
      xAxisLatex: 'J = \\frac{W}{Q}',
      passesOrigin: true,
      originReason: 'هذه التجربة تعتمد على جدول القراءات والتطبيق المباشر لمبدأ حفظ الطاقة دون رسم بياني.',
      slopeFormula: 'W = I · V · t',
      slopeLatex: 'W = I \\cdot V \\cdot t',
      slopeUnit: 'J',
      slopeUnitLatex: '\\text{J}',
      targetName: 'مكافئ جول (J)',
      targetFormula: 'J = (I · V · t) / ((m_w·C_w + M_c + M_s)(T_f - T_i))',
      targetFormulaLatex: 'J = \\frac{IVt}{(m_w C_w + M_c + M_s)(T_f - T_i)}',
      targetUnit: 'J/cal',
      targetUnitLatex: '\\text{J/cal}',
      samplePoints: { x1: 18.6, y1: 23.6, x2: 3744, y2: 3.9, xFactor: 1, yFactor: 1 },
      expectedSlope: 3744,
      expectedTarget: 3.90,
      reportExampleNote: 'في التقرير المحلول: $J = \\frac{1.95 \\times 4 \\times 480}{(164.2\\times 1 + 24 + 3.9)(23.6 - 18.6)} = \\frac{3744}{960.5} \\approx 3.89\\text{ J/cal}$ (قريبة من القيمة النظرية المرجعية $4.18\\text{ J/cal}$).',
      conceptualQ4Prompt: 'ماذا تمثل القيمة الفيزيائية لمكافئ جول ($J \\approx 4.18\\text{ J/cal}$)؟',
      conceptualQ4Correct: 'نسبة الطاقة الكهربائية (بالجول) إلى الطاقة الحرارية المكافئة لها (بالسعر cal)',
      conceptualQ4Distractors: [
        'نسبة الطاقة الحركية المكتسبة إلى الشغل المبذول بفعل الجاذبية',
        'كمية الحرارة اللازمة لرفع حرارة 1 kg من المادة بمقدار 1 K',
        'نسبة الإجهاد إلى الانفعال في الأسلاك المعدنية'
      ],
      intermediateQ5Prompt: 'احسب الطاقة الكهربائية المبذولة على الملف $W = I \\cdot V \\cdot t$ بوحدة الجول ($\\text{J}$) لتيار $1.95\\text{ A}$ وجهد $4\\text{ V}$ وزمن $480\\text{ s}$:',
      intermediateQ5CorrectVal: 3744,
      intermediateQ5Tolerance: 10,
      intermediateQ5Unit: 'J',
      intermediateQ5UnitLatex: '\\text{J}'
    },
    precisionNote: 'ملاحظة الوحدات في هذه التجربة: الكتل $m_w$ بالغرام و $C_w = 1\\text{ cal/(g}\\cdot^\\circ\\text{C)}$ والمكافئان $M_c, M_s$ بـ $\\text{cal/}^\\circ\\text{C}$ حتى يكون المقام بوحدة الكالوري ($\\text{cal}$) والبسط بالجول فتنتج الوحدة $\\text{J/cal}$.'
  },
  {
    id: 'sound',
    number: 10,
    kind: 'linear',
    title: 'سرعة الصوت في الهواء (Speed of Sound)',
    shortTitle: 'سرعة الصوت',
    badge: 'الرنين في الأعمدة المغلقة',
    icon: 'sound',
    ...makeDriveVideo('1pxSKznbGZ1S8kna0SbCCMu-kTqMnhLb0'),
    goal: '1) دراسة ظاهرة الرنين في الأعمدة الهوائية المغلقة. 2) إيجاد سرعة الصوت في الهواء عند درجة حرارة المعمل. 3) معرفة العلاقة بين سرعة الصوت ودرجة حرارة المعمل.',
    goalKeywords: ['ظاهرة الرنين', 'سرعة الصوت', 'درجة حرارة المعمل'],
    theorySummary: [
      {
        title: 'ظاهرة الرنين والموجات الموقوفة',
        body: 'في العمود الهوائي المغلق تتشكل عقدة عند الطرف المغلق (سعة أقل ما يمكن) وبطن عند الطرف المفتوح (أكبر سعة). يحدث الرنين الأول الأساسي عندما يساوي طول الرنين ربع الطول الموجي $L = \\frac{\\lambda}{4}$، بينما تحدث التوافقيات عند الأعداد الفردية $L = n \\frac{\\lambda}{4}$ ($n = 1, 3, 5\\dots$).'
      },
      {
        title: 'تصحيح فوهة الأنبوبة والعلاقة الخطية',
        body: 'نظراً لتكوّن بطن الموجة خارج فوهة الأنبوبة بقليل فإن طول الأنبوبة $l$ ينقصه مقدار التصحيح $\\Delta l = 0.6r$؛ وهذا سبب قطع الخط البياني لمحور الصادات السالب:',
        formulaLatex: 'l = \\frac{v}{4}\\left(\\frac{1}{f}\\right) - 0.6 r, \\quad v_T = v_0 + 0.6 T \\; (v_0 = 331\\text{ m/s})'
      }
    ],
    mainFormulaLatex: 'l = \\frac{v}{4} \\left(\\frac{1}{f}\\right) - 0.6 r, \\quad v_T = v_0 + 0.6 T',
    mainFormulaText: 'l = (v / 4)·(1 / f) - 0.6 r   |   نظرياً: v_T = 331 + 0.6 T',
    symbols: [
      { sym: 'l', symLatex: 'l', name: 'طول عمود الهواء عند الرنين الأول', unit: 'm', unitLatex: '\\text{m}' },
      { sym: 'f', symLatex: 'f', name: 'تردد الشوكة الرنانة', unit: 'Hz (s⁻¹)', unitLatex: '\\text{Hz}' },
      { sym: '1/f', symLatex: '\\frac{1}{f}', name: 'مقلوب التردد', unit: 's', unitLatex: '\\text{s}' },
      { sym: 'v', symLatex: 'v', name: 'سرعة الصوت عملياً في المعمل', unit: 'm/s', unitLatex: '\\text{m/s}' },
      { sym: 'r', symLatex: 'r', name: 'نصف قطر فوهة الأنبوبة', unit: 'm', unitLatex: '\\text{m}' },
      { sym: 'v_T', symLatex: 'v_T', name: 'سرعة الصوت نظرياً عند حرارة T', unit: 'm/s', unitLatex: '\\text{m/s}' }
    ],
    givensOnExam: 'v₀ = 331 m/s, T = 20 °C',
    givensOnExamLatex: 'v_0 = 331 \\text{ m/s}, \\; T = 20^\\circ\\text{C}',
    practicalSteps: [
      'نطرق الشوكة الرنانة ذات التردد المعلوم $f$ ونقربها من فوهة الأنبوبة المملوءة جزئياً بالماء.',
      'نعدل ارتفاع عمود الهواء حتى نسمع أوضح رنين (أول رنين أساسي) ونسجل الطول $l \\times 10^{-2}\\text{ m}$.',
      'نكرر مع شوكات بترددات مختلفة ونحسب مقلوب التردد $\\frac{1}{f} \\times 10^{-3}\\text{ s}$ لكل شوكة.'
    ],
    tableConfig: {
      givenColumn: {
        header: 'f (Hz أو s⁻¹)',
        headerLatex: 'f \\text{ (s}^{-1}\\text{)}',
        values: ['512', '480', '420', '364', '320']
      },
      missingColumns: [
        {
          id: 'c1',
          correctHeader: '1/f × 10⁻³ (s)',
          headerLatex: '\\frac{1}{f} \\times 10^{-3} \\text{ (s)}',
          labelAr: 'مقلوب التردد',
          options: ['1/f × 10⁻³ (s)', 't_avg (s)', 'W = mgs (J)', '1/l × 10⁻² (cm⁻¹)'],
          sampleValues: ['1.95', '2.08', '2.38', '2.74', '3.12']
        },
        {
          id: 'c2',
          correctHeader: 'Δl (أو l) × 10⁻² (m)',
          headerLatex: '\\Delta l \\times 10^{-2} \\text{ (m)}',
          labelAr: 'طول عمود الهواء عند الرنين الأول',
          options: ['Δl (أو l) × 10⁻² (m)', 'KE × 10⁻³ (J)', 'v = 2s/t (m/s)', 'r² × 10⁻⁶ (m²)'],
          sampleValues: ['16.7', '17.8', '20.4', '23.5', '26.7']
        }
      ],
      calcDrill: {
        question: 'إذا كان ميل الخط المستقيم للعلاقة بين $l$ و $\\frac{1}{f}$ يساوي $\\text{slope} = 88.88\\text{ m/s}$، فما سرعة الصوت عملياً $v$ في المختبر (بوحدة $\\text{m/s}$)؟',
        correctValue: 355.52,
        tolerance: 0.5,
        explanation: 'بما أن الرنين الأول يحدث عند ربع الطول الموجي ($L = \\frac{\\lambda}{4}$)، فإن $v = 4 \\times \\text{slope} = 4 \\times 88.88 = 355.52\\text{ m/s}$.'
      }
    },
    graph: {
      hasGraph: true,
      yAxis: 'Δl (أو l) × 10⁻² (m)',
      yAxisLatex: 'l \\times 10^{-2} \\text{ (m)}',
      xAxis: '1/f × 10⁻³ (s)',
      xAxisLatex: '\\frac{1}{f} \\times 10^{-3} \\text{ (s)}',
      passesOrigin: false,
      originReason: 'لا يمر بنقطة الأصل بل يقطع محور $Y$ السالب عند $-0.6r$ بسبب مقدار تصحيح الفوهة؛ لتكوّن بطن الموجة خارج الفوهة قليلاً.',
      slopeFormula: 'slope = Δl / Δ(1/f) = v / 4',
      slopeLatex: '\\text{slope} = \\frac{\\Delta l}{\\Delta(1/f)} = \\frac{v}{4}',
      slopeUnit: 'm/s',
      slopeUnitLatex: '\\text{m/s}',
      targetName: 'سرعة الصوت عملياً (v)',
      targetFormula: 'v = 4 × slope | v_T = 331 + 0.6 T | r = |b| / 0.6',
      targetFormulaLatex: 'v = 4 \\times \\text{slope}, \\quad v_T = 331 + 0.6 T',
      targetUnit: 'm/s',
      targetUnitLatex: '\\text{m/s}',
      samplePoints: { x1: 2.0, y1: 17.0, x2: 2.9, y2: 25.0, xFactor: 1e-3, yFactor: 1e-2, yIntercept: -0.01 },
      expectedSlope: 88.88,
      expectedTarget: 355.52,
      reportExampleNote: '$\\text{slope} = \\frac{(25 - 17)\\times 10^{-2}}{(2.9 - 2.0)\\times 10^{-3}} = 88.88\\text{ m/s}$، وسرعة الصوت عملياً $v = 4 \\times 88.88 = 355.52\\text{ m/s}$، ونظرياً عند $20^\\circ\\text{C}$: $v_T = 343\\text{ m/s}$، ونصف القطر من المقطع السالب: $r = \\frac{1\\times 10^{-2}}{0.6} \\approx 0.0167\\text{ m}$.'
    },
    precisionNote: 'عند حساب الميل يُضرب البسط في $10^{-2}$ والمقام في $10^{-3}$، وتُضرب قيمة الميل في 4 لاستنتاج سرعة الصوت، كما تُحسب قيمة نصف قطر الأنبوبة $r = \\frac{|\\text{y-intercept}|}{0.6}$.'
  }
];

// Maps option/axis/unit labels cleanly into crisp KaTeX LaTeX strings
const LATEX_LABEL_MAP: Record<string, string> = {
  // Missing Column Headers
  'Δl_inc (m) × 10⁻²': '\\Delta l_{\\text{inc}} \\times 10^{-2} \\text{ (m)}',
  'Δl_dec (m) × 10⁻²': '\\Delta l_{\\text{dec}} \\times 10^{-2} \\text{ (m)}',
  'Δl_avg (m) × 10⁻²': '\\Delta l_{\\text{avg}} \\times 10^{-2} \\text{ (m)}',
  'W = mgs (J)': 'W = mgs \\text{ (J)}',
  'W = mgs × 10⁻³ (J)': 'W = mgs \\times 10^{-3} \\text{ (J)}',
  't₁ (s)': 't_1 \\text{ (s)}',
  't₂ (s)': 't_2 \\text{ (s)}',
  't₁, t₂, t₃ (s)': 't_1, t_2, t_3 \\text{ (s)}',
  't₁, t₂, t₃ × 10⁻³ (s)': 't_1, t_2, t_3 \\times 10^{-3} \\text{ (s)}',
  't_avg (s)': 't_{\\text{avg}} \\text{ (s)}',
  't_avg × 10⁻³ (s)': 't_{\\text{avg}} \\times 10^{-3} \\text{ (s)}',
  't² (s²)': 't^2 \\text{ (s}^2\\text{)}',
  't² × 10⁻² (s²)': 't^2 \\times 10^{-2} \\text{ (s}^2\\text{)}',
  'v (m/s)': 'v \\text{ (m/s)}',
  'v = d/t (m/s)': 'v = \\frac{d}{t} \\text{ (m/s)}',
  'v = d / t_avg (m/s)': 'v = \\frac{d}{t_{\\text{avg}}} \\text{ (m/s)}',
  'v = 2s/t (m/s)': 'v = \\frac{2s}{t} \\text{ (m/s)}',
  'v = 2s / t_avg (m/s)': 'v = \\frac{2s}{t_{\\text{avg}}} \\text{ (m/s)}',
  'v = s / t_avg (m/s)': 'v = \\frac{s}{t_{\\text{avg}}} \\text{ (m/s)}',
  'W = Fs (J)': 'W = F s \\text{ (J)}',
  'KE (J)': 'KE \\text{ (J)}',
  'KE = ½Mv²': 'KE = \\frac{1}{2} M v^2',
  'KE = ½ M v² × 10⁻³ (J)': 'KE = \\frac{1}{2} M v^2 \\times 10^{-3} \\text{ (J)}',
  'KE = ½ m v² (J)': 'KE = \\frac{1}{2} m v^2 \\text{ (J)}',
  'KE × 10⁻³ (J)': 'KE \\times 10^{-3} \\text{ (J)}',
  'W × 10⁻³ (J)': 'W \\times 10^{-3} \\text{ (J)}',
  'l = |A - X| (cm)': 'l = |A - X| \\text{ (cm)}',
  'h = |Y - X| (cmHg)': 'h = |Y - X| \\text{ (cmHg)}',
  'h (cmHg)': 'h \\text{ (cmHg)}',
  'Y (cm)': 'Y \\text{ (cm)}',
  '1/l (cm⁻¹)': '\\frac{1}{l} \\text{ (cm}^{-1}\\text{)}',
  '1/l × 10⁻²': '\\frac{1}{l} \\times 10^{-2}',
  '1/l × 10⁻² (cm⁻¹)': '\\frac{1}{l} \\times 10^{-2} \\text{ (cm}^{-1}\\text{)}',
  '1/f (s)': '\\frac{1}{f} \\text{ (s)}',
  '1/f × 10⁻³ (s)': '\\frac{1}{f} \\times 10^{-3} \\text{ (s)}',
  'Δl (m)': '\\Delta l \\text{ (m)}',
  'Δl (m) × 10⁻²': '\\Delta l \\times 10^{-2} \\text{ (m)}',
  'Δl_inc (m)': '\\Delta l_{\\text{inc}} \\text{ (m)}',
  'Δl_dec (m)': '\\Delta l_{\\text{dec}} \\text{ (m)}',
  'Δl_avg (m)': '\\Delta l_{\\text{avg}} \\text{ (m)}',
  'Δl (أو l) × 10⁻² (m)': '\\Delta l \\times 10^{-2} \\text{ (m)}',
  'Δl × 10⁻⁵ (m)': '\\Delta l \\times 10^{-5} \\text{ (m)}',
  'Δl_inc × 10⁻⁵ (m)': '\\Delta l_{\\text{inc}} \\times 10^{-5} \\text{ (m)}',
  'Δl_dec × 10⁻⁵ (m)': '\\Delta l_{\\text{dec}} \\times 10^{-5} \\text{ (m)}',
  'Δl_avg × 10⁻⁵ (m)': '\\Delta l_{\\text{avg}} \\times 10^{-5} \\text{ (m)}',
  'm (kg) × 10⁻³': 'm \\times 10^{-3} \\text{ (kg)}',
  'S × 10⁻² (m)': 'S \\times 10^{-2} \\text{ (m)}',
  'M (kg)': 'M \\text{ (kg)}',
  'r × 10⁻³ (m)': 'r \\times 10^{-3} \\text{ (m)}',
  'r² × 10⁻⁶': 'r^2 \\times 10^{-6}',
  'r² × 10⁻⁶ (m²)': 'r^2 \\times 10^{-6} \\text{ (m}^2\\text{)}',
  'slope = Δy/Δx': '\\text{slope} = \\frac{\\Delta y}{\\Delta x}',
  'slope = g/k': '\\text{slope} = \\frac{g}{k}',
  'P₀ = b/a': 'P_0 = \\frac{b}{a}',
  'P₀ (cmHg)': 'P_0 \\text{ (cmHg)}',
  'η (Pa·s)': '\\eta \\text{ (Pa}\\cdot\\text{s)}',
  'Y (N/m²)': 'Y \\text{ (N/m}^2\\text{)}',
  'J (J/cal)': 'J \\text{ (J/cal)}',
  'C_b (J/(kg·K))': 'C_b \\; \\text{(J/(kg}\\cdot\\text{K))}',
  'J = W / Q (J/cal)': 'J = \\frac{W}{Q} \\text{ (J/cal)}',
  'k (N/m)': 'k \\text{ (N/m)}',
  'm_w = m_cw - m_c | تحويل الكتل × 10⁻³ (kg)': 'm_w = m_{cw} - m_c \\; (\\times 10^{-3}\\text{ kg})',
  'm_w = m_cw - m_c (g) | W = IVt (J)': 'm_w = m_{cw} - m_c \\text{ (g)} \\; | \\; W = IVt \\text{ (J)}',
  'الطريقة العملية (F₃, θ₃ → R, θ_R)': '\\text{العملية: } R = F_3, \\; \\theta_R = \\theta_3 - 180^\\circ - \\theta_1',
  'الطريقة الحسابية (R, θ_R)': '\\text{الحسابية: } R = \\sqrt{F_1^2+F_2^2+2F_1F_2\\cos\\theta}',
  'الطريقة البيانية (1cm = 25gw)': '\\text{البيانية: } 1\\text{ cm} = 25\\text{ gw}',
  // Units
  'kg': '\\text{kg}',
  'g': '\\text{g}',
  'm': '\\text{m}',
  'cm': '\\text{cm}',
  's': '\\text{s}',
  'N/m': '\\text{N/m}',
  'N/m²': '\\text{N/m}^2',
  'Pa·s': '\\text{Pa}\\cdot\\text{s}',
  'Pa·s (أو N·s/m²)': '\\text{Pa}\\cdot\\text{s}',
  'm/s': '\\text{m/s}',
  'm/s²': '\\text{m/s}^2',
  'm/kg': '\\text{m/kg}',
  's²/m': '\\text{s}^2/\\text{m}',
  '(m·s)⁻¹': '(\\text{m}\\cdot\\text{s})^{-1}',
  'cm⁻¹ / cmHg': '\\text{cm}^{-1}/\\text{cmHg}',
  'cmHg': '\\text{cmHg}',
  'J': '\\text{J}',
  '°C': '^\\circ\\text{C}',
  '%': '\\%',
  'gw': '\\text{gw}',
  'J/(kg·K)': '\\text{J/(kg}\\cdot\\text{K)}',
  'J/cal': '\\text{J/cal}',
  'ليس له وحدة (J / J)': '\\text{عديم الوحدة } (\\text{J/J})',
  'ليس له وحدة (J / J) ': '\\text{عديم الوحدة } (\\text{J/J})'
};

export function toLatexLabel(raw: string): string {
  if (!raw) return '';
  if (LATEX_LABEL_MAP[raw]) return LATEX_LABEL_MAP[raw];
  return `\\text{${raw.replace(/\\/g, '').replace(/[{}$]/g, '')}}`;
}
