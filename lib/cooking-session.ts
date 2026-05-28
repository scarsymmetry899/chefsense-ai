'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  hydrateKeyFromSupabase,
  readLocalJson,
  syncKeyToSupabase,
  writeLocalJson,
} from '@/lib/persistence/supabase-browser';

export type CookingSessionState = {
  activeStep: number;
  completedSteps: number[];
  runningStep: number | null;
  startedAt: number | null;
  elapsedByStep: Record<number, number>;
  timerArmedAt: number | null;
  finishedAt: number | null;
};

const STORAGE_PREFIX = 'chefsense.cook.';

function getStorageKey(dishId: string) {
  return `${STORAGE_PREFIX}${dishId}`;
}

const EMPTY_SESSION: CookingSessionState = {
  activeStep: 1,
  completedSteps: [],
  runningStep: null,
  startedAt: null,
  elapsedByStep: {},
  timerArmedAt: null,
  finishedAt: null,
};

export function getStoredCookingSession(dishId: string): CookingSessionState | null {
  if (typeof window === 'undefined') return null;
  return readLocalJson<CookingSessionState | null>(getStorageKey(dishId), null);
}

export function getResumeStepForDish(dishId: string, fallbackStep = 1) {
  const stored = getStoredCookingSession(dishId);
  if (!stored) return fallbackStep;
  if (stored.finishedAt) return fallbackStep;
  return stored.activeStep || fallbackStep;
}

export function hasInProgressDish(dishId: string) {
  const stored = getStoredCookingSession(dishId);
  return Boolean(
    stored &&
      !stored.finishedAt &&
      (stored.activeStep >= 1 || stored.completedSteps.length > 0 || Object.keys(stored.elapsedByStep).length > 0),
  );
}

export function getTotalCookingMinutes(dishId: string) {
  const stored = getStoredCookingSession(dishId);
  if (!stored) return 0;
  const totalSeconds = Object.values(stored.elapsedByStep).reduce((sum, value) => sum + value, 0);
  return Math.round(totalSeconds / 60);
}

