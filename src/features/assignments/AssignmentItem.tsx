import { memo } from 'react';
import { Clock, BookOpen, Flag, Pin, Trash2 } from 'lucide-react';
import { PRIORITY_THEME } from '../../types/assignment';
import type { Assignment } from '../../types/assignment';
import { formatDeadline } from '../../utils/date';
import { useDeadlineInfo } from '../../hooks/useDeadlineInfo';

/** Phần B — bộ đếm render phục vụ đo hiệu năng (đọc: window.__assignmentItemRenders) */
declare global {
  interface Window {
    __assignmentItemRenders?: number;
    __resetRenderCount?: () => void;
  }
}

function trackRender(): void {
  window.__assignmentItemRenders = (window.__assignmentItemRenders ?? 0) + 1;
}

if (typeof window !== 'undefined') {
  window.__resetRenderCount = () => {
    window.__assignmentItemRenders = 0;
  };
}

interface AssignmentItemProps {
  assignment: Assignment;
  /** Đã ghim hay chưa — state Zustand truyền xuống từ list (card là presentational) */
  pinned: boolean;
  /** Handler truyền xuống từ AssignmentList — để kết hợp React.memo + useCallback khi tối ưu */
  onToggle: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  onTogglePin: (assignment: Assignment) => void;
}

/**
 * Nâng cấp Phần B — React.memo: chỉ re-render khi assignment/pinned/handler thực sự đổi.
 * Handlers từ list được bọc useCallback nên khi gõ tìm kiếm card sẽ bỏ qua re-render.
 */
function AssignmentItem({ assignment, pinned, onToggle, onDelete, onTogglePin }: AssignmentItemProps) {
  trackRender();

  const info = useDeadlineInfo(assignment.deadline);
  const theme = PRIORITY_THEME[assignment.priority];

  return (
    <li
      className={assignment.completed ? 'assignment-card assignment-card--done' : 'assignment-card'}
    >
      <label className="assignment-card__check">
        <input type="checkbox" checked={assignment.completed} onChange={() => onToggle(assignment)} />
      </label>

      <div className="assignment-card__body">
        <span className="assignment-card__subject">
          <BookOpen size={14} className="assignment-card__subject-icon" />
          {assignment.subject}
        </span>
        <span className="assignment-card__title">{assignment.title}</span>
        <div className="assignment-card__meta">
          <span className={theme.className}>
            <Flag size={12} className="badge__icon" />
            {theme.label}
          </span>
          <span className="assignment-card__deadline">
            <Clock size={14} className="assignment-card__deadline-icon" />
            Hạn nộp: {formatDeadline(assignment.deadline)}
          </span>
        </div>
      </div>

      <div className="assignment-card__side">
        <span className={`due-badge due-badge--${info.kind}`}>{info.label}</span>
        <div className="assignment-card__actions">
          <button
            type="button"
            className={pinned ? 'pin-button pin-button--active' : 'pin-button'}
            onClick={() => onTogglePin(assignment)}
            aria-pressed={pinned}
            aria-label={pinned ? 'Bỏ ghim bài tập' : 'Ghim bài tập lên đầu danh sách'}
            title={pinned ? 'Bỏ ghim' : 'Ghim lên đầu danh sách'}
          >
            <Pin size={15} strokeWidth={2} fill={pinned ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => onDelete(assignment)}
            aria-label="Xoá bài tập"
            title="Xoá bài tập"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </li>
  );
}

export default memo(AssignmentItem);
