'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Camera, Copy, Loader2, Lock, Save, Share2, Star } from 'lucide-react';
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
] as const;

type ToneId = (typeof TONE_KEYS)[number]['id'];

const CAPTION_LANGS = [
  { id: 'en', label: 'EN' },
  { id: 'hi', label: 'HI' },
  { id: 'te', label: 'TE' },
] as const;

type CaptionLangId = (typeof CAPTION_LANGS)[number]['id'];

const COPY = {
  en: {
    title: 'Share my plate',
    subtitle: 'Upload the final dish, reveal the plating score, and use a ready-to-share caption.',
    captionWriting: 'ChefSense is writing your caption…',
    photo: 'Final plate photo',
    upload: 'Upload photo',
    change: 'Change photo',
    lockedTitle: 'Add the final plated dish',
    lockedBody: 'Upload the final plated dish to unlock the presentation score, caption preview, and share flow.',
    scoreTitle: 'Plating score',
    scoreSubtitle: 'Your final rating appears only after the plated dish is uploaded.',
    suggestions: 'ChefSense suggestions',
    captionTone: 'Caption tone',
    captionLanguage: 'Caption language',
    finalRating: 'Final rating',
    selfRating: 'Your self-rating',
    copy: 'Copy Caption',
    share: 'Share',
    save: 'Save',
    done: 'Done cooking',
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
    scoring: 'ChefSense is scoring your plate…',
    mismatchTitle: "This doesn't look like",
    retake: 'Retake',
    forceAccept: 'Use this photo anyway',
    forcedNote: 'Photo accepted — score below is a neutral estimate since the dish did not match.',
  },
  hi: {
    title: 'Share my plate',
    subtitle: 'फाइनल डिश अपलोड करें, तभी प्लेटिंग स्कोर देखें और शेयर-रेडी कैप्शन लें।',
    captionWriting: 'ChefSense आपका caption लिख रहा है…',
    photo: 'फाइनल प्लेट फोटो',
    upload: 'Upload photo',
    change: 'Change photo',
    lockedTitle: 'अपनी अंतिम प्लेटेड डिश जोड़ें',
    lockedBody: 'फाइनल प्लेट अपलोड होने के बाद ही स्कोर, कैप्शन प्रीव्यू और शेयर फ्लो खुलेगा।',
    scoreTitle: 'Plating score',
    scoreSubtitle: 'रेटिंग केवल फाइनल प्लेट अपलोड होने के बाद दिखाई जाएगी।',
    suggestions: 'ChefSense suggestions',
    captionTone: 'Caption tone',
    captionLanguage: 'Caption language',
    finalRating: 'Final rating',
    selfRating: 'Your self-rating',
    copy: 'Copy Caption',
    share: 'Share',
    save: 'Save',
    done: 'Done cooking',
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
    scoring: 'ChefSense आपकी प्लेट स्कोर कर रहा है…',
    mismatchTitle: 'यह नहीं लगता',
    retake: 'Retake',
    forceAccept: 'Use this photo anyway',
    forcedNote: 'फोटो स्वीकार की गई — डिश मैच नहीं हुई इसलिए नीचे neutral estimate है।',
  },
  te: {
    title: 'Share my plate',
    subtitle: 'ఫైనల్ డిష్‌ను అప్‌లోడ్ చేసి, ప్లేటింగ్ స్కోర్ చూసి, షేర్-రెడీ క్యాప్షన్ పొందండి.',
    captionWriting: 'ChefSense మీ caption రాస్తోంది…',
    photo: 'ఫైనల్ ప్లేట్ ఫోటో',
    upload: 'Upload photo',
    change: 'Change photo',
    lockedTitle: 'మీ ఫైనల్ ప్లేటెడ్ డిష్‌ను జోడించండి',
    lockedBody: 'ఫైనల్ ప్లేట్ అప్‌లోడ్ చేసిన తర్వాతే స్కోర్, క్యాప్షన్ ప్రివ్యూ, షేర్ ఫ్లో కనిపిస్తాయి.',
    scoreTitle: 'Plating score',
    scoreSubtitle: 'ఫైనల్ ప్లేట్ అప్‌లోడ్ చేసిన తర్వాతే రేటింగ్ కనిపిస్తుంది.',
    suggestions: 'ChefSense suggestions',
    captionTone: 'Caption tone',
    captionLanguage: 'Caption language',
    finalRating: 'Final rating',
    selfRating: 'Your self-rating',
    copy: 'Copy Caption',
    share: 'Share',
    save: 'Save',
    done: 'Done cooking',
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
    scoring: 'ChefSense మీ ప్లేట్‌ను స్కోర్ చేస్తోంది…',
    mismatchTitle: 'ఇది అలా అనిపించడం లేదు',
    retake: 'Retake',
    forceAccept: 'Use this photo anyway',
    forcedNote: 'ఫోటో అంగీకరించబడింది — డిష్ మ్యాచ్ కాలేదు కాబట్టి కింద neutral estimate.',
  },
} as const;

