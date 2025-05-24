// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import categoryReducer from './categorySlice';
import subcategoryReducer from './subCategorySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer ,
    subcategory: subcategoryReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
