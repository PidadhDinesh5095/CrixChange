import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  liveMatches: [],
  selectedMatch: null,
  isLoading: false,
  error: null,
};

export const getMatches = createAsyncThunk(
  'currentMatches/getMatches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/currentMatches/today');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch matches');
    }
  }
);

const currentMatchSlice = createSlice({
  name: 'currentMatch',
  initialState, 
    reducers: { 
      setSelectedMatch: (state, action) => {
        state.selectedMatch = action.payload.matches;
      },

    },
    extraReducers: (builder) => {
    builder
        .addCase(getMatches.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(getMatches.fulfilled, (state, action) => {
            state.isLoading = false;
            state.liveMatches = action.payload.matches || [];
            console.log("Matches fetched successfully:", state.liveMatches); // Debug log
        })
        .addCase(getMatches.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });
    },
});

export const { setSelectedMatch } = currentMatchSlice.actions;
export default currentMatchSlice.reducer;