import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
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
  if (interval === "1b") return ballData;
  const groupSize =
    interval === "1o" ? 6 : interval === "2o" ? 12 : interval === "5o" ? 30 : interval === "10o" ? 60 : ballData.length || 1;
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

const INTERVALS = [["1b", "1B"], ["1o", "1O"], ["2o", "2O"], ["5o", "5O"], ["10o", "10O"], ["full", "Full"]];

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
    <div className="leading-tight">
      <div className="text-[10.5px] text-gray-400 uppercase tracking-wide">{label}</div>
      <div className={`text-xs font-semibold font-sans ${colorClass || "text-black dark:text-white"}`}>{value}</div>
    </div>
  );
}

function TerminalHeader({ team, current, change, changePct, dayHigh, dayLow, dayVol }) {
  const isUp = change >= 0;
  const colorClass = isUp ? "text-green-600" : "text-red-600";
  return (
    <div className="flex flex-wrap h-11 items-center gap-4 p-1 border-b border-gray-200 dark:border-gray-800 shrink-0">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ background: team.color, color: "#000" }}
        >
          {team.short}
        </div>
        <div>
          <div className="text-[10.5px] font-semibold text-gray-400">{team.name}</div>
          <div className={`flex items-center gap-1 text-md font-bold font-sans leading-tight ${colorClass}`}>
            ₹{current.close.toFixed(2)}
            {isUp ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
          </div>
        </div>
      </div>
      <div className="w-px h-6 bg-gray-200 font-sans dark:bg-white " />
      <StatBlock label="Change" value={`${isUp ? "+" : ""}${change.toFixed(2)} (${changePct.toFixed(2)}%)`} colorClass={colorClass} />
      <StatBlock label="High" value={dayHigh.toFixed(2)} />
      <StatBlock label="Low" value={dayLow.toFixed(2)} />
      <StatBlock label="Volume" value={dayVol.toFixed(0)} />
      
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

  return (
    <div className="flex flex-wrap items-center gap-2 p-0.9 border-b border-gray-200 dark:border-gray-800 shrink-0">
      <div className="flex gap-0.5">
        {INTERVALS.map(([v, label]) => (
          <button
            key={v}
            onClick={() => setInterval_(v)}
            className={`px-2.5 py-1 text-xs font-medium rounded-sm  transition-colors ${
              interval_ === v
                ? "bg-black text-white dark:bg-white dark:text-black "
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-gray-200 dark:bg-gray-800" />

      <ToolbarDropdown
        label={CHART_TYPES.find((c) => c.key === chartType)?.label || "Chart type"}
        isOpen={chartTypeOpen}
        onToggle={() => { setChartTypeOpen((v) => !v); setIndicatorsOpen(false); }}
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
        onToggle={() => { setIndicatorsOpen((v) => !v); setChartTypeOpen(false); }}
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
  { data, chartType, indicators, isDark, resetSignal, upColor, downColor },
  ref
) {
  const svgRef = useRef(null);
  const followLive = useRef(true);
  const dragState = useRef({ dragging: false, startX: 0, startViewStart: 0 });

  const [viewLen, setViewLen] = useState(() => Math.min(50, Math.max(1, data.length)));
  const [viewStart, setViewStart] = useState(() => Math.max(0, data.length - Math.min(50, Math.max(1, data.length))));
  const [hoverI, setHoverI] = useState(null);

  useEffect(() => {
    const initLen = Math.min(50, Math.max(1, data.length));
    setViewLen(initLen);
    setViewStart(Math.max(0, data.length - initLen));
    followLive.current = true;
    setHoverI(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  useEffect(() => {
    setViewStart((vs) => {
      if (followLive.current) return Math.max(0, data.length - viewLen);
      return Math.max(0, Math.min(Math.max(0, data.length - viewLen), vs));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length]);

  const zoomBy = useCallback((factor, anchorFrac) => {
    setViewLen((prevLen) => {
      const newLen = Math.max(5, Math.min(data.length || 1, Math.round(prevLen * factor)));
      setViewStart((prevStart) => {
        const anchorIdx = prevStart + prevLen * anchorFrac;
        let newStart = Math.round(anchorIdx - newLen * anchorFrac);
        newStart = Math.max(0, Math.min(Math.max(0, data.length - newLen), newStart));
        followLive.current = newStart + newLen >= data.length - 1;
        return newStart;
      });
      return newLen;
    });
  }, [data.length]);

  const resetView = useCallback(() => {
    const initLen = Math.min(50, Math.max(1, data.length));
    setViewLen(initLen);
    setViewStart(Math.max(0, data.length - initLen));
    followLive.current = true;
  }, [data.length]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => zoomBy(0.8, 0.5),
    zoomOut: () => zoomBy(1.25, 0.5),
    reset: resetView,
  }), [zoomBy, resetView]);

  const handleWheel = (e) => {
    if (!svgRef.current) return;
    try { e.preventDefault(); } catch (err) { /* passive listener, ignore */ }
    const rect = svgRef.current.getBoundingClientRect();
    const frac = rect.width ? Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) : 0.5;
    zoomBy(e.deltaY > 0 ? 1.15 : 1 / 1.15, frac);
  };

  const handleMouseDown = (e) => {
    dragState.current = { dragging: true, startX: e.clientX, startViewStart: viewStart };
  };
  const endDrag = () => { dragState.current.dragging = false; };

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = rect.width ? W / rect.width : 1;
    const px = (e.clientX - rect.left) * scaleX;
    const chartW = W - PAD_L - PAD_R;
    const nVis = Math.max(1, Math.min(viewLen, data.length - viewStart));
    const step = nVis > 1 ? chartW / (nVis - 1) : 0;
    let idx = step ? Math.round((px - PAD_L) / step) : 0;
    idx = Math.max(0, Math.min(nVis - 1, idx));
    setHoverI(idx);

    if (dragState.current.dragging) {
      const deltaPx = (e.clientX - dragState.current.startX) * scaleX;
      const deltaCandles = step ? Math.round(-deltaPx / step) : 0;
      let newStart = dragState.current.startViewStart + deltaCandles;
      newStart = Math.max(0, Math.min(Math.max(0, data.length - viewLen), newStart));
      followLive.current = newStart + viewLen >= data.length - 1;
      setViewStart(newStart);
    }
  };

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

  const visible = data.slice(viewStart, viewStart + viewLen);
  const n = visible.length;

  const subSpecs = [];
  if (indicators.volume) subSpecs.push({ key: "volume", h: 56, label: "Volume" });
  if (indicators.rsi) subSpecs.push({ key: "rsi", h: 56, label: "RSI (14)" });
  if (indicators.macd) subSpecs.push({ key: "macd", h: 72, label: "MACD (12, 26, 9)" });

  const mainTop = 10, mainH = 290, GAP = 14, TIME_H = 22;
  const mainBottom = mainTop + mainH;
  let cursor = mainBottom + GAP;
  const panes = subSpecs.map((s) => { const top = cursor, bottom = top + s.h; cursor = bottom + GAP; return { ...s, top, bottom }; });
  const totalH = (panes.length ? panes[panes.length - 1].bottom : mainBottom) + TIME_H;

  const GRID = isDark ? "#27272a" : "#9CA3AF";
  const AXIS = isDark ? "#9ca3af" : "#71717a";
  const NEUTRAL_LINE = isDark ? "#e5e7eb" : "#111827";
  const SMA_C = "#F0B90B", EMA_C = "#3B82F6", VWAP_C = "#A855F7", BOLL_C = "#14B8A6", MACD_C = "#3B82F6", SIGNAL_C = "#F0B90B", RSI_C = "#A855F7";

  if (!n) {
    return <div className="h-72 flex items-center justify-center text-gray-400 text-sm border border-gray-200 dark:border-gray-800 rounded-sm">Waiting for data…</div>;
  }

  const chartW = W - PAD_L - PAD_R;
  const step = n > 1 ? chartW / (n - 1) : 0;
  const x = (i) => PAD_L + i * step;
  const candleW = Math.max(1.5, Math.min(step * 0.62, 16));

  const sliceInd = (arr) => (arr ? arr.slice(viewStart, viewStart + viewLen) : null);
  const smaVis = indicators.sma ? sliceInd(indicatorSeries.sma) : null;
  const emaVis = indicators.ema ? sliceInd(indicatorSeries.ema) : null;
  const vwapVis = indicators.vwap ? sliceInd(indicatorSeries.vwap) : null;
  const bollVis = indicators.bollinger ? {
    upper: sliceInd(indicatorSeries.bollinger.upper),
    mid: sliceInd(indicatorSeries.bollinger.mid),
    lower: sliceInd(indicatorSeries.bollinger.lower),
  } : null;

  const lows = visible.map((d) => d.low), highs = visible.map((d) => d.high);
  const extra = [];
  if (smaVis) extra.push(...smaVis.filter((v) => v != null));
  if (emaVis) extra.push(...emaVis.filter((v) => v != null));
  if (vwapVis) extra.push(...vwapVis.filter((v) => v != null));
  if (bollVis) { extra.push(...bollVis.upper.filter((v) => v != null)); extra.push(...bollVis.lower.filter((v) => v != null)); }

  let minP = Math.min(...lows, ...(extra.length ? extra : [Math.min(...lows)]));
  let maxP = Math.max(...highs, ...(extra.length ? extra : [Math.max(...highs)]));
  const pricePad = (maxP - minP) * 0.1 || 1;
  minP -= pricePad; maxP += pricePad;
  const yMain = (p) => mainTop + mainH - ((p - minP) / ((maxP - minP) || 1)) * (mainH - 16) - 8;

  const linePath = visible.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${yMain(d.close)}`).join(" ");
  const trendColor = visible[n - 1].close >= visible[0].open ? upColor : downColor;
  const areaPath = `${linePath} L${x(n - 1)},${mainBottom - 8} L${x(0)},${mainBottom - 8} Z`;
  const baseline = visible[0].open;
  const baselineY = yMain(baseline);
  const baselineAreaPath = `${linePath} L${x(n - 1)},${baselineY} L${x(0)},${baselineY} Z`;

  const toPath = (arr, yfn) => arr.map((v, i) => (v == null ? null : `${i === 0 || arr[i - 1] == null ? "M" : "L"}${x(i)},${yfn(v)}`)).filter(Boolean).join(" ");

  const priceTicks = Array.from({ length: 6 }, (_, i) => minP + (maxP - minP) * i / 5);
  const timeTickIdx = Array.from({ length: Math.min(6, n) }, (_, i) => Math.round(i * (n - 1) / Math.max(1, Math.min(6, n) - 1)));

  const safeHoverIdx = hoverI != null ? Math.min(Math.max(hoverI, 0), Math.max(0, n - 1)) : Math.max(0, n - 1);
  const hoverD = visible[safeHoverIdx] ?? visible[n - 1];
  const hoverUp = hoverD ? hoverD.close >= hoverD.open : false;
  const chgAbs = hoverD ? hoverD.close - hoverD.open : 0;
  const chgPct = hoverD && hoverD.open ? (chgAbs / hoverD.open) * 100 : 0;
  const rangePct = hoverD && hoverD.open ? ((hoverD.high - hoverD.low) / hoverD.open) * 100 : 0;
  const readIdx = safeHoverIdx;

  return (
    <div className="relative " onMouseUp={endDrag} onMouseLeave={endDrag}>
      <div className="flex flex-wrap  items-center gap-x-4 gap-y-1 text-[11px] font-sans px-1">
        <span className={hoverUp ? "text-green-600" : "text-red-600"}>O <b>{hoverD.open.toFixed(2)}</b></span>
        <span className={hoverUp ? "text-green-600" : "text-red-600"}>H <b>{hoverD.high.toFixed(2)}</b></span>
        <span className={hoverUp ? "text-green-600" : "text-red-600"}>L <b>{hoverD.low.toFixed(2)}</b></span>
        <span className={hoverUp ? "text-green-600" : "text-red-600"}>C <b>{hoverD.close.toFixed(2)}</b></span>
        <span className="text-gray-400">Chg <b className={chgAbs >= 0 ? "text-green-600" : "text-red-600"}>{chgPct.toFixed(2)}%</b></span>
        <span className="text-gray-400">Range <b className="text-black dark:text-white">{rangePct.toFixed(2)}%</b></span>
        {indicators.sma && <span style={{ color: SMA_C }}>SMA(5) {smaVis && smaVis[readIdx] != null ? smaVis[readIdx].toFixed(2) : "—"}</span>}
        {indicators.ema && <span style={{ color: EMA_C }}>EMA(9) {emaVis && emaVis[readIdx] != null ? emaVis[readIdx].toFixed(2) : "—"}</span>}
        {indicators.vwap && <span style={{ color: VWAP_C }}>VWAP {vwapVis && vwapVis[readIdx] != null ? vwapVis[readIdx].toFixed(2) : "—"}</span>}
        {indicators.bollinger && <span style={{ color: BOLL_C }}>BB(20,2)</span>}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${totalH}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: totalH, display: "block", cursor: "crosshair" }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        onDoubleClick={resetView}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={trendColor} stopOpacity="0.02" />
          </linearGradient>
          <clipPath id="clipAbove"><rect x={PAD_L} y={mainTop} width={chartW} height={Math.max(0, baselineY - mainTop)} /></clipPath>
          <clipPath id="clipBelow"><rect x={PAD_L} y={baselineY} width={chartW} height={Math.max(0, mainBottom - baselineY)} /></clipPath>
        </defs>

        {priceTicks.map((p, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={PAD_L + chartW} y1={yMain(p)} y2={yMain(p)} stroke={GRID} strokeWidth="1" />
            <text x={PAD_L + chartW + 6} y={yMain(p) + 4} fontSize="10.5" fill={AXIS}>{p.toFixed(2)}</text>
          </g>
        ))}

        {chartType === "candlestick" && visible.map((d, i) => {
          const up = d.close >= d.open;
          const col = up ? upColor : downColor;
          return (
            <g key={i}>
              <line x1={x(i)} x2={x(i)} y1={yMain(d.high)} y2={yMain(d.low)} stroke={col} strokeWidth="1" />
              <rect x={x(i) - candleW / 2} y={Math.min(yMain(d.open), yMain(d.close))} width={candleW} height={Math.max(1, Math.abs(yMain(d.open) - yMain(d.close)))} fill={col} />
            </g>
          );
        })}

        {chartType === "bar" && visible.map((d, i) => {
          const up = d.close >= d.open;
          const col = up ? upColor : downColor;
          const tick = candleW / 2;
          return (
            <g key={i} stroke={col} strokeWidth="1.4">
              <line x1={x(i)} x2={x(i)} y1={yMain(d.high)} y2={yMain(d.low)} />
              <line x1={x(i) - tick} x2={x(i)} y1={yMain(d.open)} y2={yMain(d.open)} />
              <line x1={x(i)} x2={x(i) + tick} y1={yMain(d.close)} y2={yMain(d.close)} />
            </g>
          );
        })}

        {chartType === "area" && (
          <>
            <path d={areaPath} fill="url(#areaFill)" stroke="none" />
            <path d={linePath} fill="none" stroke={trendColor} strokeWidth="1.8" />
          </>
        )}

        {chartType === "line" && <path d={linePath} fill="none" stroke={trendColor} strokeWidth="1.8" />}

        {chartType === "baseline" && (
          <>
            <path d={baselineAreaPath} fill={upColor} fillOpacity="0.22" clipPath="url(#clipAbove)" />
            <path d={baselineAreaPath} fill={downColor} fillOpacity="0.22" clipPath="url(#clipBelow)" />
            <path d={linePath} fill="none" stroke={NEUTRAL_LINE} strokeWidth="1.6" />
            <line x1={PAD_L} x2={PAD_L + chartW} y1={baselineY} y2={baselineY} stroke={AXIS} strokeDasharray="3,3" strokeWidth="1" />
          </>
        )}

        {indicators.bollinger && bollVis && (
          <>
            <path d={toPath(bollVis.upper, yMain)} fill="none" stroke={BOLL_C} strokeWidth="1" strokeDasharray="2,2" />
            <path d={toPath(bollVis.lower, yMain)} fill="none" stroke={BOLL_C} strokeWidth="1" strokeDasharray="2,2" />
            <path d={toPath(bollVis.mid, yMain)} fill="none" stroke={BOLL_C} strokeWidth="1" />
          </>
        )}
        {indicators.sma && smaVis && <path d={toPath(smaVis, yMain)} fill="none" stroke={SMA_C} strokeWidth="1.4" />}
        {indicators.ema && emaVis && <path d={toPath(emaVis, yMain)} fill="none" stroke={EMA_C} strokeWidth="1.4" />}
        {indicators.vwap && vwapVis && <path d={toPath(vwapVis, yMain)} fill="none" stroke={VWAP_C} strokeWidth="1.4" />}

        {panes.map((pane) => {
          if (pane.key === "volume") {
            const maxVol = Math.max(...visible.map((d) => d.volume), 1);
            const yVol = (v) => pane.bottom - (v / maxVol) * (pane.h - 8);
            return (
              <g key="volume">
                <line x1={PAD_L} x2={PAD_L + chartW} y1={pane.top} y2={pane.top} stroke={GRID} strokeWidth="1" />
                <text x={PAD_L} y={pane.top + 10} fontSize="10" fill={AXIS}>{pane.label}</text>
                {visible.map((d, i) => {
                  const up = d.close >= d.open;
                  return <rect key={i} x={x(i) - candleW / 2} y={yVol(d.volume)} width={candleW} height={pane.bottom - yVol(d.volume)} fill={up ? upColor : downColor} fillOpacity="0.45" />;
                })}
              </g>
            );
          }
          if (pane.key === "rsi" && indicators.rsi) {
            const rsiVis = sliceInd(indicatorSeries.rsi);
            const yRsi = (v) => pane.bottom - (v / 100) * (pane.h - 10) - 5;
            return (
              <g key="rsi">
                <line x1={PAD_L} x2={PAD_L + chartW} y1={pane.top} y2={pane.top} stroke={GRID} strokeWidth="1" />
                <text x={PAD_L} y={pane.top + 10} fontSize="10" fill={AXIS}>{pane.label}</text>
                <line x1={PAD_L} x2={PAD_L + chartW} y1={yRsi(70)} y2={yRsi(70)} stroke={GRID} strokeDasharray="2,2" />
                <line x1={PAD_L} x2={PAD_L + chartW} y1={yRsi(30)} y2={yRsi(30)} stroke={GRID} strokeDasharray="2,2" />
                <path d={toPath(rsiVis, yRsi)} fill="none" stroke={RSI_C} strokeWidth="1.4" />
              </g>
            );
          }
          if (pane.key === "macd" && indicators.macd) {
            const macdVis = sliceInd(indicatorSeries.macd.macdLine);
            const signalVis = sliceInd(indicatorSeries.macd.signalLine);
            const histVis = sliceInd(indicatorSeries.macd.histogram);
            const absVals = [...macdVis, ...signalVis, ...histVis].filter((v) => v != null).map((v) => Math.abs(v));
            const absMax = Math.max(1e-6, ...(absVals.length ? absVals : [1]));
            const yMacd = (v) => pane.top + pane.h / 2 - (v / absMax) * (pane.h / 2 - 8);
            return (
              <g key="macd">
                <line x1={PAD_L} x2={PAD_L + chartW} y1={pane.top} y2={pane.top} stroke={GRID} strokeWidth="1" />
                <text x={PAD_L} y={pane.top + 10} fontSize="10" fill={AXIS}>{pane.label}</text>
                <line x1={PAD_L} x2={PAD_L + chartW} y1={yMacd(0)} y2={yMacd(0)} stroke={GRID} strokeWidth="1" />
                {visible.map((_, i) => histVis[i] != null ? (
                  <rect key={i} x={x(i) - candleW / 2} y={Math.min(yMacd(0), yMacd(histVis[i]))} width={candleW} height={Math.max(1, Math.abs(yMacd(histVis[i]) - yMacd(0)))} fill={histVis[i] >= 0 ? upColor : downColor} fillOpacity="0.5" />
                ) : null)}
                <path d={toPath(macdVis, yMacd)} fill="none" stroke={MACD_C} strokeWidth="1.3" />
                <path d={toPath(signalVis, yMacd)} fill="none" stroke={SIGNAL_C} strokeWidth="1.3" />
              </g>
            );
          }
          return null;
        })}

        {timeTickIdx.map((i, k) => (
          <text key={k} x={x(i)} y={totalH - 6} fontSize="10" fill={AXIS} textAnchor="middle">{visible[i] ? visible[i].time.toFixed(1) : ""}</text>
        ))}

        {hoverI != null && (
          <>
            <line x1={x(hoverI)} x2={x(hoverI)} y1={mainTop} y2={panes.length ? panes[panes.length - 1].bottom : mainBottom} stroke={AXIS} strokeDasharray="3,3" strokeWidth="1" />
            <line x1={PAD_L} x2={PAD_L + chartW} y1={yMain(hoverD.close)} y2={yMain(hoverD.close)} stroke={AXIS} strokeDasharray="3,3" strokeWidth="1" />
            <rect x={PAD_L + chartW} y={yMain(hoverD.close) - 8} width={PAD_R - 2} height="16" fill={hoverUp ? upColor : downColor} />
            <text x={PAD_L + chartW + 6} y={yMain(hoverD.close) + 4} fontSize="10.5" fill="#fff">{hoverD.close.toFixed(2)}</text>
          </>
        )}
      </svg>
    </div>
  );
});

/* =========================================================================
   ORDER BOOK (left panel — fills full height, view mode split/bids/asks)
   ========================================================================= */
function OrderBookPanel({ price, viewMode, setViewMode, isDark, upColor, downColor }) {
  const rows = useMemo(() => {
    const step = Math.max(0.05, price * 0.0015);
    const asks = [], bids = [];
    let cumA = 0, cumB = 0;
    for (let i = 12; i >= 1; i--) { const amt = +(Math.random() * 900 + 20).toFixed(2); cumA += amt; asks.push({ price: +(price + step * i).toFixed(2), amount: amt, total: cumA }); }
    for (let i = 1; i <= 12; i++) { const amt = +(Math.random() * 900 + 20).toFixed(2); cumB += amt; bids.push({ price: +(price - step * i).toFixed(2), amount: amt, total: cumB }); }
    const maxTotal = Math.max(cumA, cumB, 1);
    return { asks, bids, maxTotal, cumA, cumB };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.round(price * 20)]);

  const buyPct = rows.cumA + rows.cumB > 0 ? (rows.cumB / (rows.cumA + rows.cumB)) * 100 : 50;

  const Row = ({ r, side }) => (
    <div className="relative grid grid-cols-3 gap-1 px-1 py-0.2  text-[11px] font-semibold font-sans tabular-nums">
      <div
        className="absolute right-0 top-0 bottom-0"
        style={{
          width: `${Math.min(100, (r.total / rows.maxTotal) * 100)}%`,
          background: side === "ask" ? (isDark ? "rgba(239,68,68,0.14)" : "rgba(220,38,38,0.10)") : (isDark ? "rgba(34,197,94,0.14)" : "rgba(22,163,74,0.10)"),
        }}
      />
      <span className="relative z-10 text-left" style={{ color: side === "ask" ? downColor : upColor }}>{r.price.toFixed(2)}</span>
      <span className="relative z-10 text-right text-black dark:text-white">{r.amount.toFixed(2)}</span>
      <span className="relative z-10 text-right text-gray-500 dark:text-gray-400">{r.total.toFixed(0)}</span>
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
              className={`px-1.5 py-1 rounded-sm border transition-colors ${viewMode === m ? "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-white" : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-900"}`}
            >
              <div className="flex flex-col gap-0.5">
                {[0, 1, 2, 3].map((k) => (
                  <div key={k} className="w-3.5 h-0.5" style={{ background: m === "asks" ? downColor : m === "bids" ? upColor : k < 2 ? downColor : upColor }} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 px-2 py-1 text-[10px] uppercase text-gray-900 dark:text-gray-400 tracking-wide font-semibold">
        <span className="text-left">Price</span><span className="text-right">Amount</span><span className="text-right">Total</span>
      </div>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {viewMode !== "bids" && (
          <div className="flex-1 overflow-hidden flex flex-col-reverse">
            {rows.asks.slice(viewMode === "split" ? -8 : -14).map((r, i) => <Row key={i} r={r} side="ask" />)}
          </div>
        )}
        <div className="px-2 py-1  flex items-center gap-2">
          <span className="text-base font-bold font-sans" style={{ color: upColor }}>{price.toFixed(2)}</span>
          <span className="text-[11.5px] text-gray-400">live price</span>
        </div>
        {viewMode !== "asks" && (
          <div className="flex-1 overflow-hidden">
            {rows.bids.slice(0, viewMode === "split" ? 8 : 14).map((r, i) => <Row key={i} r={r} side="bid" />)}
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
   ORDER ENTRY (Market/Limit, Buy + Sell — same width as the chart above it
   because both live inside the same flex-1 center column)
   ========================================================================= */
function OrderSide({ side, orderMode, price, setPrice, qty, setQty, marketPrice, teamShort, onSubmit }) {
  const isBuy = side === "buy";
  const effPrice = orderMode === "market" ? marketPrice : (price ?? marketPrice);
  const total = effPrice * qty;
  const walletBalance = 50000;
  const maxQty = effPrice > 0 ? Math.floor(walletBalance / effPrice) : 0;
  const fee = total * 0.001;
  const pcts = [25, 50, 75, 100];

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-sm p-1">
      <div className="flex justify-between mb-1">
        <span className="text-[12px] text-gray-900 dark:text-gray-400 font-medium ">Price</span>
        <span className="text-[12px] text-gray-900 dark:text-gray-400 font-medium ">{orderMode === "market" ? "Market price" : "₹ INR"}</span>
      </div>
      <input
        type="number"
        disabled={orderMode === "market"}
        value={orderMode === "market" ? marketPrice.toFixed(2) : price ?? ""}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="w-full mb-1 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-400 font-semibold bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-sm disabled:opacity-50 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
      />

      <div className="flex justify-between mb-1">
        <span className="text-[12px] text-gray-900 dark:text-gray-400 font-medium">Amount</span>
        <span className="text-[12px] text-gray-900 dark:text-gray-400 font-medium">{teamShort}</span>
      </div>
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
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

      <button onClick={onSubmit} className={`w-full h-8 py-2 rounded-sm font-bold text-sm text-white transition-colors ${isBuy ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
        {isBuy ? "Buy" : "Sell"} {teamShort} for ₹ {total.toFixed(2)}
      </button>
    </div>
  );
}

function OrderEntry({ orderMode, setOrderMode, current, teamShort, buyQty, setBuyQty, sellQty, setSellQty, buyPrice, setBuyPrice, sellPrice, setSellPrice, onSubmit }) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-1">
      <div className="flex gap-2 ">
        {["limit", "market"].map((m) => (
          <button
            key={m}
            onClick={() => setOrderMode(m)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-sm  capitalize transition-colors ${orderMode === m ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"}`}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <OrderSide side="buy" orderMode={orderMode} price={buyPrice} setPrice={setBuyPrice} qty={buyQty} setQty={setBuyQty} marketPrice={current.close} teamShort={teamShort} onSubmit={() => onSubmit("buy")} />
        <OrderSide side="sell" orderMode={orderMode} price={sellPrice} setPrice={setSellPrice} qty={sellQty} setQty={setSellQty} marketPrice={current.close} teamShort={teamShort} onSubmit={() => onSubmit("sell")} />
      </div>
    </div>
  );
}

/* =========================================================================
   RIGHT SIDEBAR — team/stock list (search + rows) and trades tabs
   ========================================================================= */
function TeamListPanel({ teams, teamStats, selectedTeamId, onSelect, favorites, onToggleFav, search, setSearch }) {
  const filtered = teams.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.short.toLowerCase().includes(search.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => (favorites.has(b.id) ? 1 : 0) - (favorites.has(a.id) ? 1 : 0));

  return (
    <div className="flex-1 min-h-0 flex flex-col border-b border-gray-200 dark:border-gray-900">
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
        {sorted.map((t) => {
          const stat = teamStats[t.id] || { price: 0, changePct: 0 };
          const isSel = t.id === selectedTeamId;
          const isFav = favorites.has(t.id);
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`w-full flex items-center gap-2 p-1 text-left border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${isSel ? "bg-gray-100 dark:bg-gray-900 border-l-2 border-l-black dark:border-l-white" : ""}`}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: t.color, color: "#000" }}>{t.short}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{t.short}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 tracking-wide font-semibold truncate">{t.name}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[0.68rem] font-sans">₹{stat.price.toFixed(2)}</div>
                <div className={`text-[9px] font-sans ${stat.changePct >= 0 ? "text-green-600" : "text-red-600"}`}>{stat.changePct >= 0 ? "+" : ""}{stat.changePct.toFixed(2)}%</div>
              </div>
              <Star
                size={13}
                onClick={(e) => { e.stopPropagation(); onToggleFav(t.id); }}
                className={isFav ? "text-black dark:text-white fill-black dark:fill-white shrink-0" : "text-gray-300 dark:text-gray-700 shrink-0"}
              />
            </button>
          );
        })}
        {sorted.length === 0 && <div className="text-center text-xs text-gray-400 py-6">No teams match your search</div>}
      </div>
    </div>
  );
}

function TradesPanel({ marketTrades, myTrades, activeTab, setActiveTab }) {
  const list = activeTab === "market" ? marketTrades : myTrades;
  return (
    <div className="flex-1 min-h-0 flex flex-col">
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
      <div className="grid grid-cols-3 gap-1 px-2 py-1 text-[11px]  uppercase text-gray-900 dark:text-gray-400 tracking-wide font-semibold">
        <span className="text-left ml-1">Price</span><span className="text-left ml-3">Qty</span><span className="text-right mr-4">Time</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {list.length === 0 && <div className="text-center text-xs text-gray-400 py-6">No trades yet</div>}
        {list.map((t, i) => (
          <div key={t.id ?? i} className={`grid grid-cols-3 gap-1   text-[11px] font-semibold font-sans tabular-nums ${i === 0 ? "trade-row-new" : ""}`}>
            
            <span className={`text-left transition-colors ml-3 font-semibold duration-500 ${t.up ? "text-green-600" : "text-red-600"}`}>{t.price.toFixed(2)}</span>
            <span className="text-left ml-4 text-gray-900 dark:text-gray-400 tracking-wide font-semibold">{t.qty}</span>
            <span className="text-right mr-3 text-gray-900 dark:text-gray-400 tracking-wide font-semibold">{t.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN TERMINAL
   ========================================================================= */
export default function CrixchangeTradingTerminal() {
  const isDark = false; // theme is fixed to the app's light design system — no manual toggle
  const [selectedTeamId, setSelectedTeamId] = useState(IPL_TEAMS[2].id);
  const selectedTeam = IPL_TEAMS.find((t) => t.id === selectedTeamId);

  const seedFor = (id) => id.split("").reduce((s, c) => s + c.charCodeAt(0), 0) * 97 + 50;
  const [seriesByTeam, setSeriesByTeam] = useState(() => {
    const map = {};
    IPL_TEAMS.forEach((t) => { map[t.id] = generateSeries(50 + (seedFor(t.id) % 30), 60, seedFor(t.id)); });
    return map;
  });

  // live tick: every team's series grows a little each cycle, so the
  // watchlist and the active chart both feel live
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

  const ballData = seriesByTeam[selectedTeamId] || [];

  const [interval_, setInterval_] = useState("1b");
  const [chartType, setChartType] = useState("candlestick");
  const [indicators, setIndicators] = useState({ sma: true, ema: false, rsi: false, macd: false, vwap: false, bollinger: false, volume: true });
  const toggleIndicator = (key) => setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));

  const candleData = useMemo(() => aggregate(ballData, interval_), [ballData, interval_]);
  const current = candleData[candleData.length - 1] || { close: 0, open: 0, high: 0, low: 0, time: 0 };
  const first = ballData[0] || { open: current.close || 1 };
  const change = current.close - first.open;
  const changePct = first.open ? (change / first.open) * 100 : 0;
  const dayHigh = ballData.length ? Math.max(...ballData.map((d) => d.high)) : 0;
  const dayLow = ballData.length ? Math.min(...ballData.map((d) => d.low)) : 0;
  const dayVol = ballData.reduce((s, d) => s + d.volume, 0);

  const teamStats = useMemo(() => {
    const map = {};
    IPL_TEAMS.forEach((t) => {
      const s = seriesByTeam[t.id];
      if (!s || !s.length) { map[t.id] = { price: 0, changePct: 0 }; return; }
      const last = s[s.length - 1].close;
      const f = s[0].open;
      map[t.id] = { price: last, changePct: f ? ((last - f) / f) * 100 : 0 };
    });
    return map;
  }, [seriesByTeam]);

  const [viewMode, setViewMode] = useState("split");
  const [orderMode, setOrderMode] = useState("limit");
  const [buyQty, setBuyQty] = useState(1);
  const [sellQty, setSellQty] = useState(1);
  const [buyPrice, setBuyPrice] = useState(null);
  const [sellPrice, setSellPrice] = useState(null);
  useEffect(() => { setBuyPrice(current.close); setSellPrice(current.close); }, [current.close]);

  const [toast, setToast] = useState(null);
  const [myTrades, setMyTrades] = useState([]);
  const [activeTradesTab, setActiveTradesTab] = useState("market");
  const [favorites, setFavorites] = useState(() => new Set());
  const [search, setSearch] = useState("");

  // Market trades: colored by comparison to the PREVIOUS trade's price
  // (real-exchange behavior), not by a static buy/sell side.
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

  const placeOrder = (side) => {
    const qty = side === "buy" ? buyQty : sellQty;
    const price = orderMode === "market" ? current.close : (side === "buy" ? (buyPrice ?? current.close) : (sellPrice ?? current.close));
    setMyTrades((prev) => [{ id: `mine-${Date.now()}`, time: `Ov ${current.time.toFixed(1)}`, price, qty, up: side === "buy" }, ...prev].slice(0, 30));
    setToast(`${orderMode === "market" ? "Market" : "Limit"} ${side.toUpperCase()} order placed — ${qty} ${selectedTeam.short} @ ₹${price.toFixed(2)}`);
    setTimeout(() => setToast(null), 2500);
  };

  const chartRef = useRef(null);
  const upColor = isDark ? "#22c55e" : "#16a34a";
  const downColor = isDark ? "#ef4444" : "#dc2626";
  const resetSignal = `${selectedTeamId}|${interval_}`;

  return (
    <div className={isDark ? "dark" : ""}>
      <div
        className="bg-white  dark:bg-black text-black dark:text-white mt-12 font-sans flex flex-col min-h-screen lg:h-screen"
      >
        <TerminalHeader team={selectedTeam} current={current} change={change} changePct={changePct} dayHigh={dayHigh} dayLow={dayLow} dayVol={dayVol} />

        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          <div className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 flex flex-col min-h-0 h-72 lg:h-auto">
            <OrderBookPanel price={current.close || 1} viewMode={viewMode} setViewMode={setViewMode} isDark={isDark} upColor={upColor} downColor={downColor} />
          </div>

          <div className="flex-1 min-w-0 flex flex-col lg:overflow-y-auto">
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
            <div className="px-3 py-2">
              <TerminalChart
                ref={chartRef}
                data={candleData}
                chartType={chartType}
                indicators={indicators}
                isDark={isDark}
                resetSignal={resetSignal}
                upColor={upColor}
                downColor={downColor}
              />
            </div>
            <OrderEntry
              orderMode={orderMode}
              setOrderMode={setOrderMode}
              current={current}
              teamShort={selectedTeam.short}
              buyQty={buyQty} setBuyQty={setBuyQty}
              sellQty={sellQty} setSellQty={setSellQty}
              buyPrice={buyPrice} setBuyPrice={setBuyPrice}
              sellPrice={sellPrice} setSellPrice={setSellPrice}
              onSubmit={placeOrder}
            />
          </div>

          <div className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 flex flex-col min-h-0">
            <div className="h-64 lg:h-auto lg:flex-1 flex flex-col min-h-0">
              <TeamListPanel
                teams={IPL_TEAMS}
                teamStats={teamStats}
                selectedTeamId={selectedTeamId}
                onSelect={setSelectedTeamId}
                favorites={favorites}
                onToggleFav={toggleFav}
                search={search}
                setSearch={setSearch}
              />
            </div>
            <div className="h-64 lg:h-auto lg:flex-1 flex flex-col min-h-0">
              <TradesPanel marketTrades={marketTrades} myTrades={myTrades} activeTab={activeTradesTab} setActiveTab={setActiveTradesTab} />
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-black border border-gray-200 dark:border-white rounded-sm px-4 py-2.5 text-xs font-medium shadow-lg z-50 max-w-[90vw] text-center">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
