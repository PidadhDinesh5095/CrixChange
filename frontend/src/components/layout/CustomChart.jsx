import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createChart, CrosshairMode } from "lightweight-charts";
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Search,
  Star,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";


import { useParams, useNavigate } from "react-router-dom";
import { orderPlace, getStats, updateStockStat } from "../../store/slices/tradingSlice";
import { getWalletBalance } from '../../store/slices/walletSlice';
import { getMarketStocks, getOrderBook, updateOrderBook, getTrades, getMyTrades, updateMyTrades, updateTrades } from '../../store/slices/tradingSlice';
import socket from '../../hooks/socket.js';

/* =========================================================================
   IPL TEAMS (10 only) — colored initials, no external logo dependency
   ========================================================================= */
const IPL_TEAMS = [
  { id: "csk", short: "CSK", name: "Chennai Super Kings", color: "#F9CD05" },
  { id: "mi", short: "MI", name: "Mumbai Indians", color: "#2C6EFF" },
  { id: "rcb", short: "RCB", name: "Royal Challengers Bengaluru", color: "#EC1C24" },
  { id: "kkr", short: "KKR", name: "Kolkata Knight Riders", color: "#8B5CF6" },
  { id: "rr", short: "RR", name: "Rajasthan Royals", color: "#EA1F82" },
  { id: "srh", short: "SRH", name: "Sunrisers Hyderabad", color: "#FF822A" },
  { id: "dc", short: "DC", name: "Delhi Capitals", color: "#2196F3" },
  { id: "pbks", short: "PBKS", name: "Punjab Kings", color: "#ED1B24" },
  { id: "gt", short: "GT", name: "Gujarat Titans", color: "#1B2133" },
  { id: "lsg", short: "LSG", name: "Lucknow Super Giants", color: "#A72056" },
];

/* =========================================================================
   CRICKET EVENT ENGINE (drives price simulation) — unchanged from original
   ========================================================================= */
const CRICKET_EVENTS = [
  { name: "Dot Ball", label: "0" },
  { name: "Single", label: "1" },
  { name: "Double", label: "2" },
  { name: "Triple", label: "3" },
  { name: "Four", label: "4" },
  { name: "Six", label: "6" },
  { name: "Wicket", label: "W" },
  { name: "Catch", label: "C" },
];
const EVENT_PROBABILITIES = [0.22, 0.28, 0.13, 0.05, 0.12, 0.08, 0.08, 0.04];

function getRandomEvent(rand) {
  const r = rand();
  let acc = 0;
  for (let i = 0; i < EVENT_PROBABILITIES.length; i++) {
    acc += EVENT_PROBABILITIES[i];
    if (r < acc) return CRICKET_EVENTS[i];
  }
  return CRICKET_EVENTS[0];
}

function getEventPriceChange(event, prevEvent, over, prevHike, rand) {
  let priceChange = 0;
  let isHike = false;
  if (event.label === "6") { priceChange = 2; isHike = true; if (prevEvent?.label === "6") priceChange += 1; }
  else if (event.label === "4") { priceChange = 0.8; isHike = true; if (prevEvent?.label === "4") priceChange += 1; }
  else if (event.label === "1") {
    priceChange = 0.2;
    isHike = prevEvent?.label === "1";
    if (isHike && prevHike) priceChange += 1;
  } else if (event.label === "2") {
    priceChange = 0.3; isHike = true;
    if (prevEvent?.label === "2") priceChange = 0.4;
    if (prevEvent?.label === "2" && prevHike) priceChange += 1;
  } else if (event.label === "3") {
    priceChange = 0.5; isHike = true;
    if (prevEvent?.label === "3" && prevHike) priceChange += 1;
  } else if (event.label === "0") {
    priceChange = 0; isHike = false;
    if (prevHike) priceChange -= 0.3;
  } else if (event.label === "W") {
    priceChange = over <= 2 ? -5 : over <= 10 ? -3 : -2;
    isHike = false;
  } else if (event.label === "C") {
    priceChange = -2; isHike = false;
  }
  if (prevHike && (event.label === "0" || event.label === "1")) priceChange -= 0.3;
  return { priceChange, isHike };
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSeries(startPrice, numBalls, seed) {
  const rand = mulberry32(seed);
  const out = [];
  let price = startPrice;
  let prevEvent = null;
  let prevHike = false;
  for (let ballNum = 0; ballNum < numBalls; ballNum++) {
    const over = Math.floor(ballNum / 6) + 1;
    const ball = (ballNum % 6) + 1;
    const eventObj = getRandomEvent(rand);
    const { priceChange, isHike } = getEventPriceChange(eventObj, prevEvent, over, prevHike, rand);
    const prevPrice = price;
    price = Math.max(10, Math.min(200, price + priceChange));
    out.push({
      time: over + ball * 0.1,
      open: prevPrice,
      high: Math.max(prevPrice, price) + rand() * 0.6,
      low: Math.min(prevPrice, price) - rand() * 0.6,
      close: price,
      volume: Math.abs(price - prevPrice) * 8 + rand() * 4,
      event: eventObj.label,
    });
    prevEvent = eventObj;
    prevHike = isHike;
  }
  return out;
}

/* =========================================================================
   AGGREGATION + INDICATOR MATH
   ========================================================================= */
function aggregate(ballData, interval) {
  if (interval === "1s" || interval === "1m") return ballData;
  const groupSize =
    interval === "15m" ? 15 : interval === "1h" ? 60 : ballData.length || 1;
  const out = [];
  for (let i = 0; i < ballData.length; i += groupSize) {
    const chunk = ballData.slice(i, i + groupSize);
    if (!chunk.length) continue;
    out.push({
      time: chunk[chunk.length - 1].time,
      open: chunk[0].open,
      close: chunk[chunk.length - 1].close,
      high: Math.max(...chunk.map((d) => d.high)),
      low: Math.min(...chunk.map((d) => d.low)),
      volume: chunk.reduce((s, d) => s + d.volume, 0),
    });
  }
  return out;
}

/* =========================================================================
   REAL TRADE -> CANDLE AGGREGATION
   Converts the flat `trades` list (from Redux, fed by getTrades + the
   'trade' socket event) into OHLCV candles bucketed by interval.

   buildCandlesFromTrades -> full build, call on stock/interval switch
   applyTradeToCandles    -> incremental patch, call per new socket trade
                             (only touches the last bucket or appends one
                             new bucket — never rescans the whole history)
   ========================================================================= */
const INTERVAL_MS = {
  '1s': 1000,
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
};

// `fullAnchorMs`, when supplied, pins every trade under `interval === "full"`
// into the same single bucket (the whole loaded history as one candle).
function getBucketStartSec(timestampMs, interval, fullAnchorMs) {
  if (interval === "full") {
    return Math.floor((fullAnchorMs ?? timestampMs) / 1000);
  }
  const ms = INTERVAL_MS[interval] || INTERVAL_MS["1m"];
  return (Math.floor(timestampMs / ms) * ms) / 1000;
}

function finalizeCandle(candle) {
  candle.change = candle.close - candle.open;
  candle.changePct = candle.open ? (candle.change / candle.open) * 100 : 0;
  return candle;
}

// `trades` is assumed newest-first (trades[0] is the latest trade — how
// updateTrades/getTrades store them), so we walk it back-to-front (oldest
// -> newest) by index instead of re-parsing + sorting every trade's Date.
// For each interval bucket we count every trade that lands in it and
// derive open/high/low/close/change/changePct/volume from just those trades.
function buildCandlesFromTrades(trades, interval) {
  if (!trades || !trades.length) return [];

  const fullAnchorMs = new Date(trades[trades.length - 1].time).getTime();
  const candles = [];
  let current = null;

  for (let i = trades.length - 1; i >= 0; i--) {
    const t = trades[i];
    const ts = new Date(t.time).getTime();
    const bucketStart = getBucketStartSec(ts, interval, fullAnchorMs);
    const price = t.price;
    const vol = t.qty ?? 0;

    if (!current || current.time !== bucketStart) {
      if (current) candles.push(finalizeCandle(current));
      current = {
        time: bucketStart, // seconds — required by lightweight-charts
        open: price,
        high: price,
        low: price,
        close: price,
        volume: vol,
        tradeCount: 1,
      };
    } else {
      current.high = Math.max(current.high, price);
      current.low = Math.min(current.low, price);
      current.close = price;
      current.volume += vol;
      current.tradeCount += 1;
    }
  }
  if (current) candles.push(finalizeCandle(current));
  return candles;
}

function applyTradeToCandles(candles, trade, interval) {
  if (!trade) return candles;
  const ts = new Date(trade.time).getTime();
  const price = trade.price;
  const vol = trade.qty ?? 0;

  if (!candles.length) {
    const bucketStart = getBucketStartSec(ts, interval, ts);
    return [finalizeCandle({ time: bucketStart, open: price, high: price, low: price, close: price, volume: vol, tradeCount: 1 })];
  }

  const last = candles[candles.length - 1];
  // "full" always collapses into the single existing bucket.
  const bucketStart = interval === "full" ? last.time : getBucketStartSec(ts, interval);

  if (bucketStart === last.time) {
    const updatedLast = finalizeCandle({
      ...last,
      high: Math.max(last.high, price),
      low: Math.min(last.low, price),
      close: price,
      volume: last.volume + vol,
      tradeCount: (last.tradeCount ?? 1) + 1,
    });
    return [...candles.slice(0, -1), updatedLast];
  }

  if (bucketStart > last.time) {
    return [...candles, finalizeCandle({ time: bucketStart, open: price, high: price, low: price, close: price, volume: vol, tradeCount: 1 })];
  }

  return candles; // out-of-order/late trade — ignored
}

function sma(data, period) {
  const out = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { out.push(null); continue; }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
    out.push(sum / period);
  }
  return out;
}

