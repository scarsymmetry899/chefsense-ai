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
  Undo2,
} from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { GradientButton, ScreenCard, SectionEyebrow } from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';
import { getStepFallbackGlyph } from '@/lib/dish-flow';

type ValidationState = {
  status: 'idle' | 'ready' | 'rejected';
  message?: string;
};

export default function DishPanCheckPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const dish = getDishOrThrow(params.id);
  const stepIndex = Number(searchParams.get('step') ?? dish.cookingSteps[0]?.index ?? 1);
  const step = dish.cookingSteps.find((item) => item.index === stepIndex) ?? dish.cookingSteps[0];
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationState>({ status: 'idle' });

  useEffect(() => {
    return () => {
      if (uploadedImage?.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  const analysis = useMemo(() => {
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

    if (uploadedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(URL.createObjectURL(file));
    setValidation({ status: 'ready' });
  }

  const canAnalyze = validation.status === 'ready' && Boolean(uploadedImage);

  return (
    <AppShell showBottomNav={false} className="pb-12">
      <Header backHref={ROUTES.dishCook(dish.dishId, step.index)} />

      <section className="text-center">
        <h1 className="text-[36px] leading-none">Visual Pan Check</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
          Add a close-up of your pan or dish at this stage. ChefSense will keep the advice tied to step {step.index}.
        </p>
      </section>

      <div className="mt-5">
        <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-card">
          <div className="relative h-[340px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(247,193,120,0.35),_transparent_40%),linear-gradient(180deg,_rgba(255,248,240,0.98),_rgba(255,240,225,0.92))]">
            {uploadedImage ? (
              <img src={uploadedImage} alt="Pan check upload" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary shadow-soft">
                  <span className="text-3xl">{getStepFallbackGlyph(step.title, step.instruction)}</span>
                </span>
                <div>
                  <div className="font-serif text-[28px] text-foreground">Add your live pan photo</div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">
                    Center the pan or plated dish in the frame. Non-food or unclear uploads will be rejected.
                  </div>
                </div>
              </div>
            )}

            {canAnalyze ? (
              <>
                <div className="absolute left-4 top-4 rounded-[22px] bg-black/72 px-4 py-3 text-white">
                  <div className="text-sm">AI Confidence</div>
                  <div className="mt-2 flex items-center gap-2 font-serif text-[24px]">
                    <span className="inline-block h-10 w-10 rounded-full border-4 border-secondary" />
                    86%
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                  className="absolute right-4 top-4 rounded-[20px] bg-black/72 px-4 py-3 text-sm font-medium text-white"
                >
                  Retake
                </button>
              </>
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

      {canAnalyze ? (
        <>
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
                  ChefSense is only checking this against cues that make sense at step {step.index}.
                </div>
              </div>
            </div>
          </ScreenCard>

          <ScreenCard className="mt-4">
            <SectionEyebrow label="AI Suggestion" />
            <div className="text-[20px] leading-8 text-foreground">{analysis.suggestion}</div>
          </ScreenCard>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <ScreenCard className="p-4 text-center">
              <ThermometerSun className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">Current Step</div>
              <div className="mt-1 text-[18px] text-accent-green">{analysis.stage}</div>
            </ScreenCard>
            <ScreenCard className="p-4 text-center">
              <Camera className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">Masala Thickness</div>
              <div className="mt-1 text-[18px] text-primary">Tracked for this step</div>
            </ScreenCard>
            <ScreenCard className="p-4 text-center">
              <RotateCcw className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">Correction Scope</div>
              <div className="mt-1 text-[18px] text-accent-green">Current stage only</div>
            </ScreenCard>
            <ScreenCard className="p-4 text-center">
              <Flame className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">Burn Risk</div>
              <div className="mt-1 text-[18px] text-accent-green">{analysis.burnRisk}</div>
            </ScreenCard>
          </div>

          <div className="mt-4 rounded-full border border-border/70 bg-secondary-soft/45 px-4 py-3 text-sm text-accent-green">
            Tip: If you correct the texture now, ChefSense will bring you straight back to this cooking step.
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
            <GradientButton
              href={ROUTES.dishRescue(dish.dishId, undefined, step.index)}
              label="Open Rescue"
              icon={Undo2}
              className="px-5 py-4 [&_.font-serif]:text-[18px]"
            />
          </div>

          <div className="mt-4">
            <Link
              href={ROUTES.dishCook(dish.dishId, step.index)}
              className="inline-flex w-full items-center justify-center rounded-[22px] border border-border bg-card px-4 py-4 text-center text-[15px] font-medium text-foreground"
            >
              I corrected it, take me back to cooking
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
