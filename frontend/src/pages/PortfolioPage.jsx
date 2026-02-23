import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const PortfolioPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState({
    summary: {
      totalValue: 0,
      totalInvested: 0,
      totalPnL: 0,
      todaysPnL: 0,
      totalHoldings: 0
    },
    holdings: [],
    transactions: []
  });
  const [selectedTab, setSelectedTab] = useState('holdings');
  const [filterPeriod, setFilterPeriod] = useState('all');

  useEffect(() => {
    // Simulate loading portfolio data
    setTimeout(() => {
      setPortfolioData({
        summary: {
          totalValue: 57500,
          totalInvested: 50000,
          totalPnL: 7500,
          todaysPnL: 1250,
          totalHoldings: 8
        },
        holdings: [
          {
            id: 1,
            team: 'Mumbai Indians',
            shortName: 'MI',
            logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
            quantity: 25,
            avgPrice: 120.50,
            currentPrice: 125.50,
            invested: 3012.50,
            currentValue: 3137.50,
            pnl: 125.00,
            pnlPercent: 4.15
          },
          {
            id: 2,
            team: 'Chennai Super Kings',
            shortName: 'CSK',
            logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
            quantity: 30,
            avgPrice: 140.25,
            currentPrice: 142.75,
            invested: 4207.50,
            currentValue: 4282.50,
            pnl: 75.00,
            pnlPercent: 1.78
          },
          {
            id: 3,
            team: 'Royal Challengers Bangalore',
            shortName: 'RCB',
            logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
            quantity: 40,
            avgPrice: 95.75,
            currentPrice: 98.25,
            invested: 3830.00,
            currentValue: 3930.00,
            pnl: 100.00,
            pnlPercent: 2.61
          }
        ],
        transactions: [
          {
            id: 1,
            type: 'buy',
            team: 'Mumbai Indians',
            quantity: 10,
            price: 125.50,
            amount: 1255.00,
            date: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'completed'
          },
          {
            id: 2,
            type: 'sell',
            team: 'Chennai Super Kings',
            quantity: 5,
            price: 142.75,
            amount: 713.75,
            date: new Date(Date.now() - 4 * 60 * 60 * 1000),
            status: 'completed'
          },
          {
            id: 3,
            type: 'buy',
            team: 'Royal Challengers Bangalore',
            quantity: 15,
            price: 98.25,
            amount: 1473.75,
            date: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: 'completed'
          }
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading portfolio..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#000] font-raleway py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-[#fff] font-raleway">
                Portfolio
              </h1>
              <p className="mt-2 text-gray-600 dark:text-[#fff] font-raleway">
                Track your investments and performance
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-[#000] border border-gray-300 dark:border-[#fff] rounded-lg text-black dark:text-[#fff] font-bold font-raleway hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-black dark:bg-[#fff] text-white dark:text-[#000] rounded-lg font-bold font-raleway hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-[#000] rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-[#fff] font-raleway">Total Value</p>
                <p className="text-2xl font-bold text-black dark:text-[#fff] font-raleway">
                  {formatCurrency(portfolioData.summary.totalValue)}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1 font-raleway">
                  {portfolioData.summary.totalHoldings} holdings
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-[#000] rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-[#fff] font-raleway">Total Invested</p>
                <p className="text-2xl font-bold text-black dark:text-[#fff] font-raleway">
                  {formatCurrency(portfolioData.summary.totalInvested)}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1 font-raleway">
                  Principal amount
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-[#000] rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-[#fff] font-raleway">Total P&L</p>
                <p className={`text-2xl font-bold font-raleway ${portfolioData.summary.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {portfolioData.summary.totalPnL >= 0 ? '+' : ''}{formatCurrency(portfolioData.summary.totalPnL)}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1 font-raleway">
                  {((portfolioData.summary.totalPnL / portfolioData.summary.totalInvested) * 100).toFixed(2)}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${portfolioData.summary.totalPnL >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                {portfolioData.summary.totalPnL >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-[#008F75] dark:text-[#008F75]" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-[#000] rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-[#fff] font-raleway">Today's P&L</p>
                <p className={`text-2xl font-bold font-raleway ${portfolioData.summary.todaysPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {portfolioData.summary.todaysPnL >= 0 ? '+' : ''}{formatCurrency(portfolioData.summary.todaysPnL)}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1 font-raleway">
                  Today's change
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200 dark:border-[#fff]">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'holdings'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTab('holdings')}
              >
                Holdings
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'transactions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTab('transactions')}
              >
                Transactions
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {selectedTab === 'holdings' && (
            <div className="bg-white dark:bg-[#000] rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-[#fff]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black dark:text-[#fff] font-raleway">
                    Current Holdings
                  </h3>
                  <button className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-[#000] text-black dark:text-[#fff] rounded-lg text-sm font-bold font-raleway hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors">
                    <Filter className="w-4 h-4 mr-1" />
                    Filter
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-[#fff] font-raleway">
                  <thead className="bg-gray-50 dark:bg-[#000]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Avg Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Current Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        P&L
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#000] divide-y divide-gray-200 dark:divide-[#fff]">
                    {portfolioData.holdings.map((holding) => (
                      <tr key={holding.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={holding.logo}
                              alt={holding.team}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {holding.team}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {holding.shortName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {holding.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(holding.avgPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(holding.currentPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(holding.currentValue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${holding.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                          </div>
                          <div className={`text-xs ${holding.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            ({holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%)
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'transactions' && (
            <div className="bg-white dark:bg-[#000] rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-[#fff]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black dark:text-[#fff] font-raleway">
                    Transaction History
                  </h3>
                  <select
                    className="px-3 py-1 bg-gray-100 dark:bg-[#000] text-black dark:text-[#fff] rounded-lg text-sm font-raleway border-0 focus:ring-2 focus:ring-black dark:focus:ring-[#fff]"
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-[#fff] font-raleway">
                  <thead className="bg-gray-50 dark:bg-[#000]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#000] divide-y divide-gray-200 dark:divide-[#fff]">
                    {portfolioData.transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDateTime(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'buy'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {transaction.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {transaction.team}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {transaction.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(transaction.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {transaction.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioPage;