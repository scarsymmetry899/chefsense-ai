'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Copy, Save, Share2, Star } from 'lucide-react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { ScreenCard, SectionEyebrow } from '@/components/dish/screen-kit';
import { ROUTES } from '@/lib/constants/routes';
import { getDishOrThrow } from '@/lib/data/dishes';
import { getShareCaptions } from '@/lib/dish-flow';

const TONE_KEYS = [
  { id: 'fineDining', label: 'Fine Dining' },
  { id: 'instagramFoodie', label: 'Instagram Foodie' },
  { id: 'homeChefProud', label: 'Home Chef Proud' },
  { id: 'simpleWarm', label: 'Simple & Warm' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'telugu', label: 'Telugu' },
] as const;

export default function DishSharePage() {
  const params = useParams<{ id: string }>();
  const dish = getDishOrThrow(params.id);
  const captions = getShareCaptions(dish);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [tone, setTone] = useState<(typeof TONE_KEYS)[number]['id']>('fineDining');
  const [caption, setCaption] = useState(captions.fineDining);
  const [copied, setCopied] = useState(false);
  const [selfRating, setSelfRating] = useState(4);
  const [shareNote, setShareNote] = useState('');

  useEffect(() => {
    setCaption(captions[tone]);
  }, [captions, tone]);

  useEffect(() => {
    return () => {
      if (uploadedImage?.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  const scores = useMemo(
    () => [
      { label: 'Presentation', value: uploadedImage ? 89 : 74 },
      { label: 'Garnish', value: uploadedImage ? 84 : 70 },
      { label: 'Cleanliness', value: uploadedImage ? 91 : 75 },
      { label: 'Lighting', value: uploadedImage ? 82 : 68 },
    ],
    [uploadedImage],
  );

  const finalAssessment = uploadedImage
    ? `ChefSense rating: ${Math.round((scores.reduce((sum, item) => sum + item.value, 0) / scores.length + selfRating * 4) / 1)} / 100`
    : 'Upload the final plate to unlock the presentation rating.';

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: `${dish.dishName} by ChefSense`,
        text: caption,
      });
      setShareNote('Shared using your device share sheet.');
      return;
    }

    await navigator.clipboard.writeText(caption);
    setCopied(true);
    setShareNote('Sharing is not available here, so the caption was copied instead.');
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
  }

  function handleFile(file: File | null) {
    if (!file) return;
    if (uploadedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(URL.createObjectURL(file));
    setShareNote('');
  }

  return (
    <AppShell className="pb-32">
      <Header backHref={ROUTES.dishPlate(dish.dishId)} />

      <section className="text-center">
        <h1 className="text-[36px] leading-none">Share my plate</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted-foreground">
          Upload the final dish, review the plating score, and use a ready-to-share caption.
        </p>
      </section>

      <ScreenCard className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow label="Final plate photo" className="mb-0" />
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            className="rounded-full border border-primary/20 gradient-cta px-5 py-2.5 text-sm font-semibold text-white shadow-cta"
          >
            {uploadedImage ? 'Change photo' : 'Upload photo'}
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-[24px] border border-border bg-background">
          {uploadedImage ? (
            <img src={uploadedImage} alt="Final plated dish" className="h-[240px] w-full object-cover" />
          ) : (
            <div className="flex h-[240px] flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top_left,_rgba(247,193,120,0.35),_transparent_40%),linear-gradient(180deg,_rgba(255,248,240,0.98),_rgba(255,240,225,0.92))] px-8 text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Camera className="h-8 w-8" />
              </span>
              <div className="text-sm leading-6 text-muted-foreground">
                Add the final plated dish to unlock the presentation score, caption preview, and share flow.
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

      <div className="mt-4 grid grid-cols-2 gap-3">
        {scores.map((item) => (
          <ScreenCard key={item.label} className="p-4 text-center">
            <div className="text-sm text-muted-foreground">{item.label}</div>
            <div className="mt-2 font-serif text-[28px] text-foreground">{item.value}</div>
          </ScreenCard>
        ))}
      </div>

      <ScreenCard className="mt-4">
        <SectionEyebrow label="ChefSense suggestions" />
        <ul className="space-y-2 text-[16px] leading-7 text-foreground">
          <li>• Move closer to the bowl</li>
          <li>• Add a small cream swirl</li>
          <li>• Use natural light from the side</li>
          <li>• Wipe the rim</li>
        </ul>
      </ScreenCard>

      <ScreenCard className="mt-4">
        <SectionEyebrow label="Caption tone" />
        <div className="flex flex-wrap gap-3">
          {TONE_KEYS.map((option) => {
            const active = option.id === tone;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTone(option.id)}
                className={
                  active
                    ? 'rounded-full border border-primary/20 gradient-cta px-4 py-2 text-sm font-semibold text-white shadow-cta'
                    : 'rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-soft'
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          className="mt-4 min-h-[140px] w-full rounded-[22px] border border-border bg-background px-4 py-4 text-[16px] leading-7 text-foreground outline-none focus:ring-2 focus:ring-primary/30"
        />
      </ScreenCard>

      <ScreenCard className="mt-4">
        <SectionEyebrow label="Final rating" />
        <p className="text-[16px] leading-7 text-muted-foreground">{finalAssessment}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Your self-rating</span>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => {
              const active = index < selfRating;
              return (
                <button key={index} type="button" onClick={() => setSelfRating(index + 1)}>
                  <Star className={active ? 'h-5 w-5 fill-current text-primary' : 'h-5 w-5 text-border'} />
                </button>
              );
            })}
          </div>
        </div>
      </ScreenCard>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-border bg-card px-4 py-4 text-sm font-medium text-foreground shadow-soft"
        >
          <Copy className="h-4 w-4 text-primary" />
          Copy Caption
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-primary/20 gradient-cta px-4 py-4 text-sm font-medium text-white shadow-cta"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <button
          type="button"
          onClick={() => setShareNote('Saved to your cooking journal preview.')}
          className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-border bg-card px-4 py-4 text-sm font-medium text-foreground shadow-soft"
        >
          <Save className="h-4 w-4 text-primary" />
          Save
        </button>
      </div>

      {(copied || shareNote) ? (
        <div className="mt-4 rounded-[20px] border border-border/60 bg-background px-4 py-3 text-sm text-muted-foreground">
          {shareNote || 'Caption copied to clipboard.'}
        </div>
      ) : null}
    </AppShell>
  );
}
