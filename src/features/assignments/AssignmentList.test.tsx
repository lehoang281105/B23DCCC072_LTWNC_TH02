import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import AssignmentList from './AssignmentList';
import assignmentsReducer, { setFilter } from './assignmentsSlice';
import { fetchAssignmentsApi } from '../../api/assignmentsApi';
import { usePinStore } from '../../stores/usePinStore';
import type { Assignment } from '../../types/assignment';
import { daysFromToday } from '../../utils/date';

// Phần C — mock API bất đồng bộ: mỗi test tự quyết định trả về loading/success/error
jest.mock('../../api/assignmentsApi', () => ({
  fetchAssignmentsApi: jest.fn(),
}));
const mockFetchApi = jest.mocked(fetchAssignmentsApi);

const SEED: Assignment[] = [
  { id: 'hw-a', subject: 'Web', title: 'Đồ án Web A', deadline: daysFromToday(1), priority: 'high', completed: false },
  { id: 'hw-b', subject: 'Toán', title: 'Tiểu luận Toán B', deadline: daysFromToday(5), priority: 'low', completed: false },
  { id: 'hw-c', subject: 'Anh', title: 'Essay Speaking C', deadline: daysFromToday(-1), priority: 'medium', completed: false },
  { id: 'hw-d', subject: 'Web', title: 'Slide nhóm D', deadline: daysFromToday(-3), priority: 'low', completed: true },
];

function makeStore() {
  return configureStore({ reducer: { assignments: assignmentsReducer } });
}

async function renderList() {
  const store = makeStore();
  const view = render(
    <Provider store={store}>
      <AssignmentList />
    </Provider>,
  );
  // cho thunk fetch (đã mock) kịp chạy trong act
  await act(async () => {});
  return { store, ...view };
}

function titleOrder(container: HTMLElement): (string | null)[] {
  return [...container.querySelectorAll('.assignment-card__title')].map((el) => el.textContent);
}

