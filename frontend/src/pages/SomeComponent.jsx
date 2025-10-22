import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  TrendingUp, 
  TrendingDown,
  Play,
  Clock,
  Activity,
  BarChart3,
  Volume2,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

const MatchPerformancePage = () => {
  const { matchId } = useParams();
  const chartRef = useRef(null);
  const [matchData, setMatchData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading match performance data
    setTimeout(() => {
      const now = new Date();
      const generatePriceData = (basePrice, volatility = 0.02) => {
        const data = [];
        for (let i = 60; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60000); // Every minute
          const randomChange = (Math.random() - 0.5) * volatility * basePrice;
          const price = basePrice + randomChange + (Math.sin(i / 10) * volatility * basePrice);
          data.push({
            time: time.toISOString(),
            price: Math.max(price, basePrice * 0.9) // Minimum price floor
          });
        }
        return data;
      };

      setMatchData({
        id: matchId,
        title: 'Mumbai Indians vs Chennai Super Kings',
        status: 'LIVE',
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        teams: [
          {
            id: 'mi',
            name: 'Mumbai Indians',
            shortName: 'MI',
            currentPrice: 125.50,
            openPrice: 122.75,
            dayHigh: 128.90,
            dayLow: 121.30,
            change: 2.75,
            changePercent: 2.24,
            volume: 15420,
            marketCap: 12550000,
            priceData: generatePriceData(125.50, 0.03)
          },
          {
            id: 'csk',
            name: 'Chennai Super Kings',
            shortName: 'CSK',
            currentPrice: 142.75,
            openPrice: 145.20,
            dayHigh: 146.80,
            dayLow: 140.50,
            change: -2.45,
            changePercent: -1.69,
            volume: 18750,
            marketCap: 14275000,
            priceData: generatePriceData(142.75, 0.025)
          }
        ],
        matchEvents: [
          { time: '18:45', event: 'Match Started', impact: 'neutral' },
          { time: '19:15', event: 'MI: First Wicket', impact: 'negative' },
          { time: '19:32', event: 'MI: Boundary', impact: 'positive' },
          { time: '19:48', event: 'CSK: Powerplay', impact: 'positive' },
          { time: '20:05', event: 'MI: Catch Dropped', impact: 'negative' }
        ],
        orderBook: {
          bids: [
            { price: 125.45, quantity: 150, total: 150 },
            { price: 125.40, quantity: 200, total: 350 },
            { price: 125.35, quantity: 180, total: 530 },
            { price: 125.30, quantity: 220, total: 750 },
            { price: 125.25, quantity: 300, total: 1050 }
          ],
          asks: [
            { price: 125.55, quantity: 120, total: 120 },
            { price: 125.60, quantity: 180, total: 300 },
            { price: 125.65, quantity: 160, total: 460 },
            { price: 125.70, quantity: 240, total: 700 },
            { price: 125.75, quantity: 280, total: 980 }
          ]
        }
      });
      setIsLoading(false);
    }, 1000);
  }, [matchId]);

  const timeframes = [
    { value: '5M', label: '5M' },
    { value: '15M', label: '15M' },
    { value: '1H', label: '1H' },
    { value: '4H', label: '4H' },
    { value: '1D', label: '1D' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getChartData = (team) => {
    if (!team?.priceData) return null;

    return {
      labels: team.priceData.map(d => d.time),
      datasets: [
        {
          label: team.shortName,
          data: team.priceData.map(d => d.price),
          borderColor: '#000000',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: '#000000',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#000000',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
        titleFont: {
          family: 'Raleway',
          weight: 'bold'
        },
        bodyFont: {
          family: 'Raleway'
        },
        callbacks: {
          label: function(context) {
            return `Price: ₹${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm'
          }
        },
        grid: {
          color: '#e5e7eb',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            family: 'Raleway',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: '#e5e7eb',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            family: 'Raleway',
            size: 11
          },
          callback: function(value) {
            return '₹' + value.toFixed(2);
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    elements: {
      point: {
        hoverRadius: 6
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-black dark:text-white font-raleway">LOADING MARKET DATA...</p>
        </div>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-black dark:text-white font-raleway">MATCH NOT FOUND</p>
          <Link to="/trading" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mt-4 inline-block">
            BACK TO TRADING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black font-raleway min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Team Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matchData.teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-black dark:bg-white rounded-sm flex items-center justify-center">
                        <span className="text-white dark:text-black font-bold">{team.shortName}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-black dark:text-white">{team.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{team.shortName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-black dark:text-white">
                        ₹{team.currentPrice.toFixed(2)}
                      </p>
                      <div className={`flex items-center justify-end ${
                        team.change >= 0 ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {team.change >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        <span className="font-bold">
                          {team.change >= 0 ? '+' : ''}{team.change.toFixed(2)} ({team.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <span className="text-gray-600 dark:text-gray-400 block text-xs">OPEN</span>
                      <span className="font-bold text-black dark:text-white">₹{team.openPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-600 dark:text-gray-400 block text-xs">HIGH</span>
                      <span className="font-bold text-black dark:text-white">₹{team.dayHigh.toFixed(2)}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-600 dark:text-gray-400 block text-xs">LOW</span>
                      <span className="font-bold text-black dark:text-white">₹{team.dayLow.toFixed(2)}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-600 dark:text-gray-400 block text-xs">VOL</span>
                      <span className="font-bold text-black dark:text-white">{team.volume.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Price Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-sm"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black dark:text-white">PRICE PERFORMANCE</h3>
                  <div className="flex items-center space-x-2">
                    {timeframes.map((timeframe) => (
                      <button
                        key={timeframe.value}
                        className={`px-3 py-1 rounded-sm text-sm font-medium transition-colors ${
                          selectedTimeframe === timeframe.value
                            ? 'bg-black dark:bg-white text-white dark:text-black'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedTimeframe(timeframe.value)}
                      >
                        {timeframe.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-96">
                  {matchData.teams.map((team, index) => (
                    <div key={team.id} className={`${index > 0 ? 'mt-8' : ''}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-black dark:text-white">{team.shortName} PRICE CHART</h4>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">LAST: ₹{team.currentPrice.toFixed(2)}</span>
                          <span className={team.change >= 0 ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}>
                            {team.change >= 0 ? '+' : ''}{team.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-80 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm p-4">
                        <Line
                          ref={index === 0 ? chartRef : null}
                          data={getChartData(team)}
                          options={{
                            ...chartOptions,
                            plugins: {
                              ...chartOptions.plugins,
                              title: {
                                display: false
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Book */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-sm"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-black dark:text-white text-sm">ORDER BOOK - MI</h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-800">
                    <span>PRICE</span>
                    <span className="text-right">QTY</span>
                    <span className="text-right">TOTAL</span>
                  </div>
                  
                  {/* Asks (Sell Orders) */}
                  <div className="space-y-1">
                    {matchData.orderBook.asks.slice().reverse().map((ask, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 text-xs">
                        <span className="text-gray-600 dark:text-gray-400">₹{ask.price.toFixed(2)}</span>
                        <span className="text-right text-black dark:text-white">{ask.quantity}</span>
                        <span className="text-right text-black dark:text-white">{ask.total}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Current Price */}
                  <div className="py-2 border-y border-gray-200 dark:border-gray-800">
                    <div className="text-center">
                      <span className="text-lg font-bold text-black dark:text-white">
                        ₹{matchData.teams[0].currentPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Bids (Buy Orders) */}
                  <div className="space-y-1">
                    {matchData.orderBook.bids.map((bid, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 text-xs">
                        <span className="text-black dark:text-white">₹{bid.price.toFixed(2)}</span>
                        <span className="text-right text-black dark:text-white">{bid.quantity}</span>
                        <span className="text-right text-black dark:text-white">{bid.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Match Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-sm"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-bold text-black dark:text-white text-sm">MATCH EVENTS</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {matchData.matchEvents.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        event.impact === 'positive' ? 'bg-black dark:bg-white' :
                        event.impact === 'negative' ? 'bg-gray-600 dark:bg-gray-400' :
                        'bg-gray-400 dark:bg-gray-600'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{event.time}</span>
                        </div>
                        <p className="text-sm text-black dark:text-white mt-1">{event.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Market Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-black dark:bg-white rounded-sm p-4"
            >
              <h3 className="font-bold text-white dark:text-black text-sm mb-4">MARKET STATS</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">TOTAL VOLUME</span>
                  <span className="text-white dark:text-black font-bold">
                    {(matchData.teams[0].volume + matchData.teams[1].volume).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">MARKET CAP</span>
                  <span className="text-white dark:text-black font-bold">
                    ₹{((matchData.teams[0].marketCap + matchData.teams[1].marketCap) / 10000000).toFixed(1)}Cr
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">SPREAD</span>
                  <span className="text-white dark:text-black font-bold">
                    ₹{Math.abs(matchData.teams[0].currentPrice - matchData.teams[1].currentPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">VOLATILITY</span>
                  <span className="text-white dark:text-black font-bold">2.4%</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Trade */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm p-4"
            >
              <h3 className="font-bold text-black dark:text-white text-sm mb-4">QUICK TRADE</h3>
              <div className="space-y-3">
                <select className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white p-2 rounded-sm text-sm">
                  <option>SELECT TEAM</option>
                  <option value="mi">Mumbai Indians</option>
                  <option value="csk">Chennai Super Kings</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-black dark:bg-white text-white dark:text-black py-2 px-3 rounded-sm font-bold text-sm">
                    BUY
                  </button>
                  <button className="bg-gray-400 dark:bg-gray-600 text-white py-2 px-3 rounded-sm font-bold text-sm">
                    SELL
                  </button>
                </div>
                <input 
                  type="number" 
                  placeholder="QUANTITY" 
                  className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-black dark:text-white p-2 rounded-sm text-sm"
                />
                <button className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-sm font-bold text-sm">
                  PLACE ORDER
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: '#000000',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#ffffff',
      borderWidth: 1,
      titleFont: {
        family: 'Raleway',
        weight: 'bold'
      },
      bodyFont: {
        family: 'Raleway'
      },
      callbacks: {
        label: function(context) {
          return `Price: ₹${context.parsed.y.toFixed(2)}`;
        }
      }
    }
  },
  scales: {
    x: {
      type: 'time',
      time: {
        displayFormats: {
          minute: 'HH:mm',
          hour: 'HH:mm'
        }
      },
      grid: {
        color: '#e5e7eb',
        drawBorder: false
      },
      ticks: {
        color: '#6b7280',
        font: {
          family: 'Raleway',
          size: 11
        }
      }
    },
    y: {
      grid: {
        color: '#e5e7eb',
        drawBorder: false
      },
      ticks: {
        color: '#6b7280',
        font: {
          family: 'Raleway',
          size: 11
        },
        callback: function(value) {
          return '₹' + value.toFixed(2);
        }
      }
    }
  },
  interaction: {
    mode: 'index',
    intersect: false
  },
  elements: {
    point: {
      hoverRadius: 6
    }
  }
};

export default MatchPerformancePage;