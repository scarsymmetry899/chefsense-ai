'use client';

import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { ScreenCard, SectionEyebrow } from '@/components/dish/screen-kit';
import { ROUTES } from '@/lib/constants/routes';
import { ALL_DISHES, getDish } from '@/lib/data/dishes';
import { getShareActions, getRecentlyViewedDishes } from '@/lib/user-state';
import { getTotalCookingMinutes, hasInProgressDish } from '@/lib/cooking-session';

export default function ProfilePage() {
  const recent = getRecentlyViewedDishes();
  const shares = getShareActions();
  const totalMinutes = ALL_DISHES.reduce((sum, dish) => sum + getTotalCookingMinutes(dish.dishId), 0);
  const inProgress = ALL_DISHES.filter((dish) => hasInProgressDish(dish.dishId)).length;

  return (
    <AppShell>
      <Header backHref={ROUTES.home} title="Profile" />

      <ScreenCard>
        <SectionEyebrow label="Your cooking profile" />
        <div className="font-serif text-[28px] leading-none text-foreground">Abhit</div>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">
          +91 • ChefSense home cook • guided Indian cooking enthusiast
        </div>
      </ScreenCard>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ScreenCard className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Minutes cooking</div>
          <div className="mt-2 font-serif text-[30px] text-foreground">{totalMinutes}</div>
        </ScreenCard>
        <ScreenCard className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Dishes in progress</div>
          <div className="mt-2 font-serif text-[30px] text-foreground">{inProgress}</div>
        </ScreenCard>
        <ScreenCard className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Recently viewed</div>
          <div className="mt-2 font-serif text-[30px] text-foreground">{recent.length}</div>
        </ScreenCard>
        <ScreenCard className="p-4 text-center">
          <div className="text-sm text-muted-foreground">Shared dishes</div>
          <div className="mt-2 font-serif text-[30px] text-foreground">{shares.length}</div>
        </ScreenCard>
      </div>

      <div className="mt-5 -mx-5 overflow-x-auto px-5 scrollbar-hide">
        <div className="flex gap-3 pb-1">
          {recent.slice(0, 5).map((entry) => {
            const dish = getDish(entry.dishId);
            if (!dish) return null;
            return (
              <ScreenCard key={entry.dishId} className="w-[220px] shrink-0">
                <SectionEyebrow label="Recent dish" />
                <div className="font-serif text-[22px] leading-none text-foreground">{dish.dishName}</div>
                <div className="mt-2 text-sm text-muted-foreground">{dish.summary}</div>
              </ScreenCard>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
