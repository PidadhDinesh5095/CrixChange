import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  matches: [],
  teams: [],
  stocks: [],
  stats: [],
  orders: [],
  trades:[],
  myTrades:[],
  orderBook: { buyOrders: [], sellOrders: [] },
  selectedMatch: null,
  selectedStock: null,
  isLoading: false,
  isStocksLoading: false,
  orderIsLoading: false,
  isStatsLoading: false,
  isOrderBookLoaing: false,
  isTradesLoading:false,
   isMyTradesLoading:false,
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

export const getStats = createAsyncThunk(
  'trading/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/trading/stats');
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

export const getTrades = createAsyncThunk(
  'trading/getTrades',
  async (stockId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/trading/trades/${stockId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch Trades');
    }
  }
);


export const getMyTrades = createAsyncThunk(
  'trading/getMyTrades',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.get(`/trading/myTrades/${data.stockId}/${data.userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch Trades');
    }
  }
);
export const getMarketStocks = createAsyncThunk(
  'trading/getMarketStocks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/trading/stocks');
      return response.data.stocks || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch market stocks');
    }
  }
);

export const orderPlace = createAsyncThunk(
  'trading/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/trading/order', orderData);
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
      const response = await api.get(`/trading/depth/${teamId}`);
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
    setSelectedStock: (state, action) => {
      state.selectedStock = action.payload;
    },
    updateTrades:(state,action)=>{
      
      state.trades.unshift(action.payload);
      
    },
    updateMyTrades:(state,action)=>{
      state.myTrades.unshift(action.payload);
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
    updateStockStat: (state, action) => {
      const { id, data } = action.payload;
      const index = state.stats.findIndex((s) => s.id === id);

      if (index !== -1) {
        state.stats[index] = { id, data: { ...state.stats[index].data, ...data } };
      } else {
        state.stats.push({ id, data });
      }
    },
    updateOrderBook: (state, action) => {
      const data=action.payload;
      state.orderBook=data;
    }
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

       .addCase(getTrades.pending, (state) => {
        state.isTradesLoading= true;
        state.error = null;
      })
      .addCase(getTrades.fulfilled, (state, action) => {
        state.isTradesLoading = false;
        state.trades= action.payload.trades;
        
        state.error = null;
      })
      .addCase(getTrades.rejected, (state, action) => {
        state.isTradesLoading = false;
        state.error = action.payload;
      })

       .addCase(getMyTrades.pending, (state) => {
        state.isMyTradesLoading= true;
        state.error = null;
      })
      .addCase(getMyTrades.fulfilled, (state, action) => {
        state.isMyTradesLoading = false;
        state.myTrades= action.payload.myTrades;
        
        state.error = null;
      })
      .addCase(getMyTrades.rejected, (state, action) => {
        state.isMyTradesLoading = false;
        state.error = action.payload;
      })

      // Get market stocks
      .addCase(getMarketStocks.pending, (state) => {
        state.isStocksLoading = true;
        state.error = null;
      })
      .addCase(getMarketStocks.fulfilled, (state, action) => {
        state.isStocksLoading = false;
        state.stocks = action.payload;
        state.error = null;
      })
      .addCase(getMarketStocks.rejected, (state, action) => {
        state.isStocksLoading = false;
        state.error = action.payload;
      })

      .addCase(getStats.pending, (state) => {
        state.isStatsLoading = true;
        state.error = null;
      })
      .addCase(getStats.fulfilled, (state, action) => {
        state.isStatsLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(getStats.rejected, (state, action) => {
        state.isStatsLoading = false;
        state.error = action.payload;
      })

      // Place order
      .addCase(orderPlace.pending, (state) => {
        state.orderIsLoading = true;
        state.error = null;
      })
      .addCase(orderPlace.fulfilled, (state, action) => {
        state.orderIsLoading = false;
        state.orders.unshift(action.payload.order);
        state.error = null;
      })
      .addCase(orderPlace.rejected, (state, action) => {
        state.orderIsLoading = false;
        state.error = action.payload.message;
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
        state.isOrderBookLoaing = true;
        state.error = null;
      })
      .addCase(getOrderBook.fulfilled, (state, action) => {
        state.isOrderBookLoaing = false;
        state.orderBook = action.payload.data;
        console.log(action.payload.data);
        state.error = null;
      })
      .addCase(getOrderBook.rejected, (state, action) => {
        state.isOrderBookLoaing = false;
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
  setSelectedStock,
  updateTeamPrice,
  updateMyTrades,
  updateTrades,
  updateStockStat,
  addOrder,
  updateOrderStatus,
  updateOrderBook
} = tradingSlice.actions;
export default tradingSlice.reducer;