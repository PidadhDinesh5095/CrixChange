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
const TEAM_LOGOS = {
  MI:  'https://www.iplcricketmatch.com/wp-content/uploads/2024/02/Mumbai-Indians.jpg',
  CSK: 'https://static.wixstatic.com/media/0293d4_0be320985f284973a119aaada3d6933f~mv2.jpg/v1/fill/w_980,h_680,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/0293d4_0be320985f284973a119aaada3d6933f~mv2.jpg',
  RCB: 'https://play-lh.googleusercontent.com/iCU8yMySowwEjcyg0UHTrT-DIJrL47xsKg5g4BNTFsKWy6NIncwprtG-vLQrMSlgwg=w240-h480-rw',
  DC:  'https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/Delhi_Capitals.svg/1200px-Delhi_Capitals.svg.png',
  GT:  'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Gujarat_Titans_Logo.svg/1200px-Gujarat_Titans_Logo.svg.png',
  RR:  'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/This_is_the_logo_for_Rajasthan_Royals%2C_a_cricket_team_playing_in_the_Indian_Premier_League_%28IPL%29.svg/1200px-This_is_the_logo_for_Rajasthan_Royals%2C_a_cricket_team_playing_in_the_Indian_Premier_League_%28IPL%29.svg.png',
  KKR: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXcfuDMriEVXJeJ8tnDwmCBUcJ2vNcd14MAg&s',
  PBKS:'data:image/jpeg;base64,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',
  SRH: 'data:image/jpeg;base64,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',
  LSG: 'https://upload.wikimedia.org/wikipedia/en/a/a9/Lucknow_Super_Giants_IPL_Logo.svg'
};

