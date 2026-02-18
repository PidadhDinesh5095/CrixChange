"use client";
import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CrosshairMode } from "lightweight-charts";

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

const CricketTradingChart = () => {
	const chartContainerRef = useRef(null);
	const [series, setSeries] = useState(null);
	const [volumeSeries, setVolumeSeries] = useState(null);
	const [selectedInterval, setSelectedInterval] = useState("1b");
	const [chartType, setChartType] = useState("candlestick");
	const selectedTeam = IPL_TEAMS.find((t) => t.id === "rcb"); 
	const [showChartTypes, setShowChartTypes] = useState(false);
	const [showIndicators, setShowIndicators] = useState(false);
	const [magnetMode, setMagnetMode] = useState("off");
	const [zoomLevel, setZoomLevel] = useState(100);
	const [theme, setTheme] = useState(() => typeof window !== "undefined" ? (localStorage.getItem("theme") || "light") : "light");
	const [currentData, setCurrentData] = useState({
		open: 45.5,
		high: 58.2,
		low: 42.8,
		close: 56.7,
		change: 11.2,
		changePercent: 19.7,
	});

	const [indicators, setIndicators] = useState([
		{ id: "sma20", name: "SMA (20)", visible: false },
		{ id: "sma50", name: "SMA (50)", visible: false },
		{ id: "ema12", name: "EMA (12)", visible: false },
		{ id: "ema26", name: "EMA (26)", visible: false },
		{ id: "wma20", name: "WMA (20)", visible: false },
		{ id: "macd", name: "MACD", visible: false },
		{ id: "rsi14", name: "RSI (14)", visible: false },
		{ id: "rsi7", name: "RSI (7)", visible: false },
		{ id: "stochastic", name: "Stochastic", visible: false },
		{ id: "bollinger20", name: "Bollinger Bands", visible: false },
		{ id: "atr14", name: "ATR (14)", visible: false },
		{ id: "adx14", name: "ADX (14)", visible: false },
		{ id: "momentum12", name: "Momentum (12)", visible: false },
		{ id: "roc12", name: "ROC (12)", visible: false },
		{ id: "williams14", name: "Williams %R", visible: false },
		{ id: "cci20", name: "CCI (20)", visible: false },
		{ id: "ao", name: "Awesome Oscillator", visible: false },
		{ id: "obv", name: "OBV", visible: false },
		{ id: "vpt", name: "Volume Price Trend", visible: false },
		{ id: "ad", name: "A/D Line", visible: false },
		{ id: "mfi14", name: "Money Flow Index", visible: false },
		{ id: "kama10", name: "KAMA (10)", visible: false },
	]);

	const generateBallByBallEvents = () => {
		const events = [];
		let performanceScore = 50;

		for (let over = 1; over <= 20; over++) {
			for (let ball = 1; ball <= 6; ball++) {
				const rand = Math.random();
				let runs = 0;
				let isWicket = false;
				let isDot = false;
				let isSix = false;
				let isFour = false;

				if (over >= 18) {
					if (rand < 0.15) {
						runs = 6;
						isSix = true;
					} else if (rand < 0.28) {
						runs = 4;
						isFour = true;
					} else if (rand < 0.42) runs = 2;
					else if (rand < 0.56) runs = 1;
					else if (rand < 0.91) {
						runs = 0;
						isDot = true;
					} else {
						runs = 0;
						isWicket = true;
					}
				} else if (over >= 7) {
					if (rand < 0.08) {
						runs = 6;
						isSix = true;
					} else if (rand < 0.20) {
						runs = 4;
						isFour = true;
					} else if (rand < 0.40) runs = 2;
					else if (rand < 0.65) runs = 1;
					else if (rand < 0.95) {
						runs = 0;
						isDot = true;
					} else {
						runs = 0;
					 isWicket = true;
					}
				} else {
					if (rand < 0.12) {
						runs = 6;
						isSix = true;
					} else if (rand < 0.28) {
						runs = 4;
						isFour = true;
					} else if (rand < 0.50) runs = 2;
					else if (rand < 0.70) runs = 1;
					else if (rand < 0.96) {
						runs = 0;
						isDot = true;
					} else {
						runs = 0;
						isWicket = true;
					}
				}

				if (isWicket) {
					performanceScore -= 4 + Math.random() * 2;
				} else if (isSix) {
					performanceScore += 8 + Math.random() * 4;
				} else if (isFour) {
					performanceScore += 4 + Math.random() * 2;
				} else if (runs === 2 || runs === 3) {
					performanceScore += 2 + Math.random();
				} else if (runs === 1) {
					performanceScore += 1;
				} else if (isDot) {
					performanceScore -= 1 + Math.random();
				}

				performanceScore = Math.max(20, Math.min(200, performanceScore));

				events.push({
					over,
					ball,
					runs,
					isWicket,
					isDot,
					isSix,
					isFour,
					performanceScore,
				});
			}
		}

		return events;
	};

	const [ballEvents] = useState(generateBallByBallEvents());

	const ballToTimestamp = (over, ball) => {
		return over + ball * 0.1;
	};

	// ========== INDICATOR CALCULATIONS ==========
	const calculateSMA = (data, period) => {
		const smaData = [];
		for (let i = period - 1; i < data.length; i++) {
			let sum = 0;
			for (let j = 0; j < period; j++) {
				sum += data[i - j].close;
			}
			smaData.push({ time: data[i].time, value: sum / period });
		}
		return smaData;
	};

	const calculateEMA = (data, period) => {
		const emaData = [];
		const multiplier = 2 / (period + 1);
		let ema = data[0].close;

		for (let i = 0; i < data.length; i++) {
			if (i === 0) {
				ema = data[i].close;
			} else {
				ema = (data[i].close - ema) * multiplier + ema;
			}
			emaData.push({ time: data[i].time, value: ema });
		}
		return emaData;
	};

	const calculateWMA = (data, period) => {
		const wmaData = [];
		for (let i = period - 1; i < data.length; i++) {
			let sum = 0;
			let weight = 0;
			for (let j = 0; j < period; j++) {
				sum += data[i - j].close * (period - j);
				weight += period - j;
			}
			wmaData.push({ time: data[i].time, value: sum / weight });
		}
		return wmaData;
	};

	const calculateMACD = (data) => {
		const ema12 = calculateEMA(data, 12);
		const ema26 = calculateEMA(data, 26);
		const macdData = [];

		const minLength = Math.min(ema12.length, ema26.length);
		for (let i = 0; i < minLength; i++) {
			const macdLine = ema12[i].value - ema26[i].value;
			macdData.push({
				time: ema12[i].time,
				value: macdLine,
				color: macdLine >= 0 ? "#26a69a" : "#ef5350",
			});
		}
		return macdData;
	};

	const calculateRSI = (data, period = 14) => {
		const rsiData = [];
		let sumGain = 0;
		let sumLoss = 0;

		for (let i = 1; i < data.length; i++) {
			const change = data[i].close - data[i - 1].close;

			if (i <= period) {
				if (change > 0) sumGain += change;
				else sumLoss += -change;
			}

			if (i === period) {
				const avgGain = sumGain / period;
				const avgLoss = sumLoss / period;
				const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
				const rsi = 100 - 100 / (1 + rs);
				rsiData.push({ time: data[i].time, value: rsi });
			} else if (i > period) {
				const change = data[i].close - data[i - 1].close;
				const prevAvgGain = sumGain / period;
				const prevAvgLoss = sumLoss / period;
				const avgGain =
					(prevAvgGain * (period - 1) + (change > 0 ? change : 0)) / period;
				const avgLoss =
					(prevAvgLoss * (period - 1) + (change < 0 ? -change : 0)) / period;
				const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
				const rsi = 100 - 100 / (1 + rs);
				rsiData.push({ time: data[i].time, value: rsi });
				sumGain = avgGain * period;
				sumLoss = avgLoss * period;
			}
		}
		return rsiData;
	};

	const calculateStochastic = (data, kPeriod = 14) => {
		const stochData = [];
		for (let i = kPeriod - 1; i < data.length; i++) {
			let high = data[i].high;
			let low = data[i].low;
			for (let j = 1; j < kPeriod; j++) {
				high = Math.max(high, data[i - j].high);
				low = Math.min(low, data[i - j].low);
			}
			const k =
				high === low
					? 50
					: ((data[i].close - low) / (high - low)) * 100;
			stochData.push({
				time: data[i].time,
				value: Math.max(0, Math.min(100, k)),
			});
		}
		return stochData;
	};

	const calculateBollingerBands = (data, period = 20, stdDev = 2) => {
		const upper = [];
		const middle = [];
		const lower = [];

		for (let i = period - 1; i < data.length; i++) {
			let sum = 0;
			for (let j = 0; j < period; j++) {
				sum += data[i - j].close;
			}
			const avg = sum / period;
			middle.push({ time: data[i].time, value: avg });

			let variance = 0;
			for (let j = 0; j < period; j++) {
				variance += Math.pow(data[i - j].close - avg, 2);
			}
			const std = Math.sqrt(variance / period);

			upper.push({ time: data[i].time, value: avg + std * stdDev });
			lower.push({ time: data[i].time, value: avg - std * stdDev });
		}

		return { upper, middle, lower };
	};

	const calculateATR = (data, period = 14) => {
		const atrData = [];
		const trValues = [];

		for (let i = 1; i < data.length; i++) {
			const tr = Math.max(
				data[i].high - data[i].low,
				Math.abs(data[i].high - data[i - 1].close),
				Math.abs(data[i].low - data[i - 1].close)
			);
			trValues.push(tr);

			if (trValues.length === period) {
				const atr = trValues.reduce((a, b) => a + b) / period;
				atrData.push({ time: data[i].time, value: atr });
			} else if (trValues.length > period) {
				const prevATR = atrData[atrData.length - 1].value;
				const newATR = (prevATR * (period - 1) + tr) / period;
				atrData.push({ time: data[i].time, value: newATR });
			}
		}
		return atrData;
	};

	const calculateADX = (data, period = 14) => {
		const adxData = [];

		for (let i = 1; i < data.length; i++) {
			const upMove = data[i].high - data[i - 1].high;
			const downMove = data[i - 1].low - data[i].low;

			let pdm = 0;
			let mdm = 0;

			if (upMove > downMove && upMove > 0) pdm = upMove;
			if (downMove > upMove && downMove > 0) mdm = downMove;

			if (i >= period) {
				const tr = Math.max(
					data[i].high - data[i].low,
					Math.abs(data[i].high - data[i - 1].close),
					Math.abs(data[i].low - data[i - 1].close)
				);

			 let sumPDM = 0;
				let sumMDM = 0;

				for (let j = 0; j < period; j++) {
					const upM = data[i - j].high - data[i - j - 1].high;
					const downM = data[i - j - 1].low - data[i - j].low;
					if (upM > downM && upM > 0) sumPDM += upM;
					if (downM > upM && downM > 0) sumMDM += downM;
				}

				const plusDI = (sumPDM / tr) * 100;
				const minusDI = (sumMDM / tr) * 100;
				const dx =
					(Math.abs(plusDI - minusDI) / (plusDI + minusDI || 1)) * 100;

				adxData.push({ time: data[i].time, value: dx });
			}
		}
		return adxData;
	};

	const calculateMomentum = (data, period = 12) => {
		const momentumData = [];
		for (let i = period; i < data.length; i++) {
			const momentum = data[i].close - data[i - period].close;
			momentumData.push({ time: data[i].time, value: momentum });
		}
		return momentumData;
	};

	const calculateROC = (data, period = 12) => {
		const rocData = [];
		for (let i = period; i < data.length; i++) {
			const roc =
				((data[i].close - data[i - period].close) / data[i - period].close) *
				100;
			rocData.push({ time: data[i].time, value: roc });
		}
		return rocData;
	};

	const calculateWilliamsR = (data, period = 14) => {
		const wrData = [];
		for (let i = period - 1; i < data.length; i++) {
			let high = data[i].high;
			let low = data[i].low;
			for (let j = 1; j < period; j++) {
				high = Math.max(high, data[i - j].high);
				low = Math.min(low, data[i - j].low);
			}
			const wr =
				high === low
					? 0
					: ((high - data[i].close) / (high - low)) * -100;
			wrData.push({ time: data[i].time, value: wr });
		}
		return wrData;
	};

	const calculateCCI = (data, period = 20) => {
		const cciData = [];
		for (let i = period - 1; i < data.length; i++) {
			let sumTypicalPrice = 0;
			for (let j = 0; j < period; j++) {
				const typicalPrice = (data[i - j].high + data[i - j].low + data[i - j].close) / 3;
				sumTypicalPrice += typicalPrice;
			}
			const smaTypicalPrice = sumTypicalPrice / period;

			let sumDeviation = 0;
			for (let j = 0; j < period; j++) {
				const typicalPrice = (data[i - j].high + data[i - j].low + data[i - j].close) / 3;
				sumDeviation += Math.abs(typicalPrice - smaTypicalPrice);
			}
			const mad = sumDeviation / period;

			const currentTypicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
			const cci = mad === 0 ? 0 : (currentTypicalPrice - smaTypicalPrice) / (0.015 * mad);
			cciData.push({ time: data[i].time, value: cci });
		}
		return cciData;
	};

	const calculateAwesomeOscillator = (data) => {
		const aoData = [];
		const ema5 = calculateEMA(data, 5);
		const ema34 = calculateEMA(data, 34);

		const minLength = Math.min(ema5.length, ema34.length);
		for (let i = 0; i < minLength; i++) {
			const ao = ema5[ema5.length - minLength + i].value - ema34[ema34.length - minLength + i].value;
			aoData.push({
				time: data[data.length - minLength + i].time,
				value: ao,
				color: ao >= 0 ? "#26a69a" : "#ef5350",
			});
		}
		return aoData;
	};

	const calculateOBV = (data) => {
		const obvData = [];
		let obv = 0;

		for (let i = 0; i < data.length; i++) {
			const volume = Math.abs(data[i].close - data[i].open) * 1000;
			if (data[i].close > data[i].open) {
				obv += volume;
			} else if (data[i].close < data[i].open) {
				obv -= volume;
			}
			obvData.push({ time: data[i].time, value: obv });
		}
		return obvData;
	};

	const calculateVPT = (data) => {
		const vptData = [];
		let vpt = 0;

		for (let i = 0; i < data.length; i++) {
			const volume = Math.abs(data[i].close - data[i].open) * 1000;
			const change = i === 0 ? 0 : (data[i].close - data[i - 1].close) / data[i - 1].close;
			vpt += volume * change;
			vptData.push({ time: data[i].time, value: vpt });
		}
		return vptData;
	};

	const calculateAD = (data) => {
		const adData = [];
		let ad = 0;

		for (let i = 0; i < data.length; i++) {
			const clv = (data[i].close - data[i].low - (data[i].high - data[i].close)) / (data[i].high - data[i].low) || 0;
			const volume = Math.abs(data[i].close - data[i].open) * 1000;
			ad += clv * volume;
			adData.push({ time: data[i].time, value: ad });
		}
		return adData;
	};

	const calculateMFI = (data, period = 14) => {
		const mfiData = [];
		const typicalPrices = [];
		let positiveFlow = 0;
		let negativeFlow = 0;

		for (let i = 0; i < data.length; i++) {
			const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
			const volume = Math.abs(data[i].close - data[i].open) * 1000;
			const moneyFlow = typicalPrice * volume;

			typicalPrices.push(moneyFlow);

			if (i > 0) {
				if (typicalPrice > typicalPrices[i - 1]) {
					positiveFlow += moneyFlow;
				} else {
					negativeFlow += moneyFlow;
				}
			}

			if (i >= period) {
				const moneyFlowRatio = positiveFlow / negativeFlow || 0;
				const mfi = 100 - 100 / (1 + moneyFlowRatio);
				mfiData.push({ time: data[i].time, value: mfi });
			}
		}
		return mfiData;
	};

	const calculateKAMA = (data, period = 10) => {
		const kamaData = [];
		let kama = data[0].close;

		for (let i = period; i < data.length; i++) {
			let sumChange = 0;
			let sumDirection = 0;

			for (let j = 0; j < period; j++) {
				const change = Math.abs(data[i - j].close - data[i - j - 1].close);
				sumChange += change;
				sumDirection += data[i - j].close - data[i - j - 1].close;
			}

			const er = Math.abs(sumDirection) / (sumChange || 1);
			const fastSC = 2 / (2 + 1);
			const slowSC = 2 / (30 + 1);
			const smoothingConst = Math.pow(er * (fastSC - slowSC) + slowSC, 2);

			kama = kama + smoothingConst * (data[i].close - kama);
			kamaData.push({ time: data[i].time, value: kama });
		}
		return kamaData;
	};

	const toHeikinAshi = (data) => {
		const haData = [];
		let prevHA = null;

		data.forEach((candle) => {
			const haClose = (candle.open + candle.high + candle.low + candle.close) / 4;
			const haOpen = prevHA ? (prevHA.open + prevHA.close) / 2 : (candle.open + candle.close) / 2;
			const haHigh = Math.max(candle.high, haOpen, haClose);
			const haLow = Math.min(candle.low, haOpen, haClose);

			const ha = {
				time: candle.time,
				open: haOpen,
				high: haHigh,
				low: haLow,
				close: haClose,
			};

			haData.push(ha);
			prevHA = ha;
		});

		return haData;
	};

	const toRenko = (data, brickSize = 5) => {
		const renkoData = [];
		let currentPrice = data[0].close;
		let timeCounter = 0;

		data.forEach((candle) => {
			const priceDiff = candle.close - currentPrice;
			const bricks = Math.floor(Math.abs(priceDiff) / brickSize);

			for (let i = 0; i < bricks; i++) {
				const direction = priceDiff > 0 ? 1 : -1;
				const open = currentPrice;
				const close = currentPrice + direction * brickSize;

				renkoData.push({
					time: timeCounter++ + Number(candle.time),
					open,
					high: Math.max(open, close),
					low: Math.min(open, close),
					close,
				});

				currentPrice = close;
			}
		});

		return renkoData;
	};

	const aggregateData = (events, aggregation) => {
		const data = [];

		if (aggregation === "1b") {
			events.forEach((event, idx) => {
				const prevScore = idx > 0 ? events[idx - 1].performanceScore : 50;
				const time = ballToTimestamp(event.over, event.ball);

				data.push({
					time: time,
					open: prevScore,
					high: Math.max(prevScore, event.performanceScore) + Math.random() * 0.5,
					low: Math.min(prevScore, event.performanceScore) - Math.random() * 0.5,
					close: event.performanceScore,
				});
			});
		} else if (aggregation === "1o") {
			for (let over = 1; over <= 20; over++) {
				const overEvents = events.filter((e) => e.over === over);
				if (overEvents.length === 0) continue;

				const open =
					over === 1 ? 50 : events.filter((e) => e.over < over).slice(-1)[0]?.performanceScore || 50;
				const close = overEvents[overEvents.length - 1].performanceScore;
				const high = Math.max(...overEvents.map((e) => e.performanceScore)) + 0.5;
				const low = Math.min(...overEvents.map((e) => e.performanceScore)) - 0.5;

				data.push({
					time: over + 1.0,
					open,
					high,
					low,
					close,
				});
			}
		} else if (aggregation === "2o") {
			for (let i = 1; i <= 20; i += 2) {
				const overEvents = events.filter((e) => e.over >= i && e.over < i + 2);
				if (overEvents.length === 0) continue;

				const open = events.filter((e) => e.over < i).slice(-1)[0]?.performanceScore || 50;
				const close = overEvents[overEvents.length - 1].performanceScore;
				const high = Math.max(...overEvents.map((e) => e.performanceScore)) + 0.5;
				const low = Math.min(...overEvents.map((e) => e.performanceScore)) - 0.5;

				data.push({
					time: i + 2.0,
					open,
					high,
					low,
					close,
				});
			}
		} else if (aggregation === "5o") {
			for (let i = 1; i <= 20; i += 5) {
				const overEvents = events.filter((e) => e.over >= i && e.over < i + 5);
				if (overEvents.length === 0) continue;

				const open = events.filter((e) => e.over < i).slice(-1)[0]?.performanceScore || 50;
				const close = overEvents[overEvents.length - 1].performanceScore;
				const high = Math.max(...overEvents.map((e) => e.performanceScore)) + 0.5;
				const low = Math.min(...overEvents.map((e) => e.performanceScore)) - 0.5;

				data.push({
					time: Math.min(i + 4, 20) + 1.0,
					open,
					high,
					low,
					close,
				});
			}
		} else if (aggregation === "10o") {
			for (let i = 1; i <= 20; i += 10) {
				const overEvents = events.filter((e) => e.over >= i && e.over < i + 10);
				if (overEvents.length === 0) continue;

				const open = events.filter((e) => e.over < i).slice(-1)[0]?.performanceScore || 50;
				const close = overEvents[overEvents.length - 1].performanceScore;
				const high = Math.max(...overEvents.map((e) => e.performanceScore)) + 0.5;
				const low = Math.min(...overEvents.map((e) => e.performanceScore)) - 0.5;

				data.push({
					time: Math.min(i + 9, 20) + 1.0,
					open,
					high,
					low,
					close,
				});
			}
		} else if (aggregation === "PP") {
			const overEvents = events.filter((e) => e.over >= 1 && e.over <= 6);
			const open = 50;
			const close = overEvents[overEvents.length - 1].performanceScore;
			const high = Math.max(...overEvents.map((e) => e.performanceScore)) + 0.5;
			const low = Math.min(...overEvents.map((e) => e.performanceScore)) - 0.5;

			data.push({ time: 6.0, open, high, low, close });
		} else if (aggregation === "Mid") {
			const overEvents = events.filter((e) => e.over >= 7 && e.over <= 15);
			const open = events.filter((e) => e.over < 7).slice(-1)[0]?.performanceScore || 50;
			const close = overEvents[overEvents.length - 1].performanceScore;
			const high = Math.max(...overEvents.map((e) => e.performanceScore)) + 0.5;
			const low = Math.min(...overEvents.map((e) => e.performanceScore)) - 0.5;

			data.push({ time: 15.0, open, high, low, close });
		} else if (aggregation === "Death") {
			const overEvents = events.filter((e) => e.over >= 16 && e.over <= 20);
			const open = events.filter((e) => e.over < 16).slice(-1)[0]?.performanceScore || 50;
			const close = overEvents[overEvents.length - 1].performanceScore;
			const high = Math.max(...overEvents.map((e) => e.performanceScore)) + 0.5;
			const low = Math.min(...overEvents.map((e) => e.performanceScore)) - 0.5;

			data.push({ time: 20.0, open, high, low, close });
		} else if (aggregation === "Full") {
			const open = 50;
			const close = events[events.length - 1].performanceScore;
			const high = Math.max(...events.map((e) => e.performanceScore)) + 0.5;
			const low = Math.min(...events.map((e) => e.performanceScore)) - 0.5;

			data.push({ time: 20.0, open, high, low, close });
		}

		return data;
	};

	const [candleData, setCandleData] = useState(() => aggregateData(ballEvents, selectedInterval));

	const generateLineData = () => {
		let cumulativeRuns = 0;
		return ballEvents.map((event) => {
			cumulativeRuns += event.runs;
			return {
				time: ballToTimestamp(event.over, event.ball),
				value: cumulativeRuns,
			};
		});
	};

	const [lineData] = useState(generateLineData());

	const generateVolumeData = () => {
		const data = [];

		for (let i = 0; i < candleData.length; i++) {
			const runsInPeriod = candleData[i].close - candleData[i].open;

			data.push({
				time: candleData[i].time,
				value: Math.abs(runsInPeriod) * 5,
				color: runsInPeriod >= 0 ? "#26a69a" : "#ef5350",
			});
		}

		return data;
	};

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

	// Sync theme with localStorage and document root
	useEffect(() => {
		const handleThemeChange = () => {
			const storedTheme = localStorage.getItem("theme") || "light";
			setTheme(storedTheme);
			if (storedTheme === "dark") {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
		};
		handleThemeChange();
		window.addEventListener("storage", handleThemeChange);
		return () => window.removeEventListener("storage", handleThemeChange);
	}, []);

	// --- Chart creation and update ---
	useEffect(() => {
		if (!chartContainerRef.current) return;

		// Remove any previous chart instance by clearing the container
		chartContainerRef.current.innerHTML = "";

		const isDark = theme === "dark";
		const container = chartContainerRef.current;
		const width = Math.max(container.clientWidth, window.innerWidth < 640 ? window.innerWidth : 500);
		const height = window.innerWidth < 640 ? window.innerHeight * 0.5 : 590;

		const chartBg = isDark ? "#000" : "#000";
		const chartText = isDark ? "#fff" : "#fff";
		const gridColor = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)";
		const borderColor = isDark ? "#fff" : "#000";

		const chart = createChart(container, {
			width,
			height,
			layout: {
				background: { color: chartBg },
				textColor: chartText,
				fontFamily: "'Darker Grotesque', 'sans-serif'",
			},
			grid: {
				vertLines: { color: gridColor },
				horzLines: { color: gridColor },
			},
			crosshair: {
				mode: magnetMode === "off" ? CrosshairMode.Normal : CrosshairMode.Magnet,
				vertLine: {
					color: "#758696",
					width: 1,
					style: 3,
					labelBackgroundColor: "#2B3139",
				},
				horzLine: {
					color: "#758696",
					width: 1,
					style: 3,
					labelBackgroundColor: "#2B3139",
				},
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

		const candleSeries = chart.addCandlestickSeries({
			upColor: "#19af7aff",
			downColor: "#ef5350",
			borderDownColor: "#ef5350",
			borderUpColor: "#19af7aff",
			wickDownColor: "#ef5350",
			wickUpColor: "#19af7aff",
		});

		const volSeries = chart.addHistogramSeries({
			priceFormat: { type: "volume" },
			priceScaleId: "",
		});

		chart.priceScale("").applyOptions({
			scaleMargins: { top: 0.8, bottom: 0 },
		});

		candleSeries.setData(candleData);
		volSeries.setData(generateVolumeData());
		chart.timeScale().fitContent();

		chart.subscribeCrosshairMove((param) => {
			if (!param.time || !param.seriesData.get(candleSeries)) return;
			const data = param.seriesData.get(candleSeries);
			if (data) {
				const change = data.close - data.open;
				const changePercent = (change / data.open) * 100;
				setCurrentData({
					open: data.open,
					high: data.high,
					low: data.low,
					close: data.close,
					change,
					changePercent,
				});
			}
		});

		setSeries(candleSeries);
		setVolumeSeries(volSeries);

		const handleResize = () => {
			chart.applyOptions({
				width: Math.max(container.clientWidth, window.innerWidth < 640 ? window.innerWidth : 500),
				height: window.innerWidth < 640 ? window.innerHeight * 0.5 : 585,
			});
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
			chart.remove();
		};
	// Add all dependencies that affect chart appearance/data
	}, [candleData, magnetMode, theme]);

	const changeInterval = (interval) => {
		setSelectedInterval(interval);
		const newData = aggregateData(ballEvents, interval);
		setCandleData(newData);

		if (chart && series) {
			series.setData(newData);
			volumeSeries?.setData(generateVolumeData());
			chart.timeScale().fitContent();
		}
	};

	const changeChartType = (type) => {
		if (!chart || !volumeSeries) return;
		setChartType(type);
		if (series) chart.removeSeries(series);

		let newSeries;
		let dataToUse = candleData;

		if (type === "heikin-ashi") {
			dataToUse = toHeikinAshi(candleData);
		} else if (type === "renko") {
			dataToUse = toRenko(candleData, 5);
		}

		if (type === "candlestick" || type === "heikin-ashi") {
			newSeries = chart.addCandlestickSeries({
				upColor: "#26a69a",
				downColor: "#ef5350",
				borderDownColor: "#ef5350",
				borderUpColor: "#26a69a",
				wickDownColor: "#ef5350",
				wickUpColor: "#26a69a",
			});
			newSeries.setData(dataToUse);
		} else if (type === "hollow-candle") {
			newSeries = chart.addCandlestickSeries({
				upColor: "rgba(38, 166, 154, 0)",
				downColor: "rgba(239, 83, 80, 0)",
				borderDownColor: "#ef5350",
				borderUpColor: "#26a69a",
				wickDownColor: "#ef5350",
				wickUpColor: "#26a69a",
			});
			newSeries.setData(candleData);
		} else if (type === "bar" || type === "columns" || type === "renko") {
			newSeries = chart.addBarSeries({
				upColor: "#26a69a",
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
		chart.timeScale().fitContent();
	};

	const toggleIndicator = (indicatorId) => {
		if (!chart) return;
		const indicatorIdx = indicators.findIndex((ind) => ind.id === indicatorId);
		if (indicatorIdx === -1) return;

		const indicator = indicators[indicatorIdx];

		if (indicator.visible && indicator.series) {
			indicator.series.forEach((s) => {
				try {
					chart.removeSeries(s);
				} catch (e) {
					console.error("Error removing series:", e);
				}
			});
			setIndicators((prev) => [
				...prev.slice(0, indicatorIdx),
				{ ...indicator, visible: false, series: undefined },
				...prev.slice(indicatorIdx + 1),
			]);
		} else {
			const seriesList = [];

			try {
				let data = [];

				if (indicatorId === "sma20") {
					data = calculateSMA(candleData, 20);
					const line = chart.addLineSeries({ color: "#FF6B00", lineWidth: 2 });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "sma50") {
					data = calculateSMA(candleData, 50);
					const line = chart.addLineSeries({ color: "#FF00FF", lineWidth: 2 });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "ema12") {
					data = calculateEMA(candleData, 12);
					const line = chart.addLineSeries({ color: "#00D4FF", lineWidth: 2 });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "ema26") {
					data = calculateEMA(candleData, 26);
					const line = chart.addLineSeries({ color: "#00FFFF", lineWidth: 2 });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "wma20") {
					data = calculateWMA(candleData, 20);
					const line = chart.addLineSeries({ color: "#9D4EDD", lineWidth: 2 });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "macd") {
					data = calculateMACD(candleData);
					const hist = chart.addHistogramSeries({ color: "#3A86FF", priceScaleId: "right" });
					hist.setData(data);
					seriesList.push(hist);
				} else if (indicatorId === "rsi14") {
					data = calculateRSI(candleData, 14);
					const line = chart.addLineSeries({ color: "#FB5607", lineWidth: 2, priceScaleId: "rsi" });
					chart.priceScale("rsi").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "rsi7") {
					data = calculateRSI(candleData, 7);
					const line = chart.addLineSeries({ color: "#FB0000", lineWidth: 2, priceScaleId: "rsi7" });
					chart.priceScale("rsi7").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "stochastic") {
					data = calculateStochastic(candleData, 14);
					const line = chart.addLineSeries({ color: "#8338EC", lineWidth: 2, priceScaleId: "stoch" });
					chart.priceScale("stoch").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "bollinger20") {
					const bb = calculateBollingerBands(candleData, 20, 2);
					const upper = chart.addLineSeries({ color: "rgba(255, 107, 0, 0.5)", lineWidth: 1 });
					const middle = chart.addLineSeries({ color: "rgba(255, 107, 0, 0.3)", lineWidth: 1 });
					const lower = chart.addLineSeries({ color: "rgba(255, 107, 0, 0.5)", lineWidth: 1 });
					upper.setData(bb.upper);
					middle.setData(bb.middle);
					lower.setData(bb.lower);
					seriesList.push(upper, middle, lower);
				} else if (indicatorId === "atr14") {
					data = calculateATR(candleData, 14);
					const line = chart.addLineSeries({ color: "#E63946", lineWidth: 2, priceScaleId: "atr" });
					chart.priceScale("atr").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "adx14") {
					data = calculateADX(candleData, 14);
					const line = chart.addLineSeries({ color: "#06FFA5", lineWidth: 2, priceScaleId: "adx" });
					chart.priceScale("adx").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "momentum12") {
					data = calculateMomentum(candleData, 12);
					const hist = chart.addHistogramSeries({ color: "#FFD700", priceScaleId: "momentum" });
					hist.setData(data);
					seriesList.push(hist);
				} else if (indicatorId === "roc12") {
					data = calculateROC(candleData, 12);
					const line = chart.addLineSeries({ color: "#FFBE0B", lineWidth: 2, priceScaleId: "roc" });
					chart.priceScale("roc").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "williams14") {
					data = calculateWilliamsR(candleData, 14);
					const line = chart.addLineSeries({ color: "#FF006E", lineWidth: 2, priceScaleId: "williams" });
					chart.priceScale("williams").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "cci20") {
					data = calculateCCI(candleData, 20);
					const line = chart.addLineSeries({ color: "#00B4D8", lineWidth: 2, priceScaleId: "cci" });
					chart.priceScale("cci").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "ao") {
					data = calculateAwesomeOscillator(candleData);
					const hist = chart.addHistogramSeries({ color: "#FF5733", priceScaleId: "ao" });
					hist.setData(data);
					seriesList.push(hist);
				} else if (indicatorId === "obv") {
					data = calculateOBV(candleData);
					const line = chart.addLineSeries({ color: "#33FF57", lineWidth: 2, priceScaleId: "obv" });
					chart.priceScale("obv").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "vpt") {
					data = calculateVPT(candleData);
					const line = chart.addLineSeries({ color: "#3357FF", lineWidth: 2, priceScaleId: "vpt" });
					chart.priceScale("vpt").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "ad") {
					data = calculateAD(candleData);
					const line = chart.addLineSeries({ color: "#FF33F5", lineWidth: 2, priceScaleId: "ad" });
					chart.priceScale("ad").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "mfi14") {
					data = calculateMFI(candleData, 14);
					const line = chart.addLineSeries({ color: "#F5FF33", lineWidth: 2, priceScaleId: "mfi" });
					chart.priceScale("mfi").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
					line.setData(data);
					seriesList.push(line);
				} else if (indicatorId === "kama10") {
					data = calculateKAMA(candleData, 10);
					const line = chart.addLineSeries({ color: "#33FFF5", lineWidth: 2 });
					line.setData(data);
					seriesList.push(line);
				}

				if (seriesList.length > 0) {
					setIndicators((prev) => [
						...prev.slice(0, indicatorIdx),
						{ ...indicator, visible: true, series: seriesList },
						...prev.slice(indicatorIdx + 1),
					]);
				}
			} catch (e) {
				console.error("Error loading indicator:", indicatorId, e);
			}
		}
	};

	const handleZoomIn = () => {
		if (chart) {
			const timeScale = chart.timeScale();
			const range = timeScale.getVisibleLogicalRange();
			if (range) {
				const newRange = {
					from: range.from + (range.to - range.from) * 0.1,
					to: range.to - (range.to - range.from) * 0.1,
				};
				timeScale.setVisibleLogicalRange(newRange);
			}
			setZoomLevel((prev) => Math.min(prev + 10, 200));
		}
	};

	const handleZoomOut = () => {
		if (chart) {
			const timeScale = chart.timeScale();
			const range = timeScale.getVisibleLogicalRange();
			if (range) {
				const newRange = {
					from: range.from - (range.to - range.from) * 0.1,
					to: range.to + (range.to - range.from) * 0.1,
				};
				timeScale.setVisibleLogicalRange(newRange);
			}
			setZoomLevel((prev) => Math.max(prev - 10, 50));
		}
	};

	const toggleMagnetMode = () => {
		setMagnetMode((prev) => (prev === "off" ? "off" : "off"));
	};

	const intervals = [
		{ label: "1b", value: "1b" },
		{ label: "1o", value: "1o" },
		{ label: "2o", value: "2o" },
		{ label: "5o", value: "5o" },
		{ label: "10o", value: "10o" },
		{ label: "PP", value: "PP" },
		{ label: "Mid", value: "Mid" },
		{ label: "Death", value: "Death" },
		{ label: "Full", value: "Full" },
	];

	const chartTypes = [
		{ label: "Candlestick", value: "candlestick", icon: "📊" },
		{ label: "Hollow Candle", value: "hollow-candle", icon: "🕳️" },
		{ label: "Bar", value: "bar", icon: "📶" },
		{ label: "Line", value: "line", icon: "📈" },
		{ label: "Line+Markers", value: "line-markers", icon: "📍" },
		{ label: "Step Line", value: "step-line", icon: "⬆️" },
		{ label: "Baseline", value: "baseline", icon: "📉" },
		{ label: "Area", value: "area", icon: "🏔️" },
		{ label: "HLC", value: "hlc", icon: "📊" },
		{ label: "Area Baseline", value: "area-baseline", icon: "🌊" },
		{ label: "Columns", value: "columns", icon: "▥" },
		{ label: "Histogram", value: "histogram", icon: "📊" },
		{ label: "High-Low", value: "high-low", icon: "⬆️" },
		{ label: "Heikin-Ashi", value: "heikin-ashi", icon: "🎌" },
		{ label: "Renko", value: "renko", icon: "🧱" },
		{ label: "Line Break", value: "line-break", icon: "⚡" },
		{ label: "Kagi", value: "kagi", icon: "🔺" },
		{ label: "Point & Figure", value: "point-figure", icon: "⭕" },
		{ label: "Range", value: "range", icon: "📏" },
	];

	// --- Main JSX ---
	return (
		<div
			className={`font-sans min-h-screen flex flex-col bg-white text-black dark:bg-black dark:text-white`}
			style={{
				fontFamily: "'Darker Grotesque', 'sans-serif'",
				minHeight: "600px",
				height: "100%",
				width: "100%",
				position: "relative",
				top: 0,
				left: 0,
				zIndex: "auto",
			}}
		>
			{/* Toolbar */}
			<div
				className={`flex items-center  px-2 py-2 gap-2 sm:px-4 sm:gap-3 bg-white text-black dark:bg-black dark:text-white`}
				style={{
					fontFamily: "'Darker Grotesque', 'sans-serif'",
					zIndex: 100,
				}}
			>
				{/* Team Display (no dropdown) */}
				<div className="flex items-center gap-2 ">
					<img
						src={selectedTeam.logo}
						alt={selectedTeam.name}
						className="w-10 h-10 rounded-full  bg-white object-cover"
						style={{ background: "#fff" }}
					/>
					<span className="font-bold font-sans text-base text-[1.7rem] text-black dark:text-white">{selectedTeam.name}</span>
				</div>
				{/* Intervals */}
				<div className="flex gap-1">
					{intervals.slice(0, 5).map((interval) => (
						<button
							key={interval.value}
							onClick={() => changeInterval(interval.value)}
							className={`px-3 py-1 rounded text-md font-bold transition-colors ${
								selectedInterval === interval.value
									? "bg-[#2B3139] text-white"
									: "bg-transparent text-[#848E9C] hover:bg-gray-200 dark:hover:bg-gray-800"
							}`}
						>
							{interval.label}
						</button>
					))}
				</div>
				<div className="h-5 w-px bg-[#2B3139] mx-2" />
				{/* Chart Type Dropdown */}
				<div className="relative z-50">
					<button
						onClick={() => setShowChartTypes(!showChartTypes)}
						className=" text-black dark:text-white px-3 py-1 rounded font-bold text-md"
					>
						{chartTypes.find((t) => t.value === chartType)?.icon}{" "}
						{chartTypes.find((t) => t.value === chartType)?.label}
					</button>
					{showChartTypes && (
						<div className="absolute top-full left-0 mt-2 bg-[#1E2329] border border-[#2B3139] rounded-lg p-2 min-w-[180px] max-h-96 overflow-y-auto z-50 shadow-xl">
							{chartTypes.map((type) => (
								<div
									key={type.value}
									onClick={() => {
										changeChartType(type.value);
										setShowChartTypes(false);
									}}
									className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-xs ${
										chartType === type.value
											? "text-[#26a69a] bg-[#26a69a1a]"
											: "text-[#848E9C] hover:bg-gray-800"
									}`}
								>
									<span>{type.icon}</span>
									<span>{type.label}</span>
								</div>
							))}
						</div>
					)}
				</div>
				<div className="h-5 w-px bg-[#2B3139] mx-2" />
				{/* Indicators Dropdown */}
				<div className="relative z-50">
					<button
						onClick={() => setShowIndicators(!showIndicators)}
						className={`flex items-center gap-1 px-3 py-1 rounded text-black dark:text-white text-md font-bold ${
							showIndicators ? "bg-[#2B3139]" : "bg-transparent"
						} text-[#848E9C]`}
					>
						<span className="text-black dark:text-white px-3 py-1 rounded font-bold text-md">Indicators</span>
            
						 ({indicators.filter((i) => i.visible).length})
					</button>
					{showIndicators && (
						<div className="absolute top-full left-0 mt-2 bg-[#1E2329] border border-[#2B3139] rounded-lg p-2 min-w-[200px] max-h-96 overflow-y-auto z-50 shadow-xl">
							{indicators.map((indicator) => (
								<div
									key={indicator.id}
									onClick={() => toggleIndicator(indicator.id)}
									className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-xs ${
										indicator.visible
											? "text-[#26a69a] bg-[#26a69a1a]"
											: "text-[#848E9C] hover:bg-gray-800"
									}`}
								>
									<span>{indicator.visible ? "✓" : "○"}</span>
									<span>{indicator.name}</span>
								</div>
							))}
						</div>
					)}
				</div>
				{/* Zoom Controls */}
				<button
					onClick={handleZoomIn}
					className="bg-transparent border-none text-[#848E9C] px-2 py-1 text-lg"
					title="Zoom In"
				>
					+
				</button>
				<button
					onClick={handleZoomOut}
					className="bg-transparent border-none text-[#848E9C] px-2 py-1 text-lg"
					title="Zoom Out"
				>
					-
				</button>
			</div>
			{/* OHLC Bar */}
			<div
				className={`flex flex-wrap items-center border-b px-2 py-2 gap-3 text-base sm:px-4 sm:gap-6 border-gray-200 bg-white text-black dark:border-gray-800 dark:bg-black dark:text-white`}
				style={{
					fontFamily: "'Darker Grotesque', 'sans-serif'",
					zIndex: 50,
				}}
			>
				<div>
					<span className="text-black dark:text-white text-xs font-bold">O </span>
					<span className={currentData.change >= 0 ? "text-[#26a69a] font-bold text-md" : "text-[#ef5350] font-bold text-md"}>{currentData.open.toFixed(1)}</span>
				</div>
				<div>
					<span className="text-black dark:text-white text-xs font-bold">H </span>
					<span className={currentData.change >= 0 ? "text-[#26a69a] font-bold text-md" : "text-[#ef5350] font-bold text-md"}>{currentData.high.toFixed(1)}</span>
				</div>
				<div>
					<span className="text-black dark:text-white text-xs font-bold">L </span>
					<span className={currentData.change >= 0 ? "text-[#26a69a] font-bold text-md" : "text-[#ef5350] font-bold text-md"}>{currentData.low.toFixed(1)}</span>
				</div>
				<div>
					<span className="text-black dark:text-white text-xs font-bold">C </span>
					<span className={currentData.change >= 0 ? "text-[#26a69a] font-bold text-md" : "text-[#ef5350] font-bold text-md"}>
						{currentData.close.toFixed(1)}
					</span>
				</div>
				<div>
					<span className={currentData.change >= 0 ? "text-[#26a69a] font-bold text-md" : "text-[#ef5350] font-bold text-md"}>
						{currentData.change >= 0 ? "+" : ""}
						{currentData.change.toFixed(1)} ({currentData.changePercent.toFixed(2)}%)
					</span>
				</div>
				<div className="ml-auto">
					<span className="text-[#848E9C]">Zoom: </span>
					<span>{zoomLevel}%</span>
				</div>
			</div>

			{/* Chart */}
			<div
				ref={chartContainerRef}
				className="flex-1"
				style={{
					width: "100%",
					background: "inherit",
					position: "relative",
					zIndex: 1,
					height: "auto",
				}}
			/>
		</div>
	);
};

export default CricketTradingChart;
