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
    <footer className="bg-black dark:bg-white font-sans text-white dark:text-black border-t-2 border-white dark:border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 font-sans">
          {/* Brand Section */}
          <div className="lg:col-span-2 font-sans">
            <Link to="/" className="flex items-center space-x-3  text-[2.6rem] font-bold flex-shrink-0">
              <h1 c>Crixchange<span className='text-red-500 ml-[0.5] font-bold'>.</span></h1>
            </Link>
            <p className="text-gray-400 dark:text-gray-600 mb-6 max-w-md font-sans leading-relaxed">
              Professional sports stock exchange platform. Institutional-grade trading infrastructure
              with regulatory compliance and real-time market data.
            </p>
            {/* Contact Info */}
            <div className="space-y-3 font-sans">
              <div className="flex items-center space-x-3 font-sans">
                <Mail className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                <span className="text-gray-400 dark:text-gray-600 font-sans">support@crixchange.com</span>
              </div>
              <div className="flex items-center space-x-3 font-sans">
                <Phone className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                <span className="text-gray-400 dark:text-gray-600 font-sans">+91 1800-CRIX-000</span>
              </div>
              <div className="flex items-center space-x-3 font-sans">
                <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                <span className="text-gray-400 dark:text-gray-600 font-sans">Mumbai Financial District, India</span>
              </div>
            </div>
          </div>
          {/* Footer Links */}
          <div className="font-sans">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide font-sans">PLATFORM</h3>
            <ul className="space-y-3 font-sans">
              {footerLinks.platform.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black transition-colors duration-200 font-sans text-sm"
                  >
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
                  <Link
                    to={link.href}
                    className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black transition-colors duration-200 font-sans text-sm"
                  >
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
                  <Link
                    to={link.href}
                    className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black transition-colors duration-200 font-sans text-sm"
                  >
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
                  <Link
                    to={link.href}
                    className="text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-black transition-colors duration-200 font-sans text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 dark:border-gray-200 pt-8 mt-8 font-sans">

          <div className="mt-6 pt-6 border-t border-gray-800 dark:border-gray-200 font-sans">
            <p className="text-md text-gray-500 dark:text-gray-500 leading-relaxed font-sans">
              <strong>RISK DISCLOSURE:</strong> Trading on CrixChange involves virtual team stocks whose values fluctuate based on real-world cricket team performance. Prices are subject to change depending on market sentiment, player form, and match outcomes. Please understand all rules and risks before participating.
              <br /><br />
              <span className="block mt-2">
                <strong>Attention Users:</strong>
                <ul className="list-disc ml-5">
                  <li>CrixChange operates as a cricket team stock trading simulation platform. It does not facilitate investment or trading in actual securities or financial markets.</li>
                  <li>All transactions, trades, and balances on CrixChange are virtual and hold no monetary value outside the platform unless explicitly stated.</li>
                  <li>Ensure your account details and contact information are accurate to receive important updates, verification requests, and notifications.</li>
                  <li>Prevent unauthorized access by keeping your account credentials secure. CrixChange will never ask for your password or OTP through phone or email.</li>
                  <li>KYC verification may be required for withdrawals, rewards, or advanced features to ensure platform integrity and prevent misuse.</li>
                  <li>Do not share personal or financial information with anyone claiming to represent CrixChange outside official communication channels.</li>
                  <li>CrixChange does not offer betting, gambling, or stock market advisory services. Any such claims made by third parties are fraudulent — please report them immediately.</li>
                </ul>
              </span>

              <span className="block mt-2">
                <strong>Complaint Redressal:</strong> For any platform-related issues, please write to
                <a href="mailto:support@crixchange.com" className="underline"> crixchangeindia@gmail.com</a>.
                Our team ensures prompt review and resolution of all user concerns. <br />
                <br />
                <strong>Dispute Resolution:</strong> In case of unresolved issues, users can escalate the matter via our in-app support section. We ensure transparent communication and fair handling of every complaint.
              </span>

             
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;