const MatchPerformancePage = () => {
  const { matchId } = useParams();
  const chartRef = useRef(null);
  const [matchData, setMatchData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('balls');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading match performance data
    setTimeout(() => {
      const now = new Date();
      // Generate price data for 20 overs (120 balls)
      const generatePriceData = (basePrice, volatility = 0.02) => {
        const data = [];
        for (let i = 0; i < 120; i++) {
          // Ball label: over.ball (e.g., 1.1, 1.2, ..., 20.6)
          const over = Math.floor(i / 6) + 1;
          const ball = (i % 6) + 1;
          const label = `${over}.${ball}`;
          const randomChange = (Math.random() - 0.5) * volatility * basePrice;
          const price = basePrice + randomChange + (Math.sin(i / 10) * volatility * basePrice);
          data.push({
            ball: label,
            price: Math.max(price, basePrice * 0.9)
          });
        }
        return data;
      };

      setMatchData({
        id: matchId,
        title: 'Chennai Super Kings vs Royal Challengers Bangalore',
        status: 'LIVE',
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        teams: [
          {
            id: 'csk',
            name: 'Chennai Super Kings',
            shortName: 'CSK',
            logo: TEAM_LOGOS.CSK,
            currentPrice: 138.60,
            openPrice: 137.00,
            dayHigh: 140.50,
            dayLow: 136.20,
            change: 1.60,
            changePercent: 1.17,
            volume: 16200,
            marketCap: 13860000,
            priceData: generatePriceData(138.60, 0.03)
          },
          {
            id: 'rcb',
            name: 'Royal Challengers Bangalore',
            shortName: 'RCB',
            logo: TEAM_LOGOS.RCB,
            currentPrice: 132.10,
            openPrice: 133.50,
            dayHigh: 134.80,
            dayLow: 131.00,
            change: -1.40,
            changePercent: -1.05,
            volume: 15400,
            marketCap: 13210000,
            priceData: generatePriceData(132.10, 0.025)
          }
        ],
        matchEvents: [
          { time: '18:45', event: 'Match Started', impact: 'neutral' },
          { time: '19:15', event: 'CSK: First Wicket', impact: 'negative' },
          { time: '19:32', event: 'CSK: Boundary', impact: 'positive' },
          { time: '19:48', event: 'RCB: Powerplay', impact: 'positive' },
          { time: '20:05', event: 'CSK: Catch Dropped', impact: 'negative' }
        ],
        orderBook: {
          bids: [
            { price: 134.15, quantity: 150, total: 150 },
            { price: 134.10, quantity: 200, total: 350 },
            { price: 134.05, quantity: 180, total: 530 },
            { price: 134.00, quantity: 220, total: 750 },
            { price: 133.95, quantity: 300, total: 1050 }
          ],
          asks: [
            { price: 134.25, quantity: 120, total: 120 },
            { price: 134.30, quantity: 180, total: 300 },
            { price: 134.35, quantity: 160, total: 460 },
            { price: 134.40, quantity: 240, total: 700 },
            { price: 134.45, quantity: 280, total: 980 }
          ]
        }
      });
      setIsLoading(false);
    }, 1000);
  }, [matchId]);

  // Add filtering logic for chart data
  const filterChartData = (priceData) => {
    if (selectedTimeframe === 'balls') {
      return priceData;
    }
    if (selectedTimeframe === 'over') {
      // Show only last ball of each over (6th ball: .6)
      return priceData.filter(d => d.ball.endsWith('.6'));
    }
    if (selectedTimeframe === '5overs') {
      // Show only last ball of every 5th over (5.6, 10.6, 15.6, 20.6)
      return priceData.filter(d => {
        const [over, ball] = d.ball.split('.').map(Number);
        return ball === 6 && over % 5 === 0;
      });
    }
    return priceData;
  };

  const timeframes = [
    { value: 'balls', label: 'Balls' },
    { value: 'over', label: 'Over' },
    { value: '5overs', label: '5 Overs' }
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

  // IPL team colors (official/approximate HEX codes)
  const TEAM_COLORS = {
    MI:   { light: '#005DAA', dark: '#fff' },      // Mumbai Indians (Blue)
    CSK:  { light: '#F4D03F', dark: '#fff' },      // Chennai Super Kings (Yellow)
    RCB:  { light: '#D1001F', dark: '#fff' },      // Royal Challengers Bangalore (Red)
    DC:   { light: '#17479E', dark: '#fff' },      // Delhi Capitals (Blue)
    GT:   { light: '#1C1C1C', dark: '#fff' },      // Gujarat Titans (Dark Blue/Black)
    RR:   { light: '#EA1A85', dark: '#fff' },      // Rajasthan Royals (Pink)
    KKR:  { light: '#3A225D', dark: '#fff' },      // Kolkata Knight Riders (Purple)
    PBKS: { light: '#ED1B24', dark: '#fff' },      // Punjab Kings (Red)
    SRH:  { light: '#F26522', dark: '#fff' },      // Sunrisers Hyderabad (Orange)
    LSG:  { light: '#00ADEF', dark: '#fff' },      // Lucknow Super Giants (Light Blue)
  };

  const getTeamColor = (shortName) => {
    const isDark = document.documentElement.classList.contains('dark');
    const colorObj = TEAM_COLORS[shortName] || { light: '#000', dark: '#fff' };
    return isDark ? colorObj.dark : colorObj.light;
  };

  const getChartData = (team) => {
    if (!team?.priceData) return null;
    const filtered = filterChartData(team.priceData);
    const color = getTeamColor(team.shortName);
    return {
      labels: filtered.map(d => d.ball),
      datasets: [
        {
          label: team.shortName,
          data: filtered.map(d => d.price),
          borderColor: color,
          backgroundColor: color + '22', // transparent fill
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
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
        type: 'category',
        title: {
          display: true,
          text: 'Ball (Over.Ball)'
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
          },
          callback: function(value, index, values) {
            // Show every 6th ball (start of each over) and last ball
            if (index % 6 === 0 || index === values.length - 1) {
              return this.getLabelForValue(value);
            }
            return '';
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
      <div className="min-h-screen bg-white dark:bg-[#000] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-[#fff] mx-auto mb-4"></div>
          <p className="text-black dark:text-[#fff] font-raleway">LOADING MARKET DATA...</p>
        </div>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#000] flex items-center justify-center">
        <div className="text-center">
          <p className="text-black dark:text-[#fff] font-raleway">MATCH NOT FOUND</p>
          <Link to="/trading" className="text-gray-600 dark:text-[#fff] hover:text-black dark:hover:text-[#fff] mt-4 inline-block">
            BACK TO TRADING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#000] font-raleway">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-[#000] border-b border-gray-200 dark:border-[#fff] py-4">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/trading"
                className="inline-flex items-center text-gray-600 dark:text-[#fff] hover:text-black dark:hover:text-[#fff] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                BACK TO TRADING
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-[#fff]"></div>
              <h1 className="text-xl font-bold text-black dark:text-[#fff]">
                {matchData.title}
              </h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold ${
                matchData.status === 'LIVE' 
                  ? 'bg-black text-white dark:bg-[#fff] dark:text-[#000]' 
                  : 'bg-gray-400 text-white'
              }`}>
                {matchData.status === 'LIVE' && <Play className="w-3 h-3 mr-1" />}
                {matchData.status}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 bg-black dark:bg-[#fff] hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-[#000] rounded-sm font-medium transition-colors">
                <RefreshCw className="w-4 h-4 mr-2" />
                REFRESH
              </button>
            </div>
          </div>
        </div>
      </div>

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
                  className="bg-gray-50 dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-sm p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-black dark:bg-white rounded-sm flex items-center justify-center">
                        <img src={team.logo} alt={team.shortName} className="w-full h-full  bg-white object-cover " />
                       
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-black dark:text-white flex items-center">
                          
                          {team.name}
                        </h3>
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
              className="bg-white dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-sm"
            >
              <div className="p-6 border-b border-gray-200 dark:border-[#fff]">
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
                <div className="h-auto">  
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
                      <div className="h-80 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-[#fff] rounded-sm p-4">
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
            {/* Quick Trade */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gray-50 dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-sm p-4"
            >
              <h3 className="font-bold text-black dark:text-[#fff] text-sm mb-4">QUICK TRADE</h3>
              <div className="space-y-3">
                <select className="w-full bg-white dark:bg-[#000] border border-gray-300 dark:border-[#fff] text-black dark:text-[#fff] p-2 rounded-sm text-sm">
                  <option>SELECT TEAM</option>
                  <option value="mi">Mumbai Indians</option>
                  <option value="srh">Sunrises Hyderabad</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-black dark:bg-[#fff] text-white dark:text-[#000] py-2 px-3 rounded-sm font-bold text-sm">
                    BUY
                  </button>
                  <button className="bg-gray-400 dark:bg-gray-600 text-white py-2 px-3 rounded-sm font-bold text-sm">
                    SELL
                  </button>
                </div>
                <input 
                  type="number" 
                  placeholder="QUANTITY" 
                  className="w-full bg-white dark:bg-[#000] border border-gray-300 dark:border-[#fff] text-black dark:text-[#fff] p-2 rounded-sm text-sm"
                />
                <button className="w-full bg-black dark:bg-[#fff] text-white dark:text-[#000] py-2 rounded-sm font-bold text-sm">
                  PLACE ORDER
                </button>
              </div>
            </motion.div>
            {/* Order Book */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-sm"
            >
              <div className="p-4 border-b border-gray-200 dark:border-[#fff]">
                <h3 className="font-bold text-black dark:text-[#fff] text-sm">ORDER BOOK - MI</h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-[#fff]">
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
                  <div className="py-2 border-y border-gray-200 dark:border-[#fff]">
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
              className="bg-white dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-sm"
            >
              <div className="p-4 border-b border-gray-200 dark:border-[#fff]">
                <h3 className="font-bold text-black dark:text-[#fff] text-sm">MATCH EVENTS</h3>
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
              // Swap the theme colors: black for light, white for dark
              className="bg-white dark:bg-[#000] border rounded-sm p-4"
            >
              <h3 className="font-bold text-black dark:text-[#fff] text-sm mb-4">MARKET STATS</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">TOTAL VOLUME</span>
                  <span className="text-black dark:text-[#fff] font-bold">
                    {(matchData.teams[0].volume + matchData.teams[1].volume).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">MARKET CAP</span>
                  <span className="text-black dark:text-[#fff] font-bold">
                    ₹{((matchData.teams[0].marketCap + matchData.teams[1].marketCap) / 10000000).toFixed(1)}Cr
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">SPREAD</span>
                  <span className="text-black dark:text-[#fff] font-bold">
                    ₹{Math.abs(matchData.teams[0].currentPrice - matchData.teams[1].currentPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">VOLATILITY</span>
                  <span className="text-black dark:text-[#fff] font-bold">2.4%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// IPL team logo URLs


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