function ema(data, period) {
  const out = new Array(data.length).fill(null);
  if (data.length < period) return out;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < period; i++) sum += data[i].close;
  let prev = sum / period;
  out[period - 1] = prev;
  for (let i = period; i < data.length; i++) {
    prev = data[i].close * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

function rsi(data, period = 14) {
  const out = new Array(data.length).fill(null);
  if (data.length < period + 1) return out;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period, avgLoss = losses / period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

function macd(data, fast = 12, slow = 26, signalPeriod = 9) {
  const emaFast = ema(data, fast);
  const emaSlow = ema(data, slow);
  const macdLine = data.map((_, i) => (emaFast[i] != null && emaSlow[i] != null ? emaFast[i] - emaSlow[i] : null));
  const firstValid = macdLine.findIndex((v) => v != null);
  const signalLine = new Array(data.length).fill(null);
  if (firstValid !== -1 && data.length - firstValid >= signalPeriod) {
    const k = 2 / (signalPeriod + 1);
    let sum = 0;
    for (let i = firstValid; i < firstValid + signalPeriod; i++) sum += macdLine[i];
    let prev = sum / signalPeriod;
    signalLine[firstValid + signalPeriod - 1] = prev;
    for (let i = firstValid + signalPeriod; i < data.length; i++) {
      prev = macdLine[i] * k + prev * (1 - k);
      signalLine[i] = prev;
    }
  }
  const histogram = data.map((_, i) => (macdLine[i] != null && signalLine[i] != null ? macdLine[i] - signalLine[i] : null));
  return { macdLine, signalLine, histogram };
}

function bollinger(data, period = 20, mult = 2) {
  const mid = sma(data, period);
  const upper = new Array(data.length).fill(null);
  const lower = new Array(data.length).fill(null);
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) { const diff = data[j].close - mid[i]; sum += diff * diff; }
    const sd = Math.sqrt(sum / period);
    upper[i] = mid[i] + mult * sd;
    lower[i] = mid[i] - mult * sd;
  }
  return { mid, upper, lower };
}

function vwapCalc(data) {
  const out = new Array(data.length).fill(null);
  let cumPV = 0, cumV = 0;
  data.forEach((d, i) => {
    const typical = (d.high + d.low + d.close) / 3;
    cumPV += typical * d.volume;
    cumV += d.volume;
    out[i] = cumV > 0 ? cumPV / cumV : d.close;
  });
  return out;
}

/* =========================================================================
   SHARED SMALL UI PRIMITIVES (match the login page: rounded-sm, thin
   borders, black/white/gray palette, font-sans)
   ========================================================================= */
function IconBtn({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5  rounded-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
    >
      {children}
    </button>
  );
}

const CHART_TYPES = [
  { key: "candlestick", label: "Candlestick" },
  { key: "line", label: "Line" },
  { key: "area", label: "Area" },
  { key: "baseline", label: "Baseline" },
  { key: "bar", label: "Bar" },
];

const INDICATOR_OPTIONS = [
  { key: "sma", label: "SMA (5)" },
  { key: "ema", label: "EMA (9)" },
  { key: "rsi", label: "RSI (14)" },
  { key: "macd", label: "MACD (12, 26, 9)" },
  { key: "vwap", label: "VWAP" },
  { key: "bollinger", label: "Bollinger Bands (20, 2)" },
  { key: "volume", label: "Volume" },
];

const INTERVALS = [["1s", "1S"], ["1m", "1M"], ["15m", "15M"], ["1h", "1H"], ["full", "Full"]];

