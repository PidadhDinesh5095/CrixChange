import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';



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
        state.ipos = action.payload?.ipos || action.payload?.data?.ipos ;
      })
      .addCase(getIPOs.rejected, (state, action) => {
        state.isLoading = false;
        state.ipos = [];
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
