import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, CheckBadgeIcon, ShieldCheckIcon, UserGroupIcon, GlobeAltIcon } from '../components/Icons';

export default function BecomeDistributorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-10">
      {/* Header */}
      <header className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </button>
        <h1 className="text-xl font-bold mx-auto dark:text-gray-100">Become a Distributor</h1>
        <div className="w-6"></div>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-brand-light dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckBadgeIcon className="w-10 h-10 text-brand-blue" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Verify Your Status</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
                Join the official network of verified Enagic® Distributors on Kangen Share.
            </p>
        </div>

        {/* Benefits */}
        <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <ShieldCheckIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Build Trust</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Verified badges show travelers that you are a legitimate owner and distributor, increasing trust and safety.
                    </p>
                </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <GlobeAltIcon className="w-8 h-8 text-brand-blue flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Host Travelers</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Only verified distributors can enable hosting features to share water and connect with the global community.
                    </p>
                </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <UserGroupIcon className="w-8 h-8 text-purple-500 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Grow Your Network</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Connect with prospects and other owners. Your profile gets higher visibility in search results.
                    </p>
                </div>
            </div>
        </div>

        {/* CTA */}
        <div className="pt-4">
            <Link 
                to="/profile/edit" 
                className="block w-full py-4 bg-brand-blue text-white text-center font-bold rounded-2xl shadow-lg hover:bg-blue-600 transition-transform active:scale-95"
            >
                Start Verification
            </Link>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
                You will need to provide your Distributor ID and a proof document (e.g., ID card, invoice).
            </p>
        </div>
      </div>
    </div>
  );
}
