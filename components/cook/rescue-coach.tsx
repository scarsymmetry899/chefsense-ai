'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, Lightbulb, LifeBuoy, Loader2, Shield, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import type { LanguageCode } from '@/lib/i18n/dictionary';

type RescueCoachProps = {
  dishId: string;
  stepIndex: number;
  stepTitle: string;
};

type Confidence = 'low' | 'medium' | 'high';

type FixSuggestionsResponse = {
  ok: boolean;
  source?: 'openai' | 'fallback';
  diagnosis?: string;
  immediateFix?: string[];
  preventNextTime?: string[];
  confidence?: Confidence;
  warning?: string;
  error?: string;
};

type SymptomChip = {
  id: string;
  label: string;
};

const DEFAULT_CHIPS: SymptomChip[] = [
  { id: 'sticking', label: 'Sticking' },
  { id: 'burning', label: 'Burning' },
  { id: 'too-salty', label: 'Too salty' },
  { id: 'too-watery', label: 'Too watery' },
  { id: 'raw-inside', label: 'Raw inside' },
  { id: 'looks-off', label: 'Looks off' },
];

function localeFromLang(lang: LanguageCode): 'en' | 'hi' | 'te' {
  return lang === 'hi' || lang === 'te' ? lang : 'en';
}

function confidenceLabel(confidence?: Confidence): string {
  if (confidence === 'high') return 'High confidence';
  if (confidence === 'medium') return 'Medium confidence';
  if (confidence === 'low') return 'Low confidence';
  return '';
}

export function RescueCoach({ dishId, stepIndex, stepTitle }: RescueCoachProps) {
  const { lang } = useLanguage();
  const locale = localeFromLang(lang);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FixSuggestionsResponse | null>(null);

  const chips = useMemo(() => DEFAULT_CHIPS, []);

  const toggleChip = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const reset = () => {
    setSelected([]);
    setFreeText('');
    setResult(null);
    setError(null);
  };

  const closePanel = () => {
    setOpen(false);
    reset();
  };

  const askChefSense = async () => {
    if (pending) return;
    if (!selected.length && !freeText.trim()) {
      setError('Pick a symptom or describe what you are seeing.');
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/fix-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishId,
          currentStep: stepIndex,
          symptoms: selected,
          freeText: freeText.trim(),
          locale,
        }),
      });

      const payload = (await response.json()) as FixSuggestionsResponse;

      if (!payload.ok) {
        throw new Error(payload.error || 'ChefSense could not generate a rescue right now.');
      }

      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach ChefSense.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full border border-copper/40 bg-secondary-soft px-4 py-2 text-sm font-medium text-copper shadow-soft transition-transform active:scale-[0.98]"
        aria-expanded={open}
      >
        <LifeBuoy className="h-4 w-4" />
        <span>Need a rescue?</span>
      </button>

      {open ? (
        <div className="mt-3 card-warm paper-panel space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">
                Rescue this step
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Tell ChefSense what is happening with{' '}
                <span className="font-medium text-foreground">{stepTitle.toLowerCase()}</span>.
              </div>
            </div>
            <button
              type="button"
              onClick={closePanel}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-card"
              aria-label="Close rescue panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => {
              const active = selected.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => toggleChip(chip.id)}
                  className={
                    active
                      ? 'inline-flex items-center rounded-full border border-copper bg-copper px-3 py-1.5 text-xs font-medium text-white shadow-soft'
                      : 'inline-flex items-center rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-copper/60'
                  }
                  aria-pressed={active}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="rescue-freetext">
              Anything else?
            </label>
            <textarea
              id="rescue-freetext"
              value={freeText}
              onChange={(event) => setFreeText(event.target.value)}
              rows={2}
              placeholder="e.g. masala looks grainy and the oil is not separating yet"
              className="mt-1 w-full resize-none rounded-[18px] border border-border/70 bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-copper"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={reset}
              disabled={pending}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={askChefSense}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full gradient-cta px-4 py-2 text-sm font-medium text-white shadow-cta disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Asking…
                </>
              ) : (
                <>
                  <LifeBuoy className="h-4 w-4" />
                  Ask ChefSense
                </>
              )}
            </button>
          </div>

          {error ? (
            <div className="rounded-[16px] border border-primary/30 bg-primary-soft/55 px-3 py-2 text-xs text-primary-dark">
              {error}
            </div>
          ) : null}

          {result && result.ok ? (
            <div className="space-y-3">
              {result.warning ? (
                <div className="rounded-[16px] border border-border/70 bg-card px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {result.source === 'fallback' ? 'Offline rescue' : 'ChefSense rescue'}
                  {confidenceLabel(result.confidence) ? ` · ${confidenceLabel(result.confidence)}` : ''}
                </div>
              ) : (
                <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {result.source === 'fallback' ? 'Offline rescue' : 'ChefSense rescue'}
                  {confidenceLabel(result.confidence) ? ` · ${confidenceLabel(result.confidence)}` : ''}
                </div>
              )}

              {result.diagnosis ? (
                <div className="rounded-[20px] border border-primary/20 bg-primary-soft/40 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm font-semibold text-primary-dark">Diagnosis</div>
                      <div className="mt-1 text-sm leading-relaxed text-foreground">
                        {result.diagnosis}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {result.immediateFix?.length ? (
                <div className="rounded-[20px] border border-copper/30 bg-secondary-soft/60 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="mt-0.5 h-5 w-5 text-copper" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-copper">Do this now</div>
                      <ul className="mt-1 space-y-1 text-sm leading-relaxed text-foreground">
                        {result.immediateFix.map((tip, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-copper" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}

              {result.preventNextTime?.length ? (
                <div className="rounded-[20px] border border-accent-green/30 bg-accent-green-soft/50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 text-accent-green" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-accent-green">Next time</div>
                      <ul className="mt-1 space-y-1 text-sm leading-relaxed text-foreground">
                        {result.preventNextTime.map((tip, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-accent-green" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
