import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE } from '../../config/api';

export interface CatalogFile {
  path: string;
  url: string;
  size: number;
  contentType: string;
}

export interface CatalogItem {
  _id: string;
  title: string;
  coverImageUrl?: string;
  files: CatalogFile[];
  totalSize: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CatalogState {
  items: CatalogItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchCatalogs = createAsyncThunk<CatalogItem[], void, { rejectValue: string }>(
  'catalog/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/api/catalog`);
      return res.data.data || res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.error || 'Failed to fetch catalogs');
    }
  }
);

export const createCatalogItem = createAsyncThunk<CatalogItem, { title: string; coverImagePath?: string; files: { path: string; size: number; contentType: string }[] }, { rejectValue: string }>(
  'catalog/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE}/api/catalog`, payload);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.error || 'Failed to create catalog');
    }
  }
);

export const updateCatalogItem = createAsyncThunk<
  CatalogItem,
  { id: string; title?: string; coverImagePath?: string | null; files?: { path: string; size: number; contentType: string }[] },
  { rejectValue: string }
>(
  'catalog/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_BASE}/api/catalog/${id}`, payload);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.error || 'Failed to update catalog');
    }
  }
);

export const deleteCatalogItem = createAsyncThunk<string, string, { rejectValue: string }>(
  'catalog/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/api/catalog/${id}`);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.error || 'Failed to delete catalog');
    }
  }
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCatalogs.fulfilled, (state, action: PayloadAction<CatalogItem[]>) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchCatalogs.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createCatalogItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCatalogItem.fulfilled, (state, action: PayloadAction<CatalogItem>) => {
        state.items.unshift(action.payload);
        state.isLoading = false;
      })
      .addCase(createCatalogItem.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateCatalogItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCatalogItem.fulfilled, (state, action: PayloadAction<CatalogItem>) => {
        const idx = state.items.findIndex((i) => i._id === action.payload._id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
        state.isLoading = false;
      })
      .addCase(updateCatalogItem.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteCatalogItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCatalogItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
        state.isLoading = false;
      })
      .addCase(deleteCatalogItem.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const selectCatalogs = (state: any) => state.catalog.items as CatalogItem[];
export const selectCatalogLoading = (state: any) => state.catalog.isLoading as boolean;
export const selectCatalogError = (state: any) => state.catalog.error as string | null;

export default catalogSlice.reducer;
