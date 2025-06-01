// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import categoryReducer from './categorySlice';
import subcategoryReducer from './subCategorySlice';
import galleryReducer from './gallerySlice';


const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer ,
    subcategory: subcategoryReducer,
    gallery: galleryReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
