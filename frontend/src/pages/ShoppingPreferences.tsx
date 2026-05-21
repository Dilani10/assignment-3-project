import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import FormSection from '../components/FormSection';
import LocationAutocomplete from '../components/LocationAutocomplete';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { LocationAddress } from '../types';

const ShoppingPreferences: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, setPreferences, completePreferences } = useAppContext();
  const [weeklyBudget, setWeeklyBudget] = useState(preferences.weeklyBudget || 0);
  const [duration, setDuration] = useState(preferences.duration || 1);
  const [location, setLocation] = useState(preferences.location || '');
  const [locationAddress, setLocationAddress] = useState<LocationAddress | null>(preferences.locationAddress || null);
  const [errors, setErrors] = useState<{
    weeklyBudget?: string;
    duration?: string;
    location?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!weeklyBudget || weeklyBudget < 1) {
      newErrors.weeklyBudget = 'Weekly budget must be at least $1';
    }
    
    if (!duration || duration < 1) {
      newErrors.duration = 'Duration must be at least 1 week';
    }
    
    if (!location) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Navigate immediately for instant response
      completePreferences();
      navigate('/grocery-list');
      // Save preferences in background (non-blocking)
      setPreferences({ weeklyBudget, duration, location, locationAddress });
    }
  };

  return (
    <PageLayout showBack>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <FormSection
            title="Shopping Preferences"
            subtitle="Tell us about your shopping habits"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium text-secondary-700">Step 1 of 4</span>
                <span className="text-lg font-medium text-secondary-500">25% complete</span>
              </div>
              <div className="w-full bg-secondary-300 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full w-1/4"></div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Budget Slider */}
              <div className="mb-6">
                <label className="block text-lg font-semibold text-secondary-800 mb-3">
                  Weekly Budget (AUD)
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="10"
                    value={weeklyBudget}
                    onChange={(e) => setWeeklyBudget(Number(e.target.value))}
                    className="w-full h-2 bg-secondary-400 rounded-lg appearance-none cursor-pointer slider"
                  />
                  {/* Budget Milestones */}
                  <div className="flex justify-between text-base text-secondary-400 mt-3">
                    <span>$50</span>
                    <span>$500</span>
                    <span>$1,000</span>
                    <span>$1,500</span>
                    <span>$2,000</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <div className="w-0.5 h-2 bg-secondary-400"></div>
                    <div className="w-0.5 h-2 bg-secondary-400"></div>
                    <div className="w-0.5 h-2 bg-secondary-400"></div>
                    <div className="w-0.5 h-2 bg-secondary-400"></div>
                    <div className="w-0.5 h-2 bg-secondary-400"></div>
                  </div>
                  <div className="text-center mt-3">
                    <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-3xl font-bold shadow-lg">
                      ${weeklyBudget}
                    </span>
                  </div>
                </div>
                {errors.weeklyBudget && (
                  <p className="mt-2 text-base text-red-600">{errors.weeklyBudget}</p>
                )}
              </div>

              {/* Duration Picker */}
              <div className="mb-6">
                <label className="block text-lg font-semibold text-secondary-800 mb-5">
                  Shopping Duration
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((week) => (
                    <button
                      key={week}
                      type="button"
                      onClick={() => setDuration(week)}
                      className={`
                        p-4 rounded-xl border-2 transition-all duration-200 text-center
                        ${duration === week
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-secondary-200 bg-white hover:border-secondary-300 hover:shadow-md'
                        }
                      `}
                    >
                      <div className="text-2xl font-bold">{week}</div>
                      <div className="text-xl text-base text-secondary-500">Week{week > 1 ? 's' : ''}</div>
                    </button>
                  ))}
                </div>
                {errors.duration && (
                  <p className="mt-2 text-base text-red-600">{errors.duration}</p>
                )}
              </div>

              {/* Location Input */}
              <div className="mb-8">
                <LocationAutocomplete
                  label="Location"
                  value={location}
                  onChange={(address) => {
                    if (address) {
                      setLocation(address.fullAddress);
                      setLocationAddress(address);
                    } else {
                      setLocation('');
                      setLocationAddress(null);
                    }
                  }}
                  placeholder="Enter your suburb or city in Australia"
                  required
                  error={errors.location}
                />
              </div>
              
              {/* Disclaimer */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-800 mb-1">Your privacy is protected</p>
                    <p className="text-base text-emerald-700">
                      We only use your data to optimise the basket based on your shopping preferences and never store it.
                    </p>
                  </div>
                </div>
              </div>

              
              
              <Button
                type="submit"
                fullWidth
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Continue
              </Button>
            </form>
          </FormSection>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default ShoppingPreferences;
