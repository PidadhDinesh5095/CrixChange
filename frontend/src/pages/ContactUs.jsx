import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-10 font-sans">
    <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
    <p className="mb-10 text-gray-600 dark:text-gray-400">
      Questions about your account, a trade, or how CrixChange works? Reach out to us directly —
      we're happy to help.
    </p>

    <div className="space-y-6 mb-10">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-white dark:text-black" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
          <a href="mailto:crixchangeindia@gmail.com" className="font-bold hover:underline">
            crixchangeindia@gmail.com
          </a>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0">
          <Phone className="w-5 h-5 text-white dark:text-black" />
        </div>
       
      </div>

      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-white dark:text-black" />
        </div>
        
      </div>
    </div>

    <p className="text-sm text-gray-500 dark:text-gray-500">
      Since CrixChange is a paper-trading platform, we don't handle real-money deposits or
      withdrawals — but we're glad to help with account issues, bugs, or feedback.
    </p>
  </div>
);

export default Contact;