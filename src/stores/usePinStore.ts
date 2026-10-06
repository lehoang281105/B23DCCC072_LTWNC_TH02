import { create } from 'zustand';

/**
 * Nâng cấp Phần A — ghim bài tập quan trọng.
 * Đây là state giao diện đơn giản nên dùng Zustand, KHÔNG đưa vào Redux.
 */
interface PinState {
  /** Id các bài tập đã ghim (bài ghim sau đứng trước) */
  pinnedIds: string[];
  /** Bật/tắt ghim cho một bài tập */
  togglePin: (id: string) => void;
  /** Bài tập đã được ghim hay chưa */
  isPinned: (id: string) => boolean;
}

export const usePinStore = create<PinState>()((set, get) => ({
  pinnedIds: [],
  togglePin: (id) =>
    set((state) => ({
      pinnedIds: state.pinnedIds.includes(id)
        ? state.pinnedIds.filter((pinnedId) => pinnedId !== id)
        : [id, ...state.pinnedIds],
    })),
  isPinned: (id) => get().pinnedIds.includes(id),
}));
