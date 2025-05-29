// src/redux/slices/categorySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Category {
  _id: string; // Changed from id to _id to match MongoDB
  name: string;
  coverImage: string; // Changed from image to coverImage
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
};

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  'category/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('hhttps://hf-backend-4-mv62.onrender.com/api/categories');
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Add new category
export const addCategory = createAsyncThunk(
  'category/add',
  async (categoryData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.post('https://hf-backend-4-mv62.onrender.com/api/categories', categoryData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add category');
    }
  }
);

// Update category
export const updateCategory = createAsyncThunk(
  'category/update',
  async ({ id, categoryData }: { id: string; categoryData: FormData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`https://hf-backend-4-mv62.onrender.com/api/categories/${id}`, categoryData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

// Delete category
export const deleteCategory = createAsyncThunk(
  'category/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`https://hf-backend-4-mv62.onrender.com/api/categories/${id}`);
      return id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.categories = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.categories = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchCategories.rejected, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.categories.push(action.payload);
        state.isLoading = false;
      })
      
      .addCase(addCategory.rejected,
         (state, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        const index = state.categories.findIndex(cat => cat._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.isLoading = false;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(updateCategory.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.categories = state.categories.filter(cat => cat._id !== action.payload);
        state.isLoading = false;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(deleteCategory.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCategories } = categorySlice.actions;
export const selectCategories = (state: { category: CategoryState }) => state.category.categories;
export const selectCategoriesLoading = (state: { category: CategoryState }) => state.category.isLoading;
export const selectCategoriesError = (state: { category: CategoryState }) => state.category.error;

export default categorySlice.reducer;