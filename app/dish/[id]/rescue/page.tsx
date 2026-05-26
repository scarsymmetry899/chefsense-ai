'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ImagePlus, Search, ShieldCheck, Sparkles, Undo2 } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { GradientButton, ScreenCard, SectionEyebrow } from '@/components/dish/screen-kit';
import { getDishOrThrow } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';
import { getDefaultRescueIssue, getStepAwareRescueCopy, isLateTasteStage } from '@/lib/dish-flow';

export default function DishRescuePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const dish = getDishOrThrow(params.id);
  const stepIndex = Number(searchParams.get('step') ?? 1);
  const step = dish.cookingSteps.find((item) => item.index === stepIndex) ?? dish.cookingSteps[0];
  const defaultIssue = searchParams.get('issue') ?? getDefaultRescueIssue(dish, step.index)?.id;
  const uploadRef = useRef<HTMLInputElement>(null);

  const [selectedIssues, setSelectedIssues] = useState<string[]>(
    defaultIssue ? [defaultIssue] : [],
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (uploadedImage?.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  const chosenIssues = useMemo(
    () => dish.rescueIssues.filter((item) => selectedIssues.includes(item.id)),
    [dish.rescueIssues, selectedIssues],
  );

  const primaryIssue = chosenIssues[0] ?? getDefaultRescueIssue(dish, step.index);
  const canDiagnose = Boolean(primaryIssue) && (selectedIssues.length > 0 || uploadedImage);
  const stageAwareCopy = getStepAwareRescueCopy(step.title, step.index, dish.cookingSteps.length);
  const finishStyleFix = isLateTasteStage(step.index, dish.cookingSteps.length);

  function toggleIssue(issueId: string) {
    setSelectedIssues((current) =>
      current.includes(issueId)
        ? current.filter((item) => item !== issueId)
        : [...current, issueId],
    );
  }

  function handleFile(file: File | null) {
    if (!file) return;
    if (uploadedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(URL.createObjectURL(file));
  }

  return (
    <AppShell>
      <Header
        backHref={ROUTES.dishCook(dish.dishId, step.index)}
        actions={[{ icon: Bell, label: 'Alerts' }]}
      />

      <section className="text-center">
        <h1 className="text-[36px] leading-none">{finishStyleFix ? 'Taste and fix your dish' : 'Fix this cooking stage'}</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
          {stageAwareCopy}
        </p>
      </section>

      <ScreenCard className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <SectionEyebrow icon={ImagePlus} label="Current dish photo" className="mb-1" />
            <h2 className="text-[22px]">Upload what the dish looks like right now</h2>
          </div>
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            className="rounded-full border border-primary/20 gradient-cta px-5 py-2.5 text-sm font-semibold text-white shadow-cta"
          >
            {uploadedImage ? 'Change image' : 'Add image'}
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-[24px] border border-border bg-background">
          {uploadedImage ? (
            <img src={uploadedImage} alt="Rescue upload" className="h-[220px] w-full object-cover" />
          ) : (
            <div className="flex h-[220px] flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top_left,_rgba(247,193,120,0.35),_transparent_40%),linear-gradient(180deg,_rgba(255,248,240,0.98),_rgba(255,240,225,0.92))] px-8 text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
                <ImagePlus className="h-7 w-7" />
              </span>
              <div className="text-sm leading-6 text-muted-foreground">
                Add a live photo if the dish looks off. ChefSense will keep the fix tied to the current stage and bring you back to it.
              </div>
            </div>
          )}
        </div>

        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />
      </ScreenCard>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {dish.rescueIssues.map((issue) => {
          const active = selectedIssues.includes(issue.id);
          return (
            <button
              key={issue.id}
              type="button"
              onClick={() => toggleIssue(issue.id)}
              className={
                active
                  ? 'rounded-[18px] border border-primary/30 bg-gradient-to-r from-primary to-primary-dark px-3 py-3 text-center text-sm font-medium text-white shadow-cta'
                  : 'rounded-[18px] border border-border bg-card px-3 py-3 text-center text-sm text-foreground shadow-soft'
              }
            >
              {issue.label}
            </button>
          );
        })}
      </div>

      {canDiagnose && primaryIssue ? (
        <>
          <ScreenCard className="mt-5">
            <SectionEyebrow icon={Search} label="Likely Diagnosis" />
            <p className="text-[18px] leading-8 text-muted-foreground">{primaryIssue.diagnosis}</p>
            <div className="mt-4 rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
              This recommendation only uses issues that make sense up to step {step.index}: {step.title.toLowerCase()}.
            </div>
            {selectedIssues.length > 1 ? (
              <div className="mt-3 rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
                Also considering: {chosenIssues.slice(1).map((item) => item.label).join(', ')}
              </div>
            ) : null}
          </ScreenCard>

          <ScreenCard className="mt-4">
            <SectionEyebrow icon={Sparkles} label="Immediate Fix" />
            <ol className="space-y-3 pl-6 text-[18px] leading-8 text-foreground">
              {primaryIssue.immediateFix.map((fix) => (
                <li key={fix}>{fix}</li>
              ))}
            </ol>
          </ScreenCard>

          <div className="mt-4 -mx-5 overflow-x-auto scrollbar-hide px-5">
            <div className="flex gap-3 pb-1">
              <ScreenCard className="w-[280px] shrink-0">
                <SectionEyebrow icon={ShieldCheck} label="Prevent Next Time" />
                <ul className="space-y-2 text-[16px] leading-7 text-foreground">
                  {primaryIssue.preventNextTime.map((tip) => (
                    <li key={tip}>• {tip}</li>
                  ))}
                </ul>
              </ScreenCard>
              <ScreenCard className="w-[280px] shrink-0">
                <SectionEyebrow label="Food Science" />
                <p className="text-[16px] leading-7 text-muted-foreground">{primaryIssue.foodScience}</p>
              </ScreenCard>
              <ScreenCard className="w-[280px] shrink-0">
                <SectionEyebrow label="Chef Coaching" />
                <p className="text-[16px] leading-7 text-muted-foreground">
                  ChefSense will resume at this same step after the fix so you do not lose your place in the cooking flow.
                </p>
              </ScreenCard>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <GradientButton href={ROUTES.dishCook(dish.dishId, step.index)} label="I corrected it" icon={Undo2} />
            <button
              type="button"
              onClick={() => uploadRef.current?.click()}
              className="rounded-[24px] border border-border bg-card px-5 py-4 text-[17px] font-medium text-foreground shadow-soft"
            >
              Update dish photo
            </button>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
