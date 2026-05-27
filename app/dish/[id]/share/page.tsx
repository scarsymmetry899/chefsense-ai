'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Copy, Lock, Save, Share2, Star } from 'lucide-react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { ScreenCard, SectionEyebrow } from '@/components/dish/screen-kit';
import { ROUTES } from '@/lib/constants/routes';
import { getDishOrThrow } from '@/lib/data/dishes';
import { getShareCaptions } from '@/lib/dish-flow';
import { useLanguage } from '@/lib/i18n/language-context';
import { recordShareAction } from '@/lib/user-state';

const TONE_KEYS = [
  { id: 'fineDining', label: 'Fine Dining' },
  { id: 'instagramFoodie', label: 'Instagram Foodie' },
  { id: 'homeChefProud', label: 'Home Chef Proud' },
  { id: 'simpleWarm', label: 'Simple & Warm' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'telugu', label: 'Telugu' },
] as const;

const COPY = {
  en: {
    title: 'Share my plate',
    subtitle: 'Upload the final dish, reveal the plating score, and use a ready-to-share caption.',
    photo: 'Final plate photo',
    upload: 'Upload photo',
    change: 'Change photo',
    lockedTitle: 'Add the final plated dish',
    lockedBody: 'Upload the final plated dish to unlock the presentation score, caption preview, and share flow.',
    scoreTitle: 'Plating score',
    scoreSubtitle: 'Your final rating appears only after the plated dish is uploaded.',
    suggestions: 'ChefSense suggestions',
    captionTone: 'Caption tone',
    finalRating: 'Final rating',
    selfRating: 'Your self-rating',
    copy: 'Copy Caption',
    share: 'Share',
    save: 'Save',
    next: 'What to try next',
    overall: 'Overall',
    presentation: 'Presentation',
    garnish: 'Garnish',
    cleanliness: 'Cleanliness',
    lighting: 'Lighting',
    copied: 'Caption copied to clipboard.',
    fallback: 'Sharing is not available here, so the caption was copied instead.',
    sheet: 'Shared using your device share sheet.',
    saved: 'Saved to your cooking journal preview.',
    nextBody:
      'Great job. Your plating is strong and the dish is share-ready. Next time, push the garnish contrast a little further and try another guided dish for a new chef technique.',
  },
  hi: {
    title: 'Share my plate',
    subtitle: 'फाइनल डिश अपलोड करें, तभी प्लेटिंग स्कोर देखें और शेयर-रेडी कैप्शन लें।',
    photo: 'फाइनल प्लेट फोटो',
    upload: 'Upload photo',
    change: 'Change photo',
    lockedTitle: 'अपनी अंतिम प्लेटेड डिश जोड़ें',
    lockedBody: 'फाइनल प्लेट अपलोड होने के बाद ही स्कोर, कैप्शन प्रीव्यू और शेयर फ्लो खुलेगा।',
    scoreTitle: 'Plating score',
    scoreSubtitle: 'रेटिंग केवल फाइनल प्लेट अपलोड होने के बाद दिखाई जाएगी।',
    suggestions: 'ChefSense suggestions',
    captionTone: 'Caption tone',
    finalRating: 'Final rating',
    selfRating: 'Your self-rating',
    copy: 'Copy Caption',
    share: 'Share',
    save: 'Save',
    next: 'What to try next',
    overall: 'Overall',
    presentation: 'Presentation',
    garnish: 'Garnish',
    cleanliness: 'Cleanliness',
    lighting: 'Lighting',
    copied: 'Caption clipboard में कॉपी हो गया।',
    fallback: 'यहाँ direct share उपलब्ध नहीं है, इसलिए caption copy कर दिया गया है।',
    sheet: 'आपके device share sheet से share किया गया।',
    saved: 'Cooking journal preview में save कर दिया गया है।',
    nextBody:
      'बहुत बढ़िया। आपकी प्लेटिंग share-ready है। अगली बार garnish contrast थोड़ा और बढ़ाइए और किसी दूसरी guided dish के साथ नई technique आज़माइए।',
  },
  te: {
    title: 'Share my plate',
    subtitle: 'ఫైనల్ డిష్‌ను అప్‌లోడ్ చేసి, ప్లేటింగ్ స్కోర్ చూసి, షేర్-రెడీ క్యాప్షన్ పొందండి.',
    photo: 'ఫైనల్ ప్లేట్ ఫోటో',
    upload: 'Upload photo',
    change: 'Change photo',
    lockedTitle: 'మీ ఫైనల్ ప్లేటెడ్ డిష్‌ను జోడించండి',
    lockedBody: 'ఫైనల్ ప్లేట్ అప్‌లోడ్ చేసిన తర్వాతే స్కోర్, క్యాప్షన్ ప్రివ్యూ, షేర్ ఫ్లో కనిపిస్తాయి.',
    scoreTitle: 'Plating score',
    scoreSubtitle: 'ఫైనల్ ప్లేట్ అప్‌లోడ్ చేసిన తర్వాతే రేటింగ్ కనిపిస్తుంది.',
    suggestions: 'ChefSense suggestions',
    captionTone: 'Caption tone',
    finalRating: 'Final rating',
    selfRating: 'Your self-rating',
    copy: 'Copy Caption',
    share: 'Share',
    save: 'Save',
    next: 'What to try next',
    overall: 'Overall',
    presentation: 'Presentation',
    garnish: 'Garnish',
    cleanliness: 'Cleanliness',
    lighting: 'Lighting',
    copied: 'Caption clipboard‌కు copy అయింది.',
    fallback: 'ఇక్కడ direct share లేదు, కాబట్టి caption copy చేయబడింది.',
    sheet: 'మీ device share sheet ద్వారా share చేయబడింది.',
    saved: 'Cooking journal preview‌లో save చేయబడింది.',
    nextBody:
      'చాలా బాగా చేశారు. మీ plating ఇప్పుడు share-ready గా ఉంది. వచ్చే సారి garnish contrast ని కొంచెం పెంచి, మరో guided dish తో కొత్త technique ప్రయత్నించండి.',
  },
} as const;

