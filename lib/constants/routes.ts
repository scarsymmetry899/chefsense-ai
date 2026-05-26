/**
 * ChefSense AI — Central Route Map
 *
 * Single source of truth for every navigation target in the app.
 * Never hardcode route strings inside components — import from here.
 *
 * Why:
 *   - Easy to rename or restructure routes in one place
 *   - Type-safe parameter passing
 *   - Pairs with API_ROUTES for fetch calls
 */

export const ROUTES = {
  welcome: '/',
  home: '/home',

  dish: (id: string) => `/dish/${id}`,
  dishSources: (id: string) => `/dish/${id}/sources`,
  dishMiseEnPlace: (id: string) => `/dish/${id}/mise-en-place`,
  dishCook: (id: string, step?: number) =>
    typeof step === 'number'
      ? `/dish/${id}/cook?step=${step}`
      : `/dish/${id}/cook`,
  dishVoice: (id: string, step?: number) =>
    typeof step === 'number'
      ? `/dish/${id}/voice?step=${step}`
      : `/dish/${id}/voice`,
  dishPanCheck: (id: string, step?: number) =>
    typeof step === 'number'
      ? `/dish/${id}/pan-check?step=${step}`
      : `/dish/${id}/pan-check`,
  dishRescue: (id: string, issueId?: string, step?: number) => {
    const params = new URLSearchParams();
    if (issueId) params.set('issue', issueId);
    if (typeof step === 'number') params.set('step', String(step));
    const query = params.toString();
    return query ? `/dish/${id}/rescue?${query}` : `/dish/${id}/rescue`;
  },
  dishFinish: (id: string) => `/dish/${id}/finish`,
  dishPlate: (id: string) => `/dish/${id}/plate`,
  dishShare: (id: string) => `/dish/${id}/share`,
} as const;

export const API_ROUTES = {
  generateRecipe: '/api/generate-recipe',
  rescue: '/api/rescue',
  translate: '/api/translate',
  analyzePan: '/api/analyze-pan',
} as const;

/** Bottom-nav targets — used by BottomNav. */
export const BOTTOM_NAV_ITEMS = [
  { key: 'home', label: 'Home', href: ROUTES.home, icon: 'home' as const },
  {
    key: 'cook',
    label: 'Cook',
    href: ROUTES.dishMiseEnPlace('paneer-butter-masala'),
    icon: 'chef-hat' as const,
  },
  {
    key: 'rescue',
    label: 'Rescue',
    href: ROUTES.dishRescue('paneer-butter-masala', 'raw-masala-taste', 1),
    icon: 'life-buoy' as const,
  },
  { key: 'pantry', label: 'Pantry', href: ROUTES.home, icon: 'archive' as const },
  { key: 'profile', label: 'Profile', href: ROUTES.home, icon: 'user' as const },
] as const;

export type BottomNavKey = (typeof BOTTOM_NAV_ITEMS)[number]['key'];
