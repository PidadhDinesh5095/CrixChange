import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  balance: 0,
  frozenBalance: 0,
  totalDeposited: 0,
  totalWithdrawn: 0,
  transactions: [],
  isLoading: false,
  isDepositing: false,
  isWithdrawing: false,
  error: null,
};

export const getWalletBalance = createAsyncThunk(
  'wallet/getBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wallet/balance');
      console.log('Wallet balance response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet balance');
    }
  }
);

export const depositFunds = createAsyncThunk(
  'wallet/deposit',
  async (depositData, { rejectWithValue }) => {
    console.log('Deposit data:', depositData); // Debug log
    const token = localStorage.getItem('token');
    try {
      const response = await api.post('/wallet/deposit',depositData,
        {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      } );
      console.log('Deposit response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Deposit failed');
    }
  }
);

export const withdrawFunds = createAsyncThunk(
  'wallet/withdraw',
  async (withdrawData, { rejectWithValue }) => {
    try {
      const response = await api.post('/wallet/withdraw', withdrawData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Withdrawal failed');
    }
  }
);

export const getTransactionHistory = createAsyncThunk(
  'wallet/getTransactions',
  async (params, { rejectWithValue }) => {
    try {
      console.log('Fetching transactions with params:', params); // Debug log
      const response = await api.get('/wallet/transactions', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

// Wallet slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateBalance: (state, action) => {
      state.balance = action.payload.balance;
      state.frozenBalance = action.payload.frozenBalance || state.frozenBalance;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Get wallet balance
      .addCase(getWalletBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWalletBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.wallet.balance;
        state.frozenBalance = action.payload.wallet.frozenBalance;
        state.totalDeposited = action.payload.wallet.totalDeposited;
        state.totalWithdrawn = action.payload.wallet.totalWithdrawn;
        state.transactions = action.payload.transactions || [];
        state.error = null;
      })
      .addCase(getWalletBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Deposit funds
      .addCase(depositFunds.pending, (state) => {
        state.isDepositing = true;
        state.error = null;
      })
      .addCase(depositFunds.fulfilled, (state, action) => {
        state.isDepositing = false;
        state.balance = action.payload.wallet.balance;
        state.totalDeposited = action.payload.wallet.totalDeposited;
        state.transactions = action.payload.transactions || state.transactions;
        state.error = null;
      })
      .addCase(depositFunds.rejected, (state, action) => {
        state.isDepositing = false;
        state.error = action.payload;
      })

      // Withdraw funds
      .addCase(withdrawFunds.pending, (state) => {
        state.isWithdrawing = true;
        state.error = null;
      })
      .addCase(withdrawFunds.fulfilled, (state, action) => {
        state.isWithdrawing = false;
        state.balance = action.payload.wallet.balance;
        state.totalWithdrawn = action.payload.wallet.totalWithdrawn;
        state.transactions = action.payload.transactions || state.transactions;
        state.error = null;
      })
      .addCase(withdrawFunds.rejected, (state, action) => {
        state.isWithdrawing = false;
        state.error = action.payload;
      })

      // Get transaction history
      .addCase(getTransactionHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.data.transactions;
        state.error = null;
      })
      .addCase(getTransactionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateBalance, addTransaction } = walletSlice.actions;
export default walletSlice.reducer;