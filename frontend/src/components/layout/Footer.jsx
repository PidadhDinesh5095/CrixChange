import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'MARKETS', href: '/markets' },
      { label: 'PORTFOLIO', href: '/portfolio' },
      { label: 'IPO', href: '/ipos' },
    ],
    company: [
      { label: 'ABOUT US', href: '/about' },
      { label: 'HOW IT WORKS', href: '/how-it-works' },
    ],
    support: [
      { label: 'CONTACT', href: '/contact' },
    ],
    legal: [
      { label: 'TERMS', href: '/terms' },
      { label: 'PRIVACY', href: '/privacy' },
      { label: 'RISK DISCLOSURE', href: '/risk' },
    ],
  };

  return (
    <footer className="bg-black dark:bg-white font-sans text-white dark:text-black border-t-2 border-white dark:border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 font-sans">
          <div className="lg:col-span-2 font-sans">
            <Link to="/" className="flex items-center space-x-3 text-[2.6rem] font-bold flex-shrink-0">
              <h1>Crixchange<span className='text-red-500 ml-[0.5] font-bold'>.</span></h1>
            </Link>
            <p className="text-gray-400 dark:text-gray-600 mb-3 max-w-md font-sans leading-relaxed">
              India's favourite way to trade IPL team stocks — built for cricket fans who love the
              game and the market.
            </p>
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-4 h-4 text-[#008F75]" />
              <span className="text-xs font-bold uppercase tracking-wide text-[#008F75]">
                100% Paper Trading — No Real Money Involved
              </span>
            </div>
            <div className="space-y-3 font-sans">
              <div className="flex items-center space-x-3 font-sans">
                <Mail className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                <span className="text-gray-400 dark:text-gray-600 font-sans">crixchangeindia@gmail.com</span>
              </div>
              
            </div>
          </div>

          <div className="font-sans">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide font-sans">PLATFORM</h3>
            <ul className="space-y-3 font-sans">
              {footerLinks.platform.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black transition-colors duration-200 font-sans text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="font-sans">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide font-sans">COMPANY</h3>
            <ul className="space-y-3 font-sans">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black transition-colors duration-200 font-sans text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="font-sans">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide font-sans">SUPPORT</h3>
            <ul className="space-y-3 font-sans">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black transition-colors duration-200 font-sans text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="font-sans">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide font-sans">LEGAL</h3>
            <ul className="space-y-3 font-sans">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black transition-colors duration-200 font-sans text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-200 pt-8 mt-8 font-sans">
          <div className="pt-6 font-sans">
            <p className="text-md text-gray-500 dark:text-gray-500 leading-relaxed font-sans">
              <strong>DISCLAIMER:</strong> CrixChange is a fantasy-style, skill-based simulation
              platform for trading virtual IPL team stocks. It is <strong>not</strong> a stockbroker,
              exchange, or investment platform, and does not deal in real securities or currencies.
              All balances and trades are virtual play-money and carry no real-world monetary value.
              A flat 0.3% fee applies to every executed trade, deducted in virtual currency only.
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
            For entertainment and educational
            purposes only — no real money trading.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;