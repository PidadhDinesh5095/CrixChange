import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import walletSlice from './slices/walletSlice';
import tradingSlice from './slices/tradingSlice';
import portfolioSlice from './slices/portfolioSlice';
import kycSlice from './slices/kycSlice';
import themeSlice from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    wallet: walletSlice,
    trading: tradingSlice,
    portfolio: portfolioSlice,
    kyc: kycSlice,
    theme: themeSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;