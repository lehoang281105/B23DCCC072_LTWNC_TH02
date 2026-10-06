import { PRIORITIES } from '../types/assignment';
import type { Assignment, Priority } from '../types/assignment';
import { daysFromToday } from './date';

/**
 * Nâng cấp Phần B — sinh dữ liệu mẫu cho chế độ stress test.
 * Dữ liệu sinh theo quy luật luân phiên (môn học, độ khó, hạn nộp trải đều)
 * để danh sách trông thực tế và kết quả đo lặp lại được.
 */

const SUBJECTS = [
  'Lập trình Web Nâng Cao',
  'Cấu trúc dữ liệu & giải thuật',
  'Cơ sở dữ liệu',
  'Mạng máy tính',
  'Toán rời rạc',
  'Hệ điều hành',
  'Tiếng Anh học thuật',
] as const;

const TITLE_TEMPLATES = [
  'Bài tập tuần {n}',
  'Lab {n} — thực hành tại lớp',
  'Đồ án giữa kỳ (phần {n})',
  'Ôn tập chương {n}',
  'Bài tiểu luận chủ đề {n}',
  'Quiz chương {n}',
] as const;

/** Sinh `count` bài tập mẫu; id tăng dần nên luôn duy nhất */
export function generateAssignments(count: number): Assignment[] {
  return Array.from({ length: count }, (_, i) => {
    const subject = SUBJECTS[i % SUBJECTS.length];
    const template = TITLE_TEMPLATES[i % TITLE_TEMPLATES.length];
    const priority: Priority = PRIORITIES[i % PRIORITIES.length];
    // Hạn nộp trải từ -15 đến +30 ngày quanh hôm nay
    const deadline = daysFromToday(((i * 7) % 46) - 15);
    return {
      id: `stress-${String(i + 1).padStart(5, '0')}`,
      subject,
      title: `${template.replace('{n}', String((i % 12) + 1))} #${i + 1}`,
      deadline,
      priority,
      completed: i % 4 === 0,
    };
  });
}