export function useCookingSession(dishId: string, initialStep: number) {
  const storageKey = getStorageKey(dishId);
  const [state, setState] = useState<CookingSessionState>({
    ...EMPTY_SESSION,
    activeStep: initialStep,
  });
  const [now, setNow] = useState(() => Date.now());
  const hasHydratedRef = useRef(false);
  const lastSyncedRef = useRef<string | null>(null);

  // Hydrate from localStorage first (instant), then from Supabase (async,
  // last-write-wins). The Supabase hydrate may update localStorage which we
  // pick up on a microtask.
  useEffect(() => {
    let cancelled = false;

    function applyFromStorage() {
      if (cancelled) return;
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<CookingSessionState>;
        setState((current) => ({
          activeStep: typeof parsed.activeStep === 'number' ? parsed.activeStep : current.activeStep,
          completedSteps: Array.isArray(parsed.completedSteps) ? parsed.completedSteps : current.completedSteps,
          runningStep:
            typeof parsed.runningStep === 'number' || parsed.runningStep === null
              ? (parsed.runningStep ?? null)
              : current.runningStep,
          startedAt:
            typeof parsed.startedAt === 'number' || parsed.startedAt === null
              ? (parsed.startedAt ?? null)
              : current.startedAt,
          elapsedByStep:
            parsed.elapsedByStep && typeof parsed.elapsedByStep === 'object'
              ? (parsed.elapsedByStep as Record<number, number>)
              : current.elapsedByStep,
          timerArmedAt:
            typeof parsed.timerArmedAt === 'number' || parsed.timerArmedAt === null
              ? (parsed.timerArmedAt ?? null)
              : current.timerArmedAt,
          finishedAt:
            typeof parsed.finishedAt === 'number' || parsed.finishedAt === null
              ? (parsed.finishedAt ?? null)
              : current.finishedAt,
        }));
      } catch {
        // Ignore malformed stored state.
      }
    }

    applyFromStorage();
    hasHydratedRef.current = true;

    // Pull from Supabase in the background — if it's newer, the local copy is
    // refreshed and the next read after the microtask reflects it.
    void hydrateKeyFromSupabase<CookingSessionState>(storageKey).then((updated) => {
      if (updated && !cancelled) {
        applyFromStorage();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  // Persist locally + push to Supabase on every change, but skip the first
  // render before hydration completes (otherwise we'd overwrite remote state
  // with the empty default).
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    try {
      writeLocalJson(storageKey, state);
      const serialized = JSON.stringify(state);
      if (serialized !== lastSyncedRef.current) {
        lastSyncedRef.current = serialized;
        void syncKeyToSupabase(storageKey, state);
      }
    } catch {
      // Ignore write failures.
    }
  }, [state, storageKey]);

  useEffect(() => {
    if (!state.runningStep || !state.startedAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [state.runningStep, state.startedAt]);

  useEffect(() => {
    setState((current) =>
      current.activeStep === initialStep
        ? current
        : {
            ...current,
            activeStep: initialStep,
            runningStep: current.runningStep,
            startedAt: current.startedAt,
            timerArmedAt: current.timerArmedAt,
          },
    );
  }, [initialStep]);

  const liveElapsedSeconds = useMemo(() => {
    if (!state.runningStep || !state.startedAt) return 0;
    return Math.floor((now - state.startedAt) / 1000);
  }, [now, state.runningStep, state.startedAt]);

  const armedSeconds = useMemo(() => {
    if (!state.timerArmedAt) return 0;
    return Math.floor((now - state.timerArmedAt) / 1000);
  }, [now, state.timerArmedAt]);

  function getElapsedForStep(stepIndex: number) {
    const saved = state.elapsedByStep[stepIndex] ?? 0;
    if (state.runningStep === stepIndex) {
      return saved + liveElapsedSeconds;
    }
    return saved;
  }

  function startStep(stepIndex: number) {
    const nowTs = Date.now();
    setNow(nowTs);
    setState((current) => ({
      ...current,
      activeStep: stepIndex,
      runningStep: stepIndex,
      startedAt: nowTs,
      timerArmedAt: nowTs,
      finishedAt: null,
    }));
  }

  function pauseStep() {
    const nowTs = Date.now();
    setNow(nowTs);
    setState((current) => {
      if (!current.runningStep || !current.startedAt) return current;
      const stepIndex = current.runningStep;
      const elapsed = (current.elapsedByStep[stepIndex] ?? 0) + Math.floor((nowTs - current.startedAt) / 1000);
      return {
        ...current,
        runningStep: null,
        startedAt: null,
        elapsedByStep: {
          ...current.elapsedByStep,
          [stepIndex]: elapsed,
        },
      };
    });
  }

  function markStepComplete(stepIndex: number, nextStep?: number) {
    const nowTs = Date.now();
    setNow(nowTs);
    setState((current) => {
      const alreadyDone = current.completedSteps.includes(stepIndex);
      const elapsed =
        current.runningStep === stepIndex && current.startedAt
          ? (current.elapsedByStep[stepIndex] ?? 0) + Math.floor((nowTs - current.startedAt) / 1000)
          : (current.elapsedByStep[stepIndex] ?? 0);

      return {
        ...current,
        activeStep: nextStep ?? stepIndex,
        completedSteps: alreadyDone
          ? current.completedSteps
          : [...current.completedSteps, stepIndex].sort((a, b) => a - b),
        runningStep: null,
        startedAt: null,
        timerArmedAt: null,
        elapsedByStep: {
          ...current.elapsedByStep,
          [stepIndex]: elapsed,
        },
        finishedAt: nextStep ? null : nowTs,
      };
    });
  }

  function reopenStep(stepIndex: number) {
    const nowTs = Date.now();
    setNow(nowTs);
    setState((current) => ({
      ...current,
      activeStep: stepIndex,
      completedSteps: current.completedSteps.filter((item) => item !== stepIndex),
      runningStep: stepIndex,
      startedAt: nowTs,
      timerArmedAt: nowTs,
      finishedAt: null,
    }));
  }

  function abandonDish() {
    setState({ ...EMPTY_SESSION });
  }

  return {
    session: state,
    getElapsedForStep,
    startStep,
    pauseStep,
    markStepComplete,
    reopenStep,
    abandonDish,
    armedSeconds,
  };
}
