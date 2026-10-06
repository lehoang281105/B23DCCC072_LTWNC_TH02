import { useEffect, useState } from 'react';

/**
 * Nâng cấp Phần B — trả về bản "đóng băng" của `value`,
 * chỉ cập nhật sau khi value không đổi liên tục trong `delayMs` ms.
 * Dùng cho ô tìm kiếm để không lọc lại toàn bộ danh sách ở mỗi keystroke.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
