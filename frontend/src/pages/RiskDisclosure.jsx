import React from 'react';

const RiskDisclosure = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-10 font-sans">
    <h1 className="text-3xl font-bold mb-6">Risk Disclosure</h1>
    <p className="mb-2 text-gray-500 text-sm">Last updated: 28-07-2026</p>

    <p className="mb-4">
      CrixChange is a <strong>fantasy-style, skill-based simulation platform</strong>. It allows
      users to trade virtual stocks of IPL cricket teams using play money only. CrixChange is{' '}
      <strong>not</strong> a stockbroker, stock exchange, or investment advisory service, and does
      not deal in real securities, currencies, derivatives, or any other financial instruments.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2">No Real Money Involved</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>All wallet balances, holdings, IPO allotments, and profit/loss figures on CrixChange are entirely virtual and carry no monetary value outside the platform.</li>
      <li>No real currency is ever deposited, withdrawn, wagered, or won through CrixChange.</li>
      <li>Nothing on CrixChange should be interpreted as financial or investment advice.</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-2">Simulated Market Behaviour</h2>
    <p className="mb-4">
      Team stock prices are generated using a simulation model influenced by real IPL match
      results, team form, and public sentiment. While this is designed to feel realistic, price
      movements are not a reflection of any real financial market, and past performance in the
      simulation is not indicative of future price behaviour.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2">Trading Fees</h2>
    <p className="mb-4">
      A flat <strong>0.3% fee</strong> is charged on every executed trade (buy or sell), deducted in
      virtual currency from your wallet. This fee exists purely to simulate transaction costs
      found in real markets and does not represent an actual monetary charge.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2">Not Gambling or Betting</h2>
    <p className="mb-4">
      CrixChange does not offer betting, gambling, or wagering services of any kind. Any third
      party claiming to offer real-money betting or trading "through CrixChange" is fraudulent —
      please report such claims to us immediately at{' '}
      <a href="mailto:crixchangeindia@gmail.com" className="text-blue-600 underline">
        crixchangeindia@gmail.com
      </a>.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2">Account Security</h2>
    <p className="mb-4">
      Keep your account credentials confidential. CrixChange will never ask for your password or
      OTP over phone, SMS, or email.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2">Acknowledgement</h2>
    <p className="mb-4">
      By using CrixChange, you acknowledge that the platform is intended solely for entertainment
      and skill-based learning purposes, that all activity is virtual, and that no real financial
      risk or reward is associated with your use of the platform.
    </p>
  </div>
);

export default RiskDisclosure;