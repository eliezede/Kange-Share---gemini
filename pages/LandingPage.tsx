
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App.tsx';
import { 
    DropletIcon, 
    MapPinIcon, 
    StarIcon, 
    ShieldCheckIcon, 
    DevicePhoneMobileIcon, 
    ChatBubbleOvalLeftEllipsisIcon, 
    GlobeAltIcon, 
    CheckBadgeIcon,
    SearchIcon,
    UserGroupIcon,
    SparklesIcon,
    ChevronRightIcon,
    BuildingStorefrontIcon
} from '../components/Icons.tsx';

// --- Components ---

const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center p-4">
        <p className="text-3xl md:text-4xl font-bold text-brand-blue">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">{label}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; role: string; location: string }> = ({ quote, author, role, location }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full">
        <div className="flex gap-1 mb-4">
            {[1,2,3,4,5].map(i => <StarIcon key={i} className="w-4 h-4 text-yellow-400" />)}
        </div>
        <p className="text-gray-700 dark:text-gray-300 italic mb-6 flex-1">"{quote}"</p>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400">
                {author.charAt(0)}
            </div>
            <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{author}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{role} • {location}</p>
            </div>
        </div>
    </div>
);

const WellnessPartnerCard: React.FC<{ name: string, category: string, location: string, rating: number, image: string }> = ({ name, category, location, rating, image }) => (
    <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="relative aspect-[4/3] overflow-hidden">
            <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-lg">
                Certified Partner
            </div>
        </div>
        <div className="p-5 flex-1">
            <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">{category}</p>
                <div className="flex items-center gap-1">
                    <StarIcon className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs font-bold dark:text-gray-200">{rating}</span>
                </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5" /> {location}
            </p>
        </div>
    </div>
);

