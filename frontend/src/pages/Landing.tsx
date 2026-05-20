import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
// Import supermarket logos
import aldiLogo from '../assets/logos/aldi.png';
import colesLogo from '../assets/logos/coles.png';
import woolworthsLogo from '../assets/logos/woolworths.png';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleSeeHowItWorks = () => {
    // Scroll to features section or navigate to a demo page
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          {/* Logo Icon */}
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl animate-float">
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          
          {/* Title */}
          <h1 className="text-7xl md:text-9xl font-extrabold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
              OPTIMISED
            </span>
          </h1>
          
          {/* Slogan */}
          <p className="text-xl md:text-3xl font-semibold text-white/95 max-w-5xl mx-auto leading-relaxed mb-4">
            Compare prices across major stores, build optimised shopping lists, and find the best deals for your weekly groceries.
          </p>
          
          {/* Trust Signal */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-yellow-400 text-2xl">⭐⭐⭐⭐⭐</span>
            <span className="text-white/80 text-xl font-medium">4.9/5 rating from 10,000+ shoppers</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="px-10 py-5 text-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Start Saving Now
          </Button>
          <Button
            onClick={handleSeeHowItWorks}
            variant="outline"
            size="lg"
            className="px-10 py-5 text-xl border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
          >
            See How It Works
          </Button>
        </motion.div>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto"
        >
          <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <div className="text-4xl font-bold text-emerald-300 mb-1">30%</div>
            <div className="text-white/80 text-base">Average Savings</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <div className="text-4xl font-bold text-cyan-300 mb-1">10K+</div>
            <div className="text-white/80 text-base">Happy Shoppers</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <div className="text-4xl font-bold text-teal-300 mb-1">1000+</div>
            <div className="text-white/80 text-base">Products Compared</div>
          </div>
        </motion.div>

        {/* Store Logos Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mb-12"
        >
          <p className="text-white/60 text-lg mb-4 font-medium">Compare prices from:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {/* Aldi Logo Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center hover:shadow-2xl transition-all duration-300"
            >
              <img 
                src={aldiLogo} 
                alt="Aldi Logo" 
                className="h-14 object-contain"
              />
            </motion.div>

            {/* Coles Logo Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center hover:shadow-2xl transition-all duration-300"
            >
              <img 
                src={colesLogo} 
                alt="Coles Logo" 
                className="h-14 object-contain"
              />
            </motion.div>

            {/* Woolworths Logo Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center hover:shadow-2xl transition-all duration-300"
            >
              <img 
                src={woolworthsLogo} 
                alt="Woolworths Logo" 
                className="h-14 object-contain"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          id="features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Smart Lists</h3>
            <p className="text-white/80 text-base">Build and manage your grocery lists with intelligent suggestions</p>
          </div>
          
          <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Price Compare</h3>
            <p className="text-white/80 text-base">Compare prices across Aldi, Coles, and Woolworths instantly</p>
          </div>
          
          <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Save Money</h3>
            <p className="text-white/80 text-base">Find the best deals and save up to 30% on your groceries</p>
          </div>
        </motion.div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6"
        >
          <div className="flex items-center gap-2 text-white/70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-base font-medium">No credit card required</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-base font-medium">Privacy protected</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-base font-medium">Free to use</span>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Landing;
