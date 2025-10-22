import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'TRADING', href: '/trading' },
      { label: 'ANALYTICS', href: '/analytics' },
      { label: 'PORTFOLIO', href: '/portfolio' },
      { label: 'LEADERBOARD', href: '/leaderboard' },
    ],
    company: [
      { label: 'ABOUT', href: '/about' },
      { label: 'CAREERS', href: '/careers' },
      { label: 'PRESS', href: '/press' },
      { label: 'INVESTORS', href: '/investors' },
    ],
    support: [
      { label: 'HELP CENTER', href: '/help' },
      { label: 'API DOCS', href: '/api-docs' },
      { label: 'SYSTEM STATUS', href: '/status' },
      { label: 'CONTACT', href: '/contact' },
    ],
    legal: [
      { label: 'TERMS', href: '/terms' },
      { label: 'PRIVACY', href: '/privacy' },
      { label: 'COMPLIANCE', href: '/compliance' },
      { label: 'RISK DISCLOSURE', href: '/risk' },
    ],
  };

  return (
    <footer className="bg-black dark:bg-white text-white dark:text-black border-t-2 border-white dark:border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white dark:bg-black rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-black dark:text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">CRIXCHANGE</span>
            </Link>
            <p className="text-gray-400 dark:text-gray-600 mb-6 max-w-md font-mono leading-relaxed">
              Professional sports stock exchange platform. Institutional-grade trading infrastructure 
              with regulatory compliance and real-time market data.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                <span className="text-gray-400 dark:text-gray-600 font-mono">support@crixchange.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                <span className="text-gray-400 dark:text-gray-600 font-mono">+91 1800-CRIX-000</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                <span className="text-gray-400 dark:text-gray-600 font-mono">Mumbai Financial District, India</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">PLATFORM</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black transition-colors duration-200 font-mono text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">COMPANY</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black transition-colors duration-200 font-mono text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">SUPPORT</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black transition-colors duration-200 font-mono text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">LEGAL</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black transition-colors duration-200 font-mono text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Market Status */}
        <div className="border-t border-gray-800 dark:border-gray-200 pt-8 mt-12">
          <div className="bg-gray-900 dark:bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white dark:text-black mb-4 uppercase tracking-wide font-mono">
              MARKET STATUS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-white dark:text-black font-mono">OPEN</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 font-mono">MARKET STATUS</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white dark:text-black font-mono">09:15</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 font-mono">NEXT CLOSE</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white dark:text-black font-mono">8</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 font-mono">LIVE MATCHES</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white dark:text-black font-mono">0.8ms</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 font-mono">AVG LATENCY</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 dark:border-gray-200 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-gray-400 dark:text-gray-600 text-sm mb-4 md:mb-0 font-mono">
              © {currentYear} CRIXCHANGE SECURITIES LTD. ALL RIGHTS RESERVED.
            </div>

            {/* Regulatory */}
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500 dark:text-gray-500 font-mono">SEBI REG: INZ000123456</span>
              <span className="text-xs text-gray-500 dark:text-gray-500 font-mono">NSE: 12345</span>
              <span className="text-xs text-gray-500 dark:text-gray-500 font-mono">BSE: 67890</span>
            </div>
          </div>

          {/* Regulatory Notice */}
          <div className="mt-6 pt-6 border-t border-gray-800 dark:border-gray-200">
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed font-mono">
              <strong>RISK DISCLOSURE:</strong> Trading in sports securities involves substantial risk and may not be suitable for all investors. 
              Past performance is not indicative of future results. CrixChange Securities Ltd. is registered with SEBI and follows all applicable 
              regulations for securities trading in India. Please read all risk disclosures before trading.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;