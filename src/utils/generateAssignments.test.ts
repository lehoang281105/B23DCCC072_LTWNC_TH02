import { generateAssignments } from './generateAssignments';
import { isAssignmentArray } from './typeGuards';

describe('generateAssignments — dữ liệu mẫu cho stress test', () => {
  it('sinh đúng số lượng được yêu cầu', () => {
    expect(generateAssignments(0)).toHaveLength(0);
    expect(generateAssignments(10)).toHaveLength(10);
    expect(generateAssignments(10_000)).toHaveLength(10_000);
  });

  it('bài sinh ra hợp lệ theo type guard của app', () => {
    expect(isAssignmentArray(generateAssignments(100))).toBe(true);
  });

  it('id duy nhất trên 10.000 bài', () => {
    const items = generateAssignments(10_000);
    expect(new Set(items.map((a) => a.id)).size).toBe(10_000);
  });

  it('deadline có dạng ISO yyyy-mm-dd', () => {
    for (const a of generateAssignments(50)) {
      expect(a.deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('trộn cả bài đã hoàn thành và chưa hoàn thành', () => {
    const items = generateAssignments(100);
    expect(items.some((a) => a.completed)).toBe(true);
    expect(items.some((a) => !a.completed)).toBe(true);
  });

  it('có nhiều môn học và nhiều mức ưu tiên', () => {
    const items = generateAssignments(100);
    expect(new Set(items.map((a) => a.subject)).size).toBeGreaterThan(1);
    expect(new Set(items.map((a) => a.priority)).size).toBe(3);
  });
});
