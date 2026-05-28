'use client';

import { useMemo } from 'react';
import { useTranslatedRecord } from './use-dynamic-translation';
import type { CookingStep } from '../types';

/**
 * Returns the step with title, instruction, beginnerExplanation,
 * whyThisMatters, and each sensoryCue translated into the active language.
 *
 * - When the active lang is 'en', the input is returned unchanged.
 * - Translations are batched into a single /api/translate call and cached
 *   server- and client-side, so step navigation in HI/TE is cheap after the
 *   first hit.
 */
export function useLocalizedStep(step: CookingStep): CookingStep {
  const sensoryKeys = step.sensoryCues.map((_, index) => `cue${index}`);

  const items = useMemo<Record<string, string>>(() => {
    const base: Record<string, string> = {
      title: step.title,
      instruction: step.instruction,
      beginnerExplanation: step.beginnerExplanation,
      whyThisMatters: step.whyThisMatters ?? '',
    };
    step.sensoryCues.forEach((cue, index) => {
      base[`cue${index}`] = cue.cue;
    });
    return base;
  }, [step]);

  const translated = useTranslatedRecord(items, {
    context: 'A chef-guided step in an Indian recipe. Keep numbers and timings literal.',
  });

  return useMemo<CookingStep>(() => {
    return {
      ...step,
      title: translated.title || step.title,
      instruction: translated.instruction || step.instruction,
      beginnerExplanation: translated.beginnerExplanation || step.beginnerExplanation,
      whyThisMatters: translated.whyThisMatters || step.whyThisMatters,
      sensoryCues: step.sensoryCues.map((cue, index) => ({
        ...cue,
        cue: translated[sensoryKeys[index]] || cue.cue,
      })),
    };
    // sensoryKeys is derived from step.sensoryCues length, which is captured by `step`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, translated]);
}
