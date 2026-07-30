import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMarketStocks, getStats, updateStockStat } from '../store/slices/tradingSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import socket from '../hooks/socket';


const TradingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stocks, isStocksLoading, isStatsLoading, stats, error } = useSelector((state) => state.trading);
  const [search, setSearch] = useState('');


  useEffect(() => {
    if (!stocks || stocks.length === 0) {
      dispatch(getMarketStocks());
    }
  }, [dispatch, stocks]);
  useEffect(() => {
    if (!stats || stats.length === 0) {
      dispatch(getStats());
    }
  }, [dispatch, stats]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  useEffect(() => {

    if (!socket.connected) {

      socket.connect();

    }

    const handleConnect = () => {
      console.log('✅ Socket connected:', socket.id);
    };

    const handleDisconnect = (reason) => {
      console.log('❌ Socket disconnected:', reason);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('stats', (payload) => {
      dispatch(updateStockStat(payload));
    })

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.disconnect();
    };
  }, []);

  const statsById = useMemo(() => {
    const map = {};
    (stats || []).forEach((s) => {
      map[String(s.id)] = s.data;
    });
    return map;
  }, [stats]);

  const visibleStocks = useMemo(() => {
    const keyword = search.toLowerCase();
    return (stocks || [])
      .filter((stock) => {
        const name = `${stock.title} ${stock.symbol}`.toLowerCase();
        return name.includes(keyword);
      })
      .map((stock) => {
        const stat = statsById[String(stock._id)];
        return stat ? { ...stock, ...stat } : stock;
      });
  }, [stocks, search, statsById]);


  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);

  return (
    <div className="min-h-screen bg-white dark:bg-[#000] py-8 mt-10 font-sans">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team or symbol"
            className="w-full max-w-md rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111] px-4 py-3 text-sm text-black dark:text-white outline-none"
          />
        </div>

        {isStocksLoading || isStatsLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="lg" text="LOADING MARKETS..." />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111] p-1">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    <th className="p-3 font-bold">Team</th>
                    <th className="p-3 font-bold">Symbol</th>
                    <th className="p-3 font-bold">Price</th>
                    <th className="p-3 font-bold">Change</th>
                    <th className="p-3 font-bold">Change %</th>
                    <th className="p-3 font-bold">High</th>
                    <th className="p-3 font-bold">Low</th>
                    <th className="p-3 font-bold">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStocks.map((stock) => (
                    <tr
                      key={stock._id}
                      onClick={() => navigate(`/match-performance/${stock._id}`)}
                      className="cursor-pointer border-b border-gray-200 dark:border-gray-800 last:border-b-0 transition-colors hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"
                    >
                      <td className="p-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-black dark:bg-white text-xs md:text-sm font-black text-white dark:text-black overflow-hidden">
                            {stock.image ? (
                              <img
                                src={stock.image}
                                alt={stock.symbol}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              stock.symbol?.slice(0, 2) || 'ST'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-black font-sans dark:text-white">{stock.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-sans text-gray-700 dark:text-gray-300">{stock.symbol}</td>
                      <td className="p-3 font-bold text-black dark:text-white">{formatCurrency(stock.price)}</td>
                      <td className={`p-3 font-bold ${stock.change >= 0 ? 'text-[#008F75]' : 'text-red-500'}`}>
                        {stock.change >= 0 ? '+' : ''}
                        {stock.change?.toFixed(2)}
                      </td>
                      <td className={`p-3 font-bold ${stock.changePercent >= 0 ? 'text-[#008F75]' : 'text-red-500'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}
                        {stock.changePercent?.toFixed(2)}%
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{formatCurrency(stock.high)}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{formatCurrency(stock.low)}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{stock.volume?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingPage;