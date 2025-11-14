import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { DropletIcon, MapPinIcon, StarIcon, ShieldCheckIcon, DevicePhoneMobileIcon, ChatBubbleOvalLeftEllipsisIcon, GlobeAltIcon, CheckBadgeIcon } from '../components/Icons';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-light dark:bg-blue-900/50 text-brand-blue mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{children}</p>
  </div>
);

const HowItWorksStep: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-light dark:bg-blue-900/50 text-brand-blue mx-auto mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-semibold mb-1 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 px-4">{children}</p>
    </div>
);

const AppMockup = () => (
    <div className="w-full max-w-sm mx-auto bg-gray-800 rounded-[2.5rem] shadow-2xl shadow-gray-400/30 dark:shadow-black/30 p-2.5">
        <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[2rem] p-1.5">
            <div className="bg-gray-50 dark:bg-gray-800 h-[480px] rounded-[1.75rem] overflow-hidden">
                <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-bold text-center dark:text-gray-100">Find a Host</p>
                </div>
                <div className="p-2 space-y-2">
                    {/* Mock Host Card 1 */}
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                        <img src="https://picsum.photos/seed/sarah/80/80" alt="Sarah" className="w-12 h-12 rounded-md object-cover" />
                        <div className="flex-1">
                            <div className="flex items-center">
                                <h4 className="font-bold text-sm dark:text-gray-100">Sarah Chen</h4>
                                <CheckBadgeIcon className="w-4 h-4 text-brand-blue ml-1" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">San Francisco</p>
                            <div className="flex items-center mt-0.5">
                                <StarIcon className="w-3 h-3 text-yellow-400" />
                                <span className="ml-1 text-xs font-semibold dark:text-gray-200">4.9</span>
                            </div>
                        </div>
                    </div>
                    {/* Mock Host Card 2 */}
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                        <img src="https://picsum.photos/seed/ben/80/80" alt="Ben" className="w-12 h-12 rounded-md object-cover" />
                        <div className="flex-1">
                            <div className="flex items-center">
                                <h4 className="font-bold text-sm dark:text-gray-100">Ben Miller</h4>
                                <CheckBadgeIcon className="w-4 h-4 text-brand-blue ml-1" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">New York</p>
                            <div className="flex items-center mt-0.5">
                                <StarIcon className="w-3 h-3 text-yellow-400" />
                                <span className="ml-1 text-xs font-semibold dark:text-gray-200">5.0</span>
                            </div>
                        </div>
                    </div>
                    {/* Mock Host Card 3 */}
                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                        <img src="https://picsum.photos/seed/kenji/80/80" alt="Kenji" className="w-12 h-12 rounded-md object-cover" />
                        <div className="flex-1">
                             <div className="flex items-center">
                                <h4 className="font-bold text-sm dark:text-gray-100">Kenji Tanaka</h4>
                                <CheckBadgeIcon className="w-4 h-4 text-brand-blue ml-1" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Los Angeles</p>
                            <div className="flex items-center mt-0.5">
                                <StarIcon className="w-3 h-3 text-yellow-400" />
                                <span className="ml-1 text-xs font-semibold dark:text-gray-200">4.9</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


export default function LandingPage() {
  const { openLoginModal } = useAuth();
  
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 antialiased overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 border-b border-gray-200/80 dark:border-gray-700/80">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold dark:text-white">Kangen Share</h1>
          <button onClick={openLoginModal} className="bg-brand-blue text-white font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
            Login
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 text-center bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-4 opacity-0 animate-fade-in-up dark:text-white" style={{ animationDelay: '100ms' }}>
              Find Kangen Water<br />Anywhere You Travel.
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Connect with verified Kangen K8 owners and get alkaline water wherever you go.
            </p>
            <div className="flex justify-center gap-4 mb-16 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <Link to="/signup" className="bg-brand-blue text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
                Get Started
              </Link>
              <a href="#features" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold px-8 py-3 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Learn More
              </a>
            </div>
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <AppMockup />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12 opacity-0 animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold dark:text-white">How It Works</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Get water in three simple steps.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <HowItWorksStep icon={<MapPinIcon className="w-8 h-8" />} title="1. Find a Host">
                            Search for verified hosts in your travel destination.
                        </HowItWorksStep>
                    </div>
                    <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <HowItWorksStep icon={<DropletIcon className="w-8 h-8" />} title="2. Request Water">
                            Choose your pH level and schedule a pickup time.
                        </HowItWorksStep>
                    </div>
                    <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <HowItWorksStep icon={<StarIcon className="w-8 h-8" />} title="3. Pick up & Enjoy">
                            Meet your host, collect your water, and stay hydrated.
                        </HowItWorksStep>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 opacity-0 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold dark:text-white">Designed for Travelers</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Everything you need for a seamless experience.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <FeatureCard icon={<ShieldCheckIcon className="w-7 h-7" />} title="Verified K8 Owners">
                        Every host is a verified Kangen K8 owner, ensuring quality and safety.
                    </FeatureCard>
                </div>
                <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <FeatureCard icon={<DevicePhoneMobileIcon className="w-7 h-7" />} title="Clean & Minimal App">
                        Our app is designed to be intuitive and easy to use, so you can focus on your trip.
                    </FeatureCard>
                </div>
                <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <FeatureCard icon={<ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7" />} title="Host Ratings & Reviews">
                        Read reviews from other travelers to find the perfect host for your needs.
                    </FeatureCard>
                </div>
                <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <FeatureCard icon={<GlobeAltIcon className="w-7 h-7" />} title="Travel-Friendly">
                        Access Kangen water in multiple cities, with more locations added regularly.
                    </FeatureCard>
                </div>
            </div>
          </div>
        </section>
        
        {/* Why Kangen Share */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <div className="opacity-0 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Why Kangen Share?</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                Traveling with a Kangen machine can be cumbersome. Kangen Share eliminates the hassle by connecting you with a network of fellow owners. Now you can enjoy the benefits of alkaline water without sacrificing luggage space or worrying about transportation, making your travels lighter and healthier.
                </p>
            </div>
          </div>
        </section>
        
        {/* About Kangen Share */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <div className="opacity-0 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">About Kangen Share</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                Our mission is to foster a global community of wellness enthusiasts, making healthy hydration accessible everywhere. We value trust, community, and the shared passion for Kangen water, ensuring every connection made on our platform is safe, reliable, and positive.
                </p>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <div className="bg-brand-blue text-white rounded-3xl p-12 md:p-16 max-w-4xl mx-auto opacity-0 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Be the first to access Kangen water anywhere.</h2>
              <Link to="/signup" className="bg-white text-brand-blue font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors mt-4 inline-block">
                Get Started Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-8 text-center text-gray-500 dark:text-gray-400">
          <div className="flex justify-center gap-6 mb-4">
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">About</a>
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">Contact</a>
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">Privacy Policy</a>
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">Terms & Conditions</a>
          </div>
          <p>&copy; {new Date().getFullYear()} Kangen Share. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}