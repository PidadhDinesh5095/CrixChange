import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Clock,
  Users,
  Target,
  BarChart3,
  RefreshCw,
  Activity,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const TradingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [orderType, setOrderType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [orderPrice, setOrderPrice] = useState('market');

  useEffect(() => {
    // Simulate loading matches data
    setTimeout(() => {
      const mockMatches = [
        {
          id: 1,
          title: 'Mumbai Indians vs Chennai Super Kings',
          status: 'live',
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
          teams: [
            {
              id: 'mi',
              name: 'Mumbai Indians',
              shortName: 'MI',
              logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
              currentPrice: 125.50,
              change: 2.5,
              changePercent: 2.03,
              volume: 15420,
              dayHigh: 128.75,
              dayLow: 122.30
            },
            {
              id: 'csk',
              name: 'Chennai Super Kings',
              shortName: 'CSK',
              logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
              currentPrice: 142.75,
              change: -1.8,
              changePercent: -1.24,
              volume: 18750,
              dayHigh: 145.20,
              dayLow: 140.50
            }
          ]
        },
        {
          id: 2,
          title: 'Royal Challengers Bangalore vs Delhi Capitals',
          status: 'upcoming',
          startTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
          teams: [
            {
              id: 'rcb',
              name: 'Royal Challengers Bangalore',
              shortName: 'RCB',
              logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
              currentPrice: 98.25,
              change: 5.2,
              changePercent: 5.59,
              volume: 12300,
              dayHigh: 102.80,
              dayLow: 95.40
            },
            {
              id: 'dc',
              name: 'Delhi Capitals',
              shortName: 'DC',
              logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
              currentPrice: 118.90,
              change: -3.1,
              changePercent: -2.54,
              volume: 9850,
              dayHigh: 122.45,
              dayLow: 116.80
            }
          ]
        }
      ];
      setMatches(mockMatches);
      setSelectedMatch(mockMatches[0]);
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

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      live: { color: 'bg-black text-white dark:bg-white dark:text-black', icon: Play, text: 'LIVE' },
      upcoming: { color: 'bg-gray-400 text-white dark:bg-gray-600 dark:text-white', icon: Clock, text: 'UPCOMING' },
      completed: { color: 'bg-gray-300 text-black dark:bg-gray-700 dark:text-white', icon: Target, text: 'COMPLETED' }
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

  const handlePlaceOrder = () => {
    if (!selectedTeam || !quantity) {
      return;
    }
    
    // Simulate order placement
    console.log('Placing order:', {
      team: selectedTeam,
      type: orderType,
      quantity: parseInt(quantity),
      price: orderPrice
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="LOADING MARKETS..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans  bg-white dark:bg-[#000] py-8">
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
                LIVE TRADING
              </h1>
              <p className="mt-2 text-gray-600 dark:text-[#fff] font-mono">
                Professional trading terminal • Real-time execution
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-black dark:bg-[#fff] rounded-full">
                <div className="w-2 h-2 bg-white dark:bg-[#000] rounded-full animate-pulse"></div>
                <span className="text-white dark:text-[#000] text-xs font-bold font-mono">MARKET OPEN</span>
              </div>
              <button className="inline-flex items-center px-4 py-2 bg-black dark:bg-[#fff] hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-[#000] rounded-lg font-bold transition-colors">
                <RefreshCw className="w-4 h-4 mr-2" />
                REFRESH
              </button>
            </div>
          </div>
        </motion.div>

        {/* Match Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className={`bg-gray-50 dark:bg-[#000] border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedMatch?.id === match.id 
                    ? 'border-black dark:border-[#fff]' 
                    : 'border-gray-200 dark:border-[#fff] hover:border-gray-400 dark:hover:border-gray-600'
                }`}
                onClick={() => setSelectedMatch(match)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black dark:text-[#fff]">
                    {match.title}
                  </h3>
                  {getStatusBadge(match.status)}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-[#fff] font-mono">
                  <span>START: {formatTime(match.startTime)}</span>
                  <span className="flex items-center">
                    <Activity className="w-4 h-4 mr-1" />
                    {match.teams.reduce((sum, team) => sum + team.volume, 0).toLocaleString()} VOL
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {selectedMatch && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Team Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {selectedMatch.teams.map((team) => (
                <div
                  key={team.id}
                  className={`bg-gray-50 dark:bg-[#000] border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedTeam?.id === team.id 
                      ? 'border-black dark:border-[#fff]' 
                      : 'border-gray-200 dark:border-[#fff] hover:border-gray-400 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedTeam(team)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-black dark:bg-[#fff] rounded-full flex items-center justify-center">
                        <span className="text-white dark:text-[#000] font-bold">
                          {team.shortName}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-black dark:text-[#fff]">
                          {team.name}
                        </h3>
                        <p className="text-gray-600 dark:text-[#fff] font-mono">{team.shortName}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Link
                        to={`/match-performance/${selectedMatch.id}`}
                        className="inline-flex items-center px-3 py-2 bg-white dark:bg-[#000] text-black dark:text-[#fff] font-medium rounded border border-black dark:border-[#fff] hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-xs font-bold"
                        style={{ minWidth: 0 }}
                        onClick={e => e.stopPropagation()}
                      >
                        VIEW PERFORMANCE
                        <BarChart3 className="ml-2 w-4 h-4" />
                      </Link>
                      <p className="text-3xl font-bold text-black dark:text-[#fff] font-mono">
                        ₹{team.currentPrice.toFixed(2)}
                      </p>
                      <div className={`flex items-center justify-end ${
                        team.change >= 0 ? 'text-black dark:text-[#fff]' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {team.change >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1 text-[#008F75]" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        <span className="font-bold font-mono">
                          {team.change >= 0 ? '+' : ''}{team.change.toFixed(2)} ({team.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#fff]">
                    <div className="grid grid-cols-3 gap-4 text-sm font-mono">
                      <div className="text-center">
                        <span className="text-gray-600 dark:text-[#fff] block">HIGH</span>
                        <span className="font-bold text-black dark:text-[#fff]">₹{team.dayHigh.toFixed(2)}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-600 dark:text-[#fff] block">LOW</span>
                        <span className="font-bold text-black dark:text-[#fff]">₹{team.dayLow.toFixed(2)}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-600 dark:text-[#fff] block">VOLUME</span>
                        <span className="font-bold text-black dark:text-[#fff]">{team.volume.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Trading Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-black dark:bg-[#fff] rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-white dark:text-[#000] mb-6 uppercase tracking-wide font-mono">
                ORDER TERMINAL
              </h3>

              {selectedTeam ? (
                <div className="space-y-6">
                  {/* Selected Team */}
                  <div className="bg-gray-900 dark:bg-[#000] rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white dark:bg-[#000] rounded-full flex items-center justify-center">
                        <span className="text-black dark:text-[#fff] font-bold text-sm">
                          {selectedTeam.shortName}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-white dark:text-[#fff]">
                          {selectedTeam.shortName}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-[#fff] font-mono">
                          ₹{selectedTeam.currentPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Type */}
                  <div>
                    <label className="block text-sm font-bold text-white dark:text-[#000] mb-2 uppercase tracking-wide">
                      ORDER TYPE
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className={`py-3 px-4 rounded-lg font-bold transition-colors ${
                          orderType === 'buy'
                            ? 'bg-white dark:bg-[#000] text-black dark:text-[#fff]'
                            : 'bg-gray-800 dark:bg-gray-200 text-white dark:text-black hover:bg-gray-700 dark:hover:bg-gray-300'
                        }`}
                        onClick={() => setOrderType('buy')}
                      >
                        BUY
                      </button>
                      <button
                        className={`py-3 px-4 rounded-lg font-bold transition-colors ${
                          orderType === 'sell'
                            ? 'bg-white dark:bg-[#000] text-black dark:text-[#fff]'
                            : 'bg-gray-800 dark:bg-gray-200 text-white dark:text-black hover:bg-gray-700 dark:hover:bg-gray-300'
                        }`}
                        onClick={() => setOrderType('sell')}
                      >
                        SELL
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-bold text-white dark:text-[#000] mb-2 uppercase tracking-wide">
                      QUANTITY
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-gray-800 dark:bg-[#fff] text-white dark:text-[#000] rounded-lg font-mono focus:ring-2 focus:ring-white dark:focus:ring-[#000]"
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>

                  {/* Price Type */}
                  <div>
                    <label className="block text-sm font-bold text-white dark:text-[#000] mb-2 uppercase tracking-wide">
                      PRICE TYPE
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-800 dark:bg-[#fff] text-white dark:text-[#000] rounded-lg font-mono focus:ring-2 focus:ring-white dark:focus:ring-[#000]"
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(e.target.value)}
                    >
                      <option value="market">MARKET PRICE</option>
                      <option value="limit">LIMIT ORDER</option>
                    </select>
                  </div>

                  {/* Order Summary */}
                  {quantity && (
                    <div className="bg-gray-900 dark:bg-[#000] rounded-lg p-4">
                      <h4 className="font-bold text-white dark:text-[#fff] mb-3 uppercase tracking-wide font-mono">ORDER SUMMARY</h4>
                      <div className="space-y-2 text-sm font-mono">
                        <div className="flex justify-between">
                          <span className="text-gray-400 dark:text-[#fff]">QUANTITY:</span>
                          <span className="text-white dark:text-[#fff] font-bold">{quantity} SHARES</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 dark:text-[#fff]">PRICE:</span>
                          <span className="text-white dark:text-[#fff] font-bold">
                            ₹{selectedTeam.currentPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-gray-700 dark:border-gray-300 pt-2">
                          <span className="text-white dark:text-[#fff]">TOTAL:</span>
                          <span className="text-white dark:text-[#fff]">
                            ₹{(selectedTeam.currentPrice * parseInt(quantity || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Place Order Button */}
                  <button
                    className={`w-full py-4 px-4 rounded-lg font-bold transition-colors ${
                      orderType === 'buy'
                        ? 'bg-white dark:bg-[#000] text-black dark:text-[#fff] hover:bg-gray-200 dark:hover:bg-gray-800'
                        : 'bg-gray-600 dark:bg-gray-400 text-white dark:text-black hover:bg-gray-500 dark:hover:bg-gray-300'
                    } ${!quantity ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handlePlaceOrder}
                    disabled={!quantity}
                  >
                    {orderType === 'buy' ? 'EXECUTE BUY ORDER' : 'EXECUTE SELL ORDER'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 dark:text-gray-600 font-mono uppercase tracking-wide">
                    SELECT TEAM TO TRADE
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Market Data Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-black dark:bg-[#fff] rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white dark:text-[#000] mb-6 uppercase tracking-wide font-mono">
            MARKET DATA FEED
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white dark:text-[#000] font-mono">₹15.7Cr</p>
              <p className="text-sm text-gray-400 dark:text-gray-600 font-mono uppercase">DAILY VOLUME</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white dark:text-[#000] font-mono">1,250</p>
              <p className="text-sm text-gray-400 dark:text-gray-600 font-mono uppercase">ACTIVE ORDERS</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white dark:text-[#000] font-mono">+2.3%</p>
              <p className="text-sm text-gray-400 dark:text-gray-600 font-mono uppercase">MARKET CHANGE</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white dark:text-[#000] font-mono">0.8ms</p>
              <p className="text-sm text-gray-400 dark:text-gray-600 font-mono uppercase">LATENCY</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TradingPage;