function ToolbarDropdown({ label, isOpen, onToggle, onClose, children, widthClass = "w-44" }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium  rounded-sm hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
      >
        {label} <ChevronDown size={12} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className={`absolute left-0 top-full mt-1 ${widthClass} bg-white dark:bg-black  rounded-sm shadow-lg z-50 py-1`}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================================
   SINGLE APP HEADER — team identity + live stats, no theme toggle, no
   extraneous icon buttons. This is the ONLY header in the app.
   ========================================================================= */
function StatBlock({ label, value, colorClass }) {
  return (
    <div className="leading-tight shrink-0 whitespace-nowrap">
      <div className="text-[10.5px] text-gray-400 uppercase tracking-wide">{label}</div>
      <div className={`text-xs font-semibold font-sans ${colorClass || "text-black dark:text-white"}`}>{value}</div>
    </div>
  );
}

function TerminalHeader({ team, current, change, changePct, dayHigh, dayLow, dayVol }) {
  const isUp = change >= 0;
  const colorClass = isUp ? "#2A9C70" : "#CA3D50";
  const colors = isUp ? "text-emerald-600" : "text-rose-600";
  return (
    <div className="flex flex-nowrap lg:flex-wrap h-auto lg:h-11 items-center gap-2 lg:gap-4 p-1 border-b border-gray-200 dark:border-gray-800 shrink-0 overflow-x-auto lg:overflow-visible">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-sm font-black text-white dark:text-black overflow-hidden shrink-0">
          {current.img ? (
            <img src={current.img} alt={team.name} className="h-full w-full object-cover" />
          ) : (
            team.name?.slice(0, 2) || 'ST'
          )}
        </div>
        <div className="whitespace-nowrap">
          <div className="text-[12px] font-semibold text-black dark:text-white">{team.name}</div>
          <div className={`flex items-center gap-1 text-md font-bold font-sans leading-tight `}
            style={{ color: colorClass }}>
            ₹{current.close.toFixed(2)}
            {isUp ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
          </div>
        </div>
      </div>
      <div className="w-px h-6 bg-gray-200 font-sans dark:bg-white shrink-0" />
      <StatBlock label="Change" value={`${isUp ? "+" : ""}${change.toFixed(2)} (${changePct.toFixed(2)}%)`} colorClass={colors} />
      <StatBlock label="High" value={dayHigh.toFixed(2)} colorClass={colors} />
      <StatBlock label="Low" value={dayLow.toFixed(2)} colorClass={colors} />
      <StatBlock label="Volume" value={dayVol.toFixed(0)} colorClass={colors} />

    </div>
  );
}

/* =========================================================================
   MOBILE-ONLY: tab bar (Chart / Order Book / Trades / Stocks)
   Rendered right below TerminalHeader. Hidden on lg (desktop keeps the
   existing 3-column layout untouched).
   ========================================================================= */
const MOBILE_TABS = [
  ["chart", "Chart"],
  ["orderbook", "Order Book"],
  ["trades", "Trades"],
  ["stocks", "Stocks"],
];

function MobileTabBar({ active, onChange }) {
  return (
    <div className="flex lg:hidden border-b border-gray-200 dark:border-gray-800 shrink-0">
      {MOBILE_TABS.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 px-2 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${active === key
            ? "border-black dark:border-white text-black dark:text-white"
            : "border-transparent text-gray-400"
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* =========================================================================
   CHART TOOLBAR — interval buttons, chart type + indicators dropdowns,
   zoom controls (TradingView-style flat toolbar, text-only interval tabs)
   ========================================================================= */
function ChartToolbar({ interval_, setInterval_, chartType, setChartType, indicators, toggleIndicator, onZoomIn, onZoomOut, onReset }) {
  const [chartTypeOpen, setChartTypeOpen] = useState(false);
  const [indicatorsOpen, setIndicatorsOpen] = useState(false);
  const [intervalOpen, setIntervalOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2 p-0.9 border-b border-gray-200 dark:border-gray-800 shrink-0">
      {/* Desktop: original inline interval buttons, unchanged */}
      <div className="hidden lg:flex gap-0.5">
        {INTERVALS.map(([v, label]) => (
          <button
            key={v}
            onClick={() => setInterval_(v)}
            className={`px-2.5 py-1 text-xs font-medium rounded-sm  transition-colors ${interval_ === v
              ? "bg-black text-white dark:bg-white dark:text-black "
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Mobile: interval as a dropdown so everything fits without scrolling */}
      <div className="lg:hidden">
        <ToolbarDropdown
          label={INTERVALS.find(([v]) => v === interval_)?.[1] || "Interval"}
          isOpen={intervalOpen}
          onToggle={() => { setIntervalOpen((v) => !v); setChartTypeOpen(false); setIndicatorsOpen(false); }}
          onClose={() => setIntervalOpen(false)}
          widthClass="w-32"
        >
          {INTERVALS.map(([v, label]) => (
            <button
              key={v}
              onClick={() => { setInterval_(v); setIntervalOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-900 text-left"
            >
              <span>{label}</span>
              {interval_ === v && <Check size={12} />}
            </button>
          ))}
        </ToolbarDropdown>
      </div>

      <div className="w-px h-4 bg-gray-200 dark:bg-gray-800" />

      <ToolbarDropdown
        label={CHART_TYPES.find((c) => c.key === chartType)?.label || "Chart type"}
        isOpen={chartTypeOpen}
        onToggle={() => { setChartTypeOpen((v) => !v); setIndicatorsOpen(false); setIntervalOpen(false); }}
        onClose={() => setChartTypeOpen(false)}
      >
        {CHART_TYPES.map((ct) => (
          <button
            key={ct.key}
            onClick={() => { setChartType(ct.key); setChartTypeOpen(false); }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-900 text-left"
          >
            <span>{ct.label}</span>
            {chartType === ct.key && <Check size={12} />}
          </button>
        ))}
      </ToolbarDropdown>

      <ToolbarDropdown
        label="Indicators"
        isOpen={indicatorsOpen}
        onToggle={() => { setIndicatorsOpen((v) => !v); setChartTypeOpen(false); setIntervalOpen(false); }}
        onClose={() => setIndicatorsOpen(false)}
        widthClass="w-56"
      >
        {INDICATOR_OPTIONS.map((opt) => (
          <label key={opt.key} className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">
            <input
              type="checkbox"
              checked={!!indicators[opt.key]}
              onChange={() => toggleIndicator(opt.key)}
              className="accent-black dark:accent-white"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </ToolbarDropdown>

      <div className="flex items-center gap-1 ml-auto">
        <IconBtn onClick={onZoomOut} title="Zoom out"><ZoomOut size={14} /></IconBtn>
        <IconBtn onClick={onZoomIn} title="Zoom in"><ZoomIn size={14} /></IconBtn>
        <IconBtn onClick={onReset} title="Reset zoom"><Maximize2 size={14} /></IconBtn>
      </div>
    </div>
  );
}
/* =========================================================================
   TERMINAL CHART — candlestick / bar / line / area / baseline, crosshair,
   zoom (buttons + wheel), drag pan, price/time scale, optional Volume /
   RSI / MACD sub-panes, overlay indicators (SMA/EMA/VWAP/Bollinger)
   ========================================================================= */
const W = 1000, PAD_L = 10, PAD_R = 56;

const TerminalChart = forwardRef(function TerminalChart(
  { data, chartType, indicators, isDark, resetSignal, upColor, downColor, interval },
  ref
) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [hoverData, setHoverData] = useState(null);

  const indicatorSeries = useMemo(() => {
    const out = {};
    if (indicators.sma) out.sma = sma(data, 5);
    if (indicators.ema) out.ema = ema(data, 9);
    if (indicators.vwap) out.vwap = vwapCalc(data);
    if (indicators.bollinger) out.bollinger = bollinger(data, 20, 2);
    if (indicators.rsi) out.rsi = rsi(data, 14);
    if (indicators.macd) out.macd = macd(data, 12, 26, 9);
    return out;
  }, [data, indicators]);
  const isMobileView = typeof window !== "undefined" && window.innerWidth < 1024;




  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container || !data.length) {
      setHoverData(null);
      return;
    }

    container.innerHTML = "";
    const chart = createChart(container, {

      width: container.clientWidth || 715,
      height: isMobileView ? (container.clientHeight || 388) + 10: 378,
      layout: {
        background: { color: isDark ? "#000000" : "#ffffff" },
        textColor: isDark ? "#f5f5f5" : "#111827",
        fontFamily: "Darker Grotesque",
      },
      grid: {
        vertLines: { color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" },
        horzLines: { color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: isDark ? "#94a3b8" : "#64748b", width: 1, style: 2 },
        horzLine: { color: isDark ? "#94a3b8" : "#64748b", width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: isDark ? "#374151" : "#d1d5db",
        scaleMargins: { top: 0.08, bottom: indicators.volume ? 0.24 : 0.1 },
      },
      timeScale: {
        borderColor: isDark ? "#374151" : "#d1d5db",
        rightOffset: 4,
        barSpacing: 2,
        minBarSpacing: 4,
        tickMarkFormatter: (time) => {
          // `time` is now a real Unix-seconds timestamp (candles are built
          // from actual trade times), so format it as a clock/date instead
          // of the old relative over/ball number.
          const value = Number(time);
          if (!Number.isFinite(value)) return "";
          const d = new Date(value * 1000);
          const hh = String(d.getHours()).padStart(2, "0");
          const mm = String(d.getMinutes()).padStart(2, "0");
          const ss = String(d.getSeconds()).padStart(2, "0");
          if (interval === "1s") return `${hh}:${mm}:${ss}`;
          if (interval === "1m" || interval === "15m") return `${hh}:${mm}`;
          if (interval === "1h") return `${hh}:00`;
          return d.toLocaleDateString(); // "full"
        },
      },
    });

    chartRef.current = chart;

    const mainData = data.map((d, index) => ({
      time: Number(d.time) || index + 1,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const seriesOptions = {
      upColor: upColor,
      downColor: downColor,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
    };

    let mainSeries;
    if (chartType === "candlestick") {
      mainSeries = chart.addCandlestickSeries(seriesOptions);
      mainSeries.setData(mainData);
    } else if (chartType === "bar") {
      mainSeries = chart.addBarSeries({ upColor: upColor, downColor: downColor });
      mainSeries.setData(mainData);
    } else if (chartType === "area") {
      mainSeries = chart.addAreaSeries({
        lineColor: upColor,
        topColor: `${upColor}33`,
        bottomColor: `${downColor}11`,
      });
      mainSeries.setData(mainData.map((d) => ({ time: d.time, value: d.close })));
    } else if (chartType === "baseline") {
      mainSeries = chart.addBaselineSeries({
        baseValue: { type: "price", price: mainData[0]?.close ?? 0 },
        topLineColor: upColor,
        topFillColor1: `${upColor}33`,
        topFillColor2: `${upColor}11`,
        bottomLineColor: downColor,
        bottomFillColor1: `${downColor}11`,
        bottomFillColor2: `${downColor}33`,
      });
      mainSeries.setData(mainData.map((d) => ({ time: d.time, value: d.close })));
    } else {
      mainSeries = chart.addLineSeries({ color: upColor, lineWidth: 2 });
      mainSeries.setData(mainData.map((d) => ({ time: d.time, value: d.close })));
    }

    if (indicators.volume) {
      const volumeSeries = chart.addHistogramSeries({
        color: upColor,
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });
      volumeSeries.setData(data.map((d, index) => ({
        time: Number(d.time) || index + 1,
        value: d.volume,
        color: d.close >= d.open ? `${upColor}66` : `${downColor}66`,
      })));
      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.82, bottom: 0.02 },
      });
    }

    const addOverlaySeries = (color, values) => {
      if (!Array.isArray(values)) return;
      const numericPoints = values.reduce((acc, value, index) => {
        const numericValue = Number(value);
        const numericTime = Number(data[index]?.time) || index + 1;
        if (value == null || Number.isNaN(numericValue) || !Number.isFinite(numericTime)) return acc;
        acc.push({ time: numericTime, value: numericValue });
        return acc;
      }, []);

      if (!numericPoints.length) return;
      const series = chart.addLineSeries({ color, lineWidth: 1.5 });
      series.setData(numericPoints);
    };

    if (indicators.sma) {
      addOverlaySeries("#f59e0b", indicatorSeries.sma);
    }
    if (indicators.ema) {
      addOverlaySeries("#3b82f6", indicatorSeries.ema);
    }
    if (indicators.vwap) {
      addOverlaySeries("#a855f7", indicatorSeries.vwap);
    }
    if (indicators.bollinger) {
      addOverlaySeries("#14b8a6", indicatorSeries.bollinger.upper);
      addOverlaySeries("#14b8a6", indicatorSeries.bollinger.mid);
      addOverlaySeries("#14b8a6", indicatorSeries.bollinger.lower);
    }

    chart.timeScale().fitContent();

    const handleCrosshairMove = (param) => {
      if (!param.time || !param.seriesData.get(mainSeries)) {
        setHoverData(null);
        return;
      }
      const point = param.seriesData.get(mainSeries);
      if (point) {
        setHoverData(point);
      }
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    const handleResize = () => {
      chart.applyOptions({
        width: container.clientWidth || 720,
        height: isMobileView ? (container.clientHeight || 388) + 10 : 378,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
    };
  }, [data, chartType, indicators, isDark, resetSignal, upColor, downColor, interval]);

  const zoomBy = useCallback((factor) => {
    const chartInstance = chartRef.current;
    if (!chartInstance) return;
    const timeScale = chartInstance.timeScale();
    const range = timeScale.getVisibleLogicalRange();
    if (!range) return;
    const center = (range.from + range.to) / 2;
    const span = Math.max(6, (range.to - range.from) * factor);
    const newFrom = Math.max(0, center - span / 2);
    const newTo = Math.min(data.length - 1, center + span / 2);
    timeScale.setVisibleLogicalRange({ from: newFrom, to: newTo });
  }, [data.length]);

  const resetView = useCallback(() => {
    chartRef.current?.timeScale().fitContent();
  }, []);

  useImperativeHandle(ref, () => ({
    zoomIn: () => zoomBy(0.8),
    zoomOut: () => zoomBy(1.25),
    reset: resetView,
  }), [zoomBy, resetView]);

  const latestPoint = hoverData || data[data.length - 1] || { open: 0, high: 0, low: 0, close: 0 };
  const normalizedPoint = {
    open: latestPoint.open ?? latestPoint.value ?? 0,
    high: latestPoint.high ?? latestPoint.value ?? latestPoint.close ?? 0,
    low: latestPoint.low ?? latestPoint.value ?? latestPoint.close ?? 0,
    close: latestPoint.close ?? latestPoint.value ?? latestPoint.open ?? 0,
  };
  const hoverUp = normalizedPoint.close >= normalizedPoint.open;
  const chgAbs = normalizedPoint.close - normalizedPoint.open;
  const chgPct = normalizedPoint.open ? (chgAbs / normalizedPoint.open) * 100 : 0;
  const rangePct = normalizedPoint.open ? ((normalizedPoint.high - normalizedPoint.low) / normalizedPoint.open) * 100 : 0;
  const rsiValue = indicators.rsi && indicatorSeries.rsi?.[data.length - 1] != null ? indicatorSeries.rsi[data.length - 1].toFixed(2) : "—";
  const macdValue = indicators.macd && indicatorSeries.macd?.histogram?.[data.length - 1] != null ? indicatorSeries.macd.histogram[data.length - 1].toFixed(2) : "—";

  if (!data.length) {
    return <div className="h-72 flex items-center justify-center text-gray-400 text-sm border border-gray-200 dark:border-gray-800 rounded-sm">Waiting for data…</div>;
  }

  return (
    <div className="flex flex-col gap-2 ">
      <div className="flex flex-wrap h-3 items-center  gap-x-4 gap-y-1 text-[11px] font-sans px-1">
        <span className={hoverUp ? "text-[#2A9C70]" : "text-[#F6465D]"}>O <b>{normalizedPoint.open.toFixed(2)}</b></span>
        <span className={hoverUp ? "text-[#2A9C70]" : "text-[#F6465D]"}>H <b>{normalizedPoint.high.toFixed(2)}</b></span>
        <span className={hoverUp ? "text-[#2A9C70]" : "text-[#F6465D]"}>L <b>{normalizedPoint.low.toFixed(2)}</b></span>
        <span className={hoverUp ? "text-[#2A9C70]" : "text-[#F6465D]"}>C <b>{normalizedPoint.close.toFixed(2)}</b></span>
        <span className="text-gray-400">Chg <b className={chgAbs >= 0 ? "text-green-600" : "text-red-600"}>{chgPct.toFixed(2)}%</b></span>
        <span className="text-gray-400">Range <b className="text-black dark:text-white">{rangePct.toFixed(2)}%</b></span>
        {indicators.sma && <span className="text-amber-500">SMA(5)</span>}
        {indicators.ema && <span className="text-blue-500">EMA(9)</span>}
        {indicators.vwap && <span className="text-fuchsia-500">VWAP</span>}
        {indicators.bollinger && <span className="text-teal-500">BB(20,2)</span>}
      </div>
      <div className="relative">
        <div
          ref={chartContainerRef}
          className="w-full rounded-sm bg-white  border-gray-200 dark:border-gray-800 overflow-hidden dark:bg-black"
          style={{ height: isMobileView ? window.innerHeight - 250 : 380 }}
        />

        <div className="pointer-events-none absolute inset-0 flex pb-20 items-center z-10 justify-center">
          <span className="select-none text-5xl font-bold text-gray-400/20 dark:text-gray-500/20">
            Crixchange.
          </span>
        </div>
      </div>

      {(indicators.rsi || indicators.macd) && (
        <div className="flex flex-wrap gap-3 px-1 text-[11px] text-gray-500 dark:text-gray-400">
          {indicators.rsi && <span>RSI: {rsiValue}</span>}
          {indicators.macd && <span>MACD: {macdValue}</span>}
        </div>
      )}

    </div>
  );
});

/* =========================================================================
   ORDER BOOK (left panel — fills full height, view mode split/bids/asks)
   ========================================================================= */


function formatCompact(n) {
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
  if (abs >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (abs >= 1e3) return (n / 1e3).toFixed(2).replace(/\.?0+$/, "") + "k";
  return n.toFixed(2);
}

function buildRows(book, side, userId) {
  const levels = side === "asks" ? book.asks : book.bids;
  if (!levels) return [];

  const rows = Object.entries(levels).map(([priceStr, level]) => {
    const price = parseFloat(priceStr);
    const amount = level.totalQty;
    return {
      price,
      amount,
      total: price * amount, // total = price * amount (per-row notional)
      isOwn: (level.orders || []).some((o) => o.userId === userId),
    };
  });

  // asks ascending (lowest first), bids descending (highest first)
  rows.sort((a, b) => (side === "asks" ? a.price - b.price : b.price - a.price));

  return rows;
}

function OrderBookPanel({ price, depth, viewMode, setViewMode, isDark, upColor, downColor, userId }) {
  const { asks, bids, maxTotal, sumAsks, sumBids } = useMemo(() => {
    const askRows = buildRows(depth, "asks", userId);
    const bidRows = buildRows(depth, "bids", userId);
    const sumA = askRows.reduce((s, r) => s + r.total, 0);
    const sumB = bidRows.reduce((s, r) => s + r.total, 0);
    const maxRowTotal = Math.max(
      ...askRows.map((r) => r.total),
      ...bidRows.map((r) => r.total),
      1
    );
    return { asks: askRows, bids: bidRows, maxTotal: maxRowTotal, sumAsks: sumA, sumBids: sumB };
  }, [depth, userId]);

  const buyPct = sumAsks + sumBids > 0 ? (sumBids / (sumAsks + sumBids)) * 100 : 50;

  const Row = ({ r, side }) => (
    <div
      className="relative grid grid-cols-3 gap-1 px-1 py-0.2 text-[11px] font-semibold font-sans tabular-nums"
      style={
        r.isOwn
          ? {
            background: isDark ? "rgba(236,72,153,0.12)" : "rgba(236,72,153,0.08)",
          }
          : undefined
      }
    >
      <div
        className="absolute right-0 top-0 bottom-0"
        style={{
          width: `${Math.min(100, (r.total / maxTotal) * 100)}%`,
          background:
            side === "ask"
              ? isDark
                ? "rgba(239,68,68,0.14)"
                : "rgba(220,38,38,0.10)"
              : isDark
                ? "rgba(34,197,94,0.14)"
                : "rgba(22,163,74,0.10)",
        }}
      />
      <span className="relative z-10 text-left" style={{ color: side === "ask" ? downColor : upColor }}>
        {formatCompact(r.price)}
      </span>
      <span className="relative z-10 text-right text-black dark:text-white">{formatCompact(r.amount)}</span>
      <span className="relative z-10 text-right text-gray-500 dark:text-gray-400">{formatCompact(r.total)}</span>
    </div>
  );

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center p-1 justify-between border-b border-gray-200 dark:border-gray-800">
        <span className="text-md font-semibold">Order Book</span>
        <div className="flex gap-1">
          {["split", "bids", "asks"].map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              title={m}
              className={`px-1.5 py-1 rounded-sm border transition-colors ${viewMode === m
                ? "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-white"
                : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-900"
                }`}
            >
              <div className="flex flex-col gap-0.5">
                {[0, 1, 2, 3].map((k) => (
                  <div
                    key={k}
                    className="w-3.5 h-0.5"
                    style={{ background: m === "asks" ? downColor : m === "bids" ? upColor : k < 2 ? downColor : upColor }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 px-2 py-1 text-[10px] uppercase text-gray-900 dark:text-gray-400 tracking-wide font-semibold">
        <span className="text-left">Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Total</span>
      </div>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {viewMode !== "bids" && (
          <div className="flex-1 overflow-y-auto flex flex-col-reverse">
            {asks.map((r, i) => (
              <Row key={i} r={r} side="ask" />
            ))}
            {asks.length === 0 && <div className="text-center text-[10px] text-gray-400 py-4">No asks</div>}
          </div>
        )}
        <div className="px-2 py-1 flex items-center gap-2">
          <span className="text-base font-bold font-sans" style={{ color: upColor }}>
            {price.toFixed(2)}
          </span>
          <span className="text-[11.5px] text-gray-400">live price</span>
        </div>
        {viewMode !== "asks" && (
          <div className="flex-1 overflow-y-auto">
            {bids.map((r, i) => (
              <Row key={i} r={r} side="bid" />
            ))}
            {bids.length === 0 && <div className="text-center text-[10px] text-gray-400 py-4">No bids</div>}
          </div>
        )}
      </div>
      <div className="p-1 relative b-0 border-t border-gray-200 dark:border-gray-800">
        <div className="flex h-1 rounded-sm overflow-hidden mb-1">
          <div style={{ width: `${buyPct}%`, background: upColor }} />
          <div style={{ width: `${100 - buyPct}%`, background: downColor }} />
        </div>
        <div className="flex justify-between text-[10.5px] font-sans">
          <span style={{ color: upColor }}>{buyPct.toFixed(2)}%</span>
          <span style={{ color: downColor }}>{(100 - buyPct).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   MOBILE-ONLY: combined order book table (Amount | Price | Price | Amount)
   Same depth rank of bids/asks sit side by side in one row, matching the
   Binance-style mobile order book reference. Uses the same buildRows()
   helper as the desktop OrderBookPanel — no new data logic.
   ========================================================================= */
function MobileOrderBookPanel({ depth, viewMode, setViewMode, isDark, upColor, downColor, userId }) {
  const { bids, asks, maxTotal } = useMemo(() => {
    const bidRows = buildRows(depth, "bids", userId);
    const askRows = buildRows(depth, "asks", userId);
    const maxRowTotal = Math.max(
      ...bidRows.map((r) => r.total),
      ...askRows.map((r) => r.total),
      1
    );
    return { bids: bidRows, asks: askRows, maxTotal: maxRowTotal };
  }, [depth, userId]);

  const rowCount = Math.max(bids.length, asks.length);
  const combinedRows = Array.from({ length: rowCount }, (_, i) => ({
    bid: bids[i] || null,
    ask: asks[i] || null,
  }));

  const ownBg = isDark ? "rgba(236,72,153,0.12)" : "rgba(236,72,153,0.08)";

  const SingleRow = ({ r, side }) => (
    <div
      className="relative grid grid-cols-3 gap-1 px-1 py-0.5 text-[11px] font-semibold font-sans tabular-nums"
      style={r.isOwn ? { background: ownBg } : undefined}
    >
      <div
        className="absolute right-0 top-0 bottom-0"
        style={{
          width: `${Math.min(100, (r.total / maxTotal) * 100)}%`,
          background:
            side === "ask"
              ? isDark ? "rgba(239,68,68,0.14)" : "rgba(220,38,38,0.10)"
              : isDark ? "rgba(34,197,94,0.14)" : "rgba(22,163,74,0.10)",
        }}
      />
      <span className="relative z-10 text-left" style={{ color: side === "ask" ? downColor : upColor }}>
        {formatCompact(r.price)}
      </span>
      <span className="relative z-10 text-right text-black dark:text-white">{formatCompact(r.amount)}</span>
      <span className="relative z-10 text-right text-gray-500 dark:text-gray-400">{formatCompact(r.total)}</span>
    </div>
  );

  const singleList = viewMode === "bids" ? bids : asks;
  const isMobileView = typeof window !== "undefined" && window.innerWidth < 1024;

  return (
    <div className="flex flex-col "
      style={{ height: isMobileView ? window.innerHeight - 250 : 380 }}>
      <div className="flex items-center p-1 justify-between border-b border-gray-200 dark:border-gray-800">
        <span className="text-md font-semibold">Order Book</span>
        <div className="flex gap-1">
          {["split", "bids", "asks"].map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              title={m}
              className={`px-1.5 py-1 rounded-sm border transition-colors ${viewMode === m
                ? "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-white"
                : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-900"
                }`}
            >
              <div className="flex flex-col gap-0.5">
                {[0, 1, 2, 3].map((k) => (
                  <div
                    key={k}
                    className="w-3.5 h-0.5"
                    style={{ background: m === "asks" ? downColor : m === "bids" ? upColor : k < 2 ? downColor : upColor }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {viewMode === "split" ? (
        <>
          <div className="grid grid-cols-4 gap-1 px-2 py-1 text-[10px] uppercase text-gray-900 dark:text-gray-400 tracking-wide font-semibold border-b border-gray-200 dark:border-gray-800">
            <span className="text-left">Amount</span>
            <span className="text-left">Price</span>
            <span className="text-right">Price</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {combinedRows.map((r, i) => (
              <div key={i} className="relative grid grid-cols-4 gap-1 px-1 py-0.5 text-[11px] font-semibold font-sans tabular-nums">
                <div className="absolute left-0 top-0 bottom-0 w-1/2" style={r.bid?.isOwn ? { background: ownBg } : undefined} />
                <div className="absolute right-0 top-0 bottom-0 w-1/2" style={r.ask?.isOwn ? { background: ownBg } : undefined} />
                <div
                  className="absolute right-1/2 top-0 bottom-0"
                  style={{
                    width: r.bid ? `${Math.min(50, (r.bid.total / maxTotal) * 50)}%` : 0,
                    background: isDark ? "rgba(34,197,94,0.14)" : "rgba(22,163,74,0.10)",
                  }}
                />
                <div
                  className="absolute left-1/2 top-0 bottom-0"
                  style={{
                    width: r.ask ? `${Math.min(50, (r.ask.total / maxTotal) * 50)}%` : 0,
                    background: isDark ? "rgba(239,68,68,0.14)" : "rgba(220,38,38,0.10)",
                  }}
                />
                <span className="relative z-10 text-left text-black dark:text-white">
                  {r.bid ? formatCompact(r.bid.amount) : ""}
                </span>
                <span className="relative z-10 text-left" style={{ color: upColor }}>
                  {r.bid ? formatCompact(r.bid.price) : ""}
                </span>
                <span className="relative z-10 text-right" style={{ color: downColor }}>
                  {r.ask ? formatCompact(r.ask.price) : ""}
                </span>
                <span className="relative z-10 text-right text-black dark:text-white">
                  {r.ask ? formatCompact(r.ask.amount) : ""}
                </span>
              </div>
            ))}
            {combinedRows.length === 0 && <div className="text-center text-[10px] text-gray-400 py-4">No orders</div>}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1 px-2 py-1 text-[10px] uppercase text-gray-900 dark:text-gray-400 tracking-wide font-semibold border-b border-gray-200 dark:border-gray-800">
            <span className="text-left">Price</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Total</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {singleList.map((r, i) => (
              <SingleRow key={i} r={r} side={viewMode === "bids" ? "bid" : "ask"} />
            ))}
            {singleList.length === 0 && <div className="text-center text-[10px] text-gray-400 py-4">No {viewMode}</div>}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================================
   ORDER ENTRY (Market/Limit, Buy + Sell — same width as the chart above it
   because both live inside the same flex-1 center column)
   ========================================================================= */
function OrderSide({ side, orderMode, price, setPrice, qty, setQty, balance, marketPrice, teamShort, onSubmit, isLoading, isAuthenticated }) {
  const navigate = useNavigate();
  const isBuy = side === "buy";
  const effPrice = orderMode === "market" ? marketPrice : (price ?? marketPrice);
  const total = effPrice * qty;
  const walletBalance = isAuthenticated ? balance : 0;
  const maxQty = effPrice > 0 ? Math.floor(walletBalance / effPrice) : 0;
  const fee = total * 0.03;
  const pcts = [25, 50, 75, 100];

  const handleQtyChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setQty("");
      return;
    }

    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setQty(value);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-sm p-1">
      <div className="flex justify-between mb-1">
        <span className="text-[12px] text-gray-900 dark:text-gray-400 font-medium ">Price</span>
        <span className="text-[12px] text-gray-900 dark:text-gray-400 font-medium ">{orderMode === "market" ? "Market price" : "₹ INR"}</span>
      </div>
      <input
        type="number"
        step="0.01"
        disabled={orderMode === "market"}
        value={orderMode === "market" ? marketPrice.toFixed(2) : price ?? ""}
        onChange={(e) => {
          const value = e.target.value;

          if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
            setPrice(value === "" ? "" : Number(value));
          }
        }}
        className="w-full mb-1 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-400 font-semibold bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-sm disabled:opacity-50 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
      />

      <div className="flex justify-between mb-1">
        <span className="text-[12px] text-gray-900 dark:text-gray-400 font-medium">Amount</span>
        <span className="text-[12px] text-gray-900 dark:text-gray-400 font-medium">{teamShort}</span>
      </div>


      <input
        type="number"
        min="1"
        step="0.01"
        value={qty}
        onChange={handleQtyChange}
        className="w-full mb-1 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-400 font-semibold bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
      />

      <div className="flex gap-1.5 mb-2">
        {pcts.map((p) => (
          <button key={p} onClick={() => setQty(Math.max(1, Math.round((maxQty * p) / 100)))} className="flex-1 text-[10.5px] py-1 text-gray-900 dark:text-gray-400 font-semibold border border-gray-200 dark:border-gray-800 rounded-sm  hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            {p}%
          </button>
        ))}
      </div>

      <div className="space-y-1 mb-1 text-[11px]">
        <div className="flex justify-between text-gray-900 dark:text-gray-400 font-medium"><span>Available</span><span>₹{walletBalance.toLocaleString()}</span></div>
        <div className="flex justify-between text-gray-900 dark:text-gray-400 font-medium"><span>{isBuy ? "Max Buy" : "Max Sell"}</span><span>{maxQty} {teamShort}</span></div>
        <div className="flex justify-between text-gray-900 dark:text-gray-400 font-medium"><span>Est. Fee</span><span>₹{fee.toFixed(2)}</span></div>
        <div className="flex justify-between text-md font-semibold text-black dark:text-white"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
      </div>

      <button
        onClick={isAuthenticated ? onSubmit : () => navigate("/login")}
        disabled={isAuthenticated && (total > balance || isLoading)}
        className={`w-full h-8 py-2 rounded-sm font-bold text-sm text-white transition-colors flex items-center justify-center gap-2 ${isAuthenticated && (total > balance || isLoading)
          ? "bg-gray-400 cursor-not-allowed"
          : isBuy
            ? "bg-[#2A9C70] hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
          }`}
      >
        {!isAuthenticated ? (
          "Login"
        ) : isBuy ? (
          isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Buying...
            </>
          ) : (
            <>Buy {teamShort} for ₹ {total.toFixed(2)}</>
          )
        ) : (
          isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Selling...
            </>
          ) : (
            <>Sell {teamShort} for ₹ {total.toFixed(2)}</>
          )
        )}
      </button>
    </div>
  );
}

function OrderEntry({ orderMode, setOrderMode, current, teamShort, buyQty, setBuyQty, sellQty, setSellQty, buyPrice, setBuyPrice, sellPrice, setSellPrice, onSubmit, balance, buyLoading, sellLoading, isAuthenticated }) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-1">
      <div className="flex gap-2 ">
        {["limit", "market"].map((m) => (
          <button
            key={m}
            onClick={() => setOrderMode(m)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-sm capitalize transition-colors ${orderMode === m ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"}`}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <OrderSide side="buy" orderMode={orderMode} price={buyPrice} setPrice={setBuyPrice} qty={buyQty} setQty={setBuyQty} marketPrice={current.close} balance={balance} teamShort={teamShort} isAuthenticated={isAuthenticated} isLoading={buyLoading} onSubmit={() => onSubmit("buy")} />
        <OrderSide side="sell" orderMode={orderMode} price={sellPrice} setPrice={setSellPrice} qty={sellQty} setQty={setSellQty} marketPrice={current.close} balance={balance} teamShort={teamShort} isAuthenticated={isAuthenticated} isLoading={sellLoading} onSubmit={() => onSubmit("sell")} />
      </div>
    </div>
  );
}

/* =========================================================================
   MOBILE-ONLY: Buy/Sell slide-up sheet. Reuses the exact same OrderSide
   component/fields as desktop OrderEntry — no new fields added.
   ========================================================================= */
function MobileOrderSheet({
  open,
  onClose,
  side,
  setSide,
  orderMode,
  setOrderMode,
  current,
  teamShort,
  balance,
  isAuthenticated,
  buyQty,
  setBuyQty,
  sellQty,
  setSellQty,
  buyPrice,
  setBuyPrice,
  sellPrice,
  setSellPrice,
  onSubmit,
  buyLoading,
  sellLoading,
}) {
  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 inset-x-0 bg-white dark:bg-black rounded-t-lg p-2 max-h-[85vh] overflow-y-auto">
        <div className="flex gap-2 mb-2">
          {["buy", "sell"].map((s) => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-sm capitalize transition-colors ${side === s
                ? s === "buy"
                  ? "bg-[#2A9C70] text-white"
                  : "bg-red-600 text-white"
                : "bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-2">
          {["limit", "market"].map((m) => (
            <button
              key={m}
              onClick={() => setOrderMode(m)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-sm capitalize transition-colors ${orderMode === m ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"}`}
            >
              {m}
            </button>
          ))}
        </div>
        {side === "buy" ? (
          <OrderSide
            side="buy"
            orderMode={orderMode}
            price={buyPrice}
            setPrice={setBuyPrice}
            qty={buyQty}
            setQty={setBuyQty}
            marketPrice={current.close}
            balance={balance}
            teamShort={teamShort}
            isAuthenticated={isAuthenticated}
            isLoading={buyLoading}
            onSubmit={() => onSubmit("buy")}
          />
        ) : (
          <OrderSide
            side="sell"
            orderMode={orderMode}
            price={sellPrice}
            setPrice={setSellPrice}
            qty={sellQty}
            setQty={setSellQty}
            marketPrice={current.close}
            balance={balance}
            teamShort={teamShort}
            isAuthenticated={isAuthenticated}
            isLoading={sellLoading}
            onSubmit={() => onSubmit("sell")}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   RIGHT SIDEBAR — team/stock list (search + rows)
   NOTE: `teams` here comes from the real `stocks` Redux slice (Mongo docs),
   which uses `_id`, not the mock IPL_TEAMS `id`. All id/favorite lookups
   are normalized below via `getId()` so favorites and selection actually work.
   ========================================================================= */
const getId = (t) => t?._id ?? t?.id;

function TeamListPanel({ teams, teamStats, selectedTeamId, onSelect, favorites, onToggleFav, search, setSearch, isLoading }) {
  const filtered = (teams || []).filter(
    (t) =>
      (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.symbol || '').toLowerCase().includes(search.toLowerCase())
  );
  const sorted = [...filtered].sort(
    (a, b) => (favorites.has(getId(b)) ? 1 : 0) - (favorites.has(getId(a)) ? 1 : 0)
  );
  const isMobileView = typeof window !== "undefined" && window.innerWidth < 1024;
  return (
    <div className="flex-1 min-h-0 flex flex-col border-b border-gray-200 dark:border-gray-900"
      style={{ height: isMobileView ? window.innerHeight - 250 : "100%" }}>
      <div className="p-1 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams"
            className="w-full pl-8 pr-1 py-1 text-xs bg-white dark:bg-black text-gray-900 dark:text-gray-400 tracking-wide font-semibold rounded-sm  outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <LoadingSpinner size="sm" text="LOADING TEAMS..." />
          </div>
        ) : (
          <>
            {sorted.map((t) => {
              const id = getId(t);
              const stat = teamStats[id] || { price: t.price ?? 0, changePct: t.changePercent ?? 0 };
              const isSel = id === selectedTeamId;
              const isFav = favorites.has(id);
              return (
                <button
                  key={id}
                  onClick={() => onSelect(id)}
                  className={`w-full flex items-center gap-2 p-1 text-left border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${isSel ? "bg-gray-100 dark:bg-gray-900 border-l-2 border-l-black dark:border-l-white" : ""}`}
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-bold shrink-0 bg-gray-200 dark:bg-gray-800">
                    {t.image ? (
                      <img
                        src={t.image}
                        alt={t.symbol || ""}
                        className="w-full h-full object-cover"
                        style={{
                          imageRendering: "auto",
                        }}
                      />
                    ) : (
                      t.symbol || '--'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{t.title}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 tracking-wide font-semibold truncate">{t.symbol}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[12px] font-bold font-sans text-black dark:text-white">
                      {stat.price >= 0 ? "+" : ""}{stat.price.toFixed(2)}
                    </div>
                    <div className={`text-[10px] font-bold font-sans ${stat.changePct >= 0 ? "text-[#2A9C70]" : "text-[#F6465D]"}`}>
                      {stat.changePct >= 0 ? "+" : ""}{stat.changePct.toFixed(2)}%
                    </div>
                  </div>
                  <Star
                    size={13}
                    onClick={(e) => { e.stopPropagation(); onToggleFav(id); }}
                    className={isFav ? "text-black dark:text-white fill-black dark:fill-white shrink-0" : "text-gray-300 dark:text-gray-700 shrink-0"}
                  />
                </button>
              );
            })}
            {sorted.length === 0 && <div className="text-center text-xs text-gray-400 py-6">No teams match your search</div>}
          </>
        )}
      </div>
    </div>
  );
}




function formatTime(t) {
  const d = t instanceof Date ? t : new Date(t);
  if (isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function TradesPanel({ marketTrades, myTrades, activeTab, setActiveTab, isAuthenticated }) {
  const navigate = useNavigate();


  const list = activeTab === "market" ? marketTrades : myTrades;
  const showLoginPrompt = activeTab === "mine" && !isAuthenticated;
  const isMobileView = typeof window !== "undefined" && window.innerWidth < 1024;
  return (
    <div className="flex-1 min-h-0 flex flex-col"
      style={{ height: isMobileView ? window.innerHeight - 250 : "100%" }}>
      <style>{`
        @keyframes rowIn { from { background-color: rgba(148,163,184,0.35); } to { background-color: transparent; } }
        .trade-row-new { animation: rowIn 0.6s ease-out; }
      `}</style>
      <div className="flex">
        {[["market", "Market Trades"], ["mine", "My Trades"]].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setActiveTab(k)}
            className={`flex-1 px-1 py-1 text-xs font-semibold border-b-2 -mb-px transition-colors ${activeTab === k ? "border-black dark:border-white text-black dark:text-white" : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {!showLoginPrompt && (
        <div className="grid grid-cols-3 gap-1 px-2 py-1 text-[11px]  uppercase text-gray-900 dark:text-gray-400 tracking-wide font-semibold">
          <span className="text-left ml-1">Price</span><span className="text-left ml-3">Qty</span><span className="text-right mr-4">Time</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {showLoginPrompt ? (
          <div className="flex flex-col items-center justify-center gap-2 text-center py-8">
            <span className="text-xs text-gray-400">Log in to see your trades</span>
            <button
              onClick={() => navigate("/login")}
              className="px-3 py-1.5 text-xs font-semibold rounded-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              Log In
            </button>
          </div>
        ) : (
          <>
            {list.length === 0 && <div className="text-center text-xs text-gray-400 py-6">No trades yet</div>}
            {list.map((t, i) => (
              <div key={t.id ?? i} className={`grid grid-cols-3 gap-1   text-[11px] font-semibold font-sans tabular-nums ${i === 0 ? "trade-row-new" : ""}`}>
                <span className={`text-left transition-colors ml-3 font-semibold duration-500 ${t.up ? "text-[#2A9C70]" : "text-[#F6465D]"}`}>{formatCompact(t.price)}</span>
                <span className="text-left ml-4 text-gray-900 dark:text-gray-400 tracking-wide font-semibold">{formatCompact(t.qty)}</span>
                <span className="text-right mr-3 text-gray-900 dark:text-gray-400 tracking-wide font-semibold">{formatTime(t.time)}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}



/* =========================================================================
   MAIN TERMINAL
   ========================================================================= */
export default function CrixchangeTradingTerminal() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
  });
  const [pendingSide, setPendingSide] = useState(null);

  const dispatch = useDispatch();
  const { id: urlStockId } = useParams();
  const [selectedTeamId, setSelectedTeamId] = useState(urlStockId || null);

  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);
  const { orderIsLoading, stocks, stats, isStocksLoading, orderBook, isOrderBookLoaing, trades, myTrades, isTradesLoaing, isMyTradesLoaing } = useSelector((state) => state.trading);

  useEffect(() => {
    if (isAuthenticated && balance === 0) {
      dispatch(getWalletBalance());
    }
    if (!stocks || stocks.length === 0) {
      dispatch(getMarketStocks());
    }
    if (!stats || stats.length === 0) {
      dispatch(getStats());
    }
  }, [dispatch, balance, isAuthenticated]);
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

    const handleTrade = (payload) => {
      if (payload.stockId == selectedTeamId) {

        dispatch(updateTrades(payload.data));
        if (payload.userId == user?.id) {

          dispatch(updateMyTrades(payload.data));
        }
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('stats', (payload) => {
      dispatch(updateStockStat(payload));
    });
    socket.on('depth', (payload) => {
      dispatch(updateOrderBook(payload));
    });
    socket.on('trade', handleTrade);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('stats');
      socket.off('depth');
      socket.off('trade', handleTrade);
      socket.disconnect();
    };
  }, [dispatch, selectedTeamId, user]);



  useEffect(() => {
    const syncTheme = () => {
      const dark = document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
      setIsDark(dark);
    };

    syncTheme();
    window.addEventListener("storage", syncTheme);
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      window.removeEventListener("storage", syncTheme);
      observer.disconnect();
    };
  }, []);

  // selectedTeamId now tracks the REAL stock id (Mongo _id), not the mock
  // IPL_TEAMS id. It is driven by the URL param (/match-performance/:id) so
  // that navigating directly to a link, or clicking a row in TeamListPanel
  // (which updates the URL), both keep this in sync. Falls back to the
  // first loaded stock only when no id is present in the URL at all.


  useEffect(() => {
    if (urlStockId) {
      setSelectedTeamId(urlStockId);

    } else if (!selectedTeamId && stocks && stocks.length > 0) {
      const firstId = getId(stocks[0]);
      setSelectedTeamId(firstId);
      navigate(`/match-performance/${firstId}`, { replace: true });
    }
  }, [urlStockId, stocks, selectedTeamId, navigate]);
  useEffect(() => {
    if (selectedTeamId) {

      dispatch(getOrderBook(selectedTeamId));
      dispatch(getTrades(selectedTeamId));
      if (isAuthenticated) {
        const formData = {
          stockId: selectedTeamId,
          userId: user.id,

        };

        dispatch(getMyTrades(formData));
      }
    }



  }, [dispatch, selectedTeamId]);




  const selectedStock = useMemo(
    () => (stocks || []).find((t) => getId(t) === selectedTeamId),
    [stocks, selectedTeamId]
  );



  // Cosmetic metadata (color/name fallback) still comes from IPL_TEAMS,
  // matched by symbol/short code rather than id — real data drives id/short/name.
  const teamMeta = IPL_TEAMS.find((t) => t.short === selectedStock?.symbol) || IPL_TEAMS[2];
  const selectedTeam = selectedStock
    ? {
      ...teamMeta,
      short: selectedStock.symbol || teamMeta.short,
      name: selectedStock.title || teamMeta.name,
    }
    : teamMeta;

  const seedFor = (id) => (id || "").split("").reduce((s, c) => s + c.charCodeAt(0), 0) * 97 + 50;
  const [seriesByTeam, setSeriesByTeam] = useState(() => {
    const map = {};
    IPL_TEAMS.forEach((t) => { map[t.id] = generateSeries(50 + (seedFor(t.id) % 30), 60, seedFor(t.id)); });
    return map;
  });

  // live tick: every mock team's series grows a little each cycle
  // (kept for the cosmetic per-team sparkline seed; the real chart below
  // no longer reads from this — it reads real trades instead)
  useEffect(() => {
    const iv = setInterval(() => {
      setSeriesByTeam((prev) => {
        const next = { ...prev };
        IPL_TEAMS.forEach((t) => {
          const cur = prev[t.id];
          if (!cur || cur.length >= 120) { next[t.id] = cur; return; }
          const ballNum = cur.length;
          const over = Math.floor(ballNum / 6) + 1;
          const ball = (ballNum % 6) + 1;
          const prevD = cur[cur.length - 1];
          const eventObj = getRandomEvent(Math.random);
          const prevEvent = CRICKET_EVENTS.find((e) => e.label === prevD.event);
          const { priceChange } = getEventPriceChange(eventObj, prevEvent, over, false, Math.random);
          const price = Math.max(10, Math.min(200, prevD.close + priceChange));
          next[t.id] = [...cur, {
            time: over + ball * 0.1,
            open: prevD.close,
            high: Math.max(prevD.close, price) + Math.random() * 0.5,
            low: Math.min(prevD.close, price) - Math.random() * 0.5,
            close: price,
            volume: Math.abs(price - prevD.close) * 8 + Math.random() * 4,
            event: eventObj.label,
          }];
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  // chart series is keyed by mock team id (teamMeta.id) — no longer used
  // to drive the main chart, kept only in case marketTrades/other spots
  // still want the mock sparkline data.
  const ballData = seriesByTeam[teamMeta.id] || [];

  const [interval_, setInterval_] = useState("1m");
  const [chartType, setChartType] = useState("candlestick");
  const [indicators, setIndicators] = useState({ sma: true, ema: false, rsi: false, macd: false, vwap: false, bollinger: false, volume: true });
  const toggleIndicator = (key) => setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));

  // ---------------------------------------------------------------------
  // REAL trade-driven candles (replaces `aggregate(ballData, interval_)`).
  // Full rebuild happens on stock switch, interval switch, or whenever the
  // `trades` array is wholesale-replaced by a fresh getTrades() fetch.
  // A single new trade landing via the 'trade' socket event (which grows
  // `trades` by exactly one) only patches the last candle bucket or
  // appends one new bucket — it never re-scans the whole trade history.
  // ---------------------------------------------------------------------
  const [candlesByInterval, setCandlesByInterval] = useState({});
  const tradesTrackRef = useRef({ stockId: null, interval: null, length: 0 });

  useEffect(() => {
    if (!trades) return;

    const switchedContext =
      tradesTrackRef.current.stockId !== selectedTeamId ||
      tradesTrackRef.current.interval !== interval_;

    const grewByOne =
      !switchedContext && trades.length === tradesTrackRef.current.length + 1;

    if (switchedContext || !grewByOne) {
      // Stock switch, interval switch, or the trades array was reset/
      // replaced by a fresh fetch (not a single incremental push) -> full rebuild.
      setCandlesByInterval((prev) => ({
        ...prev,
        [interval_]: buildCandlesFromTrades(trades, interval_),
      }));
    } else {
      // Exactly one new trade landed via the socket -> patch only.
      // NOTE: assumes `updateTrades` prepends the newest trade (trades[0]).
      // If your reducer appends instead, swap this to trades[trades.length - 1].
      const newestTrade = trades[0];
      setCandlesByInterval((prev) => ({
        ...prev,
        [interval_]: applyTradeToCandles(prev[interval_] || [], newestTrade, interval_),
      }));
    }

    tradesTrackRef.current = { stockId: selectedTeamId, interval: interval_, length: trades.length };
  }, [trades, selectedTeamId, interval_]);

  const candleData = candlesByInterval[interval_] || [];

  // teamStats keyed by REAL stock id so TeamListPanel's lookups (which use
  // the real id) actually resolve. Falls back to the mock series price via symbol match.
  const statsById = useMemo(() => {
    const map = {};
    (stats || []).forEach((s) => {
      map[String(s.id)] = s.data;
    });
    return map;
  }, [stats]);

  const teamStats = useMemo(() => {
    const map = {};
    (stocks || []).forEach((s) => {
      const id = getId(s);
      const stat = statsById[String(id)];
      map[id] = {
        price: stat?.price ?? s.price ?? 0,
        changePct: stat?.changePercent ?? s.changePercent ?? 0,
      };
    });
    return map;
  }, [stocks, statsById]);

  // Real live stat for the currently selected stock — this is what drives
  // the TerminalHeader and OrderBookPanel now, instead of the mock candle
  // math. Only the chart itself keeps reading from candleData (now trade-driven).
  const selectedStat = statsById[String(selectedTeamId)] || {};
  const headerCurrent = { close: selectedStat.price ?? selectedStock?.price ?? 0, img: selectedStock?.image };
  const headerChange = selectedStat.change ?? selectedStock?.change ?? 0;
  const headerChangePct = selectedStat.changePercent ?? selectedStock?.changePercent ?? 0;
  const headerHigh = selectedStat.high ?? selectedStock?.high ?? 0;
  const headerLow = selectedStat.low ?? selectedStock?.low ?? 0;
  const headerVol = selectedStat.volume ?? selectedStock?.volume ?? 0;

  const [viewMode, setViewMode] = useState("split");
  const [orderMode, setOrderMode] = useState("limit");
  const [buyQty, setBuyQty] = useState(1);
  const [sellQty, setSellQty] = useState(1);
  const [buyPrice, setBuyPrice] = useState(null);
  const [sellPrice, setSellPrice] = useState(null);

  // --- Mobile-only UI state (does not affect desktop rendering) ---
  const [mobileTab, setMobileTab] = useState("chart");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileSheetSide, setMobileSheetSide] = useState("buy");




  const [activeTradesTab, setActiveTradesTab] = useState("market");
  const [favorites, setFavorites] = useState(() => new Set());
  const [search, setSearch] = useState("");

  // Market trades: colored by comparison to the PREVIOUS trade's price
  // (real-exchange behavior), not by a static buy/sell side.
  // NOTE: TradesPanel below is wired to the real Redux `trades`/`myTrades`,
  // not this mock-derived value — left in place in case it's needed elsewhere.
  const marketTrades = useMemo(() => {
    const chronological = ballData.slice(-25);
    const withDirection = chronological.map((d, i) => {
      const prevClose = i === 0 ? d.open : chronological[i - 1].close;
      return {
        id: `${selectedTeamId}-${d.time}-${i}`,
        time: `Ov ${d.time.toFixed(1)}`,
        price: d.close,
        qty: +(Math.abs(d.close - d.open) * 0.4 + 0.1).toFixed(2),
        up: d.close >= prevClose,
      };
    });
    return withDirection.reverse();
  }, [ballData, selectedTeamId]);

  const toggleFav = (id) => setFavorites((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Selecting a team now navigates to /match-performance/:id, which the
  // effect above picks up via useParams and syncs back into selectedTeamId.
  // This keeps deep-linking, back/forward nav, and refresh all consistent.
  const handleSelectTeam = (id) => {
    setSelectedTeamId(id);
    navigate(`/match-performance/${id}`);
  };

  const placeOrder = async (side) => {
    if (!selectedTeam || !user) return;
    const formData = {
      side: side.toUpperCase(),
      type: orderMode.toUpperCase(),
      qty: side === "buy" ? buyQty : sellQty,
      price: Math.round(
        (
          orderMode === "market"
            ? headerCurrent.close
            : (side === "buy"
              ? (buyPrice ?? headerCurrent.close)
              : (sellPrice ?? headerCurrent.close))
        ) * 100
      ), market_id: selectedTeam.short,
      timestamp: Date.now(),
      userId: user.id,
    };
    try {
      setPendingSide(side);
      const result = await dispatch(orderPlace(formData));
      const data = result.payload;

      if (orderPlace.fulfilled.match(result)) {
        toast.success(data.message);
      } else if (orderPlace.rejected.match(result)) {
        toast.error(`Failed to place ${orderMode === "market" ? "Market" : "Limit"} ${side.toUpperCase()} order — ${data || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(`Error placing order: ${error.message}`);
    } finally {
      setPendingSide(null);
    }
  };

  // Mobile sheet submit: places the order exactly like desktop, then closes
  // the sheet once the dispatch settles.
  const handleMobileOrderSubmit = async (side) => {
    await placeOrder(side);
    setMobileSheetOpen(false);
  };

  const chartRef = useRef(null);
  const upColor = '#2A9C70';
  const downColor = '#CA3D50';
  const resetSignal = `${selectedTeamId}|${interval_}`;

  return (
    <div className={isDark ? "dark" : ""}>
      <div
        className="bg-white  dark:bg-black text-black mt-10 dark:text-white  font-sans flex flex-col h-[calc(100dvh-2.5rem)] lg:h-screen pb-16 lg:pb-0"
      >
        <TerminalHeader team={selectedTeam} current={headerCurrent} change={headerChange} changePct={headerChangePct} dayHigh={headerHigh} dayLow={headerLow} dayVol={headerVol} />

        <MobileTabBar active={mobileTab} onChange={setMobileTab} />

        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          <div
            className={`${mobileTab === "orderbook" ? "flex" : "hidden"} lg:flex w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 flex-col min-h-0 flex-1 lg:flex-none lg:h-auto`}
          >
            <div className="flex-1 min-h-0 lg:hidden">
              <MobileOrderBookPanel
                depth={orderBook}
                viewMode={viewMode}
                setViewMode={setViewMode}
                isDark={isDark}
                upColor={upColor}
                downColor={downColor}
                userId={user?.id}
              />
            </div>
            <div className="hidden lg:flex lg:flex-col flex-1 min-h-0">
              <OrderBookPanel
                price={headerCurrent.close || 1}
                depth={orderBook}
                viewMode={viewMode}
                setViewMode={setViewMode}
                isDark={isDark}
                upColor={upColor}
                downColor={downColor}
                userId={user?.id}
              />
            </div>
          </div>

          <div className={`${mobileTab === "chart" ? "flex" : "hidden"} lg:flex flex-1 min-w-0 min-h-0 flex-col lg:overflow-y-auto`}>
            <ChartToolbar
              interval_={interval_}
              setInterval_={setInterval_}
              chartType={chartType}
              setChartType={setChartType}
              indicators={indicators}
              toggleIndicator={toggleIndicator}
              onZoomIn={() => chartRef.current && chartRef.current.zoomIn()}
              onZoomOut={() => chartRef.current && chartRef.current.zoomOut()}
              onReset={() => chartRef.current && chartRef.current.reset()}
            />
            <div >
              <TerminalChart

                ref={chartRef}
                data={candleData}
                chartType={chartType}
                indicators={indicators}
                isDark={isDark}
                resetSignal={resetSignal}
                upColor={upColor}
                downColor={downColor}
                interval={interval_}
              />
            </div>
            <div className="hidden lg:block">
              <OrderEntry
                orderMode={orderMode}
                setOrderMode={setOrderMode}
                current={headerCurrent}
                balance={balance}
                teamShort={selectedTeam.short}
                buyQty={buyQty} setBuyQty={setBuyQty}
                sellQty={sellQty} setSellQty={setSellQty}
                buyPrice={buyPrice} setBuyPrice={setBuyPrice}
                sellPrice={sellPrice} setSellPrice={setSellPrice}
                onSubmit={placeOrder}
                isAuthenticated={isAuthenticated}
                buyLoading={orderIsLoading && pendingSide === "buy"}
                sellLoading={orderIsLoading && pendingSide === "sell"}
              />
            </div>
          </div>

          <div
            className={`${(mobileTab === "stocks" || mobileTab === "trades") ? "flex" : "hidden"} lg:flex w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 flex-col min-h-0 flex-1 lg:flex-none`}
          >
            <div className={`${mobileTab === "stocks" ? "flex" : "hidden"} lg:flex flex-1 lg:h-auto lg:flex-1 flex-col min-h-0`}>
              <TeamListPanel
                teams={stocks}
                teamStats={teamStats}
                selectedTeamId={selectedTeamId}
                onSelect={handleSelectTeam}
                favorites={favorites}
                onToggleFav={toggleFav}
                search={search}
                setSearch={setSearch}
                isLoading={isStocksLoading}
              />
            </div>
            <div className={`${mobileTab === "trades" ? "flex" : "hidden"} lg:flex flex-1 lg:h-auto lg:flex-1 flex-col min-h-0`}>
              <TradesPanel marketTrades={trades} myTrades={myTrades} isAuthenticated={isAuthenticated} activeTab={activeTradesTab} setActiveTab={setActiveTradesTab} />
            </div>
          </div>
        </div>

        {/* Mobile-only sticky Buy/Sell bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex gap-2 p-2 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => { setMobileSheetSide("buy"); setMobileSheetOpen(true); }}
            className="flex-1 h-10 rounded-sm font-bold text-sm text-white bg-[#2A9C70] hover:bg-green-700 transition-colors"
          >
            Buy
          </button>
          <button
            onClick={() => { setMobileSheetSide("sell"); setMobileSheetOpen(true); }}
            className="flex-1 h-10 rounded-sm font-bold text-sm text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Sell
          </button>
        </div>

        <MobileOrderSheet
          open={mobileSheetOpen}
          onClose={() => setMobileSheetOpen(false)}
          side={mobileSheetSide}
          setSide={setMobileSheetSide}
          orderMode={orderMode}
          setOrderMode={setOrderMode}
          current={headerCurrent}
          teamShort={selectedTeam.short}
          balance={balance}
          isAuthenticated={isAuthenticated}
          buyQty={buyQty} setBuyQty={setBuyQty}
          sellQty={sellQty} setSellQty={setSellQty}
          buyPrice={buyPrice} setBuyPrice={setBuyPrice}
          sellPrice={sellPrice} setSellPrice={setSellPrice}
          onSubmit={handleMobileOrderSubmit}
          buyLoading={orderIsLoading && pendingSide === "buy"}
          sellLoading={orderIsLoading && pendingSide === "sell"}
        />



      </div>
    </div>
  );
}