import { calcDaysLeft, isOverdue, toIsoDate } from './date';
import type { Assignment } from '../types/assignment';

// Mốc "hôm nay" cố định (giờ địa phương 15:30 — có phần giờ để kiểm tra startOfDay)
const NOW = new Date(2026, 9, 6, 15, 30, 0);
// Sinh deadline 'yyyy-mm-dd' theo giờ địa phương, lệch `offsetDays` ngày so với NOW
const deadlineOf = (offsetDays: number): string =>
  toIsoDate(new Date(2026, 9, 6 + offsetDays, 12, 0, 0));

function make(completed: boolean, deadline: string): Assignment {
  return { id: 'x1', subject: 'Toán rời rạc', title: 'Bài tập', deadline, priority: 'medium', completed };
}

describe('calcDaysLeft — unit (Phần C)', () => {
  it('hạn đúng hôm nay = 0, kể cả khi giờ hiện tại là 23:59 (bỏ qua phần giờ)', () => {
    expect(calcDaysLeft(deadlineOf(0), NOW)).toBe(0);
    expect(calcDaysLeft(deadlineOf(0), new Date(2026, 9, 6, 23, 59, 59))).toBe(0);
  });

  it('hạn trong tương lai: số dương', () => {
    expect(calcDaysLeft(deadlineOf(1), NOW)).toBe(1);
    expect(calcDaysLeft(deadlineOf(10), NOW)).toBe(10);
  });

  it('hạn đã qua: số âm', () => {
    expect(calcDaysLeft(deadlineOf(-1), NOW)).toBe(-1);
    expect(calcDaysLeft(deadlineOf(-10), NOW)).toBe(-10);
  });

  it('biên: khác tháng và khoảng cách nhiều ngày', () => {
    // 6/10 → 1/11 là 26 ngày
    expect(calcDaysLeft('2026-11-01', NOW)).toBe(26);
    // 1/1 → 6/10/2026 là 278 ngày
    expect(calcDaysLeft('2026-01-01', NOW)).toBe(-278);
  });
});

describe('isOverdue — unit (Phần C)', () => {
  it('chưa hoàn thành + đã qua hạn → true', () => {
    expect(isOverdue(make(false, deadlineOf(-1)), NOW)).toBe(true);
    expect(isOverdue(make(false, deadlineOf(-30)), NOW)).toBe(true);
  });

  it('biên: đúng hạn hôm nay → false (chỉ tính khi âm)', () => {
    expect(isOverdue(make(false, deadlineOf(0)), NOW)).toBe(false);
  });

  it('còn hạn → false', () => {
    expect(isOverdue(make(false, deadlineOf(3)), NOW)).toBe(false);
  });

  it('đã hoàn thành thì dù trễ hạn vẫn false', () => {
    expect(isOverdue(make(true, deadlineOf(-30)), NOW)).toBe(false);
  });
});
