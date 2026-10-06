import type { Assignment } from '../types/assignment';

/**
 * Nâng cấp Phần A + B — hàm thuần cho pipeline lọc/sắp xếp của danh sách.
 * Tách riêng để unit test dễ và để bọc trong useMemo ở component.
 */

/** Lọc theo từ khoá (không phân biệt hoa thường, khớp tên bài tập hoặc môn học) */
export function searchAssignments(items: readonly Assignment[], query: string): Assignment[] {
  const keyword = query.trim().toLowerCase();
  if (keyword === '') return [...items];
  return items.filter(
    (item) => item.title.toLowerCase().includes(keyword) || item.subject.toLowerCase().includes(keyword),
  );
}

/**
 * Ghim bài tập quan trọng lên đầu danh sách (Phần A — Zustand).
 * Dùng Set để tra O(1); sort của JS ổn định nên thứ tự tương đối trong mỗi nhóm được giữ nguyên.
 */
export function sortPinnedFirst(items: readonly Assignment[], pinnedIds: readonly string[]): Assignment[] {
  if (pinnedIds.length === 0) return [...items];
  const pinnedSet = new Set(pinnedIds);
  return [...items].sort((a, b) => {
    const aPinned = pinnedSet.has(a.id) ? 0 : 1;
    const bPinned = pinnedSet.has(b.id) ? 0 : 1;
    return aPinned - bPinned;
  });
}
