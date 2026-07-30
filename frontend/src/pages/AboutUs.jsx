import React from 'react';
import { Trophy, Users, Sparkles, ShieldCheck } from 'lucide-react';

const AboutUs = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-10 font-sans">
    <h1 className="text-3xl font-bold mb-6">About CrixChange</h1>

    <p className="mb-4">
      CrixChange was built on a simple idea: what if you could trade cricket the way you trade the
      stock market? We turn every IPL team into a "stock" whose price moves with real match
      performance, form, and fan sentiment — so you can put your cricket instincts to the test in a
      live, fast-moving market.
    </p>
    <p className="mb-4">
      Think of it as fantasy cricket meets a trading terminal. You get order books, live charts,
      IPOs, portfolios, and price-time priority matching — everything a real exchange has — built
      entirely around the sport you already love.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-10">
      <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800">
        <ShieldCheck className="w-6 h-6 mb-2 text-[#008F75]" />
        <h3 className="font-bold mb-1">100% Paper Trading</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Every rupee on CrixChange is virtual. No real money is ever deposited, wagered, or won.
        </p>
      </div>
      <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800">
        <Trophy className="w-6 h-6 mb-2 text-[#008F75]" />
        <h3 className="font-bold mb-1">Built for Cricket Fans</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Team stock prices move with real IPL performance — reward your cricket knowledge, not just luck.
        </p>
      </div>
      <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800">
        <Sparkles className="w-6 h-6 mb-2 text-[#008F75]" />
        <h3 className="font-bold mb-1">Real Exchange Mechanics</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Live order books, candlestick charts, IPOs, and instant order matching — a genuine trading experience.
        </p>
      </div>
      <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800">
        <Users className="w-6 h-6 mb-2 text-[#008F75]" />
        <h3 className="font-bold mb-1">Learn Without Risk</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A safe space to understand how markets work — no real capital, no real risk.
        </p>
      </div>
    </div>

    <h2 className="text-xl font-semibold mt-8 mb-2">Our Mission</h2>
    <p className="mb-4">
      We want to make market thinking as fun and intuitive as following a cricket match. Whether
      you're a die-hard IPL fan or just curious about how trading works, CrixChange gives you a
      hands-on, zero-risk way to learn — one match, one trade at a time.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2">Get in Touch</h2>
    <p className="mb-4">
      Have feedback, ideas, or just want to say hi? Reach out at{' '}
      <a href="mailto:crixchangeindia@gmail.com" className="text-blue-600 underline">
        crixchangeindia@gmail.com
      </a>.
    </p>
  </div>
);

export default AboutUs;