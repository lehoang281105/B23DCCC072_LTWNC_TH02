import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import FilterTabs from './FilterTabs';
import assignmentsReducer, { type AssignmentsState } from './assignmentsSlice';
import { CheckCircle2, LayoutList } from 'lucide-react';
import { FILTER_LABELS } from '../../types/assignment';
import { daysFromToday } from '../../utils/date';
import type { Assignment } from '../../types/assignment';

const items: Assignment[] = [
  { id: '1', subject: 'Web', title: 'A', deadline: daysFromToday(1), priority: 'high', completed: false },
  { id: '2', subject: 'Toán', title: 'B', deadline: daysFromToday(2), priority: 'low', completed: false },
  { id: '3', subject: 'Web', title: 'C', deadline: daysFromToday(-1), priority: 'low', completed: true },
];

const succeededState: AssignmentsState = {
  items,
  status: 'succeeded',
  error: null,
  filter: 'all',
};

function makeStore() {
  return configureStore({
    reducer: { assignments: assignmentsReducer },
    preloadedState: {
      assignments: succeededState,
    },
  });
}

function renderTabs(store = makeStore()) {
  return render(
    <Provider store={store}>
      <FilterTabs>
        <FilterTabs.Tab value="all" icon={LayoutList}>
          {FILTER_LABELS.all}
        </FilterTabs.Tab>
        <FilterTabs.Tab value="completed" icon={CheckCircle2}>
          {FILTER_LABELS.completed}
        </FilterTabs.Tab>
      </FilterTabs>
    </Provider>,
  );
}

describe('FilterTabs — compound component (Phần C)', () => {
  it('badge hiển thị đúng số lượng theo trạng thái', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: /Tất cả/ })).toHaveTextContent('3');
    expect(screen.getByRole('tab', { name: /Đã hoàn thành/ })).toHaveTextContent('1');
  });

  it('click tab: dispatch setFilter vào Redux và đổi tab active', async () => {
    const user = userEvent.setup();
    const store = makeStore();
    renderTabs(store);

    const completedTab = screen.getByRole('tab', { name: /Đã hoàn thành/ });
    expect(completedTab).toHaveAttribute('aria-selected', 'false');

    await user.click(completedTab);

    expect(store.getState().assignments.filter).toBe('completed');
    expect(completedTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Tất cả/ })).toHaveAttribute('aria-selected', 'false');
  });

  it('biên: Tab dùng bên ngoài <FilterTabs> thì ném lỗi compound context', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<FilterTabs.Tab value="all" />)).toThrow(
        '<FilterTabs.Tab> chỉ được dùng bên trong <FilterTabs>.',
      );
    } finally {
      spy.mockRestore();
    }
  });
});
