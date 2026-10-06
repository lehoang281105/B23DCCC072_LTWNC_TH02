import reducer, {
  addAssignment,
  addManyAssignments,
  removeAssignment,
  toggleAssignment,
} from './assignmentsSlice';
import { generateAssignments } from '../../utils/generateAssignments';
import type { Assignment } from '../../types/assignment';

const base: Assignment = {
  id: 'x1',
  subject: 'Lập trình Web Nâng Cao',
  title: 'Bài gốc',
  deadline: '2026-10-01',
  priority: 'low',
  completed: false,
};

describe('assignmentsSlice — reducers nâng cấp', () => {
  it('addManyAssignments nối hàng loạt 10.000 bài (stress test) mà giữ bài cũ', () => {
    const many = generateAssignments(10_000);
    const state = reducer({ items: [base], status: 'succeeded', error: null, filter: 'all' }, addManyAssignments(many));
    expect(state.items).toHaveLength(10_001);
    expect(state.items[0]).toEqual(base);
    expect(state.items[1]?.id).toBe('stress-00001');
    expect(state.items[10_000]?.id).toBe('stress-10000');
  });

  it('toggleAssignment lật trạng thái completed đúng bài', () => {
    let state = reducer({ items: [base], status: 'succeeded', error: null, filter: 'all' }, toggleAssignment('x1'));
    expect(state.items[0]?.completed).toBe(true);
    state = reducer(state, toggleAssignment('x1'));
    expect(state.items[0]?.completed).toBe(false);
  });

  it('removeAssignment xoá đúng bài theo id', () => {
    const state = reducer({ items: [base, { ...base, id: 'x2' }], status: 'succeeded', error: null, filter: 'all' }, removeAssignment('x2'));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.id).toBe('x1');
  });

  it('biên: toggleAssignment với id không tồn tại giữ nguyên state', () => {
    const before: typeof base[] = [base];
    const state = reducer({ items: [...before], status: 'succeeded', error: null, filter: 'all' }, toggleAssignment('khong-ton-tai'));
    expect(state.items).toEqual(before);
    expect(state.items[0]?.completed).toBe(false);
  });

  it('biên: removeAssignment với id không tồn tại không xoá nhầm bài khác', () => {
    const state = reducer({ items: [base], status: 'succeeded', error: null, filter: 'all' }, removeAssignment('khong-ton-tai'));
    expect(state.items).toHaveLength(1);
  });

  it('addAssignment vẫn hoạt động sau các nâng cấp', () => {
    const state = reducer(
      { items: [], status: 'succeeded', error: null, filter: 'all' },
      addAssignment({ subject: 'S', title: 'T', deadline: '2026-10-20', priority: 'high' }),
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.completed).toBe(false);
    expect(state.items[0]?.id).toContain('hw-');
  });
});
