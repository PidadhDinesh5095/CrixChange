

"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";

/* ---------------- IPL TEAMS ---------------- */

const IPL_TEAMS = [
	{
		id: "csk",
		name: "Chennai Super Kings",
		logo: "https://static.wixstatic.com/media/0293d4_0be320985f284973a119aaada3d6933f~mv2.jpg/v1/fill/w_980,h_680,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/0293d4_0be320985f284973a119aaada3d6933f~mv2.jpg",
	},
	{
		id: "mi",
		name: "Mumbai Indians",
		logo: "https://www.iplcricketmatch.com/wp-content/uploads/2024/02/Mumbai-Indians.jpg",
	},
	{
		id: "rcb",
		name: "Royal Challengers Bangalore",
		logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvXE2C2mSX88OSXLUbcTB4X0CGfod7_OcI6g&s",
	},
	{
		id: "kkr",
		name: "Kolkata Knight Riders",
		logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXcfuDMriEVXJeJ8tnDwmCBUcJ2vNcd14MAg&s",
	},
	{
		id: "rr",
		name: "Rajasthan Royals",
		logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/This_is_the_logo_for_Rajasthan_Royals%2C_a_cricket_team_playing_in_the_Indian_Premier_League_%28IPL%29.svg/1200px-This_is_the_logo_for_Rajasthan_Royals%2C_a_cricket_team_playing_in_the_Indian_Premier_League_%28IPL%29.svg.png",
	},
	{
		id: "srh",
		name: "Sunrisers Hyderabad",
		logo: "data:image/jpeg;base64,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",
	},
	{
		id: "dc",
		name: "Delhi Capitals",
		logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/Delhi_Capitals.svg/1200px-Delhi_Capitals.svg.png",
	},
	{
		id: "pbks",
		name: "Punjab Kings",
		logo: "https://img1.hscicdn.com/image/upload/f_auto/lsci/db/PICTURES/CMS/317000/317003.png"
	},
	{
		id: "gt",
		name: "Gujarat Titans",
		logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Gujarat_Titans_Logo.svg/1200px-Gujarat_Titans_Logo.svg.png",
	},
	{
		id: "lsg",
		name: "Lucknow Super Giants",
		logo: "https://upload.wikimedia.org/wikipedia/en/a/a9/Lucknow_Super_Giants_IPL_Logo.svg",
	},
];

/* ---------------- COMPONENT ---------------- */

