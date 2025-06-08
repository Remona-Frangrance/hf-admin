// features/metrics/metricsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

type MetricsState = {
  totalCategories: number;
  totalSubcategories: number;
  loading: boolean;
  error: string | null;
};

const initialState: MetricsState = {
  totalCategories: 0,
  totalSubcategories: 0,
  loading: false,
  error: null,
};

// Async thunk to fetch metrics
export const fetchMetrics = createAsyncThunk(
  'metrics/fetchMetrics',
  async (_, thunkAPI) => {
    try {
      const res = await fetch('https://hf-backend-4-mv62.onrender.com/admin/metrics');
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.totalCategories = action.payload.totalCategories;
        state.totalSubcategories = action.payload.totalSubcategories;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default metricsSlice.reducer;
