import { isOverdue } from '../../utils/date';
import type { Assignment } from '../../types/assignment';

export interface SubjectStat {
  subject: string;
  total: number;
  completed: number;
  overdue: number;
}

export interface StatsSummary {
  total: number;
  completed: number;
  overdue: number;
  subjects: SubjectStat[];
}

/**
 * Phần C — hàm thuần tính thống kê cho trang Thống kê:
 * tổng số bài, số đã hoàn thành, số quá hạn và thống kê theo từng môn.
 * Tách khỏi component để unit test dễ (đúng tên `calcStats` trong đề).
 */
export function calcStats(items: readonly Assignment[]): StatsSummary {
  const bySubject = new Map<string, SubjectStat>();
  let completed = 0;
  let overdue = 0;

  for (const assignment of items) {
    const isOd = isOverdue(assignment);
    if (assignment.completed) completed += 1;
    if (isOd) overdue += 1;

    const entry = bySubject.get(assignment.subject) ?? {
      subject: assignment.subject,
      total: 0,
      completed: 0,
      overdue: 0,
    };
    entry.total += 1;
    if (assignment.completed) entry.completed += 1;
    if (isOd) entry.overdue += 1;
    bySubject.set(assignment.subject, entry);
  }

  return {
    total: items.length,
    completed,
    overdue,
    subjects: [...bySubject.values()].sort(
      (a, b) => b.total - a.total || a.subject.localeCompare(b.subject, 'vi'),
    ),
  };
}