export default function DishSharePage() {
  const params = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const copy = COPY[lang];
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
    () =>
      uploadedImage
        ? [
            { label: copy.presentation, value: 82 },
            { label: copy.garnish, value: 78 },
            { label: copy.cleanliness, value: 84 },
            { label: copy.lighting, value: 80 },
          ]
        : [],
    [copy.cleanliness, copy.garnish, copy.lighting, copy.presentation, uploadedImage],
  );

  const overallScore = uploadedImage
    ? Math.round((scores.reduce((sum, item) => sum + item.value, 0) / scores.length + selfRating * 4) / 1)
    : null;

  const finalAssessment = uploadedImage
    ? `ChefSense rating: ${overallScore} / 100`
    : 'Upload the final plate to unlock the presentation rating.';

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: `${dish.dishName} by ChefSense`,
        text: caption,
      });
      recordShareAction(dish.dishId, 'share');
      setShareNote(copy.sheet);
      return;
    }

    await navigator.clipboard.writeText(caption);
    recordShareAction(dish.dishId, 'copy');
    setCopied(true);
    setShareNote(copy.fallback);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(caption);
    recordShareAction(dish.dishId, 'copy');
    setCopied(true);
    setShareNote(copy.copied);
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
        <h1 className="text-[42px] leading-none">{copy.title}</h1>
        <p className="mt-3 text-[16px] leading-7 text-muted-foreground">{copy.subtitle}</p>
      </section>

      <ScreenCard className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow label={copy.photo} className="mb-0" />
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            className="rounded-full border border-primary/20 gradient-cta px-5 py-2.5 text-sm font-semibold text-white shadow-cta"
          >
            {uploadedImage ? copy.change : copy.upload}
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-[24px] border border-border bg-background">
          {uploadedImage ? (
            <img src={uploadedImage} alt="Final plated dish" className="h-[240px] w-full object-cover" />
          ) : (
            <div className="flex h-[240px] flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top_left,_rgba(247,193,120,0.35),_transparent_40%),linear-gradient(180deg,_rgba(255,248,240,0.98),_rgba(255,240,225,0.92))] px-8 text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary shadow-soft">
                <Camera className="h-8 w-8" />
              </span>
              <div className="font-serif text-[30px] leading-none text-foreground">{copy.lockedTitle}</div>
              <div className="text-sm leading-6 text-muted-foreground">{copy.lockedBody}</div>
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

      {uploadedImage ? (
        <>
          <ScreenCard className="mt-4">
            <SectionEyebrow label={copy.scoreTitle} />
            <div className="rounded-[26px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(254,245,236,0.96))] px-5 py-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">{copy.overall}</div>
                  <div className="mt-1 font-sans text-[62px] font-semibold leading-none tracking-[-0.06em] text-foreground tabular-nums">
                    {overallScore}
                  </div>
                </div>
                <div className="text-right text-sm leading-6 text-muted-foreground">
                  <div>{copy.presentation} • {scores[0]?.value}%</div>
                  <div>{copy.garnish} • {scores[1]?.value}%</div>
                  <div>{copy.cleanliness} • {scores[2]?.value}%</div>
                  <div>{copy.lighting} • {scores[3]?.value}%</div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {scores.map((item) => (
                <ScreenCard key={item.label} className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                  <div className="mt-2 font-sans text-[38px] font-semibold leading-none tracking-[-0.05em] text-foreground tabular-nums">
                    {item.value}
                    <span className="ml-1 text-base text-muted-foreground">%</span>
                  </div>
                </ScreenCard>
              ))}
            </div>
          </ScreenCard>

          <ScreenCard className="mt-4">
            <SectionEyebrow label={copy.suggestions} />
            <ul className="space-y-2 text-[16px] leading-7 text-foreground">
              <li>Move closer to the bowl</li>
              <li>Add a small cream swirl</li>
              <li>Use natural light from the side</li>
              <li>Wipe the rim</li>
            </ul>
          </ScreenCard>
        </>
      ) : (
        <ScreenCard className="mt-4">
          <SectionEyebrow label={copy.scoreTitle} />
          <div className="rounded-[22px] border border-dashed border-border bg-background px-4 py-5 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Lock className="h-5 w-5" />
            </span>
            <div className="mt-3 text-sm leading-6 text-muted-foreground">{copy.scoreSubtitle}</div>
          </div>
        </ScreenCard>
      )}

      <ScreenCard className="mt-4">
        <SectionEyebrow label={copy.captionTone} />
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
        <SectionEyebrow label={copy.finalRating} />
        <p className="text-[16px] leading-7 text-muted-foreground">{finalAssessment}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{copy.selfRating}</span>
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
          {copy.copy}
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-primary/20 gradient-cta px-4 py-4 text-sm font-medium text-white shadow-cta"
        >
          <Share2 className="h-4 w-4" />
          {copy.share}
        </button>
        <button
          type="button"
          onClick={() => {
            recordShareAction(dish.dishId, 'save');
            setShareNote(copy.saved);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-border bg-card px-4 py-4 text-sm font-medium text-foreground shadow-soft"
        >
          <Save className="h-4 w-4 text-primary" />
          {copy.save}
        </button>
      </div>

      {(copied || shareNote) ? (
        <div className="mt-4 rounded-[20px] border border-border/60 bg-background px-4 py-3 text-sm text-muted-foreground">
          {shareNote || copy.copied}
        </div>
      ) : null}

      <ScreenCard className="mt-5">
        <SectionEyebrow label={copy.next} />
        <p className="text-sm leading-6 text-muted-foreground">{copy.nextBody}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary-soft px-3 py-1.5 text-sm text-primary-dark">Try Chicken Biryani next</span>
          <span className="rounded-full bg-primary-soft px-3 py-1.5 text-sm text-primary-dark">Practice a richer finish</span>
        </div>
      </ScreenCard>
    </AppShell>
  );
}