// A CSS-only mockup of the new "Dashboard" UI
const DashboardMockup = () => (
    <div className="relative w-full max-w-[300px] mx-auto bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-brand-blue/20 border-[8px] border-gray-900 overflow-hidden aspect-[9/19]">
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gray-900 z-20 flex justify-between px-6 items-center">
            <div className="w-12 h-4 bg-black rounded-full mx-auto"></div>
        </div>
        
        {/* App Content */}
        <div className="w-full h-full bg-gray-50 dark:bg-gray-900 pt-8 pb-4 px-4 flex flex-col relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center">
                        <DropletIcon className="w-5 h-5 text-brand-blue" />
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white text-sm">Kangen Share</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 mb-6">
                <SearchIcon className="w-5 h-5 text-gray-400" />
                <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>

            {/* Hero Text */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Hi, Alex! 👋</h2>
                <p className="text-sm text-gray-500">Where to next?</p>
            </div>

            {/* Magic Button */}
            <div className="w-full bg-brand-blue text-white rounded-xl p-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 mb-8">
                <MapPinIcon className="w-5 h-5" />
                <span className="font-bold text-sm">Use my current location</span>
            </div>

            {/* Horizontal Scroll Mockup */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm text-gray-800 dark:text-white">Hosts Near You</span>
                </div>
                <div className="flex gap-3 overflow-hidden opacity-70">
                    <div className="w-32 h-40 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mb-2"></div>
                        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                        <div className="h-2 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="w-32 h-40 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mb-2"></div>
                        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                        <div className="h-2 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-around items-center px-4">
            <div className="w-6 h-6 bg-brand-blue rounded-full"></div>
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
    </div>
);

export default function LandingPage() {
  const { openLoginModal } = useAuth();
  const navigate = React.useCallback(() => {
      window.location.hash = '/signup';
  }, []);

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 antialiased font-sans overflow-x-hidden h-full overflow-y-auto">
      {/* --- Navbar --- */}
      <header className="sticky top-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-50 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DropletIcon className="w-8 h-8 text-brand-blue" />
            <span className="text-xl font-bold tracking-tight dark:text-white">Kangen Share</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={openLoginModal} className="hidden md:block font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-white transition-colors">
              Login
            </button>
            <Link to="/signup" className="bg-brand-blue text-white font-bold px-6 py-2.5 rounded-full hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30">
              Get App
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* --- Hero Section --- */}
        <section className="pt-12 pb-20 lg:pt-32 lg:pb-32 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                    
                    {/* Hero Copy */}
                    <div className="flex-1 text-center lg:text-left z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-brand-blue font-semibold text-sm mb-6 animate-fade-in-up">
                            <SparklesIcon className="w-4 h-4" />
                            <span>The #1 Community for Kangen Owners</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            Hydration <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-blue-400">Without Borders.</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            Connect with verified Enagic® Distributors worldwide. Find alkaline water, meet the community, and travel lighter.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-brand-blue text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2">
                                Join the Network
                                <ChevronRightIcon className="w-5 h-5" />
                            </Link>
                            <button onClick={openLoginModal} className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                Login
                            </button>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="flex-1 relative w-full max-w-md lg:max-w-full animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-b from-blue-200/20 to-transparent rounded-full blur-3xl -z-10"></div>
                        <DashboardMockup />
                        
                        {/* Floating Badge 1 */}
                        <div className="absolute top-20 -left-4 lg:left-10 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                            <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                                <CheckBadgeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="font-bold text-xs dark:text-white">Verified Host</p>
                                <p className="text-[10px] text-gray-500">Trusted Source</p>
                            </div>
                        </div>

                        {/* Floating Badge 2 */}
                        <div className="absolute bottom-32 -right-4 lg:right-10 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                            <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full">
                                <BuildingStorefrontIcon className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-bold text-xs dark:text-white">Wellness Partner</p>
                                <p className="text-[10px] text-gray-500">Official Hub</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Stats Section --- */}
        <section className="py-10 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-200 dark:divide-gray-800">
                    <StatCard value="50+" label="Countries" />
                    <StatCard value="1k+" label="Verified Hosts" />
                    <StatCard value="10k+" label="Liters Shared" />
                    <StatCard value="4.9" label="Avg Rating" />
                </div>
            </div>
        </section>

        {/* --- Wellness Partners Section (New) --- */}
        <section className="py-24 bg-gray-50/50 dark:bg-gray-900/30">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-widest mb-4">
                            Certified Wellness Partners
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                            Hydrate at your favorite <br/> <span className="text-amber-500">Wellness Hubs.</span>
                        </h2>
                    </div>
                    <Link to="/signup" className="text-amber-600 font-bold flex items-center gap-1 hover:underline">
                        View All Partners <ChevronRightIcon className="w-5 h-5" />
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <WellnessPartnerCard 
                        name="Leafy Greens Cafe"
                        category="Organic Cafe"
                        location="Austin, TX"
                        rating={4.9}
                        image="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400"
                    />
                    <WellnessPartnerCard 
                        name="Pure Life Yoga"
                        category="Yoga Studio"
                        location="San Diego, CA"
                        rating={5.0}
                        image="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400"
                    />
                    <WellnessPartnerCard 
                        name="Holistic Harmony"
                        category="Wellness Clinic"
                        location="London, UK"
                        rating={4.8}
                        image="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400"
                    />
                    <WellnessPartnerCard 
                        name="Zen Garden Spa"
                        category="Day Spa"
                        location="Bali, Indonesia"
                        rating={4.9}
                        image="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400"
                    />
                </div>
            </div>
        </section>

        {/* --- Features Split Sections --- */}
        <section className="py-24">
            <div className="container mx-auto px-6">
                {/* Feature 1: Explore */}
                <div className="flex flex-col md:flex-row items-center gap-16 mb-32">
                    <div className="flex-1 order-2 md:order-1">
                        <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-brand-blue">
                            <MapPinIcon className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Smart Location Intelligence.
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                            Our new "Explore Hub" puts the power of hydration in your pocket. One tap finds verified hosts closest to your real-time GPS location. Filter by pH level, rating, or availability.
                        </p>
                        <ul className="space-y-3">
                            {['Instant "Near Me" search', 'Filter by verified status', 'Integrated Maps navigation'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                                    <CheckBadgeIcon className="w-5 h-5 text-green-500" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 order-1 md:order-2 bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 rotate-3 hover:rotate-0 transition-transform duration-500">
                        {/* Abstract representation of map interface */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4">
                            <div className="flex justify-between items-end mb-4">
                                <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-white"><SearchIcon className="w-4 h-4"/></div>
                            </div>
                            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl relative overflow-hidden">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                                        <div className="w-4 h-4 bg-brand-blue rounded-full border-2 border-white"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature 2: Trust (Reversed) */}
                <div className="flex flex-col md:flex-row items-center gap-16 mb-32">
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 -rotate-3 hover:rotate-0 transition-transform duration-500">
                         <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 text-center">
                            <ShieldCheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verified Distributor</h3>
                            <p className="text-gray-500 text-sm mb-4">ID: 1829300 • Valid until 2026</p>
                            <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
                                <div className="w-full h-full bg-green-500"></div>
                            </div>
                         </div>
                    </div>
                    <div className="flex-1">
                        <div className="bg-green-50 dark:bg-green-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                            <ShieldCheckIcon className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Trust is our currency.
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                            We don't just let anyone on the map. Our robust verification system ensures that Hosts are legitimate Enagic® K8 owners. Look for the blue tick to request with confidence.
                        </p>
                        <Link to="/signup" className="text-brand-blue font-bold hover:underline flex items-center gap-1">
                            Learn about our verification process <ChevronRightIcon className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Feature 3: Community */}
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 order-2 md:order-1">
                        <div className="bg-purple-50 dark:bg-purple-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                            <UserGroupIcon className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            More than just water.
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                            Kangen Share is about connection. Chat with hosts, follow your favorite distributors, and leave reviews. Build your global wellness network.
                        </p>
                    </div>
                    <div className="flex-1 order-1 md:order-2 flex justify-center">
                        <div className="relative">
                            <ChatBubbleOvalLeftEllipsisIcon className="w-64 h-64 text-gray-100 dark:text-gray-800" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                                <div className="bg-white dark:bg-gray-700 shadow-lg rounded-2xl p-4 max-w-[200px] mx-auto mb-4">
                                    <p className="text-sm text-gray-700 dark:text-gray-200">"Pickup at 2pm works great!"</p>
                                </div>
                                <div className="bg-brand-blue shadow-lg rounded-2xl p-4 max-w-[200px] mx-auto">
                                    <p className="text-sm text-white">"Perfect, see you then! 💧"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Distributor CTA --- */}
        <section className="py-20 bg-brand-blue relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="container mx-auto px-6 relative z-10 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-sm font-bold mb-6 backdrop-blur-sm">
                    For Enagic® Distributors
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    Turn your machine into a connection magnet.
                </h2>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
                    Becoming a Verified Host puts you on the map for thousands of travelers. Grow your network, share the water, and build your business organically.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/signup" className="bg-white text-brand-blue font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors shadow-xl">
                        Start Hosting
                    </Link>
                </div>
            </div>
        </section>

        {/* --- Testimonials --- */}
        <section className="py-24 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Loved by the Community</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <TestimonialCard 
                        quote="I travel for work constantly. Kangen Share saved me from buying plastic bottles in London, Paris, and Tokyo. Absolute lifesaver."
                        author="Michael R."
                        role="Digital Nomad"
                        location="Austin, TX"
                    />
                    <TestimonialCard 
                        quote="As a distributor, this app has been amazing. I've met so many interesting people passing through my city. The verification system gives me peace of mind."
                        author="Sarah L."
                        role="6A Distributor"
                        location="San Diego, CA"
                    />
                    <TestimonialCard 
                        quote="The map interface is so smooth! found a host 5 minutes from my Airbnb. The water was fresh and the host was super friendly."
                        author="Jessica T."
                        role="Yoga Instructor"
                        location="Bali, Indonesia"
                    />
                </div>
            </div>
        </section>

        {/* --- Footer --- */}
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                    <div className="flex items-center gap-2">
                        <DropletIcon className="w-6 h-6 text-brand-blue" />
                        <span className="font-bold text-xl dark:text-white">Kangen Share</span>
                    </div>
                    <div className="flex gap-8 text-gray-600 dark:text-gray-400 font-medium">
                        <Link to="/signup" className="hover:text-brand-blue">Join</Link>
                        <a href="#" className="hover:text-brand-blue">About</a>
                        <a href="#" className="hover:text-brand-blue">Safety</a>
                        <a href="#" className="hover:text-brand-blue">Support</a>
                    </div>
                </div>
                <div className="text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} Kangen Share. Independent platform. Not affiliated with Enagic®.</p>
                </div>
            </div>
        </footer>
      </main>
    </div>
  );
}
