'use client';

import { useMemo } from 'react';
import { useTranslatedRecord } from './use-dynamic-translation';
import type { Dish } from '../types';

export type LocalizedDishView = {
  dishName: string;
  summary: string;
  ingredients: Array<{ id: string; name: string; note?: string }>;
  tools: Array<{ id: string; name: string }>;
};

/**
 * Returns the dish header + ingredients + tools with all user-visible text
 * translated into the active language via /api/translate (Gemini-backed).
 *
 * - When lang is 'en' the strings pass through unchanged (the underlying hook
 *   short-circuits).
 * - Translation is batched in a single request and cached server- and client-
 *   side, so opening a different dish or returning to the same page is cheap.
 * - During the first paint in HI/TE the English value is shown; it swaps in
 *   when /api/translate resolves (a few hundred ms).
 */
export function useLocalizedDishView(dish: Dish): LocalizedDishView {
  const items = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {
      dishName: dish.dishName,
      summary: dish.summary,
    };
    dish.ingredients.forEach((ing) => {
      map[`ing-${ing.id}-name`] = ing.name;
      if (ing.note) map[`ing-${ing.id}-note`] = ing.note;
    });
    dish.tools.forEach((tool) => {
      map[`tool-${tool.id}-name`] = tool.name;
    });
    return map;
  }, [dish]);

  const translated = useTranslatedRecord(items, {
    context:
      'Mise en place for an Indian recipe. Keep ingredient names that are commonly used untranslated in kitchens (e.g. ghee, tadka, biryani masala) unchanged.',
  });

  return useMemo<LocalizedDishView>(() => {
    return {
      dishName: translated.dishName || dish.dishName,
      summary: translated.summary || dish.summary,
      ingredients: dish.ingredients.map((ing) => ({
        id: ing.id,
        name: translated[`ing-${ing.id}-name`] || ing.name,
        note: ing.note ? translated[`ing-${ing.id}-note`] || ing.note : undefined,
      })),
      tools: dish.tools.map((tool) => ({
        id: tool.id,
        name: translated[`tool-${tool.id}-name`] || tool.name,
      })),
    };
  }, [dish, translated]);
}