type PlateAnalysis = {
  dishMatch: { matches: boolean; confidence: number; reason: string };
  plating: { presentation: number; garnish: number; cleanliness: number; lighting: number };
  overall: number;
  suggestions: string[];
  source: 'openai' | 'fallback';
  warning?: string;
};

const NEUTRAL_FORCED_PLATING = {
  presentation: 75,
  garnish: 75,
  cleanliness: 75,
  lighting: 75,
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') resolve(result);
      else reject(new Error('Unexpected file reader result.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('File read failed.'));
    reader.readAsDataURL(file);
  });
}

export default function DishSharePage() {
  const params = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const copy = COPY[lang];
  const dish = getDishOrThrow(params.id);
  const captions = getShareCaptions(dish);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [tone, setTone] = useState<ToneId>('fineDining');
  const [captionLang, setCaptionLang] = useState<CaptionLangId>(lang);
  const [captionCache, setCaptionCache] = useState<Record<string, string>>({});
  const [caption, setCaption] = useState<string>(captions.fineDining);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [userEditedCaption, setUserEditedCaption] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selfRating, setSelfRating] = useState(4);
  const [shareNote, setShareNote] = useState('');
  const [analysis, setAnalysis] = useState<PlateAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [forceAccept, setForceAccept] = useState(false);

  function getColdFallbackCaption(toneId: ToneId, langId: CaptionLangId): string {
    if (langId === 'hi' && captions.hindi) return captions.hindi;
    if (langId === 'te' && captions.telugu) return captions.telugu;
    return captions[toneId];
  }

  useEffect(() => {
    const key = `${tone}|${captionLang}`;
    const cached = captionCache[key];
    if (cached) {
      setCaption(cached);
      setUserEditedCaption(false);
      return;
    }

    // Cold render: show templated fallback immediately.
    setCaption(getColdFallbackCaption(tone, captionLang));
    setUserEditedCaption(false);

    let cancelled = false;
    setCaptionLoading(true);

    (async () => {
      try {
        const res = await fetch('/api/caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dishId: dish.dishId,
            tone,
            language: captionLang,
            plateScore: analysis?.overall,
            suggestions: analysis?.suggestions,
          }),
        });
        const data = (await res.json()) as
          | { ok: true; source: 'openai' | 'fallback'; caption: string; warning?: string }
          | { ok: false; error: string };

        if (cancelled) return;
        if (data.ok && data.caption) {
          setCaptionCache((prev) => ({ ...prev, [key]: data.caption }));
          setCaption((current) => (userEditedCaptionRef.current ? current : data.caption));
        }
      } catch {
        // keep the cold fallback
      } finally {
        if (!cancelled) setCaptionLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tone, captionLang, dish.dishId, analysis?.overall]);

  const userEditedCaptionRef = useRef(false);
  useEffect(() => {
    userEditedCaptionRef.current = userEditedCaption;
  }, [userEditedCaption]);

  useEffect(() => {
    return () => {
      if (uploadedImage?.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  const mismatch = !!analysis && !analysis.dishMatch.matches && !forceAccept;
  const usingForcedFallback = !!analysis && !analysis.dishMatch.matches && forceAccept;

  const effectivePlating = analysis
    ? (usingForcedFallback ? NEUTRAL_FORCED_PLATING : analysis.plating)
    : null;

  const scores =
    uploadedImage && effectivePlating && !mismatch && !analyzing
      ? [
          { label: copy.presentation, value: effectivePlating.presentation },
          { label: copy.garnish, value: effectivePlating.garnish },
          { label: copy.cleanliness, value: effectivePlating.cleanliness },
          { label: copy.lighting, value: effectivePlating.lighting },
        ]
      : [];

  const baseOverall = usingForcedFallback
    ? Math.round(
        (NEUTRAL_FORCED_PLATING.presentation +
          NEUTRAL_FORCED_PLATING.garnish +
          NEUTRAL_FORCED_PLATING.cleanliness +
          NEUTRAL_FORCED_PLATING.lighting) /
          4,
      )
    : analysis?.overall ?? null;

  const overallScore =
    baseOverall === null || mismatch || analyzing
      ? null
      : Math.min(100, baseOverall + Math.round(selfRating * 0.6));

  const finalAssessment = !uploadedImage
    ? 'Upload the final plate to unlock the presentation rating.'
    : analyzing
      ? copy.scoring
      : overallScore !== null
        ? `ChefSense rating: ${overallScore} / 100`
        : 'Score will appear once the photo is accepted.';

  const suggestions = !uploadedImage || mismatch || analyzing ? [] : (analysis?.suggestions ?? []);

  async function handleShare() {
    const url = `${window.location.origin}${ROUTES.dish(dish.dishId)}`;
    const shareBody = [
      `${dish.dishName} by ChefSense`,
      `${dish.totalTimeMin} min guided cook`,
      caption,
      `Cook it here: ${url}`,
    ].join('\n');

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        let imageFile: File | null = null;
        if (uploadedImage?.startsWith('blob:')) {
          try {
            const blob = await fetch(uploadedImage).then((r) => r.blob());
            const ext = (blob.type.split('/')[1] ?? 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg';
            imageFile = new File([blob], `${dish.dishId}-plate.${ext}`, {
              type: blob.type || 'image/jpeg',
            });
          } catch {
            imageFile = null;
          }
        }

        const canShareFiles =
          imageFile !== null &&
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [imageFile] });

        if (canShareFiles && imageFile) {
          await navigator.share({
            title: `${dish.dishName} by ChefSense`,
            text: shareBody,
            url,
            files: [imageFile],
          });
        } else {
          await navigator.share({
            title: `${dish.dishName} by ChefSense`,
            text: shareBody,
            url,
          });
        }

        recordShareAction(dish.dishId, 'share');
        setShareNote(copy.sheet);
        return;
      } catch {
        // fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(shareBody);
    recordShareAction(dish.dishId, 'copy');
    setCopied(true);
    setShareNote(copy.fallback);
  }

  async function handleCopy() {
    const copyBody = [
      `${dish.dishName} by ChefSense`,
      `${dish.totalTimeMin} min guided cook`,
      caption,
      `Cook it here: ${window.location.origin}${ROUTES.dish(dish.dishId)}`,
    ].join('\n');
    await navigator.clipboard.writeText(copyBody);
    recordShareAction(dish.dishId, 'copy');
    setCopied(true);
    setShareNote(copy.copied);
  }

  function handleFile(file: File | null) {
    if (!file) return;
    if (uploadedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImage);
    }
    const nextUrl = URL.createObjectURL(file);
    setUploadedImage(nextUrl);
    setShareNote('');
    setAnalysis(null);
    setAnalysisError(null);
    setForceAccept(false);
    void analyzePlate(file);
  }

  async function analyzePlate(file: File) {
    setAnalyzing(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/analyze-plate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishId: dish.dishId, imageBase64: base64 }),
      });
      const data = (await res.json()) as
        | { ok: true; source: 'openai' | 'fallback'; dishMatch: PlateAnalysis['dishMatch']; plating: PlateAnalysis['plating']; overall: number; suggestions: string[]; warning?: string }
        | { ok: false; error: string };

      if (!data.ok) {
        setAnalysisError(data.error || 'Could not score the photo.');
        return;
      }

      setAnalysis({
        dishMatch: data.dishMatch,
        plating: data.plating,
        overall: data.overall,
        suggestions: data.suggestions,
        source: data.source,
        warning: data.warning,
      });
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Network error while scoring the photo.');
    } finally {
      setAnalyzing(false);
    }
  }

  function handleRetake() {
    if (uploadedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(null);
    setAnalysis(null);
    setAnalysisError(null);
    setForceAccept(false);
    if (uploadRef.current) uploadRef.current.value = '';
    uploadRef.current?.click();
  }

  return (
    <AppShell className="pb-32">
      <Header backHref={ROUTES.dishPlate(dish.dishId)} />

      <section className="text-center">
        <h1 className="h-display">{copy.title}</h1>
        <p className="mt-3 t-body-lg text-muted-foreground">{copy.subtitle}</p>
      </section>

      <ScreenCard className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <SectionEyebrow label={copy.photo} className="mb-0" />
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-primary/20 gradient-cta px-5 py-2.5 text-sm font-semibold text-white shadow-cta"
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
              <div className="h-card text-foreground">{copy.lockedTitle}</div>
              <div className="t-body text-muted-foreground">{copy.lockedBody}</div>
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
          {analyzing ? (
            <ScreenCard className="mt-4">
              <div className="flex items-center justify-center gap-3 px-4 py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm">{copy.scoring}</span>
              </div>
            </ScreenCard>
          ) : mismatch && analysis ? (
            <ScreenCard className="mt-4 border-amber-300/60 bg-amber-50/70">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="h-card text-foreground">
                    {copy.mismatchTitle} {dish.dishName}.
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{analysis.dishMatch.reason}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-primary/20 gradient-cta px-5 py-2.5 text-sm font-semibold text-white shadow-cta"
                    >
                      {copy.retake}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForceAccept(true)}
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-soft"
                    >
                      {copy.forceAccept}
                    </button>
                  </div>
                </div>
              </div>
            </ScreenCard>
          ) : analysisError ? (
            <ScreenCard className="mt-4">
              <SectionEyebrow label={copy.scoreTitle} />
              <p className="text-sm text-muted-foreground">{analysisError}</p>
            </ScreenCard>
          ) : (
            <>
              <ScreenCard className="mt-4">
                <SectionEyebrow label={copy.scoreTitle} />
                {usingForcedFallback ? (
                  <p className="mb-3 text-xs leading-5 text-muted-foreground">{copy.forcedNote}</p>
                ) : null}
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
              </ScreenCard>

              {suggestions.length > 0 ? (
                <ScreenCard className="mt-4">
                  <SectionEyebrow label={copy.suggestions} />
                  <ul className="space-y-2 t-body-lg text-foreground">
                    {suggestions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </ScreenCard>
              ) : null}
            </>
          )}
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
                    ? 'inline-flex min-h-11 items-center justify-center rounded-full border border-primary/20 gradient-cta px-5 py-2 text-sm font-semibold text-white shadow-cta'
                    : 'inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold text-foreground shadow-soft'
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <SectionEyebrow label={copy.captionLanguage} />
          <div className="flex flex-wrap gap-3">
            {CAPTION_LANGS.map((option) => {
              const active = option.id === captionLang;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setCaptionLang(option.id)}
                  className={
                    active
                      ? 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-primary/20 gradient-cta px-5 py-2 text-sm font-semibold text-white shadow-cta'
                      : 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold text-foreground shadow-soft'
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          value={caption}
          onChange={(event) => {
            setUserEditedCaption(true);
            setCaption(event.target.value);
          }}
          className="mt-4 min-h-[140px] w-full rounded-[22px] border border-border bg-background px-4 py-4 t-body-lg text-foreground outline-none focus:ring-2 focus:ring-primary/30"
        />
        {captionLoading ? (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>{copy.captionWriting}</span>
          </div>
        ) : null}
      </ScreenCard>

      <ScreenCard className="mt-4">
        <SectionEyebrow label={copy.finalRating} />
        <p className="t-body-lg text-muted-foreground">{finalAssessment}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{copy.selfRating}</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const active = index < selfRating;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelfRating(index + 1)}
                  className="inline-flex h-11 w-11 items-center justify-center"
                  aria-label={`Rate ${index + 1} star${index === 0 ? '' : 's'}`}
                >
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
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[22px] border border-border bg-card px-4 py-4 text-sm font-medium text-foreground shadow-soft"
        >
          <Copy className="h-4 w-4 text-primary" />
          {copy.copy}
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[22px] border border-primary/20 gradient-cta px-4 py-4 text-sm font-medium text-white shadow-cta"
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
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[22px] border border-border bg-card px-4 py-4 text-sm font-medium text-foreground shadow-soft"
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

      <div className="mt-5">
        <Link
          href={ROUTES.home}
          className="flex w-full items-center justify-center rounded-[24px] border border-primary/20 gradient-cta px-5 py-4 text-[17px] font-medium text-white shadow-cta"
        >
          {copy.done}
        </Link>
      </div>
    </AppShell>
  );
}
