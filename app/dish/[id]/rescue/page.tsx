'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { ROUTES } from '@/lib/constants/routes';

export default function DishRescuePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = Number(searchParams.get('step') ?? 1);

  useEffect(() => {
    router.replace(ROUTES.dishPanCheck(params.id, step));
  }, [params.id, router, step]);

  return (
    <AppShell>
      <Header backHref={ROUTES.dishCook(params.id, step)} title="Redirecting to AI Pan Checker" />
      <div className="rounded-[24px] border border-border bg-card px-4 py-5 text-sm text-muted-foreground shadow-soft">
        ChefSense now combines visual analysis and fix guidance in one place so you do not have to jump between separate rescue screens.
      </div>
    </AppShell>
  );
}
