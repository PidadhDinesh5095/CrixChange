import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  holdings: [],
  summary: {
    totalValue: 0,
    totalInvested: 0,
    totalPnL: 0,
    todaysPnL: 0,
    totalHoldings: 0
  },
  transactions: [],
  performance: {
    daily: [],
    weekly: [],
    monthly: []
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const getPortfolio = createAsyncThunk(
  'portfolio/getPortfolio',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/portfolio');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch portfolio');
    }
  }
);

export const getPortfolioSummary = createAsyncThunk(
  'portfolio/getSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/portfolio/summary');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch portfolio summary');
    }
  }
);

export const getPortfolioTransactions = createAsyncThunk(
  'portfolio/getTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/portfolio/transactions', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch portfolio transactions');
    }
  }
);

export const getPortfolioPerformance = createAsyncThunk(
  'portfolio/getPerformance',
  async (period, { rejectWithValue }) => {
    try {
      const response = await api.get(`/portfolio/performance/${period}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch portfolio performance');
    }
  }
);

// Portfolio slice
const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateHolding: (state, action) => {
      const { teamId, currentPrice } = action.payload;
      const holding = state.holdings.find(h => h.teamId === teamId);
      if (holding) {
        holding.currentPrice = currentPrice;
        holding.currentValue = holding.quantity * currentPrice;
        holding.unrealizedPnL = holding.currentValue - holding.totalInvested;
        holding.pnlPercentage = (holding.unrealizedPnL / holding.totalInvested) * 100;
      }
    },
    addHolding: (state, action) => {
      const existingHolding = state.holdings.find(h => h.teamId === action.payload.teamId);
      if (existingHolding) {
        // Update existing holding
        const newQuantity = existingHolding.quantity + action.payload.quantity;
        const newInvestment = existingHolding.totalInvested + action.payload.totalInvested;
        existingHolding.quantity = newQuantity;
        existingHolding.averageBuyPrice = newInvestment / newQuantity;
        existingHolding.totalInvested = newInvestment;
        existingHolding.currentValue = newQuantity * existingHolding.currentPrice;
        existingHolding.unrealizedPnL = existingHolding.currentValue - existingHolding.totalInvested;
        existingHolding.pnlPercentage = (existingHolding.unrealizedPnL / existingHolding.totalInvested) * 100;
      } else {
        // Add new holding
        state.holdings.push(action.payload);
      }
    },
    removeHolding: (state, action) => {
      const { teamId, quantity } = action.payload;
      const holding = state.holdings.find(h => h.teamId === teamId);
      if (holding) {
        holding.quantity -= quantity;
        if (holding.quantity <= 0) {
          state.holdings = state.holdings.filter(h => h.teamId !== teamId);
        } else {
          holding.currentValue = holding.quantity * holding.currentPrice;
          holding.unrealizedPnL = holding.currentValue - (holding.averageBuyPrice * holding.quantity);
          holding.pnlPercentage = (holding.unrealizedPnL / (holding.averageBuyPrice * holding.quantity)) * 100;
        }
      }
    },
    updateSummary: (state, action) => {
      state.summary = { ...state.summary, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get portfolio
      .addCase(getPortfolio.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPortfolio.fulfilled, (state, action) => {
        state.isLoading = false;
        state.holdings = action.payload.data.holdings;
        state.error = null;
      })
      .addCase(getPortfolio.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get portfolio summary
      .addCase(getPortfolioSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPortfolioSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload.data.summary;
        state.error = null;
      })
      .addCase(getPortfolioSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get portfolio transactions
      .addCase(getPortfolioTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPortfolioTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.data.transactions;
        state.error = null;
      })
      .addCase(getPortfolioTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get portfolio performance
      .addCase(getPortfolioPerformance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPortfolioPerformance.fulfilled, (state, action) => {
        state.isLoading = false;
        const { period, data } = action.payload.data;
        state.performance[period] = data;
        state.error = null;
      })
      .addCase(getPortfolioPerformance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  updateHolding, 
  addHolding, 
  removeHolding, 
  updateSummary 
} = portfolioSlice.actions;
export default portfolioSlice.reducer;