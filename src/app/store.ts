import { configureStore } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';
import assignmentsReducer from '../features/assignments/assignmentsSlice';
import type { AssignmentsState } from '../features/assignments/assignmentsSlice';
import { generateAssignments } from '../utils/generateAssignments';

/**
 * Nâng cấp Phần B — chế độ stress test qua URL: mở `?stress=10000`
 * để trang tải lên với sẵn 10.000 bài tập mẫu (phục vụ đo Lighthouse,
 * vì Lighthouse không tự bấm nút được). Giới hạn 20.000 để tránh lạm dụng.
 */
function getStressPreload(): { assignments: AssignmentsState } | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = new URLSearchParams(window.location.search).get('stress');
  if (raw === null) return undefined;
  const count = Number.parseInt(raw, 10);
  if (!Number.isFinite(count) || count <= 0) return undefined;
  return {
    assignments: {
      items: generateAssignments(Math.min(count, 20_000)),
      status: 'succeeded',
      error: null,
      filter: 'all',
    },
  };
}

export const store = configureStore({
  reducer: {
    assignments: assignmentsReducer,
  },
  preloadedState: getStressPreload(),
  // Nâng cấp Phần A — redux-logger chỉ bật ở môi trường development
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware();
    return import.meta.env.DEV ? defaultMiddleware.concat(logger) : defaultMiddleware;
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
