import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Trophy, 
  BarChart3,
  Plus,
  Minus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  DollarSign
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    wallet: {
      balance: 0,
      frozenBalance: 0,
      totalInvested: 0,
      totalPnL: 0
    },
    portfolio: {
      totalValue: 0,
      todaysPnL: 0,
      totalHoldings: 0
    },
    recentTrades: [],
    topPerformers: [],
    notifications: []
  });

  useEffect(() => {
    // Simulate loading dashboard data
    setTimeout(() => {
      setDashboardData({
        wallet: {
          balance: 250000,
          frozenBalance: 50000,
          totalInvested: 500000,
          totalPnL: 75000
        },
        portfolio: {
          totalValue: 575000,
          todaysPnL: 12500,
          totalHoldings: 8
        },
        recentTrades: [
          {
            id: 1,
            team: 'Mumbai Indians',
            type: 'buy',
            quantity: 100,
            price: 125.50,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: 2,
            team: 'Chennai Super Kings',
            type: 'sell',
            quantity: 50,
            price: 142.75,
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          {
            id: 3,
            team: 'Royal Challengers Bangalore',
            type: 'buy',
            quantity: 150,
            price: 98.25,
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
          }
        ],
        topPerformers: [
          { team: 'Gujarat Titans', change: 12.5, price: 156.75 },
          { team: 'Rajasthan Royals', change: 8.3, price: 134.20 },
          { team: 'Delhi Capitals', change: -5.2, price: 118.90 }
        ],
        notifications: [
          {
            id: 1,
            type: 'success',
            message: 'KYC verification approved - Trading enabled',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
          },
          {
            id: 2,
            type: 'info',
            message: 'MI vs CSK match starting in 2 hours',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
          },
          {
            id: 3,
            type: 'warning',
            message: 'Portfolio exposure exceeds 80% - Consider diversification',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
          }
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const getKYCStatusBadge = () => {
    const status = user?.kycStatus || 'approved'; // Demo: show as approved
    const statusConfig = {
      pending: { color: 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white', icon: Clock, text: 'PENDING' },
      submitted: { color: 'bg-gray-400 text-white dark:bg-gray-600 dark:text-white', icon: Clock, text: 'REVIEW' },
      approved: { color: 'bg-black text-white dark:bg-white dark:text-black', icon: CheckCircle, text: 'VERIFIED' },
      rejected: { color: 'bg-gray-600 text-white dark:bg-gray-400 dark:text-black', icon: AlertCircle, text: 'REJECTED' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="LOADING DASHBOARD..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#000] py-8 font-sans">
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
              <h1 className="text-4xl font-bold text-black dark:text-[#fff] tracking-tight">
                TRADING DASHBOARD
              </h1>
              <p className="mt-2 text-gray-600 dark:text-[#fff] font-mono">
                Professional trading interface • Real-time market data
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              {getKYCStatusBadge()}
              <button className="bg-black dark:bg-[#fff] hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-[#000] px-6 py-2 rounded-lg font-bold transition-colors">
                LIVE TRADING
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-50 dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 dark:text-[#fff] uppercase tracking-wide">WALLET BALANCE</p>
                <p className="text-3xl font-bold text-black dark:text-[#fff] font-mono">
                  {formatCurrency(dashboardData.wallet.balance)}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1 font-mono">
                  FROZEN: {formatCurrency(dashboardData.wallet.frozenBalance)}
                </p>
              </div>
              <div className="w-12 h-12 bg-black dark:bg-[#fff] rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white dark:text-[#000]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-50 dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 dark:text-[#fff] uppercase tracking-wide">PORTFOLIO VALUE</p>
                <p className="text-3xl font-bold text-black dark:text-[#fff] font-mono">
                  {formatCurrency(dashboardData.portfolio.totalValue)}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1 font-mono">
                  {dashboardData.portfolio.totalHoldings} POSITIONS
                </p>
              </div>
              <div className="w-12 h-12 bg-black dark:bg-[#fff] rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white dark:text-[#000]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-50 dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 dark:text-[#fff] uppercase tracking-wide">TODAY'S P&L</p>
                <p className={`text-3xl font-bold font-mono ${dashboardData.portfolio.todaysPnL >= 0 ? 'text-black dark:text-[#fff]' : 'text-gray-600 dark:text-gray-400'}`}>
                  {dashboardData.portfolio.todaysPnL >= 0 ? '+' : ''}{formatCurrency(dashboardData.portfolio.todaysPnL)}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1 font-mono">
                  {((dashboardData.portfolio.todaysPnL / dashboardData.wallet.totalInvested) * 100).toFixed(2)}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${dashboardData.portfolio.todaysPnL >= 0 ? 'bg-black dark:bg-[#fff]' : 'bg-gray-400 dark:bg-gray-600'}`}>
                {dashboardData.portfolio.todaysPnL >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-white dark:text-[#000]" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-white dark:text-[#000]" />
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-50 dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 dark:text-[#fff] uppercase tracking-wide">TOTAL P&L</p>
                <p className={`text-3xl font-bold font-mono ${dashboardData.wallet.totalPnL >= 0 ? 'text-black dark:text-[#fff]' : 'text-gray-600 dark:text-gray-400'}`}>
                  {dashboardData.wallet.totalPnL >= 0 ? '+' : ''}{formatCurrency(dashboardData.wallet.totalPnL)}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1 font-mono">
                  ALL TIME
                </p>
              </div>
              <div className="w-12 h-12 bg-black dark:bg-[#fff] rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white dark:text-[#000]" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Trades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2 bg-gray-50 dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-xl"
          >
            <div className="p-6 border-b border-gray-200 dark:border-[#fff]">
              <h3 className="text-lg font-bold text-black dark:text-[#fff] uppercase tracking-wide">RECENT TRADES</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${trade.type === 'buy' ? 'bg-black dark:bg-[#fff]' : 'bg-gray-400 dark:bg-gray-600'}`}>
                        {trade.type === 'buy' ? (
                          <Plus className="w-5 h-5 text-white dark:text-[#000]" />
                        ) : (
                          <Minus className="w-5 h-5 text-white dark:text-[#000]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-black dark:text-[#fff]">{trade.team}</p>
                        <p className="text-sm text-gray-600 dark:text-[#fff] font-mono">
                          {trade.type.toUpperCase()} {trade.quantity} SHARES
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-black dark:text-[#fff] font-mono">
                        ₹{trade.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-[#fff] font-mono">
                        {formatTime(trade.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="w-full text-center text-black dark:text-[#fff] hover:text-gray-600 dark:hover:text-gray-400 font-bold uppercase tracking-wide">
                  VIEW ALL TRADES
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Top Performers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gray-50 dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-xl"
            >
              <div className="p-6 border-b border-gray-200 dark:border-[#fff]">
                <h3 className="text-lg font-bold text-black dark:text-[#fff] uppercase tracking-wide">TOP MOVERS</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-black dark:text-[#fff] text-sm">
                          {performer.team}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-[#fff] font-mono">
                          ₹{performer.price.toFixed(2)}
                        </p>
                      </div>
                      <div className={`text-right ${performer.change >= 0 ? 'text-black dark:text-[#fff]' : 'text-gray-600 dark:text-gray-400'}`}>
                        <p className="font-bold text-sm font-mono">
                          {performer.change >= 0 ? '+' : ''}{performer.change.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-gray-50 dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-xl"
            >
              <div className="p-6 border-b border-gray-200 dark:border-[#fff]">
                <h3 className="text-lg font-bold text-black dark:text-[#fff] uppercase tracking-wide">ALERTS</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.notifications.map((notification) => {
                    const getIcon = () => {
                      switch (notification.type) {
                        case 'success': return CheckCircle;
                        case 'warning': return AlertCircle;
                        case 'info': return Eye;
                        default: return AlertCircle;
                      }
                    };
                    const Icon = getIcon();

                    return (
                      <div key={notification.id} className="flex items-start space-x-3">
                        <Icon className="w-5 h-5 mt-0.5 text-black dark:text-[#fff]" />
                        <div className="flex-1">
                          <p className="text-sm text-black dark:text-[#fff] font-mono">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-[#fff] mt-1 font-mono">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Market Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 bg-black dark:bg-[#fff] rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white dark:text-[#000] mb-6 uppercase tracking-wide font-mono">
            MARKET OVERVIEW
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white dark:text-[#000] font-mono">₹15.7Cr</p>
              <p className="text-sm text-gray-400 dark:text-gray-600 font-mono">DAILY VOLUME</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white dark:text-[#000] font-mono">1,250</p>
              <p className="text-sm text-gray-400 dark:text-gray-600 font-mono">ACTIVE TRADES</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white dark:text-[#000] font-mono">+2.3%</p>
              <p className="text-sm text-gray-400 dark:text-gray-600 font-mono">MARKET CHANGE</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white dark:text-[#000] font-mono">8</p>
              <p className="text-sm text-gray-400 dark:text-gray-600 font-mono">LIVE MATCHES</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;