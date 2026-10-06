import { useCallback, useEffect, useMemo, useState } from 'react';
import { List } from 'react-window';
import type { RowComponentProps } from 'react-window';
import { RotateCcw, Search, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  addManyAssignments,
  fetchAssignments,
  removeAssignment,
  toggleAssignment,
} from './assignmentsSlice';
import { selectError, selectStatus, selectVisibleAssignments } from './assignmentsSelectors';
import AssignmentItem from './AssignmentItem';
import { useDebounce } from '../../hooks/useDebounce';
import { usePinStore } from '../../stores/usePinStore';
import { searchAssignments, sortPinnedFirst } from '../../utils/assignmentFilters';
import { generateAssignments } from '../../utils/generateAssignments';
import type { Assignment } from '../../types/assignment';

const STRESS_COUNT = 10_000;

/** Phần B — chỉ bật virtualization khi danh sách đủ dài (dùng đúng chỗ, không lạm dụng) */
const VIRTUALIZE_THRESHOLD = 30;
const VIRTUAL_ROW_HEIGHT = 90;
const VIRTUAL_LIST_HEIGHT = 600;

interface RowProps {
  assignments: Assignment[];
  pinnedIds: ReadonlySet<string>;
  onToggle: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  onTogglePin: (assignment: Assignment) => void;
}

/** Hàng của danh sách ảo: chỉ render các card đang trong khung nhìn */
function VirtualRow({ index, style, assignments, pinnedIds, onToggle, onDelete, onTogglePin }: RowComponentProps<RowProps>) {
  const assignment = assignments[index];
  if (!assignment) return null;
  return (
    <div style={style} className="assignment-row">
      <AssignmentItem
        assignment={assignment}
        pinned={pinnedIds.has(assignment.id)}
        onToggle={onToggle}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
      />
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="assignment-list" aria-busy="true" aria-label="Đang tải danh sách">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="assignment-card assignment-card--skeleton">
          <div className="skeleton skeleton--check" />
          <div className="assignment-card__body">
            <div className="skeleton skeleton--subject" />
            <div className="skeleton skeleton--title" />
          </div>
          <div className="skeleton skeleton--badge" />
        </li>
      ))}
    </ul>
  );
}

export default function AssignmentList() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectStatus);
  const error = useAppSelector(selectError);
  const assignments = useAppSelector(selectVisibleAssignments);
  const pinnedIds = usePinStore((state) => state.pinnedIds);
  const togglePin = usePinStore((state) => state.togglePin);
  const [searchText, setSearchText] = useState('');

  // Yêu cầu #7 — gọi API giả lập đúng 1 lần khi khởi động app
  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchAssignments());
    }
  }, [status, dispatch]);

  // Nâng cấp Phần B — debounce 300ms: gõ liên tục không kích hoạt lọc lại từng ký tự
  const debouncedSearch = useDebounce(searchText, 300);

  // Nâng cấp Phần B — handlers bọc useCallback (dispatch và togglePin đều ổn định)
  // để kết hợp với React.memo: gõ tìm kiếm không làm card nào re-render
  const handleToggle = useCallback(
    (assignment: Assignment) => {
      dispatch(toggleAssignment(assignment.id));
      if (assignment.completed) {
        toast.info('Đã đánh dấu chưa hoàn thành', { description: assignment.title });
      } else {
        toast.success('Đã hoàn thành bài tập! 🎉', { description: assignment.title });
      }
    },
    [dispatch],
  );

  const handleDelete = useCallback(
    (assignment: Assignment) => {
      dispatch(removeAssignment(assignment.id));
      toast.error('Đã xoá bài tập', { description: assignment.title });
    },
    [dispatch],
  );

  const handleTogglePin = useCallback(
    (assignment: Assignment) => {
      togglePin(assignment.id);
    },
    [togglePin],
  );

  // Nâng cấp Phần B — pipeline lọc + ghim bọc useMemo: chỉ tính lại khi
  // dữ liệu / từ khoá (đã debounce) / danh sách ghim thay đổi
  const visibleAssignments = useMemo(
    () => sortPinnedFirst(searchAssignments(assignments, debouncedSearch), pinnedIds),
    [assignments, debouncedSearch, pinnedIds],
  );

  const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);

  // Nâng cấp Phần B — virtualization bằng react-window cho danh sách dài
  const useVirtualization = visibleAssignments.length > VIRTUALIZE_THRESHOLD;

  const rowProps = useMemo<RowProps>(
    () => ({
      assignments: visibleAssignments,
      pinnedIds: pinnedSet,
      onToggle: handleToggle,
      onDelete: handleDelete,
      onTogglePin: handleTogglePin,
    }),
    [visibleAssignments, pinnedSet, handleToggle, handleDelete, handleTogglePin],
  );

  const rowKey = useCallback((index: number, data: RowProps) => data.assignments[index]?.id ?? index, []);

  // Nâng cấp Phần B — chế độ stress test
  const handleStress = () => {
    dispatch(addManyAssignments(generateAssignments(STRESS_COUNT)));
  };

  const handleRestore = () => {
    void dispatch(fetchAssignments());
    toast.info('Đang khôi phục dữ liệu gốc…');
  };

  const busy = status === 'loading' || status === 'idle';

  return (
    <div className="list-section">
      <div className="list-toolbar">
        <label className="search-box">
          <Search size={16} aria-hidden="true" className="search-box__icon" />
          <input
            type="search"
            className="search-box__input"
            placeholder="Tìm theo tên bài tập hoặc môn học…"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            aria-label="Tìm kiếm bài tập"
          />
        </label>
        <button
          type="button"
          className="btn btn--stress"
          onClick={handleStress}
          disabled={busy}
          title={`Sinh ${STRESS_COUNT.toLocaleString('vi-VN')} bài tập mẫu để đo hiệu năng`}
        >
          <Zap size={15} /> Tạo 10.000 bài tập mẫu
        </button>
        <button
          type="button"
          className="btn btn--restore"
          onClick={handleRestore}
          disabled={busy}
          title="Tải lại dữ liệu mẫu gốc từ mock API"
        >
          <RotateCcw size={15} /> Khôi phục dữ liệu gốc
        </button>
      </div>

      {!busy && (
        <p className="result-count" role="status">
          Hiển thị {visibleAssignments.length.toLocaleString('vi-VN')} /{' '}
          {assignments.length.toLocaleString('vi-VN')} bài tập
        </p>
      )}

      {busy ? (
        <SkeletonList />
      ) : status === 'failed' ? (
        <div className="banner banner--error" role="alert">
          <span>Không tải được danh sách bài tập: {error}</span>
          <button type="button" className="btn btn--primary" onClick={() => void dispatch(fetchAssignments())}>
            Thử lại
          </button>
        </div>
      ) : assignments.length === 0 ? (
        <div className="banner banner--empty">
          Không có bài tập nào trong mục này. Thêm bài tập mới ở form phía trên nhé!
        </div>
      ) : visibleAssignments.length === 0 ? (
        <div className="banner banner--empty">
          Không có bài tập nào khớp từ khoá “{debouncedSearch.trim()}”. Thử từ khoá khác nhé!
        </div>
      ) : useVirtualization ? (
        <List
          className="virtual-list"
          style={{ height: VIRTUAL_LIST_HEIGHT }}
          rowCount={visibleAssignments.length}
          rowHeight={VIRTUAL_ROW_HEIGHT}
          rowComponent={VirtualRow}
          rowProps={rowProps}
          rowKey={rowKey}
          overscanCount={6}
          aria-label="Danh sách bài tập (chế độ ảo)"
        />
      ) : (
        <ul className="assignment-list">
          {visibleAssignments.map((assignment) => (
            <AssignmentItem
              key={assignment.id}
              assignment={assignment}
              pinned={pinnedSet.has(assignment.id)}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
