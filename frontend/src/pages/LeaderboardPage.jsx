import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Award,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Crown,
  Star
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const LeaderboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState({
    currentUser: null,
    topTraders: [],
    tournaments: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState('profit');

  useEffect(() => {
    // Simulate loading leaderboard data
    setTimeout(() => {
      setLeaderboardData({
        currentUser: {
          rank: 15,
          name: 'You',
          profit: 7500,
          profitPercent: 15.2,
          trades: 45,
          winRate: 68.5,
          avatar: null
        },
        topTraders: [
          {
            rank: 1,
            name: 'Rajesh Kumar',
            profit: 45000,
            profitPercent: 89.2,
            trades: 156,
            winRate: 78.5,
            avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
            badge: 'gold'
          },
          {
            rank: 2,
            name: 'Priya Sharma',
            profit: 38500,
            profitPercent: 76.8,
            trades: 134,
            winRate: 74.2,
            avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
            badge: 'silver'
          },
          {
            rank: 3,
            name: 'Arjun Patel',
            profit: 32000,
            profitPercent: 64.5,
            trades: 98,
            winRate: 71.4,
            avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
            badge: 'bronze'
          },
          {
            rank: 4,
            name: 'Sneha Gupta',
            profit: 28750,
            profitPercent: 58.3,
            trades: 87,
            winRate: 69.8,
            avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
            badge: null
          },
          {
            rank: 5,
            name: 'Vikram Singh',
            profit: 25600,
            profitPercent: 52.1,
            trades: 76,
            winRate: 67.1,
            avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
            badge: null
          },
          {
            rank: 6,
            name: 'Anita Reddy',
            profit: 23400,
            profitPercent: 47.8,
            trades: 65,
            winRate: 64.6,
            avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
            badge: null
          },
          {
            rank: 7,
            name: 'Rohit Mehta',
            profit: 21200,
            profitPercent: 43.5,
            trades: 58,
            winRate: 62.1,
            avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
            badge: null
          },
          {
            rank: 8,
            name: 'Kavya Nair',
            profit: 19800,
            profitPercent: 39.6,
            trades: 52,
            winRate: 59.6,
            avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
            badge: null
          }
        ],
        tournaments: [
          {
            id: 1,
            name: 'IPL Championship',
            status: 'active',
            participants: 2500,
            prize: 100000,
            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            userRank: 45
          },
          {
            id: 2,
            name: 'Weekly Warriors',
            status: 'active',
            participants: 850,
            prize: 25000,
            endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            userRank: 12
          },
          {
            id: 3,
            name: 'Rookie Challenge',
            status: 'upcoming',
            participants: 0,
            prize: 50000,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            userRank: null
          }
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, [selectedPeriod, selectedCategory]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'silver':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'bronze':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      default:
        return '';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'All Time' }
  ];

  const categories = [
    { value: 'profit', label: 'Total Profit' },
    { value: 'percentage', label: 'Profit %' },
    { value: 'trades', label: 'Total Trades' },
    { value: 'winrate', label: 'Win Rate' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading leaderboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gray-50 dark:bg-[#000] py-8">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-[#fff]">
                Leaderboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-[#fff]">
                Compete with top traders and win exciting prizes
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <select
                className="px-3 py-2 bg-white dark:bg-[#000] border border-gray-300 dark:border-[#fff] rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 bg-white dark:bg-[#000] border border-gray-300 dark:border-[#fff] rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 bg-white dark:bg-[#000] rounded-xl shadow-lg"
          >
            <div className="p-6 border-b border-gray-200 dark:border-[#fff]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#fff]">
                  Top Traders - {periods.find(p => p.value === selectedPeriod)?.label}
                </h3>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-[#fff]">
                    {leaderboardData.topTraders.length} traders
                  </span>
                </div>
              </div>
            </div>

            {/* Your Rank */}
            {leaderboardData.currentUser && (
              <div className="p-6 bg-blue-50 dark:bg-[#000] border-b border-gray-200 dark:border-[#fff]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 dark:bg-[#fff] rounded-full flex items-center justify-center">
                      <span className="text-white dark:text-[#000] font-bold">
                        #{leaderboardData.currentUser.rank}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-[#fff]">
                        Your Position
                      </p>
                      <p className="text-sm text-gray-600 dark:text-[#fff]">
                        {leaderboardData.currentUser.trades} trades • {leaderboardData.currentUser.winRate.toFixed(1)}% win rate
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600 dark:text-[#fff]">
                      {formatCurrency(leaderboardData.currentUser.profit)}
                    </p>
                    <p className="text-sm text-green-600 dark:text-[#fff]">
                      +{leaderboardData.currentUser.profitPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Traders List */}
            <div className="divide-y divide-gray-200 dark:divide-[#fff]">
              {leaderboardData.topTraders.map((trader) => (
                <div key={trader.rank} className="p-6 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(trader.rank)}
                      </div>
                      <div className="flex items-center space-x-3">
                        <img
                          src={trader.avatar}
                          alt={trader.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 dark:text-[#fff]">
                              {trader.name}
                            </p>
                            {trader.badge && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(trader.badge)}`}>
                                <Star className="w-3 h-3 mr-1" />
                                {trader.badge.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-[#fff]">
                            {trader.trades} trades • {trader.winRate.toFixed(1)}% win rate
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-[#fff]">
                        {formatCurrency(trader.profit)}
                      </p>
                      <p className="text-sm text-green-600 dark:text-[#fff]">
                        +{trader.profitPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tournaments & Challenges */}
          <div className="space-y-8">
            {/* Active Tournaments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-[#000] rounded-xl shadow-lg"
            >
              <div className="p-6 border-b border-gray-200 dark:border-[#fff]">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#fff]">
                  Tournaments
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {leaderboardData.tournaments.map((tournament) => (
                    <div key={tournament.id} className="border border-gray-200 dark:border-[#fff] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-[#fff]">
                          {tournament.name}
                        </h4>
                        {getStatusBadge(tournament.status)}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-[#fff]">Prize Pool:</span>
                          <span className="font-medium text-gray-900 dark:text-[#fff]">
                            {formatCurrency(tournament.prize)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-[#fff]">Participants:</span>
                          <span className="text-gray-900 dark:text-[#fff]">
                            {tournament.participants.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-[#fff]">Ends:</span>
                          <span className="text-gray-900 dark:text-[#fff]">
                            {formatDate(tournament.endDate)}
                          </span>
                        </div>
                        {tournament.userRank && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-[#fff]">Your Rank:</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              #{tournament.userRank}
                            </span>
                          </div>
                        )}
                      </div>
                      {tournament.status === 'upcoming' && (
                        <button className="w-full mt-3 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                          Join Tournament
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Achievement Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-[#000] rounded-xl shadow-lg"
            >
              <div className="p-6 border-b border-gray-200 dark:border-[#fff]">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#fff]">
                  Achievement Badges
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-yellow-50 dark:bg-[#111] rounded-lg">
                    <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-[#fff]">
                      Top 10
                    </p>
                    <p className="text-xs text-gray-600 dark:text-[#fff]">
                      This Month
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-[#111] rounded-lg">
                    <TrendingUp className="w-8 h-8 text-[#008F75] dark:text-[#008F75] mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-[#fff]">
                      Profit Maker
                    </p>
                    <p className="text-xs text-gray-600 dark:text-[#fff]">
                      10+ Wins
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-[#111] rounded-lg">
                    <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-[#fff]">
                      Active Trader
                    </p>
                    <p className="text-xs text-gray-600 dark:text-[#fff]">
                      50+ Trades
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-[#111] rounded-lg">
                    <Star className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-[#fff]">
                      Rising Star
                    </p>
                    <p className="text-xs text-gray-600 dark:text-[#fff]">
                      New Trader
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;