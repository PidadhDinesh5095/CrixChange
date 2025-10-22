import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Users,
  ChevronRight,
  BarChart3,
  Activity,
  Clock,
  ArrowUpRight,
  Play,
  Building2,
  Globe,
  Award
} from 'lucide-react';

const HomePage = () => {
  // Live market ticker data
  const tickerData = [
    { team: 'MI', price: 125.50, change: 2.5 },
    { team: 'CSK', price: 142.75, change: -1.8 },
    { team: 'RCB', price: 98.25, change: 5.2 },
    { team: 'DC', price: 118.90, change: -3.1 },
    { team: 'GT', price: 156.75, change: 4.8 },
    { team: 'RR', price: 134.20, change: -2.3 },
    { team: 'KKR', price: 112.45, change: 1.7 },
    { team: 'PBKS', price: 89.60, change: -4.2 },
  ];

  const stats = [
    { value: '₹500Cr+', label: 'DAILY VOLUME', icon: BarChart3 },
    { value: '50K+', label: 'ACTIVE TRADERS', icon: Users },
    { value: '99.99%', label: 'UPTIME', icon: Shield },
    { value: '<0.1ms', label: 'LATENCY', icon: Zap }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'REAL-TIME EXECUTION',
      description: 'Sub-millisecond order execution with institutional-grade infrastructure and direct market access.',
    },
    {
      icon: Shield,
      title: 'REGULATORY COMPLIANCE',
      description: 'Full SEBI compliance with KYC/AML verification and comprehensive audit trails.',
    },
    {
      icon: Zap,
      title: 'ULTRA-LOW LATENCY',
      description: 'Co-located servers with optimized networking for professional trading performance.',
    },
    {
      icon: Building2,
      title: 'INSTITUTIONAL GRADE',
      description: 'Enterprise-level security, redundancy, and scalability for serious investors.',
    }
  ];

  const liveMatches = [
    {
      id: 1,
      title: 'Mumbai Indians vs Chennai Super Kings',
      status: 'LIVE',
      teams: [
        { name: 'MI', price: 125.50, change: 2.5, volume: 15420 },
        { name: 'CSK', price: 142.75, change: -1.8, volume: 18750 }
      ],
      totalVolume: 34170
    },
    {
      id: 2,
      title: 'Royal Challengers vs Delhi Capitals',
      status: 'UPCOMING',
      teams: [
        { name: 'RCB', price: 98.25, change: 5.2, volume: 12300 },
        { name: 'DC', price: 118.90, change: -3.1, volume: 9850 }
      ],
      totalVolume: 22150
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black font-raleway">
      {/* Live Market Ticker */}
      <div className="bg-black dark:bg-black text-white dark:text-white py-2 overflow-hidden border-b border-white dark:border-white">
        <div className="animate-ticker whitespace-nowrap">
          <span className="inline-flex items-center space-x-12 text-sm font-medium">
            {[...tickerData, ...tickerData].map((item, index) => (
              <span key={index} className="inline-flex items-center space-x-3">
                <span className="font-bold">{item.team}</span>
                <span>₹{item.price.toFixed(2)}</span>
                <span className={item.change >= 0 ? 'text-white dark:text-black' : 'text-gray-400 dark:text-gray-600'}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                </span>
              </span>
            ))}
          </span>
        </div>
      </div>
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-black">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-8xl font-black text-black dark:text-white mb-8 tracking-tighter leading-none">
              CRIXCHANGE
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-4xl mx-auto font-light">
              Professional sports securities exchange platform with institutional-grade infrastructure,
              real-time execution, and regulatory compliance.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                to="/trading"
                className="inline-flex items-center px-8 py-4 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-semibold rounded-sm transition-colors"
              >
                START TRADING
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center px-8 py-4 bg-white dark:bg-black text-black dark:text-white font-semibold rounded-sm border border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                VIEW ANALYTICS
              </Link>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-12 h-12 bg-black dark:bg-black rounded-sm flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-white dark:text-white" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 dark:text-white font-medium text-sm tracking-wide">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>
      {/* Live Trading Terminal Preview */}
      <section className="py-20 bg-white dark:bg-black border-t border-gray-200 dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 "
          >
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-4 tracking-tight">
              PROFESSIONAL TERMINAL
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
              Advanced trading interface with real-time market data and institutional-grade execution
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-black rounded-sm p-8 border border-black dark:border-white"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Market Data */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-black rounded-sm p-6 border border-black dark:border-white">
                  <h3 className="text-black dark:text-white font-bold mb-4 text-lg">LIVE MARKET DATA</h3>
                  <div className="space-y-3">
                    {[
                      { symbol: 'MI', price: '125.50', change: '+2.5', volume: '15.4K', high: '128.75', low: '122.30' },
                      { symbol: 'CSK', price: '142.75', change: '-1.8', volume: '18.7K', high: '145.20', low: '140.50' },
                      { symbol: 'RCB', price: '98.25', change: '+5.2', volume: '12.3K', high: '102.80', low: '95.40' },
                      { symbol: 'DC', price: '118.90', change: '-3.1', volume: '9.8K', high: '122.45', low: '116.80' }
                    ].map((stock, index) => (
                      <div key={index} className="grid grid-cols-6 gap-4 text-sm">
                        <span className="text-black dark:text-white font-bold">{stock.symbol}</span>
                        <span className="text-black dark:text-white">₹{stock.price}</span>
                        <span
                          className={`${stock.change.startsWith('+')
                              ? 'text-black dark:text-white'
                              : 'text-white dark:text-black'
                            }`}
                        >
                          {stock.change}%
                        </span>
                        <span className="text-black dark:text-white">{stock.volume}</span>
                        <span className="text-black dark:text-white">H:{stock.high}</span>
                        <span className="text-black dark:text-white">L:{stock.low}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Order Panel */}
              <div className="bg-white dark:bg-black rounded-sm p-6 border border-black dark:border-white">
                <h3 className="text-black dark:text-white font-bold mb-4 text-lg">ORDER TERMINAL</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-black dark:bg-white text-white dark:text-black py-3 px-4 rounded-sm font-bold text-sm">
                      BUY
                    </button>
                    <button className="bg-white dark:bg-black text-black dark:text-white py-3 px-4 rounded-sm font-bold text-sm border border-black dark:border-white">
                      SELL
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="QUANTITY"
                    className="w-full bg-white dark:bg-black text-black dark:text-white p-3 rounded-sm text-sm border border-black dark:border-white"
                  />
                  <input
                    type="text"
                    placeholder="PRICE"
                    className="w-full bg-white dark:bg-black text-black dark:text-white p-3 rounded-sm text-sm border border-black dark:border-white"
                  />
                  <button className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-sm font-bold">
                    EXECUTE ORDER
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Live Markets */}
      <section className="py-20 bg-white dark:bg-black border-t border-gray-200 dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-4 tracking-tight">
              LIVE MARKETS
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
              Real-time price discovery with institutional-grade market infrastructure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {liveMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-sm p-6 hover:shadow-card transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    {match.title}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold ${match.status === 'LIVE'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-gray-400 text-white dark:bg-gray-600 dark:text-white'
                    }`}>
                    {match.status === 'LIVE' && <Play className="w-3 h-3 mr-1" />}
                    {match.status}
                  </span>
                </div>

                <div className="space-y-4">
                  {match.teams.map((team, teamIndex) => (
                    <div key={teamIndex} className="flex items-center justify-between p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-sm">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-black dark:bg-white rounded-sm flex items-center justify-center">
                          <span className="text-white dark:text-black font-bold text-sm">{team.name}</span>
                        </div>
                        <div>
                          <p className="font-bold text-black dark:text-white">{team.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            VOL: {team.volume.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-black dark:text-white">
                          ₹{team.price.toFixed(2)}
                        </p>
                        <p className={`text-sm font-bold ${team.change >= 0
                            ? 'text-black dark:text-white'
                            : 'text-gray-600 dark:text-gray-400'
                          }`}>
                          {team.change >= 0 ? '+' : ''}{team.change.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to={`/match-performance/${match.id}`}
                  className="mt-6 w-full inline-flex items-center justify-center px-4 py-3 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold rounded-sm transition-colors"
                >
                  VIEW PERFORMANCE
                  <ArrowUpRight className="ml-2 w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-black border-t border-gray-200 dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-4 tracking-tight">
              INSTITUTIONAL FEATURES
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
              Professional trading infrastructure for serious investors
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-black border border-black dark:border-white rounded-sm p-8"
                >
                  <div className="w-12 h-12 bg-black dark:bg-white rounded-sm flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-white dark:text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-white font-light leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Market Status */}
      <section className="py-20 bg-black dark:bg-white border-t border-white dark:border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white dark:text-black mb-8 tracking-tight">
              MARKET STATUS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-white dark:text-black mb-2">OPEN</p>
                <p className="text-sm text-white dark:text-black font-medium">MARKET STATUS</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white dark:text-black mb-2">₹15.7Cr</p>
                <p className="text-sm text-white dark:text-black font-medium">DAILY VOLUME</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white dark:text-black mb-2">1,250</p>
                <p className="text-sm text-white dark:text-black font-medium">ACTIVE ORDERS</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white dark:text-black mb-2">8</p>
                <p className="text-sm text-white dark:text-black font-medium">LIVE MATCHES</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-black border-t border-gray-200 dark:border-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-4 tracking-tight">
              JOIN THE EXCHANGE
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 font-light">
              Professional sports trading platform. Zero hidden fees. Complete transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                OPEN ACCOUNT
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/trading"
                className="inline-flex items-center px-8 py-4 bg-transparent text-black dark:text-white font-bold rounded-sm border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                VIEW DEMO
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;