import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const fallbackIPOs = [
  { _id: 'ipo-csk', teamName: 'Chennai Super Kings', symbol: 'CSK', teamLogo: 'CSK', ipoPrice: 125, totalShares: 1000000, availableShares: 620000, status: 'OPEN', openTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), closeTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() },
  { _id: 'ipo-mi', teamName: 'Mumbai Indians', symbol: 'MI', teamLogo: 'MI', ipoPrice: 140, totalShares: 1000000, availableShares: 780000, status: 'OPEN', openTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), closeTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString() },
  { _id: 'ipo-rcb', teamName: 'Royal Challengers Bangalore', symbol: 'RCB', teamLogo: 'RCB', ipoPrice: 118, totalShares: 1000000, availableShares: 500000, status: 'UPCOMING', openTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), closeTime: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString() },
  { _id: 'ipo-kkr', teamName: 'Kolkata Knight Riders', symbol: 'KKR', teamLogo: 'KKR', ipoPrice: 132, totalShares: 1000000, availableShares: 740000, status: 'OPEN', openTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), closeTime: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString() },
  { _id: 'ipo-srh', teamName: 'Sunrisers Hyderabad', symbol: 'SRH', teamLogo: 'SRH', ipoPrice: 96, totalShares: 1000000, availableShares: 910000, status: 'LISTED', openTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), closeTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { _id: 'ipo-gt', teamName: 'Gujarat Titans', symbol: 'GT', teamLogo: 'GT', ipoPrice: 154, totalShares: 1000000, availableShares: 430000, status: 'OPEN', openTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), closeTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() },
  { _id: 'ipo-rr', teamName: 'Rajasthan Royals', symbol: 'RR', teamLogo: 'RR', ipoPrice: 109, totalShares: 1000000, availableShares: 600000, status: 'CLOSED', openTime: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), closeTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { _id: 'ipo-pbks', teamName: 'Punjab Kings', symbol: 'PBKS', teamLogo: 'PBKS', ipoPrice: 101, totalShares: 1000000, availableShares: 330000, status: 'UPCOMING', openTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), closeTime: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString() },
  { _id: 'ipo-dc', teamName: 'Delhi Capitals', symbol: 'DC', teamLogo: 'DC', ipoPrice: 128, totalShares: 1000000, availableShares: 760000, status: 'OPEN', openTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), closeTime: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString() },
  { _id: 'ipo-lsg', teamName: 'Lucknow Super Giants', symbol: 'LSG', teamLogo: 'LSG', ipoPrice: 112, totalShares: 1000000, availableShares: 880000, status: 'LISTED', openTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), closeTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
];

const initialState = {
  ipos: [],
  selectedIPO: null,
  isLoading: false,
  isBuying: false,
  error: null
};

export const getIPOs = createAsyncThunk('ipo/getIPOs', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/ipos');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch IPOs');
  }
});

export const getIPOById = createAsyncThunk('ipo/getIPOById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/ipos/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch IPO details');
  }
});

export const buyIPO = createAsyncThunk('ipo/buyIPO', async ({ id, quantity }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/ipos/${id}/buy`, { quantity });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'IPO purchase failed');
  }
});

const ipoSlice = createSlice({
  name: 'ipo',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedIPO: (state) => {
      state.selectedIPO = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getIPOs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIPOs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ipos = action.payload?.ipos || action.payload?.data?.ipos || fallbackIPOs;
      })
      .addCase(getIPOs.rejected, (state, action) => {
        state.isLoading = false;
        state.ipos = fallbackIPOs;
        state.error = action.payload;
      })
      .addCase(getIPOById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIPOById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedIPO = action.payload?.ipo || action.payload?.data?.ipo || null;
      })
      .addCase(getIPOById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(buyIPO.pending, (state) => {
        state.isBuying = true;
        state.error = null;
      })
      .addCase(buyIPO.fulfilled, (state, action) => {
        state.isBuying = false;
        state.selectedIPO = action.payload?.ipo || state.selectedIPO;
        state.ipos = state.ipos.map((ipo) => {
          if (String(ipo._id) === String(action.payload?.ipo?._id || action.payload?.ipo?.id)) {
            return { ...ipo, ...action.payload.ipo };
          }
          return ipo;
        });
      })
      .addCase(buyIPO.rejected, (state, action) => {
        state.isBuying = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSelectedIPO } = ipoSlice.actions;
export default ipoSlice.reducer;
