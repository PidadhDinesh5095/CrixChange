import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

const PAGE_SIZE = 10

const initialState = {
  orders: {
    list: [], from: 0, to: PAGE_SIZE, hasMore: true,
    isLoading: false, filters: { status: '', side: '' }, error: null,
    cancellingIds: []
  },
  holdings: {
    list: [], isLoading: false,
    filters: { search: '', sortBy: 'currentValue', order: 'desc' }, error: null
  },
  transactions: {
    list: [], from: 0, to: PAGE_SIZE, hasMore: true,
    isLoading: false, filters: { side: '', stockId: '', startDate: '', endDate: '' }, error: null
  }
}

export const getOrders = createAsyncThunk(
  'portfolio/getOrders',
  async ({ reset = false } = {}, { getState, rejectWithValue }) => {
    try {
      const { orders } = getState().portfolio
      const userId = getState().auth.user?.id
      const from = reset ? 0 : orders.from
      const to = from + PAGE_SIZE
      const response = await api.get('/trading/orders', { params: { userId, from, to, ...orders.filters } })
      return { ...response.data, reset }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch orders')
    }
  }
)

export const getHoldings = createAsyncThunk(
  'portfolio/getHoldings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { holdings } = getState().portfolio
      const userId = getState().auth.user?.id
      const response = await api.get('/trading/holdings', { params: { userId, ...holdings.filters } })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch holdings')
    }
  }
)

export const getTransactions = createAsyncThunk(
  'portfolio/getTransactions',
  async ({ reset = false } = {}, { getState, rejectWithValue }) => {
    try {
      const { transactions } = getState().portfolio
      const userId = getState().auth.user?.id
      const from = reset ? 0 : transactions.from
      const to = from + PAGE_SIZE
      const response = await api.get('/trading/transactions', { params: { userId, from, to, ...transactions.filters } })
      return { ...response.data, reset }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch transactions')
    }
  }
)

export const cancelOrder = createAsyncThunk(
  'portfolio/cancelOrder',
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth.user?.id
      console.log(`Cancelling order ${orderId} for user ${userId}`);
      const response = await api.delete(`/trading/orders/${orderId}/${userId}`)
      return { orderId, status: response.data.status }
    } catch (error) {
      return rejectWithValue({
        orderId,
        message: error.response?.data?.error || 'Failed to cancel order'
      })
    }
  }
)

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setOrderFilters: (state, action) => {
      state.orders.filters = { ...state.orders.filters, ...action.payload }
      state.orders.list = []
      state.orders.from = 0
      state.orders.hasMore = true
    },
    setHoldingFilters: (state, action) => {
      state.holdings.filters = { ...state.holdings.filters, ...action.payload }
    },
    setTransactionFilters: (state, action) => {
      state.transactions.filters = { ...state.transactions.filters, ...action.payload }
      state.transactions.list = []
      state.transactions.from = 0
      state.transactions.hasMore = true
    },
    clearPortfolioErrors: (state) => {
      state.orders.error = null
      state.holdings.error = null
      state.transactions.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrders.pending, (state) => { state.orders.isLoading = true; state.orders.error = null })
      .addCase(getOrders.fulfilled, (state, action) => {
        const { orders, to, hasMore, reset } = action.payload
        state.orders.isLoading = false
        state.orders.list = reset ? orders : [...state.orders.list, ...orders]
        state.orders.from = to
        state.orders.to = to + PAGE_SIZE
        state.orders.hasMore = hasMore ?? orders.length === PAGE_SIZE
      })
      .addCase(getOrders.rejected, (state, action) => { state.orders.isLoading = false; state.orders.error = action.payload })

      .addCase(getHoldings.pending, (state) => { state.holdings.isLoading = true; state.holdings.error = null })
      .addCase(getHoldings.fulfilled, (state, action) => {
        state.holdings.isLoading = false
        state.holdings.list = action.payload.holdings
      })
      .addCase(getHoldings.rejected, (state, action) => { state.holdings.isLoading = false; state.holdings.error = action.payload })

      .addCase(getTransactions.pending, (state) => { state.transactions.isLoading = true; state.transactions.error = null })
      .addCase(getTransactions.fulfilled, (state, action) => {
        const { transactions, to, hasMore, reset } = action.payload
        state.transactions.isLoading = false
        state.transactions.list = reset ? transactions : [...state.transactions.list, ...transactions]
        state.transactions.from = to
        state.transactions.to = to + PAGE_SIZE
        state.transactions.hasMore = hasMore ?? transactions.length === PAGE_SIZE
      })
      .addCase(getTransactions.rejected, (state, action) => { state.transactions.isLoading = false; state.transactions.error = action.payload })

      .addCase(cancelOrder.pending, (state, action) => {
        const orderId = action.meta.arg
        if (!state.orders.cancellingIds.includes(orderId)) {
          state.orders.cancellingIds.push(orderId)
        }
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const { orderId, status } = action.payload
        state.orders.cancellingIds = state.orders.cancellingIds.filter(id => id !== orderId)
        const idx = state.orders.list.findIndex(o => o._id === orderId)
        if (idx !== -1) {
          state.orders.list[idx] = { ...state.orders.list[idx], status: status || 'CANCELLED' }
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        const orderId = action.payload?.orderId || action.meta.arg
        state.orders.cancellingIds = state.orders.cancellingIds.filter(id => id !== orderId)
        state.orders.error = action.payload?.message || 'Failed to cancel order'
      })
  }
})

export const { setOrderFilters, setHoldingFilters, setTransactionFilters, clearPortfolioErrors } = portfolioSlice.actions
export default portfolioSlice.reducer