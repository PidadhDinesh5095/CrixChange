import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { getMatches } from '../store/slices/currentMatchSlice';
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
import toast from 'react-hot-toast';
import { use } from 'react';

const HomePage = () => {
  const { isLoading, matches, selectedMatch, error } = useSelector((state) => state.currentMatch);
  const dispatch = useDispatch();
  const [liveMatches, setLiveMatches] = useState([]);

  const CACHE_KEY = "ipl_matches";
  const CACHE_TIME_KEY = "ipl_matches_time";
  const EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

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

  console.log("Current Match State:", { isLoading, matches, selectedMatch, error }); // Debug log

  // Transform matches from Redux state to liveMatches format for UI
  const transformMatches = (matchesData) => {
    return matchesData?.map((m) => ({
      id: m.id,
      title: m.match || `${m.team1} vs ${m.team2}`,
      status: m.status || 'UPCOMING',
      teams: [
        { name: m.team1, price: m.team1Price || 0, change: m.team1Change || 0, volume: m.team1Volume || 0 },
        { name: m.team2, price: m.team2Price || 0, change: m.team2Change || 0, volume: m.team2Volume || 0 }
      ],
      date: m.date,
      time: m.time,
      venue: m.venue,
      ground: m.ground,
      totalVolume: (m.team1Volume || 0) + (m.team2Volume || 0)
    })) || [];
  };

  const currentMatch = (() => {
    if (!liveMatches || liveMatches.length === 0) return null;

    if (liveMatches.length === 1) return liveMatches[0]; // ✅ no sorting needed

    return [...liveMatches].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    })[0];
  })();
  console.log("curent---",currentMatch);

  useEffect(() => {
    const loadAndSetMatches = async () => {
      // Check localStorage first
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

      if (cachedData && cachedTime) {
        const isExpired = Date.now() - Number(cachedTime) > EXPIRY_TIME;

        if (!isExpired) {
          // Use cached data
          const matchesData = JSON.parse(cachedData);
          const transformedMatches = transformMatches(matchesData);
          setLiveMatches(transformedMatches);
          console.log("Loaded matches from localStorage cache:", transformedMatches);
          return;
        }
      }

      // Fetch from API if no cache or cache expired
      try {
        const result = await dispatch(getMatches());

        if (getMatches.fulfilled.match(result)) {
          const data = result.payload;
          const matchesData = data.matches || [];
          
          // Transform and set state
          const transformedMatches = transformMatches(matchesData);
          setLiveMatches(transformedMatches);
          
          // Save to localStorage
          localStorage.setItem(CACHE_KEY, JSON.stringify(matchesData));
          localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

          console.log("Fetched and set matches from API:", transformedMatches);
        } else {
          console.error(result.payload || "Failed to fetch matches");
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    loadAndSetMatches();
  }, [dispatch]);

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

  return (
    <div className="min-h-screen bg-white dark:bg-black font-raleway">

      <section className="relative  bg-white dark:bg-black">
        <div className="max-w-8xl flex flex-row items-end justify-start mx-auto h-screen px-4 bg-[url('https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/2216/1743263092216-i')] bg-top bg-cover  sm:px-6 lg:px-8 pb-28">

          <div
            className={`pointer-events-none absolute top-0 left-0 h-full w-[100%] z-5 bg-gradient-to-r from-black to-transparent`}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center z-20 ml-16"
          >
            <div className="flex flex-col gap-6 items-center w-full">

              <div className="text-6xl md:text-[6rem] font-black text-white tracking-tighter leading-none">
                {currentMatch
                  ? (
                    <>
                      {currentMatch.teams[0].name}
                      <span className="text-orange-500 ml-1">vs</span>
                      {currentMatch.teams[1].name}
                    </>
                  )
                  : "No Match"}
              </div>

              <p className="text-xl md:text-2xl text-white mb-12 max-w-xl font-light">
                {currentMatch
                  ? currentMatch.status === "Live"
                    ? "Start trading now with high performance."
                    : `Match starts at ${currentMatch.time}`
                  : "No matches available"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {currentMatch && currentMatch.status === "Live" ? (
                <Link
                  to="/trading"
                  className="inline-flex items-center px-8 py-4 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-semibold rounded-sm transition-colors"
                >
                  START TRADING
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center px-8 py-4 bg-gray-500 text-white font-semibold rounded-sm cursor-not-allowed"
                >
                  STARTS AT {currentMatch?.time || "--"}
                </button>
              )}

              <Link
                to="/analytics"
                className="inline-flex items-center px-8 py-4 bg-white dark:bg-black text-black dark:text-white font-semibold rounded-sm border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                VIEW ANALYTICS
              </Link>
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
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-grotesque">
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
            {liveMatches.length === 0 && (
              <div className="col-span-2 text-center text-gray-500 dark:text-gray-400 py-12">No matches available.</div>
            )}
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
                <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{match.date}</span>
                  <span>{match.time}</span>
                  <span>{match.venue}</span>
                  <span>{match.ground}</span>
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
                            VOL: {team.volume?.toLocaleString?.() || team.volume}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-black dark:text-white">
                          ₹{Number(team.price).toFixed(2)}
                        </p>
                        <p className={`text-sm font-bold ${team.change >= 0
                          ? 'text-black dark:text-white'
                          : 'text-gray-600 dark:text-gray-400'
                          }`}>
                          {team.change >= 0 ? '+' : ''}{Number(team.change).toFixed(1)}%
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
      {/* Market Status 
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
      </section>*/}
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