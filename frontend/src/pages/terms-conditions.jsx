import React from 'react';

const TermsConditions = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 mt-10 lg:px-8 font-sans">
    <h1 className="text-3xl font-bold mb-6">Terms &amp; Conditions</h1>
    <p className="mb-2 text-gray-500 text-sm">Last updated: 28-07-2026</p>

    <p className="mb-4">
      This agreement sets out the terms and conditions for use of this application ("CrixChange").
      CrixChange is a fantasy-style, skill-based simulation platform that lets users trade
      <strong> virtual stocks of IPL cricket teams</strong> using play money. CrixChange does not
      offer trading in real securities, shares, currencies, or any other financial instrument, and
      is not a stockbroker, exchange, or investment platform of any kind.
    </p>
    <p className="mb-4">
      By downloading, installing, or using this application, you agree to the following terms and
      conditions.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2">1. Nature of the Platform</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>All "stocks", "IPOs", "wallet balances", and "trades" on CrixChange are entirely virtual and are created for entertainment and skill-building purposes only.</li>
      <li>No real money is ever deposited, withdrawn, wagered, or won on CrixChange. Virtual balances have no monetary value and cannot be exchanged, redeemed, or converted into real currency.</li>
      <li>Team "stock" prices are simulated based on real IPL match performance, form, and public sentiment, purely to make the trading experience realistic — they do not represent any real financial instrument.</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-2">2. Trading Fees</h2>
    <p className="mb-4">
      CrixChange charges a flat <strong>3% transaction fee</strong> on the value of every executed
      trade (buy or sell), deducted in virtual currency from your CrixChange wallet. This fee is
      used to keep the simulated market balanced and realistic and does not involve any real
      monetary charge to the user.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2">3. Eligibility</h2>
    <p className="mb-4">
      You declare that you are of the age of majority under the laws of your jurisdiction to enter
      into this agreement, and that you are using CrixChange for personal entertainment and skill
      development purposes only.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2">4. Acceptable Use</h2>
    <ul className="list-disc ml-6 mb-4">
      <li>You agree not to use bots, scripts, or automated tools to manipulate virtual prices or gain unfair advantage on the platform.</li>
      <li>You agree not to misrepresent CrixChange as a real trading, investment, or gambling platform to any third party.</li>
      <li>CrixChange may suspend or terminate accounts found to be in violation of these terms.</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-2">5. Updates to These Terms</h2>
    <p className="mb-4">
      CrixChange may update the application and vary these terms of use from time to time.
      Continued use of the application after an update implies your acceptance of the revised terms.
    </p>

    <h2 className="text-xl font-semibold mt-8 mb-2">6. General</h2>
    <p className="mb-4">
      By using this application, you acknowledge that you have read, understood, and agree to be
      bound by these terms and conditions. If you do not agree, please do not use the application.
    </p>
    <p className="mb-4">
      For any queries regarding these terms, contact us at{' '}
      <a href="mailto:crixchangeindia@gmail.com" className="text-blue-600 underline">
        crixchangeindia@gmail.com
      </a>.
    </p>
  </div>
);

export default TermsConditions;