describe('AssignmentList — tích hợp (ghim + tìm kiếm)', () => {
  beforeEach(() => {
    usePinStore.setState({ pinnedIds: [] });
    mockFetchApi.mockReset();
    mockFetchApi.mockResolvedValue({ statusCode: 200, message: 'OK', data: SEED.map((a) => ({ ...a })) });
  });

  it('ban đầu: sort theo hạn nộp, quá hạn lên trước, đã xong xuống cuối', async () => {
    const { container } = await renderList();
    expect(await screen.findByText('Đồ án Web A')).toBeInTheDocument();
    // C (-1 ngày) → A (+1) → B (+5), bài hoàn thành D xuống cuối
    expect(titleOrder(container)).toEqual(['Essay Speaking C', 'Đồ án Web A', 'Tiểu luận Toán B', 'Slide nhóm D']);
  });

  it('ghim bài tập đưa bài đó lên đầu danh sách (Zustand, Phần A)', async () => {
    const user = userEvent.setup();
    const { container } = await renderList();
    await screen.findByText('Tiểu luận Toán B');

    const cardB = screen.getByText('Tiểu luận Toán B').closest('li');
    expect(cardB).not.toBeNull();
    await user.click(
      within(cardB as HTMLElement).getByRole('button', { name: 'Ghim bài tập lên đầu danh sách' }),
    );

    expect(titleOrder(container)[0]).toBe('Tiểu luận Toán B');
    expect(usePinStore.getState().pinnedIds).toEqual(['hw-b']);
    expect(cardB?.querySelector('.pin-button--active')).not.toBeNull();
  });

  it('lọc theo từ khoá sau khi ngừng gõ 300ms (debounce, Phần B)', async () => {
    const user = userEvent.setup();
    const { container } = await renderList();
    await screen.findByText('Đồ án Web A');

    const input = screen.getByRole('searchbox', { name: 'Tìm kiếm bài tập' });
    await user.type(input, 'Tiểu');

    // debounce 300ms — phải chờ rồi danh sách mới lọc lại
    await waitFor(
      () => {
        expect(titleOrder(container)).toEqual(['Tiểu luận Toán B']);
      },
      { timeout: 2000 },
    );

    await user.clear(input);
    await waitFor(
      () => {
        expect(titleOrder(container)).toHaveLength(4);
      },
      { timeout: 2000 },
    );
  });

  it('memo hiệu quả: gõ tìm kiếm không làm các card re-render hàng loạt (Phần B)', async () => {
    const user = userEvent.setup();
    await renderList();
    await screen.findByText('Đồ án Web A');

    window.__assignmentItemRenders = 0;
    const input = screen.getByRole('searchbox', { name: 'Tìm kiếm bài tập' });
    await user.type(input, 'Tiểu');
    await waitFor(
      () => {
        expect(screen.getByText(/Hiển thị 1 \/ 4/)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    // Nhờ React.memo + useCallback: không card nào render lại chỉ vì ô tìm kiếm đổi
    expect(window.__assignmentItemRenders ?? 0).toBeLessThanOrEqual(1);
  });

  it('kết hợp tab bộ lọc và ô tìm kiếm', async () => {
    const user = userEvent.setup();
    const { store, container } = await renderList();
    await screen.findByText('Đồ án Web A');

    act(() => {
      store.dispatch(setFilter('completed'));
    });
    expect(titleOrder(container)).toEqual(['Slide nhóm D']);

    const input = screen.getByRole('searchbox', { name: 'Tìm kiếm bài tập' });
    await user.type(input, 'zzz');
    await waitFor(() => {
      expect(screen.getByText(/Không có bài tập nào khớp/)).toBeInTheDocument();
    });
  });

  it('danh sách dài (>30 bài) dùng virtualization: DOM chỉ chứa một phần card', async () => {
    const store = makeStore();
    const many: Assignment[] = Array.from({ length: 50 }, (_, i) => ({
      id: `gen-${i}`,
      subject: 'Môn',
      title: `Bài số ${i}`,
      deadline: daysFromToday(i - 10),
      priority: 'low',
      completed: false,
    }));
    // nạp thẳng dữ liệu vào store, bỏ qua mock API
    await act(async () => {
      store.dispatch({ type: 'assignments/fetchAll/fulfilled', payload: many });
    });
    const { container } = render(
      <Provider store={store}>
        <AssignmentList />
      </Provider>,
    );

    expect(screen.getByText(/Hiển thị 50 \/ 50/)).toBeInTheDocument();
    // react-window chỉ render các hàng trong khung nhìn, không phải cả 50
    await waitFor(() => {
      expect(container.querySelectorAll('.assignment-card').length).toBeLessThanOrEqual(20);
    });
    expect(container.querySelector('.virtual-list')).not.toBeNull();
  });
});

describe('AssignmentList — bất đồng bộ với API mock (Phần C)', () => {
  beforeEach(() => {
    usePinStore.setState({ pinnedIds: [] });
    mockFetchApi.mockReset();
  });

  it('trạng thái đang tải: skeleton hiện, danh sách chưa có, nút stress bị khoá', () => {
    mockFetchApi.mockImplementation(() => new Promise(() => {})); // không bao giờ resolve

    const { container } = render(
      <Provider store={makeStore()}>
        <AssignmentList />
      </Provider>,
    );

    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(container.querySelectorAll('.assignment-card--skeleton')).toHaveLength(4);
    expect(screen.queryByText('Đồ án Web A')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tạo 10.000 bài tập mẫu/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Khôi phục dữ liệu gốc/ })).toBeDisabled();
  });

  it('trạng thái thành công: hiển thị dữ liệu nhận được từ API mock', async () => {
    mockFetchApi.mockResolvedValueOnce({ statusCode: 200, message: 'OK', data: SEED });

    render(
      <Provider store={makeStore()}>
        <AssignmentList />
      </Provider>,
    );

    expect(await screen.findByText('Đồ án Web A')).toBeInTheDocument();
    expect(screen.getByText('Tiểu luận Toán B')).toBeInTheDocument();
    expect(screen.getByText(/Hiển thị 4 \/ 4/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(mockFetchApi).toHaveBeenCalledTimes(1);
  });

  it('trạng thái lỗi: banner cảnh báo + bấm "Thử lại" gọi lại API thành công', async () => {
    mockFetchApi.mockRejectedValueOnce(new Error('Không kết nối được máy chủ (mock)'));

    const user = userEvent.setup();
    render(
      <Provider store={makeStore()}>
        <AssignmentList />
      </Provider>,
    );

    const banner = await screen.findByRole('alert');
    expect(banner).toHaveTextContent(/Không tải được danh sách bài tập/);
    expect(banner).toHaveTextContent('Không kết nối được máy chủ (mock)');
    expect(mockFetchApi).toHaveBeenCalledTimes(1);

    // lần gọi thứ 2 (Thử lại) trả về dữ liệu tốt
    mockFetchApi.mockResolvedValueOnce({ statusCode: 200, message: 'OK', data: SEED });
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Đồ án Web A')).toBeInTheDocument();
    expect(mockFetchApi).toHaveBeenCalledTimes(2);
  });
});
