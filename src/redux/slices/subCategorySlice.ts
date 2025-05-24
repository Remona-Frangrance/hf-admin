import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Key } from 'react';

interface SubcategoryImage {
  url: string;
  publicId?: string;
}

interface Subcategory {
  _id: Key | null | undefined;
  id: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  coverImage: string;
  images: SubcategoryImage[];
  status: 'Active' | 'Inactive';
  createdAt: string;
}

interface SubcategoryState {
  subcategories: Subcategory[];
  loading: boolean;
  error: string | null;
  currentSubcategory: Subcategory | null;
}

const initialState: SubcategoryState = {
  subcategories: [],
  loading: false,
  error: null,
  currentSubcategory: null,
};

// Fetch all subcategories
export const fetchSubcategories = createAsyncThunk(
  'subcategory/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://hf-backend-3-u0gd.onrender.com/api/subcategories');
      return response.data;
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subcategories');
    }
  } 
);

// Add new subcategory with multiple images
export const addSubcategory = createAsyncThunk(
  'subcategory/add',
  async (subcategoryData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.post('https://hf-backend-3-u0gd.onrender.com/api/subcategories', subcategoryData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add subcategory');
    }
  }
);

// Update subcategory
export const updateSubcategory = createAsyncThunk(
  'subcategory/update',
  async ({ id, subcategoryData }: { id: string; subcategoryData: FormData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`https://hf-backend-3-u0gd.onrender.com/api/subcategories/${id}`, subcategoryData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subcategory');
    }
  }
);

// Delete subcategory
export const deleteSubcategory = createAsyncThunk(
  'subcategory/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`https://hf-backend-3-u0gd.onrender.com/api/subcategories/${id}`);
      return id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {  
      return rejectWithValue(error.response?.data?.message || 'Failed to delete subcategory');
    }
  }
);

const subcategorySlice = createSlice({
  name: 'subcategory',
  initialState,
  reducers: {
    setCurrentSubcategory: (state, action: PayloadAction<Subcategory | null>) => {
      state.currentSubcategory = action.payload;
    },
    clearSubcategories: (state) => {
      state.subcategories = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Subcategories
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action: PayloadAction<Subcategory[]>) => {
        state.subcategories = action.payload;
        state.loading = false;
      })
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(fetchSubcategories.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add Subcategory
      .addCase(addSubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubcategory.fulfilled, (state, action: PayloadAction<Subcategory>) => {
        state.subcategories.push(action.payload);
        state.loading = false;
      })
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(addSubcategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Subcategory
      .addCase(updateSubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubcategory.fulfilled, (state, action: PayloadAction<Subcategory>) => {
        const index = state.subcategories.findIndex(sub => sub.id === action.payload.id);
        if (index !== -1) {
          state.subcategories[index] = action.payload;
        }
        state.loading = false;
      })
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(updateSubcategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Subcategory
      .addCase(deleteSubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubcategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.subcategories = state.subcategories.filter(sub => sub.id !== action.payload);
        state.loading = false;
      })
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(deleteSubcategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setCurrentSubcategory, clearSubcategories } = subcategorySlice.actions;
export default subcategorySlice.reducer;