import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchAssignmentsApi } from '../../api/assignmentsApi';
import { createId, findById } from '../../api/http';
import type { Assignment, AssignmentFilter, CreateAssignmentDto } from '../../types/assignment';
import { isAssignmentArray } from '../../utils/typeGuards';

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AssignmentsState {
  items: Assignment[];
  status: RequestStatus;
  error: string | null;
  filter: AssignmentFilter;
}

const initialState: AssignmentsState = {
  items: [],
  status: 'idle',
  error: null,
  filter: 'all',
};


export const fetchAssignments = createAsyncThunk<Assignment[], void, { rejectValue: string }>(
  'assignments/fetchAll',
  async (_arg, { rejectWithValue }) => {
    try {
      const response = await fetchAssignmentsApi();
      if (response.statusCode !== 200) {
        return rejectWithValue(`Lỗi ${response.statusCode}: ${response.message}`);
      }
      if (!isAssignmentArray(response.data)) {
        return rejectWithValue('Dữ liệu trả về từ máy chủ không hợp lệ');
      }
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi không xác định';
      return rejectWithValue(message);
    }
  }
);

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    /**#2 — thêm bài tập mới từ form */
    addAssignment(state, action: PayloadAction<CreateAssignmentDto>) {
      state.items.unshift({ ...action.payload, id: createId('hw'), completed: false });
    },
    /**#3 — bật/tắt trạng thái hoàn thành */
    toggleAssignment(state, action: PayloadAction<string>) {
      const found = findById(state.items, action.payload);
      if (found) {
        found.completed = !found.completed;
      }
    },
    /** #4 — xoá bài tập */
    removeAssignment(state, action: PayloadAction<string>) {
      const index = state.items.findIndex((item) => item.id === action.payload);
      if (index !== -1) {
        state.items.splice(index, 1);
      }
    },
    /** #5 — đổi bộ lọc danh sách */
    setFilter(state, action: PayloadAction<AssignmentFilter>) {
      state.filter = action.payload;
    },
    /** Nâng cấp Phần B — stress test: thêm hàng loạt bài tập mẫu một lần duy nhất */
    addManyAssignments(state, action: PayloadAction<Assignment[]>) {
      state.items = state.items.concat(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Không thể tải danh sách bài tập';
      });
  },
});

export const { addAssignment, toggleAssignment, removeAssignment, setFilter, addManyAssignments } =
  assignmentsSlice.actions;
export default assignmentsSlice.reducer;
