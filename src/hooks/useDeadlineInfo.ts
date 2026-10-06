import { useMemo } from 'react';
import { useNow } from './useNow';
import { calcDaysLeft } from '../utils/date';

export type DeadlineInfo =
  | { kind: 'remaining'; days: number; label: string }
  | { kind: 'today'; days: 0; label: string }
  | { kind: 'overdue'; days: number; label: string };

export function useDeadlineInfo(deadlineIso: string): DeadlineInfo {
  const now = useNow();

  return useMemo(() => {
    const days = calcDaysLeft(deadlineIso, now);
    if (days > 0) {
      return { kind: 'remaining', days, label: `Còn ${days} ngày` };
    }
    if (days === 0) {
      return { kind: 'today', days: 0, label: 'Đến hạn hôm nay' };
    }
    return { kind: 'overdue', days: -days, label: `Quá hạn ${-days} ngày` };
  }, [deadlineIso, now]);
}
