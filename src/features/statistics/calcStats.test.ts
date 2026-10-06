import { calcStats } from './calcStats';
import { daysFromToday } from '../../utils/date';
import type { Assignment } from '../../types/assignment';

function make(id: string, subject: string, completed: boolean, deadline: string): Assignment {
  return { id, subject, title: `Bài ${id}`, deadline, priority: 'medium', completed };
}

describe('calcStats — unit thống kê trang Thống kê (Phần C)', () => {
  it('danh sách rỗng: mọi số bằng 0', () => {
    const stats = calcStats([]);
    expect(stats).toEqual({ total: 0, completed: 0, overdue: 0, subjects: [] });
  });

  it('đếm đúng tổng, đã hoàn thành, quá hạn', () => {
    const items = [
      make('1', 'Web', true, daysFromToday(-5)), // hoàn thành, trễ hạn → không tính quá hạn
      make('2', 'Web', false, daysFromToday(-2)), // quá hạn
      make('3', 'Toán', false, daysFromToday(3)), // còn hạn
      make('4', 'Toán', false, daysFromToday(0)), // đúng hạn hôm nay
    ];
    const stats = calcStats(items);
    expect(stats.total).toBe(4);
    expect(stats.completed).toBe(1);
    expect(stats.overdue).toBe(1);
  });

  it('gom nhóm theo môn, sắp giảm dần theo tổng', () => {
    const items = [
      make('1', 'Web', true, daysFromToday(1)),
      make('2', 'Web', false, daysFromToday(2)),
      make('3', 'Web', false, daysFromToday(3)),
      make('4', 'Mạng', false, daysFromToday(4)),
    ];
    const stats = calcStats(items);
    expect(stats.subjects).toEqual([
      { subject: 'Web', total: 3, completed: 1, overdue: 0 },
      { subject: 'Mạng', total: 1, completed: 0, overdue: 0 },
    ]);
  });

  it('cùng số lượng thì xếp theo tên môn (locale vi)', () => {
    const items = [
      make('1', 'Toán rời rạc', false, daysFromToday(1)),
      make('2', 'Cơ sở dữ liệu', false, daysFromToday(2)),
    ];
    const stats = calcStats(items);
    expect(stats.subjects.map((s) => s.subject)).toEqual(['Cơ sở dữ liệu', 'Toán rời rạc']);
  });
});
