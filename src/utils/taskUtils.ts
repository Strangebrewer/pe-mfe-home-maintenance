import { HomeTask, HomeTaskFrequency } from '../types/homeMaintenance';

const FREQUENCY_DAYS: Record<HomeTaskFrequency, number | null> = {
  [HomeTaskFrequency.MONTHLY]: 30,
  [HomeTaskFrequency.SEASONAL]: 90,
  [HomeTaskFrequency.BI_ANNUAL]: 180,
  [HomeTaskFrequency.ANNUAL]: 365,
  [HomeTaskFrequency.AS_NEEDED]: null,
};

export const FREQUENCY_LABELS: Record<HomeTaskFrequency, string> = {
  [HomeTaskFrequency.MONTHLY]: 'Monthly',
  [HomeTaskFrequency.SEASONAL]: 'Seasonal',
  [HomeTaskFrequency.BI_ANNUAL]: 'Bi-Annual',
  [HomeTaskFrequency.ANNUAL]: 'Annual',
  [HomeTaskFrequency.AS_NEEDED]: 'As Needed',
};

export function getNextDueDate(task: HomeTask): Date | null {
  const days = FREQUENCY_DAYS[task.frequency];
  if (days === null || !task.lastCompletionDate) return null;
  const next = new Date(task.lastCompletionDate);
  next.setDate(next.getDate() + days);
  return next;
}

export function getDaysUntilDue(task: HomeTask): number | null {
  const nextDue = getNextDueDate(task);
  if (!nextDue) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function sortTasksByUrgency(tasks: HomeTask[]): HomeTask[] {
  return [...tasks].sort((a, b) => {
    const aNeverDone = !a.lastCompletionDate && a.frequency !== HomeTaskFrequency.AS_NEEDED;
    const bNeverDone = !b.lastCompletionDate && b.frequency !== HomeTaskFrequency.AS_NEEDED;
    if (aNeverDone && !bNeverDone) return -1;
    if (!aNeverDone && bNeverDone) return 1;

    const daysA = getDaysUntilDue(a);
    const daysB = getDaysUntilDue(b);
    if (daysA !== null && daysB !== null) return daysA - daysB;
    if (daysA !== null) return -1;
    if (daysB !== null) return 1;
    return 0;
  });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
