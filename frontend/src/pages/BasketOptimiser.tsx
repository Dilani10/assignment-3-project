import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import FormSection from '../components/FormSection';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { OptimizationType } from '../types';

const BasketOptimiser: React.FC = () => {
  const navigate = useNavigate();
  const { optimizationType, setOptimizationType, completeBasketOptimiser } = useAppContext();
  const [selectedOption, setSelectedOption] = useState<OptimizationType>(optimizationType || 'cheapestItem');

  const options = [
    {
      id: 'cheapestItem' as OptimizationType,
      title: 'Cheapest Item',
      description: 'Find the lowest price for each item across all stores',
      savings: 'Save up to 25%',
      popular: false,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'singleStore' as OptimizationType,
      title: 'Cheapest Single Store',
      description: 'Find the store with the lowest total basket cost',
      savings: 'Save up to 30%',
      popular: true,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 'within10km' as OptimizationType,
      title: 'Cheapest Within 10km',
      description: 'Find the best deals from nearby stores',
      savings: 'Save up to 20%',
      popular: false,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const handleContinue = async () => {
    setOptimizationType(selectedOption);
    await completeBasketOptimiser(selectedOption);
    navigate('/price-comparison');
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
            title="Basket Optimiser"
            subtitle="How would you like to optimise your basket?"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          >
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium text-secondary-700">Step 3 of 4</span>
                <span className="text-lg font-medium text-secondary-500">75% complete</span>
              </div>
              <div className="w-full bg-secondary-300 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full w-3/4"></div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {options.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`
                    w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden
                    ${selectedOption === option.id
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg'
                      : 'border-secondary-200 bg-white hover:border-secondary-300 hover:shadow-md'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {option.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-3 py-1 rounded-bl-xl">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`
                      p-3 rounded-xl
                      ${selectedOption === option.id
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                        : 'bg-secondary-100 text-secondary-600'
                      }
                    `}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`
                        font-bold text-lg mb-1
                        ${selectedOption === option.id
                          ? 'text-emerald-700'
                          : 'text-secondary-800'
                        }
                      `}>
                        {option.title}
                      </h3>
                      <p className={`
                        text-lg mb-2
                        ${selectedOption === option.id
                          ? 'text-emerald-600'
                          : 'text-secondary-600'
                        }
                      `}>
                        
                        {option.description}
                      </p>
                      <div className={`
                        inline-flex items-center px-3 py-1 rounded-full text-base font-bold
                        ${selectedOption === option.id
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-secondary-100 text-secondary-600'
                        }
                      `}>
                        {option.savings}
                      </div>
                    </div>
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${selectedOption === option.id
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-secondary-300'
                      }
                    `}>
                      {selectedOption === option.id && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Savings Preview */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-800">Estimated Savings</p>
                  <p className="text-lg text-emerald-600">Based on your selection</p>
                </div>
              </div>
              <div className="text-4xl font-bold text-emerald-700 mb-2">
                ${selectedOption === 'cheapestItem' ? '45' : selectedOption === 'singleStore' ? '52' : '38'}
              </div>
              <p className="text-base text-emerald-600">Potential savings this week</p>
            </div>
            
            <Button
              onClick={handleContinue}
              fullWidth
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Continue to Price Comparison
            </Button>
          </FormSection>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default BasketOptimiser;
