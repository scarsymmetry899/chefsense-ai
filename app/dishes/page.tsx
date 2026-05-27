import Link from 'next/link';
import { Clock3 } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { ALL_DISHES } from '@/lib/data/dishes';
import { ROUTES } from '@/lib/constants/routes';

const MOOD_MAP = {
  comfort: 'Comfort Food',
  quick: 'Quick & Easy',
  protein: 'High Protein',
  weekend: 'Weekend Special',
  festive: 'Festive Treats',
} as const;

export default async function DishesPage({
  searchParams,
}: {
  searchParams: Promise<{ mood?: keyof typeof MOOD_MAP }>;
}) {
  const params = await searchParams;
  const mood = params.mood;
  const dishes = mood && MOOD_MAP[mood]
    ? ALL_DISHES.filter((dish) => dish.mood.includes(MOOD_MAP[mood]))
    : ALL_DISHES;

  return (
    <AppShell>
      <Header backHref={ROUTES.home} title="Browse Dish Guides" />

      <div className="rounded-[24px] border border-border bg-card px-4 py-4 shadow-soft">
        <div className="font-serif text-[28px] leading-none text-foreground">
          {mood ? `${MOOD_MAP[mood]} picks` : 'All guided dishes'}
        </div>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">
          Five source-backed dishes are live now. More chef-guided dishes are coming soon.
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {dishes.map((dish) => (
          <Link
            key={dish.dishId}
            href={ROUTES.dish(dish.dishId)}
            className="block rounded-[24px] border border-border bg-card px-4 py-4 shadow-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-serif text-[26px] leading-none text-foreground">{dish.dishName}</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">{dish.summary}</div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-primary-soft px-3 py-1.5 text-primary-dark">{dish.difficulty}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {dish.totalTimeMin} min
                  </span>
                </div>
              </div>
              <span className="text-primary">→</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-[24px] border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
        More dish guides are coming soon. Version 2.0 will add “upload your picture and get the recipe”.
      </div>
    </AppShell>
  );
}
