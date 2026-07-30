import React, { useEffect, useCallback, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getOrders, getHoldings, getTransactions, cancelOrder, setOrderFilters, setHoldingFilters, setTransactionFilters } from '../store/slices/portfolioSlice'

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0)

const formatDateTime = (d) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(d))

const StockCell = ({ image, title, symbol }) => (
  <div className="flex items-center gap-3">
    <img src={image} alt={title} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
    <div className="leading-tight">
      <div className="text-sm font-semibold text-black dark:text-white">{title}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{symbol}</div>
    </div>
  </div>
)

const Th = ({ children, align = 'left' }) => (
  <th className={`px-4 py-3 text-${align} text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap`}>
    {children}
  </th>
)

const Td = ({ children, align = 'left', className = '' }) => (
  <td className={`px-4 py-3 text-${align} text-sm text-black dark:text-white whitespace-nowrap ${className}`}>
    {children}
  </td>
)

const PortfolioPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { orders, holdings, transactions } = useSelector(state => state.portfolio)
  const { isAuthenticated } = useSelector(state => state.auth)
  const [tab, setTab] = useState('orders')
  const observerRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (isAuthenticated) {
      if (orders.list.length === 0) dispatch(getOrders({ reset: true }))
      if (holdings.list.length === 0) dispatch(getHoldings())
      if (transactions.list.length === 0) dispatch(getTransactions({ reset: true }))
    }
  }, [dispatch, isAuthenticated])

  const loadMoreRef = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (tab === 'orders' && orders.hasMore && !orders.isLoading) dispatch(getOrders())
        if (tab === 'transactions' && transactions.hasMore && !transactions.isLoading) dispatch(getTransactions())
      }
    })
    if (node) observerRef.current.observe(node)
  }, [tab, orders.hasMore, orders.isLoading, transactions.hasMore, transactions.isLoading, dispatch])

  const handleCancelOrder = (orderId) => {
    dispatch(cancelOrder(orderId))
  }

  const tabs = [
    { id: 'orders', label: 'Orders', count: orders.list.length },
    { id: 'holdings', label: 'Holdings', count: holdings.list.length },
    { id: 'transactions', label: 'Transactions', count: transactions.list.length },
  ]

  return (
    <div className="fixed inset-0 mt-10 bg-white dark:bg-black font-raleway flex flex-col overflow-hidden">


      {/* Tabs */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 px-4 sm:px-8 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
        {/* Left - Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${tab === t.id
                ? 'bg-gray-100 dark:bg-gray-900 text-black dark:text-white border-b-2 border-black dark:border-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
            >
              {t.label}
              <span className="ml-1 text-xs text-gray-400">({t.count})</span>
            </button>
          ))}
        </div>

        {/* Right - Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {tab === 'orders' && (
            <>
              <select
                className="flex-1 sm:flex-none min-w-0 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white"
                value={orders.filters.side}
                onChange={e => dispatch(setOrderFilters({ side: e.target.value }))}
              >
                <option value="">All Sides</option>
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>

              <select
                className="flex-1 sm:flex-none min-w-0 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white"
                value={orders.filters.status}
                onChange={e => dispatch(setOrderFilters({ status: e.target.value }))}
              >
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="PARTIALLY_FILLED">Partially Filled</option>
                <option value="CLOSED">Closed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </>
          )}

          {tab === 'transactions' && (
            <>
              <select
                className="flex-1 sm:flex-none min-w-0 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white"
                value={transactions.filters.side}
                onChange={e => dispatch(setTransactionFilters({ side: e.target.value }))}
              >
                <option value="">All Sides</option>
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>

              <input
                type="date"
                className="flex-1 sm:flex-none min-w-0 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white"
                value={transactions.filters.startDate}
                onChange={e => dispatch(setTransactionFilters({ startDate: e.target.value }))}
              />

              <input
                type="date"
                className="flex-1 sm:flex-none min-w-0 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white"
                value={transactions.filters.endDate}
                onChange={e => dispatch(setTransactionFilters({ endDate: e.target.value }))}
              />
            </>
          )}
        </div>
      </div>




      {/* Table area */}
      <div className="flex-1 overflow-y-auto px-8 ">
        {tab === 'orders' && (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-black z-10">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <Th>Stock</Th>
                <Th align="right">Qty</Th>
                <Th align="right">Price</Th>
                <Th align="right">Filled</Th>
                <Th align="center">Side</Th>
                <Th align="center">Status</Th>
                <Th align="right">Placed</Th>
                <Th align="center">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {orders.list.map(o => {
                const isCancellable = o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED'
                const isCancelling = orders.cancellingIds.includes(o._id)
                return (
                  <tr key={o._id} className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-950">
                    <Td><StockCell image={o.stockId?.image} title={o.stockId?.title} symbol={o.stockId?.symbol} /></Td>
                    <Td align="right">{o.quantity}</Td>
                    <Td align="right">{formatCurrency(o.price || o.averagePrice)}</Td>
                    <Td align="right">{o.filledQuantity}/{o.quantity}</Td>
                    <Td align="center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.side === 'BUY' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {o.side}
                      </span>
                    </Td>
                    <Td align="center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {o.status}
                      </span>
                    </Td>
                    <Td align="right" className="text-gray-500 dark:text-gray-400">{formatDateTime(o.createdAt)}</Td>
                    <Td align="center">
                      {isCancellable ? (
                        <button
                          onClick={() => handleCancelOrder(o._id)}
                          disabled={isCancelling}
                          className="px-3 py-1 text-xs font-semibold rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isCancelling ? 'Cancelling...' : 'Cancel'}
                        </button>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-700 text-xs">—</span>
                      )}
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {tab === 'holdings' && (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-black z-10">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <Th>Stock</Th>
                <Th align="right">Qty</Th>
                <Th align="right">Avg Price</Th>
                <Th align="right">Current Price</Th>
                <Th align="right">Current Value</Th>
                <Th align="right">P&L</Th>
              </tr>
            </thead>
            <tbody>
              {holdings.list.map(h => (
                <tr key={h.stockId} className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-950">
                  <Td><StockCell image={h.image} title={h.title} symbol={h.symbol} /></Td>
                  <Td align="right">{(Number(h.quantity) || 0).toFixed(2)}</Td>
                  <Td align="right">{formatCurrency(h.avgPrice)}</Td>
                  <Td align="right">{formatCurrency(h.currentPrice)}</Td>
                  <Td align="right">{formatCurrency(h.currentValue)}</Td>
                  <Td align="right">
                    <div className={h.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}
                      <span className="block text-xs">({h.pnlPercent >= 0 ? '+' : ''}{h.pnlPercent.toFixed(2)}%)</span>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'transactions' && (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-black z-10">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <Th>Stock</Th>
                <Th align="center">Type</Th>
                <Th align="right">Qty</Th>
                <Th align="right">Price</Th>
                <Th align="right">Amount</Th>
                <Th align="right">Date</Th>
              </tr>
            </thead>
            <tbody>
              {transactions.list.map(t => (
                <tr key={t.id} className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-950">
                  <Td><StockCell image={t.image} title={t.title} symbol={t.symbol} /></Td>
                  <Td align="center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.type === 'BUY' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {t.type}
                    </span>
                  </Td>
                  <Td align="right">{t.quantity}</Td>
                  <Td align="right">{formatCurrency(t.price)}</Td>
                  <Td align="right">{formatCurrency(t.amount)}</Td>
                  <Td align="right" className="text-gray-500 dark:text-gray-400">{formatDateTime(t.date)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {(tab === 'orders' || tab === 'transactions') && <div ref={loadMoreRef} className="h-8" />}

        {((tab === 'orders' && orders.isLoading) ||
          (tab === 'transactions' && transactions.isLoading) ||
          (tab === 'holdings' && holdings.isLoading)) && (
            <div className="text-center py-4 text-sm text-gray-400">Loading...</div>
          )}
      </div>
    </div>
  )
}

export default PortfolioPage