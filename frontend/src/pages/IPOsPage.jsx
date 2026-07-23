import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock3, Eye, Sparkles, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { getIPOs } from '../store/slices/ipoSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const getStatusClasses = (status) => {
  switch (status) {
    case 'OPEN':
      return 'bg-black text-white dark:bg-white dark:text-black';
    case 'UPCOMING':
      return 'bg-gray-400 text-white';
    case 'CLOSED':
      return 'bg-gray-600 text-white';
    case 'LISTED':
      return 'bg-[#008F75] text-white';
    default:
      return 'bg-gray-300 text-black';
  }
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBA';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const IPOsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ipos, isLoading, error } = useSelector((state) => state.ipo);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getIPOs());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const visibleIPOs = useMemo(() => {
    const keyword = search.toLowerCase();
    return ipos.filter((ipo) => {
      const name = `${ipo.teamName} ${ipo.symbol}`.toLowerCase();
      return name.includes(keyword);
    });
  }, [ipos, search]);

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

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="lg" text="LOADING IPOs..." />
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
                    <th className="p-3 font-bold">Total</th>
                    <th className="p-3 font-bold">Remaining</th>
                    <th className="p-3 font-bold">Sold %</th>
                    <th className="p-3 font-bold">Open</th>
                    <th className="p-3 font-bold">Close</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleIPOs.map((ipo) => {
                    const soldPercent = ((ipo.totalShares - ipo.availableShares) / ipo.totalShares) * 100;
                    console.log(ipo.totalShares - ipo.availableShares, soldPercent);
                    return (
                      <tr key={ipo._id} className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black dark:bg-white text-sm font-black text-white dark:text-black">
                              {ipo.teamLogo || ipo.symbol?.slice(0, 2) || 'IP'}
                            </div>
                            <div>
                              <div className="font-bold text-black dark:text-white">{ipo.teamName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-sans text-gray-700 dark:text-gray-300">{ipo.symbol}</td>
                        <td className="p-3 font-bold text-black dark:text-white">₹{ipo.ipoPrice}</td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">{ipo.totalShares?.toLocaleString()}</td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">{ipo.availableShares?.toLocaleString()}</td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">{soldPercent}%</td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">{formatDate(ipo.openTime)}</td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">{formatDate(ipo.closeTime)}</td>
                        <td className="p-3">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusClasses(ipo.status)}`}>{ipo.status}</span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => navigate(`/ipos/${ipo._id}`)} className="rounded-lg bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                              BUY
                            </button>
                            <button onClick={() => navigate(`/ipos/${ipo._id}`)} className="rounded-lg border border-gray-300 px-2.5 py-2 text-xs font-bold text-black dark:border-gray-700 dark:text-white">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPOsPage;
