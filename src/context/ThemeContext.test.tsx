import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

function Probe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggleTheme}>
        toggle-theme
      </button>
    </div>
  );
}

describe('ThemeContext — chủ đề sáng/tối (Phần A)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('mặc định sáng khi máy không lưu lựa chọn', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('toggleTheme đổi theme, đặt data-theme lên <html> và lưu localStorage', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle-theme' }));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(window.localStorage.getItem('sdt-theme')).toBe('dark');

    fireEvent.click(screen.getByRole('button', { name: 'toggle-theme' }));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(window.localStorage.getItem('sdt-theme')).toBe('light');
  });

  it('đọc lại lựa chọn đã lưu trong localStorage', () => {
    window.localStorage.setItem('sdt-theme', 'dark');
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('useTheme ném lỗi rõ ràng khi dùng ngoài ThemeProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Probe />)).toThrow('useTheme phải được dùng bên trong <ThemeProvider>.');
    } finally {
      spy.mockRestore();
    }
  });
});
