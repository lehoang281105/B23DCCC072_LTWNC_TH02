import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import StatisticsPanel from './StatisticsPanel';
import assignmentsReducer, { type AssignmentsState } from '../assignments/assignmentsSlice';
import type { Assignment } from '../../types/assignment';

const items: Assignment[] = [
  { id: '1', subject: 'Web', title: 'A', deadline: '2026-10-01', priority: 'high', completed: true },
  { id: '2', subject: 'Web', title: 'B', deadline: '2026-09-01', priority: 'low', completed: false },
  { id: '3', subject: 'Toán', title: 'C', deadline: '2027-01-01', priority: 'medium', completed: false },
];

const succeededState: AssignmentsState = {
  items,
  status: 'succeeded',
  error: null,
  filter: 'all',
};

describe('StatisticsPanel — trang Thống kê (đếm đã xong / quá hạn / theo môn)', () => {
  it('đếm đúng tổng, đã hoàn thành, quá hạn và bảng theo môn', () => {
    const store = configureStore({
      reducer: { assignments: assignmentsReducer },
      preloadedState: {
        assignments: succeededState,
      },
    });

    render(
      <Provider store={store}>
        <StatisticsPanel />
      </Provider>,
    );

    // 2/3 chưa hoàn thành, trong đó "B" (2026-09-01) đã quá hạn; "A" hoàn thành thì không tính quá hạn
    expect(screen.getByText('Đã hoàn thành').parentElement).toHaveTextContent('1');
    const table = screen.getByRole('table');
    expect(withinRow(table, 'Web')).toEqual(['2', '1', '1']); // tổng, đã xong, quá hạn
    expect(withinRow(table, 'Toán')).toEqual(['1', '0', '0']);
  });

  it('danh sách rỗng hiện banner', () => {
    const store = configureStore({ reducer: { assignments: assignmentsReducer } });
    render(
      <Provider store={store}>
        <StatisticsPanel />
      </Provider>,
    );
    expect(screen.getByText('Chưa có bài tập nào để thống kê.')).toBeInTheDocument();
  });
});

function withinRow(table: HTMLElement, subject: string): string[] {
  const row = [...table.querySelectorAll('tbody tr')].find((tr) =>
    tr.textContent?.includes(subject),
  );
  if (!row) throw new Error(`Không tìm thấy môn ${subject}`);
  return [...row.querySelectorAll('td')].slice(1).map((td) => td.textContent ?? '');
}
