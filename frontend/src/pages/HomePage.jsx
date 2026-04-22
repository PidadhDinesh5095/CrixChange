import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { getMatches } from '../store/slices/currentMatchSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Users,
  ChevronRight,
  BarChart3,
  Activity,
  Clock,
  ArrowUpRight,
  Play,
  Building2,
  Globe,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { use } from 'react';

const HomePage = () => {
  const { isLoading, selectedMatch, error } = useSelector((state) => state.currentMatch);
  const dispatch = useDispatch();
  const [liveMatches, setLiveMatches] = useState([]);

  const CACHE_KEY = "ipl_matches";
  const CACHE_TIME_KEY = "ipl_matches_time";
  const EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

  const tickerData = [
    { team: 'MI', price: 125.50, change: 2.5 },
    { team: 'CSK', price: 142.75, change: -1.8 },
    { team: 'RCB', price: 98.25, change: 5.2 },
    { team: 'DC', price: 118.90, change: -3.1 },
    { team: 'GT', price: 156.75, change: 4.8 },
    { team: 'RR', price: 134.20, change: -2.3 },
    { team: 'KKR', price: 112.45, change: 1.7 },
    { team: 'PBKS', price: 89.60, change: -4.2 },
  ];
  const matchImages = {

    "CSK_vs_MI": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/4891/1742673084891-i",
    "CSK_vs_RCB": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/99/1743083440099-i",
    "CSK_vs_KKR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/9167/1744282189167-i",
    "CSK_vs_SRH": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/8203/1776399038203-i",
    "CSK_vs_DC": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/3194/1743780583194-i",
    "CSK_vs_RR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/5655/1743263315655-i",
    "CSK_vs_PBKS": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/7455/1745924577455-i",
    "CSK_vs_GT": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/2714/1748082122714-i",
    "CSK_vs_LSG": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/6873/1744556376873-i",

    "MI_vs_CSK": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/6368/1742488016368-i",

    "MI_vs_RCB": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/7816/1775903447816-i",
    "MI_vs_KKR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/7716/1743347067716-i",
    "MI_vs_SRH": "https://www.mumbaiindians.com/static-assets/waf-images/a2/49/24/0/article-5784-sunrisers-vs-mi1.png",
    "MI_vs_DC": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/9592/1747748149592-i",
    "MI_vs_RR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1271/1746014051271-i",
    "MI_vs_PBKS": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/7378/1748175907378-i",
    "MI_vs_GT": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1167/1743175411167-i",
    "MI_vs_LSG": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/9545/1743692969545-i",

    "RCB_vs_CSK": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/99/1743083440099-i",
    "RCB_vs_MI": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/7816/1775903447816-i",

    "RCB_vs_KKR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1834/1742497751834-i",
    "RCB_vs_SRH": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/7607/1747928747607-i",
    "RCB_vs_DC": "https://sportsmintmedia.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-16-at-11.32.57-AM.jpeg",
    "RCB_vs_RR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/3113/1745423283113-i",
    "RCB_vs_PBKS": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/4495/1744903294495-i",
    "RCB_vs_GT": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/2357/1743520252357-i",
    "RCB_vs_LSG": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/4936/1748259554936-i",

    "KKR_vs_CSK": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/9167/1744282189167-i",
    "KKR_vs_MI": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/7716/1743347067716-i",
    "KKR_vs_RCB": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1834/1742497751834-i",

    "KKR_vs_SRH": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr0nvynAcabDcOrKXyKz95TeJzfln2eI6U5w&s",
    "KKR_vs_DC": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/2572/1745843292572-i",
    "KKR_vs_RR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1515/1742913691515-i",
    "KKR_vs_PBKS": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/485/1744644510485-i",
    "KKR_vs_GT": "https://newstapone.com/wp-content/uploads/2026/04/img_0966-1024x576.jpg",
    "KKR_vs_LSG": "https://sportsmintmedia.com/wp-content/uploads/2025/04/KKR-vs-LSG-1200x675.jpg",

    "SRH_vs_CSK": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/8203/1776399038203-i",
    "SRH_vs_MI": "https://www.mumbaiindians.com/static-assets/waf-images/a2/49/24/0/article-5784-sunrisers-vs-mi1.png",
    "SRH_vs_RCB": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/7607/1747928747607-i",
    "SRH_vs_KKR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/8284/1743605638284-i",

    "SRH_vs_DC": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/2803/1776584212803-i",
    "SRH_vs_RR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/9355/1776029099355-i",
    "SRH_vs_PBKS": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/9819/1744385209819-i",
    "SRH_vs_GT": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/4309/1743868234309-i",
    "SRH_vs_LSG": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/7298/1743002907298-i",

    "DC_vs_CSK": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/3194/1743780583194-i",
    "DC_vs_MI": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/9592/1747748149592-i",
    "DC_vs_RCB": "https://sportsmintmedia.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-16-at-11.32.57-AM.jpeg",
    "DC_vs_KKR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/2572/1745843292572-i",
    "DC_vs_SRH": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/2216/1743263092216-i",

    "DC_vs_RR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/9704/1744722199704-i",
    "DC_vs_PBKS": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/5911/1746627225911-i",
    "DC_vs_GT": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/6826/1744990206826-i",
    "DC_vs_LSG": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/2215/1742753472215-i",

    "RR_vs_CSK": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/5655/1743263315655-i",
    "RR_vs_MI": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1271/1746014051271-i",
    "RR_vs_RCB": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/3113/1745423283113-i",
    "RR_vs_KKR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1515/1742913691515-i",
    "RR_vs_SRH": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/8157/1742577728157-i",

    "RR_vs_PBKS": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1002/1747507771002-i",
    "RR_vs_GT": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/8196/1744131028196-i",
    "RR_vs_LSG": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1863/1744990351863-i",

    "PBKS_vs_CSK": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/7455/1745924577455-i",
    "PBKS_vs_MI": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/7378/1748175907378-i",
    "PBKS_vs_RCB": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/4495/1744903294495-i",
    "PBKS_vs_KKR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/485/1744644510485-i",
    "PBKS_vs_SRH": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/9819/1744385209819-i",
    "PBKS_vs_DC": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/5911/1746627225911-i",
    "PBKS_vs_RR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1002/1747507771002-i",

    "PBKS_vs_GT": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1923/1742827021923-i",
    "PBKS_vs_LSG": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/4166/1743421634166-i",

    "GT_vs_CSK": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/2714/1748082122714-i",
    "GT_vs_MI": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1167/1743175411167-i",
    "GT_vs_RCB": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/2357/1743520252357-i",
    "GT_vs_KKR": "https://newstapone.com/wp-content/uploads/2026/04/img_0966-1024x576.jpg",
    "GT_vs_SRH": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9FELbajMb2GvuRFzICyemj4Pnro6iFjLiXw&s",
    "GT_vs_DC": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/6826/1744990206826-i",
    "GT_vs_RR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/8196/1744131028196-i",
    "GT_vs_PBKS": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1923/1742827021923-i",

    "GT_vs_LSG": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/3705/1744385043705-i",

    "LSG_vs_CSK": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/6873/1744556376873-i",
    "LSG_vs_MI": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/9545/1743692969545-i",
    "LSG_vs_RCB": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/4936/1748259554936-i",
    "LSG_vs_KKR": "https://sportsmintmedia.com/wp-content/uploads/2025/04/KKR-vs-LSG-1200x675.jpg",
    "LSG_vs_SRH": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/7298/1743002907298-i",
    "LSG_vs_DC": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/2215/1742753472215-i",
    "LSG_vs_RR": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1863/1744990351863-i",
    "LSG_vs_PBKS": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/4166/1743421634166-i",
    "LSG_vs_GT": "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/3705/1744385043705-i",

  };


  const convertToTodayDate = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    if (modifier.toLowerCase() === 'pm' && hours !== '12') {
      hours = parseInt(hours) + 12;
    }
    if (modifier.toLowerCase() === 'am' && hours === '12') {
      hours = '00';
    }

    const now = new Date();
    const matchDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );

    return matchDate;
  };

  // Transform matches from Redux state to liveMatches format for UI
  const transformMatches = (matchesData) => {
    return matchesData?.map((m) => {
      const key = `${m.team1}_vs_${m.team2}`;

      return {
        id: m.id,
        title: m.match || `${m.team1} vs ${m.team2}`,
        status: m.status || 'UPCOMING',
        image: matchImages[key] || "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202311/ipl-trophyjpeg-310330-16x9.jpeg?VersionId=Gk8RUADOTtcmYUr8qTymwrDlFiRZP8mK&size=690:388",

        teams: [
          { name: m.team1, price: m.team1Price || 0, change: m.team1Change || 0, volume: m.team1Volume || 0 },
          { name: m.team2, price: m.team2Price || 0, change: m.team2Change || 0, volume: m.team2Volume || 0 }
        ],

        date: m.date,
        time: m.time,
        venue: m.venue,
        ground: m.ground,
        totalVolume: (m.team1Volume || 0) + (m.team2Volume || 0)
      };
    }) || [];
  };

  const currentMatch = (() => {
    if (!liveMatches || liveMatches.length === 0) return null;

    if (liveMatches.length === 1) return liveMatches[0];

    return [...liveMatches].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    })[0];
  })();
  const upcomingMatches = (() => {

    if (liveMatches && liveMatches.length > 1) {
      const sorted = [...liveMatches].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
      });

      // 🔥 remove first + limit to 3
      return sorted.slice(1, 4);
    }

    // Case 2
    const upcomingFromLive = (liveMatches || []).filter(m => m.status === 'UPCOMING');

    if (upcomingFromLive.length > 0) {
      return upcomingFromLive
        .sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA - dateB;
        })
        .slice(0, 3);
    }

    return [];
  })();


  useEffect(() => {
    const loadAndSetMatches = async () => {
      // Check localStorage first
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

      if (cachedData && cachedTime) {
        const isExpired = Date.now() - Number(cachedTime) > EXPIRY_TIME;

        if (!isExpired) {
          // Use cached data

          const matchesData = JSON.parse(cachedData);
          const transformedMatches = transformMatches(matchesData);
          setLiveMatches(transformedMatches);

          return;
        }
      }

      // Fetch from API if no cache or cache expired
      try {
        const result = await dispatch(getMatches());

        if (getMatches.fulfilled.match(result)) {
          const data = result.payload;
          const matchesData = data.matches || [];

          // Transform and set state
          const transformedMatches = transformMatches(matchesData);
          setLiveMatches(transformedMatches);

          // Save to localStorage
          localStorage.setItem(CACHE_KEY, JSON.stringify(matchesData));
          localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

          console.log("Fetched and set matches from API:", transformedMatches);
        } else {
          console.error(result.payload || "Failed to fetch matches");
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    loadAndSetMatches();
  }, [dispatch]);

  const stats = [
    { value: '₹500Cr+', label: 'DAILY VOLUME', icon: BarChart3 },
    { value: '50K+', label: 'ACTIVE TRADERS', icon: Users },
    { value: '99.99%', label: 'UPTIME', icon: Shield },
    { value: '<0.1ms', label: 'LATENCY', icon: Zap }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'REAL-TIME EXECUTION',
      description: 'Sub-millisecond order execution with institutional-grade infrastructure and direct market access.',
    },
    {
      icon: Shield,
      title: 'REGULATORY COMPLIANCE',
      description: 'Full SEBI compliance with KYC/AML verification and comprehensive audit trails.',
    },
    {
      icon: Zap,
      title: 'ULTRA-LOW LATENCY',
      description: 'Co-located servers with optimized networking for professional trading performance.',
    },
    {
      icon: Building2,
      title: 'INSTITUTIONAL GRADE',
      description: 'Enterprise-level security, redundancy, and scalability for serious investors.',
    }
  ];
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading leaderboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black font-raleway">

      <section className="relative  bg-white dark:bg-black">

        <div
          className="max-w-8xl flex flex-row items-end justify-start mx-auto h-screen px-4 bg-top bg-cover sm:px-6 lg:px-8 pb-28"
          style={{
            backgroundImage: `url(${currentMatch?.image ||
              "https://img1.hotstarext.com/image/upload/f_auto/sources/r1/cms/prod/1863/1744990351863-i"
              })`
          }}
        >
          <div
            className={`pointer-events-none absolute top-0 left-0 h-full w-[100%] z-5 bg-gradient-to-r from-black to-transparent`}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-row items-end justify-between z-20 w-full"
          >

            {/* 🔥 LEFT: Current Match Section */}
            <div className="  flex flex-col items-center justify-end    w-[40%]  rounded-sm">

              <div className="flex flex-col gap-6 items-center ">

                <div className="text-6xl md:text-[6rem] font-black text-white tracking-tighter leading-none">
                  {currentMatch
                    ? (
                      <>
                        {currentMatch.teams[0].name}
                        <span className="text-orange-500 ml-1"> vs </span>
                        {currentMatch.teams[1].name}
                      </>
                    )
                    : "No Match"}
                </div>

                <p className="text-xl md:text-2xl text-white mb-12 max-w-xl font-light">
                  {currentMatch
                    ? currentMatch.status === "In Progress"
                      ? "Start trading now - match is live!"
                      : `Match starts at ${currentMatch.time}`
                    : "No matches available"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                {currentMatch && (currentMatch.status === "In Progress" ||  convertToTodayDate(currentMatch.time) <= new Date()) ? (
                  <Link
                    to="/trading"
                    className="inline-flex items-center px-8 py-4 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-semibold rounded-sm transition-colors"
                  >
                    START TRADING
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center px-8 py-4 bg-gray-500 text-white font-semibold rounded-sm cursor-not-allowed"
                  >
                    STARTS AT {currentMatch?.time || "--"}
                  </button>
                )}

                <Link
                  to="/analytics"
                  className="inline-flex items-center px-8 py-4 bg-white dark:bg-black text-black dark:text-white font-semibold rounded-sm border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  VIEW ANALYTICS
                </Link>
              </div>
            </div>

            {/* 🔥 RIGHT: Upcoming Matches Section */}
            {upcomingMatches && upcomingMatches.length > 0 && (
              <div className="flex flex-row gap-4  px-4 w-[50%] justify-end no-scrollbar scroll-smooth">
                {upcomingMatches.map((m) => (
                  <div
                    key={m.id}
                    className="relative min-w-[160px] h-[90px] rounded-lg overflow-hidden cursor-pointer  hover:scale-105 transition flex-shrink-0"
                  >
                    <img
                      src={m.image || "https://static.toiimg.com/thumb/msid-78076709,width-400,resizemode-4/78076709.jpg"}
                      alt={m.title}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute bottom-0 w-full p-2 bg-gradient-to-t from-black/100 to-transparent text-white">
                      <p className="text-sm font-semibold">
                        {m.teams[0].name} vs {m.teams[1].name}
                      </p>
                      <p className="text-xs opacity-80">
                        {m.date} • {m.time}
                      </p>
                    </div>
                  </div>
                ))}


              </div>
            )}

          </motion.div>
        </div>
      </section>
      {/* Live Trading Terminal Preview */}
      <section className="py-20 bg-white dark:bg-black border-t border-gray-200 dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 "
          >
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-4 tracking-tight">
              PROFESSIONAL TERMINAL
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-grotesque">
              Advanced trading interface with real-time market data and institutional-grade execution
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-black rounded-sm p-8 border border-black dark:border-white"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Market Data */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-black rounded-sm p-6 border border-black dark:border-white">
                  <h3 className="text-black dark:text-white font-bold mb-4 text-lg">LIVE MARKET DATA</h3>
                  <div className="space-y-3">
                    {[
                      { symbol: 'MI', price: '125.50', change: '+2.5', volume: '15.4K', high: '128.75', low: '122.30' },
                      { symbol: 'CSK', price: '142.75', change: '-1.8', volume: '18.7K', high: '145.20', low: '140.50' },
                      { symbol: 'RCB', price: '98.25', change: '+5.2', volume: '12.3K', high: '102.80', low: '95.40' },
                      { symbol: 'DC', price: '118.90', change: '-3.1', volume: '9.8K', high: '122.45', low: '116.80' }
                    ].map((stock, index) => (
                      <div key={index} className="grid grid-cols-6 gap-4 text-sm">
                        <span className="text-black dark:text-white font-bold">{stock.symbol}</span>
                        <span className="text-black dark:text-white">₹{stock.price}</span>
                        <span
                          className={`${stock.change.startsWith('+')
                            ? 'text-black dark:text-white'
                            : 'text-white dark:text-black'
                            }`}
                        >
                          {stock.change}%
                        </span>
                        <span className="text-black dark:text-white">{stock.volume}</span>
                        <span className="text-black dark:text-white">H:{stock.high}</span>
                        <span className="text-black dark:text-white">L:{stock.low}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Order Panel */}
              <div className="bg-white dark:bg-black rounded-sm p-6 border border-black dark:border-white">
                <h3 className="text-black dark:text-white font-bold mb-4 text-lg">ORDER TERMINAL</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-black dark:bg-white text-white dark:text-black py-3 px-4 rounded-sm font-bold text-sm">
                      BUY
                    </button>
                    <button className="bg-white dark:bg-black text-black dark:text-white py-3 px-4 rounded-sm font-bold text-sm border border-black dark:border-white">
                      SELL
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="QUANTITY"
                    className="w-full bg-white dark:bg-black text-black dark:text-white p-3 rounded-sm text-sm border border-black dark:border-white"
                  />
                  <input
                    type="text"
                    placeholder="PRICE"
                    className="w-full bg-white dark:bg-black text-black dark:text-white p-3 rounded-sm text-sm border border-black dark:border-white"
                  />
                  <button className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-sm font-bold">
                    EXECUTE ORDER
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Live Markets */}
      <section className="py-20 bg-white dark:bg-black border-t border-gray-200 dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-4 tracking-tight">
              LIVE MARKETS
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
              Real-time price discovery with institutional-grade market infrastructure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {liveMatches.length === 0 && (
              <div className="col-span-2 text-center text-gray-500 dark:text-gray-400 py-12">No matches available.</div>
            )}
            {liveMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-sm p-6 hover:shadow-card transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    {match.title}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold ${match.status === 'In Progress'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-gray-400 text-white dark:bg-gray-600 dark:text-white'
                    }`}>
                    {(match.status === 'In Progress' ||  convertToTodayDate(match.time) <= new Date()) && <Play className="w-3 h-3 mr-1" />}
                    Live
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{match.date}</span>
                  <span>{match.time}</span>
                  <span>{match.venue}</span>
                  <span>{match.ground}</span>
                </div>
                <div className="space-y-4">
                  {match.teams.map((team, teamIndex) => (
                    <div key={teamIndex} className="flex items-center justify-between p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-sm">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-black dark:bg-white rounded-sm flex items-center justify-center">
                          <span className="text-white dark:text-black font-bold text-sm">{team.name}</span>
                        </div>
                        <div>
                          <p className="font-bold text-black dark:text-white">{team.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            VOL: {team.volume?.toLocaleString?.() || team.volume}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-black dark:text-white">
                          ₹{Number(team.price).toFixed(2)}
                        </p>
                        <p className={`text-sm font-bold ${team.change >= 0
                          ? 'text-black dark:text-white'
                          : 'text-gray-600 dark:text-gray-400'
                          }`}>
                          {team.change >= 0 ? '+' : ''}{Number(team.change).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to={`/match-performance/${match.id}`}
                  className="mt-6 w-full inline-flex items-center justify-center px-4 py-3 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold rounded-sm transition-colors"
                >
                  VIEW PERFORMANCE
                  <ArrowUpRight className="ml-2 w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-black border-t border-gray-200 dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-4 tracking-tight">
              INSTITUTIONAL FEATURES
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
              Professional trading infrastructure for serious investors
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-black border border-black dark:border-white rounded-sm p-8"
                >
                  <div className="w-12 h-12 bg-black dark:bg-white rounded-sm flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-white dark:text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-white font-light leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Market Status 
      <section className="py-20 bg-black dark:bg-white border-t border-white dark:border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white dark:text-black mb-8 tracking-tight">
              MARKET STATUS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-white dark:text-black mb-2">OPEN</p>
                <p className="text-sm text-white dark:text-black font-medium">MARKET STATUS</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white dark:text-black mb-2">₹15.7Cr</p>
                <p className="text-sm text-white dark:text-black font-medium">DAILY VOLUME</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white dark:text-black mb-2">1,250</p>
                <p className="text-sm text-white dark:text-black font-medium">ACTIVE ORDERS</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white dark:text-black mb-2">8</p>
                <p className="text-sm text-white dark:text-black font-medium">LIVE MATCHES</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>*/}
      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-black border-t border-gray-200 dark:border-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-4 tracking-tight">
              JOIN THE EXCHANGE
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 font-light">
              Professional sports trading platform. Zero hidden fees. Complete transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                OPEN ACCOUNT
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/trading"
                className="inline-flex items-center px-8 py-4 bg-transparent text-black dark:text-white font-bold rounded-sm border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                VIEW DEMO
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;