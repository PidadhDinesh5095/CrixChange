import React from 'react';
import { UserPlus, Wallet, LineChart, Repeat, Percent } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: '1. Create Your Account',
    description: 'Sign up for free in seconds. Every new user starts with a virtual wallet balance to begin trading right away.',
  },
  {
    icon: LineChart,
    title: '2. Explore the Market',
    description: 'Browse live IPL team stocks with real-time price charts, order books, and volume data — just like a real exchange.',
  },
  {
    icon: Wallet,
    title: '3. Buy or Apply for an IPO',
    description: 'Place a market or limit order on any team, or apply for shares during a team\'s IPO window before it lists.',
  },
  {
    icon: Repeat,
    title: '4. Track & Trade',
    description: 'Watch prices move with real match performance. Sell, add to your position, or ride out a rough match — your call.',
  },
];

const HowItWorks = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-10 font-sans">
    <h1 className="text-3xl font-bold mb-4">How CrixChange Works</h1>
    <p className="mb-10 text-gray-600 dark:text-gray-400">
      CrixChange turns every IPL team into a tradable virtual stock. Here's how to get started.
    </p>

    <div className="space-y-8 mb-12">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="shrink-0 w-11 h-11 rounded-full bg-black dark:bg-white flex items-center justify-center">
            <step.icon className="w-5 h-5 text-white dark:text-black" />
          </div>
          <div>
            <h3 className="font-bold mb-1">{step.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
          </div>
        </div>
      ))}
    </div>

    <h2 className="text-xl font-semibold mt-8 mb-2">How Prices Move</h2>
    <p className="mb-4">
      Each team's stock price is simulated using a mix of real match results, current form, and
      market sentiment. A strong win can push a team's price up; a poor run of form can pull it
      down — just like sentiment drives real-world stocks.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2 flex items-center gap-2">
      <Percent className="w-5 h-5" /> Trading Fees
    </h2>
    <p className="mb-4">
      CrixChange charges a flat <strong>0.3% fee</strong> on the value of every executed trade — both
      buys and sells. This is deducted automatically from your virtual wallet balance at the time
      of the trade, and helps keep the simulated market realistic. No real money is ever involved.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2">A Quick Reminder</h2>
    <p className="mb-4">
      CrixChange is a skill-based simulation for entertainment and learning. All balances, trades,
      and profits are virtual and hold no real-world monetary value.
    </p>
  </div>
);

export default HowItWorks;