export default function CricketTradingChart() {
	const chartContainerRef = useRef(null);
	const chartRef = useRef(null);

	const [series, setSeries] = useState(null);
	const [volumeSeries, setVolumeSeries] = useState(null);

	const [chartType, setChartType] = useState("candlestick");
	const [selectedInterval, setSelectedInterval] = useState("1b");
	const [zoomLevel, setZoomLevel] = useState(100);
	const [magnetMode] = useState("on");
	const [currentData, setCurrentData] = useState({
		open: 45.5,
		high: 58.2,
		low: 42.8,
		close: 56.7,
		change: 11.2,
		changePercent: 19.7,
	});
	const [orderModal, setOrderModal] = useState({
		open: false,
		type: null,
	});
	const [orderQty, setOrderQty] = useState(1);
	const selectedTeam = IPL_TEAMS[2];

	/* ---------------- DATA GENERATION ---------------- */

	const generateBallEvents = () => {
		const events = [];
		let score = 50;

		for (let over = 1; over <= 20; over++) {
			for (let ball = 1; ball <= 6; ball++) {
				const prev = score;
				score += (Math.random() - 0.5) * 6;
				score = Math.max(20, Math.min(200, score));

				events.push({
					time: over + ball * 0.1,
					open: prev,
					high: Math.max(prev, score) + Math.random(),
					low: Math.min(prev, score) - Math.random(),
					close: score,
				});
			}
		}
		return events;
	};

	const [ballData] = useState(generateBallEvents);

	/* ---------------- AGGREGATION ---------------- */

	const aggregateData = (interval) => {
		if (interval === "1b") return ballData;

		const data = [];
		const groupSize =
			interval === "1o" ? 6 :
				interval === "2o" ? 12 :
					interval === "5o" ? 30 :
						interval === "10o" ? 60 :
							ballData.length;

		for (let i = 0; i < ballData.length; i += groupSize) {
			const chunk = ballData.slice(i, i + groupSize);
			if (!chunk.length) continue;

			data.push({
				time: chunk[chunk.length - 1].time,
				open: chunk[0].open,
				close: chunk[chunk.length - 1].close,
				high: Math.max(...chunk.map((d) => d.high)),
				low: Math.min(...chunk.map((d) => d.low)),
			});
		}
		return data;
	};

	const candleData = useMemo(
		() => aggregateData(selectedInterval),
		[selectedInterval]
	);

	const lineData = candleData.map((d) => ({
		time: d.time,
		value: d.close,
	}));

	const volumeData = candleData.map((d) => ({
		time: d.time,
		value: Math.abs(d.close - d.open) * 8,
		color: d.close >= d.open ? "#26a69a" : "#ef5350",
	}));
	useEffect(() => {
		const interval = setInterval(() => {
			if (candleData.length === 0) return;

			const lastCandle = candleData[candleData.length - 1];
			const newClose = lastCandle.close + (Math.random() - 0.5) * 3;
			const change = newClose - lastCandle.open;
			const changePercent = (change / lastCandle.open) * 100;

			setCurrentData({
				open: lastCandle.open,
				high: Math.max(lastCandle.high, newClose),
				low: Math.min(lastCandle.low, newClose),
				close: newClose,
				change: change,
				changePercent: changePercent,
			});

			if (
				series &&
				(chartType === "candlestick" ||
					chartType === "hollow-candle" ||
					chartType === "heikin-ashi")
			) {
				series.update({
					time: lastCandle.time,
					open: lastCandle.open,
					high: Math.max(lastCandle.high, newClose),
					low: Math.min(lastCandle.low, newClose),
					close: newClose,
				});
			}
		}, 2000);

		return () => clearInterval(interval);
	}, [candleData, series, chartType]);


	/* ---------------- HEIKIN ASHI ---------------- */

	const toHeikinAshi = (data) => {
		const ha = [];
		let prev;

		data.forEach((c) => {
			const close = (c.open + c.high + c.low + c.close) / 4;
			const open = prev ? (prev.open + prev.close) / 2 : (c.open + c.close) / 2;
			const high = Math.max(c.high, open, close);
			const low = Math.min(c.low, open, close);
			prev = { time: c.time, open, high, low, close };
			ha.push(prev);
		});
		return ha;
	};

	/* ---------------- RENKO ---------------- */

	const toRenko = (data, brick = 5) => {
		const result = [];
		let last = data[0].close;

		data.forEach((d) => {
			const diff = d.close - last;
			const bricks = Math.floor(Math.abs(diff) / brick);
			for (let i = 0; i < bricks; i++) {
				const dir = diff > 0 ? 1 : -1;
				const open = last;
				const close = last + dir * brick;
				result.push({
					time: d.time + i * 0.01,
					open,
					close,
					high: Math.max(open, close),
					low: Math.min(open, close),
				});
				last = close;
			}
		});
		return result;
	};



	useEffect(() => {
		if (!chartContainerRef.current) return;

		chartContainerRef.current.innerHTML = "";

		const chart = createChart(chartContainerRef.current, {
			width: chartContainerRef.current.clientWidth,
			height: window.innerHeight * 0.78,
			layout: {
				background: { color: "#fff" },
				textColor: "#000",
			},
			grid: {
				vertLines: { color: "#eee" },
				horzLines: { color: "#eee" },
			},
			crosshair: {
				mode:
					magnetMode === "on"
						? CrosshairMode.Normal
						: CrosshairMode.Magnet,
			},
			rightPriceScale: {
				textColor: "#848E9C",
			},
			timeScale: {
				timeVisible: true,
				minBarSpacing: 0.5,
				tickMarkFormatter: (time) => {
					const timeNum = Number(time);
					const over = Math.floor(timeNum);
					const ball = Math.round((timeNum - over) * 10);
					return ball === 0 ? `${over - 1}` : `${over - 1}.${ball}`;
				},
			},
		});

		chartRef.current = chart;

		const main = chart.addCandlestickSeries();
		main.setData(candleData);

		const vol = chart.addHistogramSeries({
			priceFormat: { type: "volume" },
			priceScaleId: "",
		});
		vol.setData(volumeData);

		chart.priceScale("").applyOptions({
			scaleMargins: { top: 0.8, bottom: 0 },
		});

		setSeries(main);
		setVolumeSeries(vol);
		chart.timeScale().fitContent();

		return () => chart.remove();
	}, [candleData]);

	/* ---------------- CHART TYPE SWITCH ---------------- */

	const changeChartType = (type) => {
		const chart = chartRef.current;
		if (!chart || !series) return;

		chart.removeSeries(series);

		let newSeries;
		let dataToUse = candleData;

		if (type === "heikin-ashi") {
			dataToUse = toHeikinAshi(candleData);
		} else if (type === "renko") {
			dataToUse = toRenko(candleData, 5);
		}

		if (type === "candlestick" || type === "heikin-ashi") {
			newSeries = chart.addCandlestickSeries({
				upColor: "#008F75",
				downColor: "#ef5350",
				borderDownColor: "#ef5350",
				borderUpColor: "#008F75",
				wickDownColor: "#ef5350",
				wickUpColor: "#008F75",
			});
			newSeries.setData(dataToUse);
		} else if (type === "hollow-candle") {
			newSeries = chart.addCandlestickSeries({
				upColor: "#008F75",
				downColor: "rgba(239, 83, 80, 0)",
				borderDownColor: "#ef5350",
				borderUpColor: "#008F75",
				wickDownColor: "#ef5350",
				wickUpColor: "#008F75",
			});
			newSeries.setData(candleData);
		} else if (type === "bar" || type === "columns" || type === "renko") {
			newSeries = chart.addBarSeries({
				upColor: "#008F75",
				downColor: "#ef5350",
			});
			newSeries.setData(dataToUse);
		} else if (type === "area" || type === "area-baseline") {
			newSeries = chart.addAreaSeries({
				lineColor: "#2962FF",
				topColor: "#2962FF",
				bottomColor: "rgba(41, 98, 255, 0.28)",
			});
			newSeries.setData(lineData);
		} else if (type === "baseline") {
			newSeries = chart.addBaselineSeries({
				baseValue: { type: "price", price: 50 },
				topLineColor: "rgba(38, 166, 154, 1)",
				topFillColor1: "rgba(38, 166, 154, 0.28)",
				topFillColor2: "rgba(38, 166, 154, 0.05)",
				bottomLineColor: "rgba(239, 83, 80, 1)",
				bottomFillColor1: "rgba(239, 83, 80, 0.05)",
				bottomFillColor2: "rgba(239, 83, 80, 0.28)",
			});
			newSeries.setData(lineData);
		} else if (type === "line-markers") {
			newSeries = chart.addLineSeries({
				color: "#2962FF",
				lineWidth: 2,
			});
			const markerData = lineData.map((d, i) => ({
				...d,
				...(i % 10 === 0 && {
					marker: {
						position: "aboveBar",
						color: "#2962FF",
						shape: "circle",
					},
				}),
			}));
			newSeries.setData(markerData);
		} else if (type === "step-line") {
			newSeries = chart.addLineSeries({
				color: "#2962FF",
				lineWidth: 2,
				lineStyle: 0,
			});
			const stepData = [];
			lineData.forEach((point, i) => {
				stepData.push(point);
				if (i < lineData.length - 1) {
					stepData.push({
						time: lineData[i + 1].time,
						value: point.value,
					});
				}
			});
			newSeries.setData(stepData);
		} else if (type === "histogram") {
			newSeries = chart.addHistogramSeries({
				color: "#26a69a",
			});
			const histData = lineData.map((d) => ({
				time: d.time,
				value: d.value,
				color: d.value > 50 ? "#26a69a" : "#ef5350",
			}));
			newSeries.setData(histData);
		} else if (type === "hlc" || type === "high-low") {
			newSeries = chart.addLineSeries({
				color: "#2962FF",
				lineWidth: 2,
			});
			const hlcData = candleData.map((d) => ({
				time: d.time,
				value: (d.high + d.low + d.close) / 3,
			}));
			newSeries.setData(hlcData);
		} else {
			newSeries = chart.addLineSeries({
				color: "#2962FF",
				lineWidth: 2,
			});
			newSeries.setData(lineData);
		}

		setSeries(newSeries);
		setChartType(type);
		chart.timeScale().fitContent();
	};


	/* ---------------- ZOOM ---------------- */

	const handleZoomIn = () => {
		const chart = chartRef.current;
		if (!chart) return;
		const ts = chart.timeScale();
		const r = ts.getVisibleLogicalRange();
		if (!r) return;
		ts.setVisibleLogicalRange({
			from: r.from + (r.to - r.from) * 0.15,
			to: r.to - (r.to - r.from) * 0.15,
		});
		setZoomLevel((z) => Math.min(z + 10, 200));
	};

	const handleZoomOut = () => {
		const chart = chartRef.current;
		if (!chart) return;
		const ts = chart.timeScale();
		const r = ts.getVisibleLogicalRange();
		if (!r) return;
		ts.setVisibleLogicalRange({
			from: r.from - (r.to - r.from) * 0.15,
			to: r.to + (r.to - r.from) * 0.15,
		});
		setZoomLevel((z) => Math.max(z - 10, 50));
	};

	/* ---------------- UI ---------------- */
	return (
		<div className="min-h-[700] bg-white text-black">
			{/* Top Bar */}
			<div className="flex items-center gap-4 px-4 py-2">
				<img src={selectedTeam.logo} className="w-10 h-10 rounded-full" />
				<strong>{selectedTeam.name}</strong>

				<select value={selectedInterval} onChange={(e) => setSelectedInterval(e.target.value)}>
					<option value="1b">1b</option>
					<option value="1o">1o</option>
					<option value="2o">2o</option>
					<option value="5o">5o</option>
					<option value="10o">10o</option>
					<option value="Full">Full</option>
				</select>

				<select value={chartType} onChange={(e) => changeChartType(e.target.value)}>
					<option value="candlestick">Candlestick</option>
					<option value="bar">Bar</option>
					<option value="area">Area</option>
					<option value="baseline">Baseline</option>
					<option value="histogram">Histogram</option>
					<option value="heikin-ashi">Heikin-Ashi</option>
					<option value="renko">Renko</option>
				</select>



				<div>
					<span className="text-xs font-bold">O </span>
					<span className={currentData.change >= 0 ? "text-[#26a69a] font-bold" : "text-[#ef5350] font-bold"}>
						{currentData.open.toFixed(1)}
					</span>
				</div>

				<div>
					<span className="text-xs font-bold">H </span>
					<span className={currentData.change >= 0 ? "text-[#26a69a] font-bold" : "text-[#ef5350] font-bold"}>
						{currentData.high.toFixed(1)}
					</span>
				</div>

				<div>
					<span className="text-xs font-bold">L </span>
					<span className={currentData.change >= 0 ? "text-[#26a69a] font-bold" : "text-[#ef5350] font-bold"}>
						{currentData.low.toFixed(1)}
					</span>
				</div>

				<div>
					<span className="text-xs font-bold">C </span>
					<span className={currentData.change >= 0 ? "text-[#26a69a] font-bold" : "text-[#ef5350] font-bold"}>
						{currentData.close.toFixed(1)}
					</span>
				</div>

				<div>
					<span className={currentData.change >= 0 ? "text-[#26a69a] font-bold" : "text-[#ef5350] font-bold"}>
						{currentData.change >= 0 ? "+" : ""}
						{currentData.change.toFixed(1)} ({currentData.changePercent.toFixed(2)}%)
					</span>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<button
						onClick={handleZoomIn}
						className="w-8 h-8 flex items-center justify-center rounded-md
               border border-gray-300 bg-white hover:bg-gray-100
               shadow-sm transition"
						title="Zoom In"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
						>
							<line x1="12" y1="5" x2="12" y2="19" />
							<line x1="5" y1="12" x2="19" y2="12" />
						</svg>
					</button>

					<button
						onClick={handleZoomOut}
						className="w-8 h-8 flex items-center justify-center rounded-md
               border border-gray-300 bg-white hover:bg-gray-100
               shadow-sm transition"
						title="Zoom Out"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
						>
							<line x1="5" y1="12" x2="19" y2="12" />
						</svg>
					</button>
				</div>


				<div className=" text-sm">Zoom: {zoomLevel}%</div>
			</div>

			{/* Buy / Sell */}
			<div className="flex gap-4 px-4  ">
				<button
					className="w-20 h-8 px-2 rounded bg-[#008F75] text-white font-[900] flex items-center justify-center gap-1"
					onClick={() => setOrderModal({ open: true, type: "buy" })}
				>
					<span className="text-[0.65rem]">BUY @</span>
					<span className="text-[0.65rem]">{currentData.close.toFixed(2)}</span>
				</button>

				<button
					className="w-20 h-8 px-2 rounded bg-[hsl(1,66%,57%)] text-white font-bold flex items-center justify-center gap-1"
					onClick={() => setOrderModal({ open: true, type: "sell" })}
				>
					<span className="text-[0.65rem]">SELL @</span>
					<span className="text-[0.65rem]">{currentData.close.toFixed(2)}</span>
				</button>
			</div>

			{/* Order Modal */}
			{orderModal.open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-white rounded-lg p-6 min-w-[320px] relative">
						<button
							className="absolute top-2 right-2 text-xl"
							onClick={() => setOrderModal({ open: false, type: null })}
						>
							×
						</button>

						<h2 className="text-lg font-bold mb-4 text-center">
							{orderModal.type === "buy" ? "Buy" : "Sell"} Order
						</h2>

						<div className="mb-4 space-y-2">
							<div className="flex justify-between">
								<span>Price:</span>
								<span>₹{currentData.close.toFixed(2)}</span>
							</div>

							<div className="flex justify-between items-center">
								<span>Quantity:</span>
								<input
									type="number"
									min={1}
									value={orderQty}
									onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value)))}
									className="border rounded px-2 py-1 w-20 text-right"
								/>
							</div>
						</div>

						<button
							className={`w-full py-2 rounded text-white font-bold ${orderModal.type === "buy" ? "bg-[#008F75]" : "bg-[#ef5350]"
								}`}
							onClick={() => setOrderModal({ open: false, type: null })}
						>
							Place Order
						</button>
					</div>
				</div>
			)}

			{/* Chart Toolbar */}
			<div
				className="flex flex-wrap items-center border-b px-4 py-2 gap-6"
				style={{ fontFamily: "'Darker Grotesque', sans-serif" }}
			>
				{/* indicators / tools */}
			</div>

			{/* Chart */}
			<div ref={chartContainerRef} className="w-full flex-1" />
		</div>
	);


}
