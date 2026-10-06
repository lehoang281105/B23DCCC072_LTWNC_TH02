import type { Assignment } from '../types/assignment';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Ép về 00:00 của ngày địa phương */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}


/** Phần C — số ngày còn lại tới hạn nộp (âm = đã qua; 0 = hôm nay; bỏ qua phần giờ) */
export function calcDaysLeft(deadlineIso: string, now: Date = new Date()): number {
  const diff = startOfDay(new Date(deadlineIso)).getTime() - startOfDay(now).getTime();
  return Math.round(diff / MS_PER_DAY);
}

/** Định dạng hạn nộp để hiển thị */
export function formatDeadline(deadlineIso: string): string {
  return new Date(deadlineIso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Chuẩn hoá một Date thành 'yyyy-mm-dd' theo giờ địa phương */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 'yyyy-mm-dd' của hôm nay — dùng cho min của input[date] */
export function todayIso(now: Date = new Date()): string {
  return toIsoDate(now);
}

/** Tạo hạn nộp cách hôm nay `days` ngày — dùng cho dữ liệu mẫu của mock API */
export function daysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/** Phần C — bài tập chưa hoàn thành AND đã qua hạn nộp */
export function isOverdue(assignment: Assignment, now: Date = new Date()): boolean {
  return !assignment.completed && calcDaysLeft(assignment.deadline, now) < 0;
}
