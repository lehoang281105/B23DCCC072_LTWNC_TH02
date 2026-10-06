import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssignmentItem from './AssignmentItem';
import { daysFromToday, formatDeadline } from '../../utils/date';
import type { Assignment } from '../../types/assignment';

const base: Assignment = {
  id: 'hw-1',
  subject: 'Lập trình Web Nâng Cao',
  title: 'Bài tập Zustand',
  deadline: daysFromToday(0),
  priority: 'high',
  completed: false,
};

function setup(overrides: Partial<Assignment> = {}, pinned = false) {
  const handlers = {
    onToggle: jest.fn(),
    onDelete: jest.fn(),
    onTogglePin: jest.fn(),
  };
  const view = render(
    <AssignmentItem assignment={{ ...base, ...overrides }} pinned={pinned} {...handlers} />,
  );
  return { handlers, ...view };
}

describe('AssignmentItem (AssignmentCard) — component (Phần C)', () => {
  it('hiển thị đủ: môn học, tên bài, badge ưu tiên, hạn nộp và trạng thái deadline', () => {
    setup();
    expect(screen.getByText('Lập trình Web Nâng Cao')).toBeInTheDocument();
    expect(screen.getByText('Bài tập Zustand')).toBeInTheDocument();
    expect(screen.getByText('Ưu tiên cao')).toBeInTheDocument();
    expect(screen.getByText(`Hạn nộp: ${formatDeadline(base.deadline)}`)).toBeInTheDocument();
    expect(screen.getByText('Đến hạn hôm nay')).toBeInTheDocument();
  });

  it('nút hoàn thành: bấm checkbox gọi onToggle với đúng bài', async () => {
    const user = userEvent.setup();
    const { handlers } = setup();

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);

    expect(handlers.onToggle).toHaveBeenCalledTimes(1);
    expect(handlers.onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: 'hw-1' }));
    expect(handlers.onDelete).not.toHaveBeenCalled();
  });

  it('nút ghim: gọi onTogglePin; khi đã ghim thì hiện trạng thái active', async () => {
    const user = userEvent.setup();
    const { handlers } = setup();

    const pinButton = screen.getByRole('button', { name: 'Ghim bài tập lên đầu danh sách' });
    await user.click(pinButton);
    expect(handlers.onTogglePin).toHaveBeenCalledTimes(1);
    expect(handlers.onTogglePin).toHaveBeenCalledWith(expect.objectContaining({ id: 'hw-1' }));

    // render lại với pinned=true (như khi list cập nhật state Zustand)
    setup({}, true);
    const activeButton = screen.getByRole('button', { name: 'Bỏ ghim bài tập' });
    expect(activeButton).toHaveClass('pin-button--active');
    expect(activeButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('nút xoá: gọi onDelete với đúng bài', async () => {
    const user = userEvent.setup();
    const { handlers } = setup();

    await user.click(screen.getByRole('button', { name: 'Xoá bài tập' }));
    expect(handlers.onDelete).toHaveBeenCalledTimes(1);
    expect(handlers.onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'hw-1' }));
    expect(handlers.onToggle).not.toHaveBeenCalled();
  });

  it('bài đã hoàn thành: checkbox checked + title gạch ngang (class done)', () => {
    setup({ completed: true });
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByText('Bài tập Zustand').closest('li')).toHaveClass('assignment-card--done');
  });
});
