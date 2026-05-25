/**
 * Dish index — every dish in the app flows through here.
 * Validates at import time so bad data fails the build, not the user.
 */

import { DishSchema, type Dish, type DishSummary } from '../types';
import { paneerButterMasala } from './paneer-butter-masala';
import { dalTadka } from './dal-tadka';
import { chickenBiryani } from './chicken-biryani';
import { eggsKejriwal } from './eggs-kejriwal';
import { bandiChickenFriedRice } from './bandi-chicken-fried-rice';

// Validate at import time. Throws loudly on schema mismatch.
const validated = [
  paneerButterMasala,
  chickenBiryani,
  dalTadka,
  eggsKejriwal,
  bandiChickenFriedRice,
].map((d, i) => {
  const result = DishSchema.safeParse(d);
  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error(`[dishes] validation failed for dish #${i}:`, result.error.format());
    throw new Error(`Invalid dish data at index ${i}`);
  }
  return result.data;
});

export const ALL_DISHES: Dish[] = validated;

/** Map for fast id lookup. */
const dishById: Record<string, Dish> = Object.fromEntries(
  ALL_DISHES.map((d) => [d.dishId, d]),
);

export function getDish(dishId: string): Dish | undefined {
  return dishById[dishId];
}

export function getDishOrThrow(dishId: string): Dish {
  const dish = dishById[dishId];
  if (!dish) throw new Error(`Unknown dish: ${dishId}`);
  return dish;
}

/** Cards on the home screen. */
export function listDishSummaries(): DishSummary[] {
  return ALL_DISHES.map(
    ({
      dishId,
      dishName,
      cuisine,
      difficulty,
      totalTimeMin,
      heroImage,
      summary,
      isVegetarian,
      mood,
    }) => ({
      dishId,
      dishName,
      cuisine,
      difficulty,
      totalTimeMin,
      heroImage,
      summary,
      isVegetarian,
      mood,
    }),
  );
}

/** Featured dish for Home + Welcome. */
export const FEATURED_DISH_ID = 'paneer-butter-masala';
