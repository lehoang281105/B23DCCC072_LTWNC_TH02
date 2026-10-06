import { useMemo } from 'react';
import { AlertCircle, BookOpen, CheckCircle2, ListTodo } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { selectItems } from '../assignments/assignmentsSelectors';
import { calcStats } from './calcStats';

/**
 * Nâng cấp Phần B — trang Thống kê: đếm số bài đã xong, quá hạn và bảng theo môn.
 * Được tải lười bằng React.lazy + Suspense ở bước tối ưu.
 * Phần C — phép tính thống kê tách thành hàm thuần calcStats để unit test.
 */
export default function StatisticsPanel() {
  const items = useAppSelector(selectItems);

  const stats = useMemo(() => calcStats(items), [items]);

  return (
    <div className="statistics">
      <div className="statistics__cards">
        <div className="stat-card">
          <ListTodo className="stat-card__icon" size={20} strokeWidth={2} />
          <span className="stat-card__value">{stats.total.toLocaleString('vi-VN')}</span>
          <span className="stat-card__label">Tổng bài tập</span>
        </div>
        <div className="stat-card stat-card--completed">
          <CheckCircle2 className="stat-card__icon" size={20} strokeWidth={2} />
          <span className="stat-card__value">{stats.completed.toLocaleString('vi-VN')}</span>
          <span className="stat-card__label">Đã hoàn thành</span>
        </div>
        <div className="stat-card stat-card--overdue">
          <AlertCircle className="stat-card__icon" size={20} strokeWidth={2} />
          <span className="stat-card__value">{stats.overdue.toLocaleString('vi-VN')}</span>
          <span className="stat-card__label">Quá hạn</span>
        </div>
      </div>

      {stats.subjects.length === 0 ? (
        <div className="banner banner--empty">Chưa có bài tập nào để thống kê.</div>
      ) : (
        <table className="subject-table">
          <thead>
            <tr>
              <th scope="col">
                <BookOpen size={13} aria-hidden="true" /> Môn học
              </th>
              <th scope="col">Tổng</th>
              <th scope="col">Đã xong</th>
              <th scope="col">Quá hạn</th>
            </tr>
          </thead>
          <tbody>
            {stats.subjects.map((subject) => (
              <tr key={subject.subject}>
                <td>{subject.subject}</td>
                <td>{subject.total.toLocaleString('vi-VN')}</td>
                <td className="subject-table__done">{subject.completed.toLocaleString('vi-VN')}</td>
                <td className={subject.overdue > 0 ? 'subject-table__overdue' : undefined}>
                  {subject.overdue.toLocaleString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
