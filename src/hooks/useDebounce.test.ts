import { act, renderHook } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce — Phần B, ô tìm kiếm 300ms', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('giữ giá trị cũ cho tới khi hết 300ms không gõ', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'ab' });
    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('ab');
  });

  it('gõ liên tục: chỉ giá trị cuối cùng được áp dụng sau khi ngừng 300ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: '' },
    });

    rerender({ value: 'w' });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    rerender({ value: 'we' });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    rerender({ value: 'web' });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    // 600ms đã trôi nhưng mỗi phím đều reset timer → chưa áp dụng lần nào
    expect(result.current).toBe('');

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('web');
  });

  it('mặc định 300ms khi không truyền delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe(1);
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe(2);
  });
});
