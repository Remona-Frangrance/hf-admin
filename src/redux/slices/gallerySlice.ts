import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string; // Changed from 'image' to 'imageUrl' to match backend
  subcategory?: string; // Added subcategory
  createdAt?: string;
  updatedAt?: string;
}

interface GalleryState {
  gallery: GalleryItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GalleryState = {
  gallery: [],
  isLoading: false,
  error: null,
};

// ✅ Fetch all gallery items (optionally filtered by subcategory)
export const fetchGallery = createAsyncThunk<
  GalleryItem[],
  { subcategory?: string } | undefined,
  { rejectValue: string }
>(
  'gallery/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const url = params?.subcategory
        ? `http://localhost:5000/api/gallery?subcategory=${encodeURIComponent(params.subcategory)}`
        : 'http://localhost:5000/api/gallery';
      const response = await axios.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gallery');
    }
  }
);

// ✅ Add a new gallery item
export const addGalleryItem = createAsyncThunk<
  GalleryItem,
  FormData,
  { rejectValue: string }
>(
  'gallery/add',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/gallery/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add gallery item');
    }
  }
);

// ✅ Update gallery item
export const updateGalleryItem = createAsyncThunk<
  GalleryItem,
  { id: string; formData: FormData },
  { rejectValue: string }
>(
  'gallery/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/gallery/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update gallery item');
    }
  }
);

// ✅ Delete gallery item
export const deleteGalleryItem = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'gallery/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:5000/api/gallery/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete gallery item');
    }
  }
);

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    clearGallery: (state) => {
      state.gallery = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchGallery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGallery.fulfilled, (state, action: PayloadAction<GalleryItem[]>) => {
        state.gallery = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchGallery.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addGalleryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addGalleryItem.fulfilled, (state, action: PayloadAction<GalleryItem>) => {
        state.gallery.push(action.payload);
        state.isLoading = false;
      })
      .addCase(addGalleryItem.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateGalleryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGalleryItem.fulfilled, (state, action: PayloadAction<GalleryItem>) => {
        const index = state.gallery.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.gallery[index] = action.payload;
        }
        state.isLoading = false;
      })
      .addCase(updateGalleryItem.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteGalleryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteGalleryItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.gallery = state.gallery.filter((item) => item._id !== action.payload);
        state.isLoading = false;
      })
      .addCase(deleteGalleryItem.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearGallery } = gallerySlice.actions;
export const selectGallery = (state: { gallery: GalleryState }) => state.gallery.gallery;
export const selectGalleryLoading = (state: { gallery: GalleryState }) => state.gallery.isLoading;
export const selectGalleryError = (state: { gallery: GalleryState }) => state.gallery.error;

export default gallerySlice.reducer;
