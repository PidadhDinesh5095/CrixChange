import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Target,
  Activity,
  DollarSign
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AnalyticsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    performance: {
      totalReturn: 0,
      totalReturnPercent: 0,
      bestPerformer: null,
      worstPerformer: null,
      winRate: 0,
      avgHoldingPeriod: 0
    },
    chartData: [],
    topGainers: [],
    topLosers: [],
    tradingStats: {
      totalTrades: 0,
      successfulTrades: 0,
      avgTradeSize: 0,
      totalVolume: 0
    }
  });
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [selectedMetric, setSelectedMetric] = useState('portfolio');

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setAnalyticsData({
        performance: {
          totalReturn: 7500,
          totalReturnPercent: 15.2,
          bestPerformer: { team: 'Gujarat Titans', return: 25.8 },
          worstPerformer: { team: 'Kolkata Knight Riders', return: -8.3 },
          winRate: 68.5,
          avgHoldingPeriod: 12
        },
        chartData: [
          { date: '2024-01-01', portfolio: 50000, benchmark: 50000 },
          { date: '2024-01-15', portfolio: 52000, benchmark: 51000 },
          { date: '2024-02-01', portfolio: 48000, benchmark: 49500 },
          { date: '2024-02-15', portfolio: 55000, benchmark: 52000 },
          { date: '2024-03-01', portfolio: 57500, benchmark: 53500 }
        ],
        topGainers: [
          { team: 'Gujarat Titans', change: 25.8, price: 156.75, volume: 12500 },
          { team: 'Rajasthan Royals', change: 18.3, price: 134.20, volume: 9800 },
          { team: 'Sunrisers Hyderabad', change: 12.7, price: 128.45, volume: 8600 }
        ],
        topLosers: [
          { team: 'Kolkata Knight Riders', change: -8.3, price: 118.90, volume: 7200 },
          { team: 'Punjab Kings', change: -5.7, price: 102.35, volume: 6400 },
          { team: 'Delhi Capitals', change: -3.2, price: 145.80, volume: 5900 }
        ],
        tradingStats: {
          totalTrades: 45,
          successfulTrades: 31,
          avgTradeSize: 2500,
          totalVolume: 112500
        }
      });
      setIsLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const periods = [
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' }
  ];

  const metrics = [
    { value: 'portfolio', label: 'Portfolio Value', icon: BarChart3 },
    { value: 'returns', label: 'Returns', icon: TrendingUp },
    { value: 'volume', label: 'Trading Volume', icon: Activity }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading analytics..." />
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
                Analytics
              </h1>
              <p className="mt-2 text-gray-600 dark:text-[#fff] font-raleway">
                Detailed insights into your trading performance
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <select
                className="px-3 py-2 bg-white dark:bg-[#000] border border-gray-300 dark:border-[#fff] rounded-lg text-sm font-raleway focus:ring-2 focus:ring-black dark:focus:ring-[#fff]"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
              <button className="inline-flex items-center px-4 py-2 bg-black dark:bg-[#fff] text-white dark:text-[#000] rounded-lg font-bold font-raleway hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-[#000] rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-[#fff] font-raleway">Total Return</p>
                <p className={`text-2xl font-bold font-raleway ${analyticsData.performance.totalReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analyticsData.performance.totalReturn >= 0 ? '+' : ''}{formatCurrency(analyticsData.performance.totalReturn)}
                </p>
                <p className={`text-xs mt-1 font-raleway ${analyticsData.performance.totalReturnPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analyticsData.performance.totalReturnPercent >= 0 ? '+' : ''}{analyticsData.performance.totalReturnPercent.toFixed(1)}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${analyticsData.performance.totalReturn >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                {analyticsData.performance.totalReturn >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
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
                <p className="text-sm font-medium text-gray-600 dark:text-[#fff] font-raleway">Win Rate</p>
                <p className="text-2xl font-bold text-black dark:text-[#fff] font-raleway">
                  {analyticsData.performance.winRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1 font-raleway">
                  Success ratio
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-[#fff] font-raleway">Total Trades</p>
                <p className="text-2xl font-bold text-black dark:text-[#fff] font-raleway">
                  {analyticsData.tradingStats.totalTrades}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1 font-raleway">
                  {analyticsData.tradingStats.successfulTrades} successful
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-[#fff] font-raleway">Avg Trade Size</p>
                <p className="text-2xl font-bold text-black dark:text-[#fff] font-raleway">
                  {formatCurrency(analyticsData.tradingStats.avgTradeSize)}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1 font-raleway">
                  Per transaction
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2 bg-white dark:bg-[#000] rounded-xl shadow-lg"
          >
            <div className="p-6 border-b border-gray-200 dark:border-[#fff]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black dark:text-[#fff] font-raleway">
                  Performance Chart
                </h3>
                <div className="flex items-center space-x-2">
                  {metrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                      <button
                        key={metric.value}
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold font-raleway transition-colors ${
                          selectedMetric === metric.value
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-[#fff] hover:text-black dark:hover:text-gray-300'
                        }`}
                        onClick={() => setSelectedMetric(metric.value)}
                      >
                        <Icon className="w-4 h-4 mr-1" />
                        {metric.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Placeholder for chart */}
              <div className="h-80 bg-gray-50 dark:bg-[#000] rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-[#fff] font-raleway">
                    Performance chart would be displayed here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-[#fff] mt-2 font-raleway">
                    Showing {selectedMetric} data for {selectedPeriod}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Top Performers */}
          <div className="space-y-8">
            {/* Top Gainers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white dark:bg-[#000] rounded-xl shadow-lg"
            >
              <div className="p-6 border-b border-gray-200 dark:border-[#fff]">
                <h3 className="text-lg font-semibold text-black dark:text-[#fff] font-raleway">
                  Top Gainers
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analyticsData.topGainers.map((gainer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-black dark:text-[#fff] text-sm font-raleway">
                          {gainer.team}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-[#fff] font-raleway">
                          Vol: {gainer.volume.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-black dark:text-[#fff] font-raleway">
                          ₹{gainer.price.toFixed(2)}
                        </p>
                        <p className="text-xs font-medium text-green-600 dark:text-green-400 font-raleway">
                          +{gainer.change.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Top Losers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-white dark:bg-[#000] rounded-xl shadow-lg"
            >
              <div className="p-6 border-b border-gray-200 dark:border-[#fff]">
                <h3 className="text-lg font-semibold text-black dark:text-[#fff] font-raleway">
                  Top Losers
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analyticsData.topLosers.map((loser, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-black dark:text-[#fff] text-sm font-raleway">
                          {loser.team}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-[#fff] font-raleway">
                          Vol: {loser.volume.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-black dark:text-[#fff] font-raleway">
                          ₹{loser.price.toFixed(2)}
                        </p>
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 font-raleway">
                          {loser.change.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Performance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 bg-white dark:bg-[#000] rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-black dark:text-[#fff] mb-6 font-raleway">
            Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-black dark:text-[#fff] mb-4 font-raleway">Best Performer</h4>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="font-medium text-green-800 dark:text-green-400 font-raleway">
                  {analyticsData.performance.bestPerformer?.team}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 font-raleway">
                  +{analyticsData.performance.bestPerformer?.return.toFixed(1)}% return
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-black dark:text-[#fff] mb-4 font-raleway">Worst Performer</h4>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="font-medium text-red-800 dark:text-red-400 font-raleway">
                  {analyticsData.performance.worstPerformer?.team}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 font-raleway">
                  {analyticsData.performance.worstPerformer?.return.toFixed(1)}% return
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;