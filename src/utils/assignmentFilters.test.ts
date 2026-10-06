import { searchAssignments, sortPinnedFirst } from './assignmentFilters';
import type { Assignment } from '../types/assignment';

function make(id: string, title: string, subject = 'Toán rời rạc'): Assignment {
  return { id, title, subject, deadline: '2026-10-10', priority: 'medium', completed: false };
}

describe('searchAssignments — lọc ô tìm kiếm', () => {
  const items = [
    make('1', 'Bài tập Redux Toolkit', 'Lập trình Web'),
    make('2', 'Đồ án cây AVL', 'Cấu trúc dữ liệu'),
    make('3', 'Opinion Essay', 'Tiếng Anh học thuật'),
  ];

  it('từ khoá rỗng hoặc toàn khoảng trắng: trả về toàn bộ', () => {
    expect(searchAssignments(items, '')).toHaveLength(3);
    expect(searchAssignments(items, '   ')).toHaveLength(3);
  });

  it('khớp theo tên bài tập, không phân biệt hoa/thường', () => {
    expect(searchAssignments(items, 'redux')).toEqual([items[0]]);
    expect(searchAssignments(items, 'AVL')).toEqual([items[1]]);
  });

  it('khớp theo môn học', () => {
    expect(searchAssignments(items, 'cấu trúc')).toEqual([items[1]]);
    expect(searchAssignments(items, 'TIẾNG ANH')).toEqual([items[2]]);
  });

  it('không có kết quả: trả về mảng rỗng', () => {
    expect(searchAssignments(items, 'khongtacdung')).toEqual([]);
  });
});

describe('sortPinnedFirst — ghim luôn lên đầu (Phần A)', () => {
  const items = [make('1', 'A'), make('2', 'B'), make('3', 'C')];

  it('đưa bài được ghim lên đầu danh sách', () => {
    expect(sortPinnedFirst(items, ['3']).map((x) => x.id)).toEqual(['3', '1', '2']);
  });

  it('nhiều bài ghim vẫn đứng trước, giữ thứ tự tương đối ổn định', () => {
    expect(sortPinnedFirst(items, ['2', '3']).map((x) => x.id)).toEqual(['2', '3', '1']);
  });

  it('không ghim gì: giữ nguyên thứ tự vào', () => {
    expect(sortPinnedFirst(items, []).map((x) => x.id)).toEqual(['1', '2', '3']);
  });

  it('ghim id không tồn tại trong danh sách: không làm đổi thứ tự', () => {
    expect(sortPinnedFirst(items, ['99']).map((x) => x.id)).toEqual(['1', '2', '3']);
  });
});
