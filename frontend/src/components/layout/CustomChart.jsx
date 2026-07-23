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
import { orderPlace } from "../../store/slices/tradingSlice";
import { getWalletBalance } from '../../store/slices/walletSlice';
import { getMarketStocks } from '../../store/slices/tradingSlice';

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
    <div className="leading-tight">
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
    <div className="flex flex-wrap h-11 items-center gap-4 p-1 border-b border-gray-200 dark:border-gray-800 shrink-0">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ background: team.color, color: "#000" }}
        >
          {team.short}
        </div>
        <div>
          <div className="text-[12px] font-semibold text-black dark:text-white">{team.name}</div>
          <div className={`flex items-center gap-1 text-md font-bold font-sans leading-tight `}
            style={{ color: colorClass }}>
            ₹{current.close.toFixed(2)}
            {isUp ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
          </div>
        </div>
      </div>
      <div className="w-px h-6 bg-gray-200 font-sans dark:bg-white " />
      <StatBlock label="Change" value={`${isUp ? "+" : ""}${change.toFixed(2)} (${changePct.toFixed(2)}%)`} colorClass={colors} />
      <StatBlock label="High" value={dayHigh.toFixed(2)} colorClass={colors} />
      <StatBlock label="Low" value={dayLow.toFixed(2)} colorClass={colors} />
      <StatBlock label="Volume" value={dayVol.toFixed(0)} colorClass={colors} />

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
            className={`px-2.5 py-1 text-xs font-medium rounded-sm  transition-colors ${interval_ === v
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

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container || !data.length) {
      setHoverData(null);
      return;
    }

    container.innerHTML = "";
    const chart = createChart(container, {
      width: container.clientWidth || 715,
      height: 378,
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
          const value = Number(time);
          if (!Number.isFinite(value)) return "";
          if (interval === "1s") return `${value}s`;
          if (interval === "1m") return `${value}m`;
          if (interval === "15m") return `${value}m`;
          if (interval === "1h") return `${value}h`;
          return `${value}`;
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
        height: 420,
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
          className="w-full rounded-sm border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-black"
          style={{ height: 380 }}
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
function OrderSide({ side, orderMode, price, setPrice, qty, setQty, balance, marketPrice, teamShort, onSubmit, isLoading }) {
  const isBuy = side === "buy";
  const effPrice = orderMode === "market" ? marketPrice : (price ?? marketPrice);
  const total = effPrice * qty;
  const walletBalance = balance;
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
        onClick={onSubmit}
        disabled={total > balance || isLoading}
        className={`w-full h-8 py-2 rounded-sm font-bold text-sm text-white transition-colors flex items-center justify-center gap-2 ${total > balance || isLoading
          ? "bg-gray-400 cursor-not-allowed"
          : isBuy
            ? "bg-[#2A9C70] hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
          }`}
      >
        {isBuy ? (
          isLoading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Buying...
            </>
          ) : (
            <>Buy {teamShort} for ₹ {total.toFixed(2)}</>
          )
        ) : (
          isLoading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
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

function OrderEntry({ orderMode, setOrderMode, current, teamShort, buyQty, setBuyQty, sellQty, setSellQty, buyPrice, setBuyPrice, sellPrice, setSellPrice, onSubmit, balance, buyLoading, sellLoading }) {
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
        <OrderSide side="buy" orderMode={orderMode} price={buyPrice} setPrice={setBuyPrice} qty={buyQty} setQty={setBuyQty} marketPrice={current.close} balance={balance} teamShort={teamShort} isLoading={buyLoading} onSubmit={() => onSubmit("buy")} />
        <OrderSide side="sell" orderMode={orderMode} price={sellPrice} setPrice={setSellPrice} qty={sellQty} setQty={setSellQty} marketPrice={current.close} balance={balance} teamShort={teamShort} isLoading={sellLoading} onSubmit={() => onSubmit("sell")} />
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

            <span className={`text-left transition-colors ml-3 font-semibold duration-500 ${t.up ? "text-[#2A9C70]" : "text-[#F6465D]"}`}>{t.price.toFixed(2)}</span>
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
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
  });
  const [pendingSide, setPendingSide] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);
  const { orderIsLoading, stocks, isStocksLoading } = useSelector((state) => state.trading);
  useEffect(() => {
    if (balance === 0) {
      dispatch(getWalletBalance());
    }
    if (!stocks || stocks.length === 0) {
      dispatch(getMarketStocks());
    }

  }, [dispatch, balance]);


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
  // IPL_TEAMS id. Starts null until stocks load, then defaults to the first one.
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  useEffect(() => {
    if (!selectedTeamId && stocks && stocks.length > 0) {
      setSelectedTeamId(getId(stocks[0]));
    }
  }, [stocks, selectedTeamId]);

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

  // chart series is keyed by mock team id (teamMeta.id), since the
  // candlestick engine is still simulated from IPL_TEAMS
  const ballData = seriesByTeam[teamMeta.id] || [];

  const [interval_, setInterval_] = useState("1m");
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

  // teamStats keyed by REAL stock id so TeamListPanel's lookups (which use
  // the real id) actually resolve. Falls back to the mock series price via symbol match.
  const teamStats = useMemo(() => {
    const map = {};
    (stocks || []).forEach((s) => {
      const id = getId(s);
      const meta = IPL_TEAMS.find((t) => t.short === s.symbol);
      const series = meta ? seriesByTeam[meta.id] : null;
      if (!series || !series.length) { map[id] = { price: s.price ?? 0, changePct: s.changePercent ?? 0 }; return; }
      const last = series[series.length - 1].close;
      const f = series[0].open;
      map[id] = { price: last, changePct: f ? ((last - f) / f) * 100 : 0 };
    });
    return map;
  }, [seriesByTeam, stocks]);

  const [viewMode, setViewMode] = useState("split");
  const [orderMode, setOrderMode] = useState("limit");
  const [buyQty, setBuyQty] = useState(1);
  const [sellQty, setSellQty] = useState(1);
  const [buyPrice, setBuyPrice] = useState(null);
  const [sellPrice, setSellPrice] = useState(null);



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

  const placeOrder = async (side) => {
    if (!selectedTeam || !user) return;
    const formData = {
      side: side.toUpperCase(),
      type: orderMode.toUpperCase(),
      qty: side === "buy" ? buyQty : sellQty,
      price: Math.round(
        (
          orderMode === "market"
            ? current.close
            : (side === "buy"
              ? (buyPrice ?? current.close)
              : (sellPrice ?? current.close))
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

  const chartRef = useRef(null);
  const upColor = '#2A9C70';
  const downColor = '#CA3D50';
  const resetSignal = `${selectedTeamId}|${interval_}`;

  return (
    <div className={isDark ? "dark" : ""}>
      <div
        className="bg-white  dark:bg-black text-black mt-10 dark:text-white  font-sans flex flex-col min-h-[calc(100vh-20vh)] lg:h-screen"
      >
        <TerminalHeader team={selectedTeam} current={current} change={change} changePct={changePct} dayHigh={dayHigh} dayLow={dayLow} dayVol={dayVol} />

        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          <div className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 flex flex-col min-h-0 h-72 lg:h-auto">
            <OrderBookPanel price={current.close || 1} viewMode={viewMode} setViewMode={setViewMode} isDark={isDark} upColor={upColor} downColor={downColor} />
          </div>

          <div className="flex-1 min-w-0  flex flex-col lg:overflow-y-auto">
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
            <OrderEntry
              orderMode={orderMode}
              setOrderMode={setOrderMode}
              current={current}
              balance={balance}
              teamShort={selectedTeam.short}
              buyQty={buyQty} setBuyQty={setBuyQty}
              sellQty={sellQty} setSellQty={setSellQty}
              buyPrice={buyPrice} setBuyPrice={setBuyPrice}
              sellPrice={sellPrice} setSellPrice={setSellPrice}
              onSubmit={placeOrder}
              buyLoading={orderIsLoading && pendingSide === "buy"}
              sellLoading={orderIsLoading && pendingSide === "sell"}
            />
          </div>

          <div className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 flex flex-col min-h-0">
            <div className="h-64 lg:h-auto lg:flex-1 flex flex-col min-h-0">
              <TeamListPanel
                teams={stocks}
                teamStats={teamStats}
                selectedTeamId={selectedTeamId}
                onSelect={setSelectedTeamId}
                favorites={favorites}
                onToggleFav={toggleFav}
                search={search}
                setSearch={setSearch}
                isLoading={isStocksLoading}
              />
            </div>
            <div className="h-64 lg:h-auto lg:flex-1 flex flex-col min-h-0">
              <TradesPanel marketTrades={marketTrades} myTrades={myTrades} activeTab={activeTradesTab} setActiveTab={setActiveTradesTab} />
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}