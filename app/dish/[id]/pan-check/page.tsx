'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Camera,
  Flame,
  ImagePlus,
  LifeBuoy,
  RotateCcw,
  ThermometerSun,
} from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { GradientButton, ScreenCard, SectionEyebrow } from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';

export default function DishPanCheckPage() {
  const params = useParams<{ id: string }>();
  const dish = getDishOrThrow(params.id);
  const step = dish.cookingSteps[6] ?? dish.cookingSteps[0];
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (uploadedImage?.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  const canAnalyze = Boolean(uploadedImage);
  const currentStage = useMemo(
    () => ({
      title: 'Nearly reduced',
      note: 'The masala looks close to ready for the next enrich-and-balance step.',
      caution: 'Slight sticking',
      suggestion: 'Lower the heat a touch and add 1 tbsp hot water before stirring.',
    }),
    [],
  );

  function handleFile(file: File | null) {
    if (!file) return;
    if (uploadedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(URL.createObjectURL(file));
  }

  return (
    <AppShell showBottomNav={false} className="pb-12">
      <Header backHref={ROUTES.dishCook(dish.dishId, step.index)} />

      <section className="text-center">
        <h1 className="text-[36px] leading-none">Visual Pan Check</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
          Upload a fresh photo and ChefSense will assess the current cooking stage.
        </p>
      </section>

      <div className="mt-5">
        <div className="overflow-hidden rounded-[28px] border border-border bg-card">
          <div className="relative h-[360px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(247,193,120,0.35),_transparent_40%),linear-gradient(180deg,_rgba(255,248,240,0.98),_rgba(255,240,225,0.92))]">
            {uploadedImage ? (
              <img src={uploadedImage} alt="Pan check upload" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Camera className="h-8 w-8" />
                </span>
                <div>
                  <div className="font-serif text-[28px] text-foreground">Add a live pan photo</div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">
                    Use your camera or gallery. The analysis cards appear after you upload a real image.
                  </div>
                </div>
              </div>
            )}

            {canAnalyze ? (
              <>
                <div className="absolute left-4 top-4 rounded-[22px] bg-black/70 px-4 py-3 text-white">
                  <div className="text-sm">AI Confidence</div>
                  <div className="mt-2 flex items-center gap-2 font-serif text-[24px]">
                    <span className="inline-block h-10 w-10 rounded-full border-4 border-secondary" />
                    85%
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                  className="absolute right-4 top-4 rounded-[20px] bg-black/70 px-4 py-3 text-sm font-medium text-white"
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
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />
      </div>

      {canAnalyze ? (
        <>
          <ScreenCard className="mt-5">
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <SectionEyebrow label="Current Stage" />
                <h2 className="text-[26px] leading-none">{currentStage.title}</h2>
                <p className="mt-3 text-[17px] leading-8 text-muted-foreground">
                  {currentStage.note}
                </p>
              </div>
              <div className="rounded-[24px] border border-primary/20 bg-primary-soft/45 p-4">
                <div className="font-medium text-primary-dark">{currentStage.caution}</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  Watch the bottom closely while the masala tightens.
                </div>
              </div>
            </div>
          </ScreenCard>

          <ScreenCard className="mt-4">
            <SectionEyebrow label="AI Suggestion" />
            <div className="text-[20px] leading-8 text-foreground">{currentStage.suggestion}</div>
          </ScreenCard>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <ScreenCard className="p-4 text-center">
              <ThermometerSun className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">Onion Stage</div>
              <div className="mt-1 text-[18px] text-accent-green">Well browned</div>
            </ScreenCard>
            <ScreenCard className="p-4 text-center">
              <Camera className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">Masala Thickness</div>
              <div className="mt-1 text-[18px] text-primary">Thick</div>
            </ScreenCard>
            <ScreenCard className="p-4 text-center">
              <RotateCcw className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">Oil Separation</div>
              <div className="mt-1 text-[18px] text-accent-green">Good</div>
            </ScreenCard>
            <ScreenCard className="p-4 text-center">
              <Flame className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-3 text-sm text-muted-foreground">Burn Risk</div>
              <div className="mt-1 text-[18px] text-accent-green">Low</div>
            </ScreenCard>
          </div>

          <div className="mt-4 rounded-full border border-border/70 bg-secondary-soft/45 px-4 py-3 text-sm text-accent-green">
            Tip: Stir every 30-40 seconds and keep one spoon of hot water ready nearby.
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
              href={ROUTES.dishRescue(dish.dishId, 'raw-masala-taste')}
              label="Open Rescue"
              icon={LifeBuoy}
              className="px-5 py-4 [&_.font-serif]:text-[18px]"
            />
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
