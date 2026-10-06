import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import AssignmentForm from './AssignmentForm';
import assignmentsReducer from './assignmentsSlice';
import { todayIso } from '../../utils/date';

function makeStore() {
  return configureStore({ reducer: { assignments: assignmentsReducer } });
}

describe('AssignmentForm — validate và submit (Phần C, component)', () => {
  it('submit khi rỗng: hiện đủ 3 lỗi validate và KHÔNG thêm bài', async () => {
    const user = userEvent.setup();
    const store = makeStore();
    render(
      <Provider store={store}>
        <AssignmentForm />
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: /Thêm bài tập/ }));

    expect(screen.getByText('Nhập môn học')).toBeInTheDocument();
    expect(screen.getByText('Nhập tên bài tập')).toBeInTheDocument();
    expect(screen.getByText('Chọn hạn nộp')).toBeInTheDocument();
    expect(store.getState().assignments.items).toHaveLength(0);
  });

  it('hạn nộp trong quá khứ: báo "Hạn nộp đã qua" và không thêm bài', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <AssignmentForm />
      </Provider>,
    );

    fireEvent.change(screen.getByLabelText('Môn học'), { target: { value: 'Web' } });
    fireEvent.change(screen.getByLabelText('Tên bài tập'), { target: { value: 'Bài X' } });
    fireEvent.change(screen.getByLabelText('Hạn nộp'), { target: { value: '2000-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Thêm bài tập/ }));

    expect(screen.getByText('Hạn nộp đã qua')).toBeInTheDocument();
    expect(store.getState().assignments.items).toHaveLength(0);
  });

  it('submit hợp lệ: dispatch addAssignment đúng dữ liệu và reset form', async () => {
    const user = userEvent.setup();
    const store = makeStore();
    render(
      <Provider store={store}>
        <AssignmentForm />
      </Provider>,
    );

    await user.type(screen.getByLabelText('Môn học'), 'Lập trình Web Nâng Cao');
    await user.type(screen.getByLabelText('Tên bài tập'), 'Bài test form');
    fireEvent.change(screen.getByLabelText('Hạn nộp'), { target: { value: todayIso() } });
    await user.click(screen.getByRole('button', { name: /Thêm bài tập/ }));

    const items = store.getState().assignments.items;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      subject: 'Lập trình Web Nâng Cao',
      title: 'Bài test form',
      deadline: todayIso(),
      priority: 'medium',
      completed: false,
    });

    // form được reset về rỗng sau khi thêm
    expect(screen.getByLabelText('Môn học')).toHaveValue('');
    expect(screen.getByLabelText('Tên bài tập')).toHaveValue('');
  });
});
