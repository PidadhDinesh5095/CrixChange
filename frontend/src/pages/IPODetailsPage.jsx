import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock3, Wallet, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { buyIPO, clearError, getIPOById } from '../store/slices/ipoSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { use } from 'react';
import {getWalletBalance} from '../store/slices/walletSlice';

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

const IPODetailsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedIPO, isLoading, isBuying, error } = useSelector((state) => state.ipo);
  const { balance } = useSelector((state) => state.wallet);
  const [quantity, setQuantity] = useState(1);
useEffect(() => {
    if(balance===0){
        dispatch(getWalletBalance());
    }
  }, [dispatch, balance]);

  useEffect(() => {
    dispatch(getIPOById(id));
    return () => dispatch(clearError());
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const totalAmount = useMemo(() => (selectedIPO?.ipoPrice || 0) * quantity, [selectedIPO, quantity]);
  const canBuy = Boolean(selectedIPO && selectedIPO.status === 'OPEN' && quantity > 0 && selectedIPO.availableShares >= quantity && balance >= totalAmount);

  const handleBuy = async () => {
    if (!canBuy) {
      toast.error('Cannot buy IPO shares right now');
      return;
    }
    const result = await dispatch(buyIPO({ id, quantity }));
    if(buyIPO.fulfilled.match(result)) {
        console.log('IPO shares bought successfully');
      toast.success('IPO shares bought successfully');
      dispatch(getIPOById(id));
    }else if(buyIPO.rejected.match(result)) {
      toast.error(result.payload || 'IPO purchase failed');
    }
     
    
  };

  if (isLoading || !selectedIPO) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#000] mt-10">
        <LoadingSpinner size="lg" text="LOADING IPO DETAILS..." />
      </div>
    );
  }

  const soldShares = (selectedIPO.totalShares || 0) - (selectedIPO.availableShares || 0);
  const soldPercent = Math.round((soldShares / (selectedIPO.totalShares || 1)) * 100);

  return (
    <div className="min-h-screen bg-white dark:bg-[#000] py-8 mt-10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/ipos')} className="mb-6 flex items-center gap-2 text-sm font-bold text-black dark:text-white">
          <ArrowLeft className="w-4 h-4" /> BACK TO IPOs
        </button>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111] p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black dark:bg-white text-xl font-black text-white dark:text-black">
                {selectedIPO.teamLogo || selectedIPO.symbol?.slice(0, 2) || 'IP'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white">{selectedIPO.teamName}</h1>
                <p className="text-sm font-mono text-gray-600 dark:text-gray-400">{selectedIPO.symbol}</p>
              </div>
            </div>
            <div className="rounded-full bg-black dark:bg-white px-4 py-2 text-sm font-bold text-white dark:text-black">{selectedIPO.status}</div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-white/80 dark:bg-black/40 p-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">IPO Price</p>
              <p className="mt-1 font-bold text-black dark:text-white">₹{selectedIPO.ipoPrice}</p>
            </div>
            <div className="rounded-xl bg-white/80 dark:bg-black/40 p-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Total Shares</p>
              <p className="mt-1 font-bold text-black dark:text-white">{selectedIPO.totalShares?.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-white/80 dark:bg-black/40 p-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Available Shares</p>
              <p className="mt-1 font-bold text-black dark:text-white">{selectedIPO.availableShares?.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-white/80 dark:bg-black/40 p-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Shares Sold</p>
              <p className="mt-1 font-bold text-black dark:text-white">{soldShares.toLocaleString()} ({soldPercent}%)</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-black/30 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-black dark:text-white"><Clock3 className="w-4 h-4" /> IPO Timing</div>
              <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-between"><span>Start</span><span className="font-mono">{formatDate(selectedIPO.openTime)}</span></div>
                <div className="flex items-center justify-between"><span>End</span><span className="font-mono">{formatDate(selectedIPO.closeTime)}</span></div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-black/30 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-black dark:text-white"><Wallet className="w-4 h-4" /> Wallet</div>
              <div className="mt-3 text-2xl font-bold text-black dark:text-white">₹{balance?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-black/30 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-black dark:text-white"><Sparkles className="w-4 h-4" /> Buy IPO Shares</div>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end">
              <div className="w-full md:w-44">
                <label className="mb-2 block text-sm font-bold text-black dark:text-white">Quantity</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setQuantity('');
                      return;
                    }
                    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
                      return;
                    }
                    const parsed = Number(value);
                    if (!Number.isNaN(parsed) && parsed > 0) {
                      setQuantity(value);
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-black outline-none dark:border-gray-700 dark:bg-black dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Live Total</p>
                <p className="text-2xl font-bold text-black dark:text-white">₹{(Number(totalAmount) || 0).toFixed(2)}</p>
              </div>
              <button onClick={handleBuy} disabled={!canBuy || isBuying} className={`rounded-lg px-5 py-3 text-sm font-bold text-white transition ${canBuy && !isBuying ? 'bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200' : 'cursor-not-allowed bg-gray-400 dark:bg-gray-700'}`}>
                {isBuying ? 'PURCHASING...' : 'BUY IPO SHARES'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IPODetailsPage;
