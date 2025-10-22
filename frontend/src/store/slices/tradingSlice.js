import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  matches: [],
  teams: [],
  orders: [],
  orderBook: { buyOrders: [], sellOrders: [] },
  selectedMatch: null,
  selectedTeam: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getMatches = createAsyncThunk(
  'trading/getMatches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/trading/matches');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch matches');
    }
  }
);

export const getTeams = createAsyncThunk(
  'trading/getTeams',
  async (matchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/trading/teams/${matchId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teams');
    }
  }
);

export const placeOrder = createAsyncThunk(
  'trading/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/trading/orders', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to place order');
    }
  }
);

export const getUserOrders = createAsyncThunk(
  'trading/getUserOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/trading/orders', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const getOrderBook = createAsyncThunk(
  'trading/getOrderBook',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/trading/orderbook/${teamId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order book');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'trading/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/trading/orders/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

// Trading slice
const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedMatch: (state, action) => {
      state.selectedMatch = action.payload;
    },
    setSelectedTeam: (state, action) => {
      state.selectedTeam = action.payload;
    },
    updateTeamPrice: (state, action) => {
      const { teamId, price, change } = action.payload;
      const team = state.teams.find(t => t.id === teamId);
      if (team) {
        team.currentPrice = price;
        team.change = change;
        team.changePercent = (change / (price - change)) * 100;
      }
    },
    addOrder: (state, action) => {
      state.orders.unshift(action.payload);
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get matches
      .addCase(getMatches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMatches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.matches = action.payload.data.matches;
        state.error = null;
      })
      .addCase(getMatches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get teams
      .addCase(getTeams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTeams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teams = action.payload.data.teams;
        state.error = null;
      })
      .addCase(getTeams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Place order
      .addCase(placeOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload.data.order);
        state.error = null;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get user orders
      .addCase(getUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data.orders;
        state.error = null;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get order book
      .addCase(getOrderBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderBook = action.payload.data;
        state.error = null;
      })
      .addCase(getOrderBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const orderId = action.payload.data.orderId;
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
          order.status = 'cancelled';
        }
        state.error = null;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setSelectedMatch, 
  setSelectedTeam, 
  updateTeamPrice, 
  addOrder, 
  updateOrderStatus 
} = tradingSlice.actions;
export default tradingSlice.reducer;