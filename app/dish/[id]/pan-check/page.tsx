'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Camera,
  Flame,
  ImagePlus,
  RotateCcw,
  ThermometerSun,
} from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { ScreenCard, SectionEyebrow } from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { API_ROUTES, ROUTES } from '@/lib/constants/routes';
import { getStepAwareRescueCopy, getStepFallbackGlyph } from '@/lib/dish-flow';
import { useLanguage } from '@/lib/i18n/language-context';
import type { RescueIssue } from '@/lib/types';

type ValidationState = {
  status: 'idle' | 'ready' | 'rejected';
  message?: string;
};

type PanAnalysisState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  message?: string;
  warning?: string;
};

type PanAnalysisPayload = {
  title: string;
  note: string;
  caution: string;
  suggestion: string;
  stage: string;
  burnRisk: 'Low' | 'Medium' | 'High';
  confidence: number;
  likelyIssueIds: string[];
  suggestedIssueLabels: string[];
  dishMatchConfidence: number;
};

export default function DishPanCheckPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const dish = getDishOrThrow(params.id);
  const stepIndex = Number(searchParams.get('step') ?? dish.cookingSteps[0]?.index ?? 1);
  const step = dish.cookingSteps.find((item) => item.index === stepIndex) ?? dish.cookingSteps[0];
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationState>({ status: 'idle' });
  const [selectedIssueLabels, setSelectedIssueLabels] = useState<string[]>([]);
  const [analysisState, setAnalysisState] = useState<PanAnalysisState>({ status: 'idle' });
  const [analysisResult, setAnalysisResult] = useState<PanAnalysisPayload | null>(null);
  const [rescueResult, setRescueResult] = useState<RescueIssue | null>(null);
  const [matchWarningDismissed, setMatchWarningDismissed] = useState(false);

  useEffect(() => {
    return () => {
      if (uploadedImage?.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  const chosenIssues = useMemo(() => {
    const normalized = selectedIssueLabels.map((label) => label.toLowerCase());
    return dish.rescueIssues.filter((issue) => normalized.includes(issue.label.toLowerCase()));
  }, [dish.rescueIssues, selectedIssueLabels]);
  const primaryIssue = rescueResult ?? chosenIssues[0] ?? dish.rescueIssues[0];

  const defaultChipLabels = useMemo(
    () => dish.rescueIssues.map((issue) => issue.label),
    [dish.rescueIssues],
  );
  const chipLabels =
    analysisResult?.suggestedIssueLabels && analysisResult.suggestedIssueLabels.length > 0
      ? analysisResult.suggestedIssueLabels
      : defaultChipLabels;
  const copy = {
    en: {
      title: 'AI Pan Checker',
      subtitle:
        'Upload one photo and ChefSense will combine visual analysis with the right fix suggestions for this exact cooking stage.',
      prompt: 'Add your live pan photo',
      promptBody: 'Center the pan or plated dish in the frame. Non-food or unclear uploads will be rejected.',
      chipsHeading: 'What tastes off so far?',
      chipsSubheading: 'Pick one or more issues so ChefSense can focus the correction.',
    },
    hi: {
      title: 'AI Pan Checker',
      subtitle:
        'एक फोटो अपलोड करें और ChefSense इसी स्टेज के लिए सही विज़ुअल और फिक्स सुझाव एक साथ देगा।',
      prompt: 'अपनी लाइव पैन फोटो जोड़ें',
      promptBody: 'पैन या प्लेटेड डिश को फ्रेम के बीच में रखें। नॉन-फूड या अस्पष्ट फोटो रिजेक्ट की जाएँगी।',
      chipsHeading: 'अब तक स्वाद में क्या गड़बड़ है?',
      chipsSubheading: 'एक या अधिक विकल्प चुनें ताकि सही सुधार मिले।',
    },
    te: {
      title: 'AI Pan Checker',
      subtitle:
        'ఒక ఫోటోను అప్‌లోడ్ చేయండి, ChefSense ఈ స్టేజ్‌కు సరిపోయే విజువల్ మరియు ఫిక్స్ సూచనలను ఒకే చోట ఇస్తుంది.',
      prompt: 'మీ లైవ్ పాన్ ఫోటోను జోడించండి',
      promptBody: 'పాన్ లేదా ప్లేటెడ్ డిష్ ఫ్రేమ్ మధ్యలో ఉండాలి. ఫుడ్ కాని లేదా క్లియర్ కాని ఫోటోలను తిరస్కరిస్తాము.',
      chipsHeading: 'ఇప్పటివరకు రుచిలో ఏమి తప్పుగా ఉంది?',
      chipsSubheading: 'సరైన సరిదిద్దు కోసం ఒకటి లేదా ఎక్కువ ఎంపికలు ఎంచుకోండి.',
    },
  }[lang];

  const fallbackAnalysis = useMemo(() => {
    const hasTextureCue = step.sensoryCues.find((cue) => cue.type === 'texture');
    const hasVisualCue = step.sensoryCues.find((cue) => cue.type === 'visual');
    return {
      title: step.index >= dish.cookingSteps.length - 2 ? 'Almost finishing' : 'On the right track',
      note: hasVisualCue?.cue ?? step.beginnerExplanation,
      caution: step.heat === 'High' ? 'Watch the pan closely' : 'Looks controlled',
      suggestion: hasTextureCue?.cue ?? `Stay with step ${step.index} until the texture matches the cue card.`,
      stage: step.title,
      burnRisk: step.heat === 'High' ? 'Medium' : 'Low',
    };
  }, [dish.cookingSteps.length, step]);

  const analysis = analysisResult ?? fallbackAnalysis;

  const dynamicAxisLabel = (() => {
    const name = dish.dishName.toLowerCase();
    if (name.includes('biryani')) return 'Rice doneness';
    if (name.includes('fried rice')) return 'Wok integration';
    if (name.includes('dal')) return 'Dal consistency';
    if (name.includes('kejriwal')) return 'Cheese melt';
    return 'Masala finish';
  })();

  const burnRiskColor =
    analysis.burnRisk === 'High'
      ? 'text-primary-dark'
      : analysis.burnRisk === 'Medium'
        ? 'text-copper'
        : 'text-accent-green';

  useEffect(() => {
    if (validation.status !== 'ready' || !uploadedDataUrl) {
      setAnalysisState({ status: 'idle' });
      setAnalysisResult(null);
      setRescueResult(null);
      return;
    }

    let cancelled = false;
    setAnalysisState({ status: 'loading' });

    void (async () => {
      try {
        const response = await fetch(API_ROUTES.analyzePan, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dishId: dish.dishId,
            currentStep: step.index,
            imageUrl: uploadedDataUrl,
            issueHints: selectedIssueLabels,
          }),
        });

        if (!response.ok) {
          throw new Error('ChefSense could not analyze this pan photo right now.');
        }

        const payload = (await response.json()) as {
          ok: boolean;
          analysis?: PanAnalysisPayload;
          rescue?: RescueIssue;
          warning?: string;
        };

        if (cancelled || !payload.ok || !payload.analysis || !payload.rescue) {
          return;
        }

        setAnalysisResult(payload.analysis);
        setRescueResult(payload.rescue);
        setMatchWarningDismissed(false);
        setAnalysisState({
          status: 'ready',
          warning: payload.warning,
        });
      } catch (error) {
        if (cancelled) return;
        setAnalysisResult(null);
        setRescueResult(null);
        setAnalysisState({
          status: 'error',
          message: error instanceof Error ? error.message : 'ChefSense could not analyze this image.',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dish.dishId, selectedIssueLabels, step.index, uploadedDataUrl, validation.status]);

  async function handleFile(file: File | null) {
    if (!file) return;
    const verdict = await validateFoodLikePhoto(file);

    if (!verdict.ok) {
      setValidation({ status: 'rejected', message: verdict.reason });
      if (uploadedImage?.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImage);
      }
      setUploadedImage(null);
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    if (uploadedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(URL.createObjectURL(file));
    setUploadedDataUrl(dataUrl);
    setValidation({ status: 'ready' });
  }

  const canAnalyze = validation.status === 'ready' && Boolean(uploadedImage);

  return (
    <AppShell className="pb-32">
      <Header backHref={ROUTES.dishCook(dish.dishId, step.index)} title={copy.title} />

      <section className="text-center">
        <h1 className="h-section">{copy.title}</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
          {copy.subtitle}
        </p>
      </section>

      <div className="mt-5">
        <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-card">
          <div className="relative h-[320px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(247,193,120,0.35),_transparent_40%),linear-gradient(180deg,_rgba(255,248,240,0.98),_rgba(255,240,225,0.92))]">
            {uploadedImage ? (
              <img src={uploadedImage} alt="Pan check upload" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary shadow-soft">
                  <span className="text-3xl">{getStepFallbackGlyph(step.title, step.instruction)}</span>
                </span>
                <div>
                  <div className="font-serif text-[28px] text-foreground">{copy.prompt}</div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">
                    {copy.promptBody}
                  </div>
                </div>
              </div>
            )}

            {canAnalyze ? (
              <div className="absolute left-4 top-4 rounded-[22px] bg-black/72 px-4 py-3 text-white">
                <div className="text-sm">AI Confidence</div>
                <div className="mt-2 flex items-center gap-2 font-serif text-[24px]">
                  <span className="inline-block h-10 w-10 rounded-full border-4 border-secondary" />
                  {analysisResult?.confidence ?? 86}%
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-border/70 p-4">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 gradient-cta px-4 py-3 text-sm font-semibold text-white shadow-cta"
            >
              <Camera className="h-4 w-4" />
              Use camera
            </button>
            <button
              type="button"
              onClick={() => uploadRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground"
            >
              <ImagePlus className="h-4 w-4 text-primary" />
              Upload image
            </button>
          </div>
        </div>
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
        />
      </div>

      {validation.status === 'rejected' ? (
        <div className="mt-4 rounded-[22px] border border-primary/30 bg-primary-soft/55 px-4 py-4 text-sm leading-6 text-primary-dark">
          {validation.message}
        </div>
      ) : null}

      {analysisState.status === 'loading' ? (
        <div className="mt-4 rounded-[22px] border border-accent-green/20 bg-accent-green-soft px-4 py-4 text-sm leading-6 text-accent-green">
          ChefSense is reading your pan photo and matching it to this exact cooking step.
        </div>
      ) : null}

      {analysisState.status === 'error' ? (
        <div className="mt-4 rounded-[22px] border border-primary/30 bg-primary-soft/55 px-4 py-4 text-sm leading-6 text-primary-dark">
          {analysisState.message}
        </div>
      ) : null}

      {analysisState.warning ? (
        <div className="mt-4 rounded-[22px] border border-secondary/30 bg-secondary/10 px-4 py-4 text-sm leading-6 text-foreground">
          {analysisState.warning}
        </div>
      ) : null}

      <div className="mt-5">
        <div className="mb-3">
          <div className="text-[15px] font-semibold text-foreground">{copy.chipsHeading}</div>
          <div className="mt-1 text-sm text-muted-foreground">{copy.chipsSubheading}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {chipLabels.map((label) => {
          const active = selectedIssueLabels.includes(label);
          return (
            <button
              key={label}
              type="button"
              onClick={() =>
                setSelectedIssueLabels((current) =>
                  current.includes(label)
                    ? current.filter((item) => item !== label)
                    : [...current, label],
                )
              }
              className={
                active
                  ? 'rounded-[18px] border border-primary/30 bg-gradient-to-r from-primary to-primary-dark px-3 py-3 text-center text-sm font-medium text-white shadow-cta'
                  : 'rounded-[18px] border border-border bg-card px-3 py-3 text-center text-sm text-foreground shadow-soft'
              }
            >
              {label}
            </button>
          );
        })}
        </div>
      </div>

      {canAnalyze ? (
        <>
          {analysisResult && analysisResult.dishMatchConfidence < 50 && !matchWarningDismissed ? (
            <div className="mt-4 flex items-start justify-between gap-3 rounded-[22px] border border-copper/40 bg-copper/10 px-4 py-4 text-sm leading-6 text-foreground">
              <div>
                <div className="font-semibold text-copper">Photo may not match this dish</div>
                <div className="mt-1 text-muted-foreground">
                  This photo doesn&apos;t look like {dish.dishName}. The analysis below is based on what&apos;s visible, not the recipe.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMatchWarningDismissed(true)}
                className="shrink-0 rounded-full border border-copper/40 px-3 py-1 text-xs font-medium text-copper"
              >
                Dismiss
              </button>
            </div>
          ) : null}
          <ScreenCard className="mt-5">
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <SectionEyebrow label="Current Stage" />
                <h2 className="text-[26px] leading-none">{analysis.title}</h2>
                <p className="mt-3 text-[17px] leading-8 text-muted-foreground">
                  {analysis.note}
                </p>
              </div>
              <div className="rounded-[24px] border border-primary/20 bg-primary-soft/45 p-4">
                <div className="font-medium text-primary-dark">{analysis.caution}</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  {getStepAwareRescueCopy(step.title, step.index, dish.cookingSteps.length)}
                </div>
              </div>
            </div>
          </ScreenCard>

          <ScreenCard className="mt-4">
            <SectionEyebrow label="Likely diagnosis" />
            <div className="text-[20px] leading-8 text-foreground">{primaryIssue.diagnosis}</div>
          </ScreenCard>

          <ScreenCard className="mt-4">
            <SectionEyebrow label="Immediate fixes" />
            <ol className="space-y-3 pl-6 text-[18px] leading-8 text-foreground">
              {primaryIssue.immediateFix.map((fix) => (
                <li key={fix}>{fix}</li>
              ))}
            </ol>
          </ScreenCard>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <ScreenCard className="p-4 text-center">
              <ThermometerSun className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">Current Step</div>
              <div className="mt-1 text-[18px] text-accent-green">{analysis.stage}</div>
            </ScreenCard>
            <ScreenCard className="p-4 text-center">
              <Camera className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">{dynamicAxisLabel}</div>
              <div className="mt-1 text-[18px] text-primary">{analysis.suggestion}</div>
            </ScreenCard>
            <ScreenCard className="p-4 text-center">
              <RotateCcw className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">Correction Scope</div>
              <div className="mt-1 text-[18px] text-accent-green">Current stage only</div>
            </ScreenCard>
            <ScreenCard className="p-4 text-center">
              <Flame className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">Burn Risk</div>
              <div className={`mt-1 text-[18px] ${burnRiskColor}`}>{analysis.burnRisk}</div>
            </ScreenCard>
          </div>

          <div className="mt-4 -mx-5 overflow-x-auto px-5 scrollbar-hide">
            <div className="flex gap-3 pb-1">
              <ScreenCard className="w-[280px] shrink-0">
                <SectionEyebrow label="Prevent next time" />
                <ul className="space-y-2 text-[16px] leading-7 text-foreground">
                  {primaryIssue.preventNextTime.map((tip) => (
                    <li key={tip}>• {tip}</li>
                  ))}
                </ul>
              </ScreenCard>
              <ScreenCard className="w-[280px] shrink-0">
                <SectionEyebrow label="Food science" />
                <p className="text-[16px] leading-7 text-muted-foreground">{primaryIssue.foodScience}</p>
              </ScreenCard>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => uploadRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-[24px] border border-primary/40 bg-white/80 px-5 py-4 text-[18px] font-medium text-primary"
            >
              <RotateCcw className="h-5 w-5" />
              Analyze Again
            </button>
            <Link
              href={ROUTES.dishCook(dish.dishId, step.index)}
              className="inline-flex items-center justify-center rounded-[24px] border border-primary/20 gradient-cta px-5 py-4 text-[18px] font-medium text-white shadow-cta"
            >
              I corrected it
            </Link>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}

async function validateFoodLikePhoto(file: File) {
  if (!file.type.startsWith('image/')) {
    return { ok: false, reason: 'Please upload an image file of your pan or plated dish.' };
  }

  const lowerName = file.name.toLowerCase();
  if (/(selfie|portrait|person|screenshot|document|resume|pdf)/i.test(lowerName)) {
    return { ok: false, reason: 'That upload does not look like a cooking photo. Please add a close-up of the pan or dish instead.' };
  }

  const url = URL.createObjectURL(file);
  try {
    const dims = await readImageSize(url);
    if (dims.width < 320 || dims.height < 320) {
      return { ok: false, reason: 'The photo is too small to assess. Please upload a clearer close-up of the dish or pan.' };
    }
    if (dims.height > dims.width * 2.3) {
      return { ok: false, reason: 'Please retake the photo with the pan or dish centered in frame. This image looks too narrow for a pan check.' };
    }
    return { ok: true };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function readImageSize(url: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
