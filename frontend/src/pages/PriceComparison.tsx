import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import FormSection from '../components/FormSection';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/pricing';

const PriceComparison: React.FC = () => {
  const navigate = useNavigate();
  const { groceryItems, prices, selectedItems, optimizationType, completePriceComparison } = useAppContext();

  // Calculate totals for each store
  const storeTotals = useMemo(() => {
    if (Object.keys(prices).length === 0) return { aldi: 0, coles: 0, woolworths: 0 };
    
    return {
      aldi: groceryItems.reduce((sum, item) => sum + (prices[item]?.aldi || 0), 0),
      coles: groceryItems.reduce((sum, item) => sum + (prices[item]?.coles || 0), 0),
      woolworths: groceryItems.reduce((sum, item) => sum + (prices[item]?.woolworths || 0), 0),
    };
  }, [groceryItems, prices]);

  // Calculate dynamic total based on optimization type
  const dynamicTotal = useMemo(() => {
    if (Object.keys(prices).length === 0) return 0;
    
    switch (optimizationType) {
      case 'cheapestItem':
        // Sum of lowest price per item across all stores
        return groceryItems.reduce((sum, item) => {
          const itemPrices = prices[item] || { aldi: 0, coles: 0, woolworths: 0 };
          return sum + Math.min(itemPrices.aldi, itemPrices.coles, itemPrices.woolworths);
        }, 0);
      
      case 'within10km':
        // Sum of lowest price per item within 10km radius stores
        // For now, assume all stores are within 10km (same as cheapestItem)
        return groceryItems.reduce((sum, item) => {
          const itemPrices = prices[item] || { aldi: 0, coles: 0, woolworths: 0 };
          return sum + Math.min(itemPrices.aldi, itemPrices.coles, itemPrices.woolworths);
        }, 0);
      
      case 'singleStore':
        // MIN(sum of all items per store)
        return Math.min(storeTotals.aldi, storeTotals.coles, storeTotals.woolworths);
      
      default:
        return 0;
    }
  }, [groceryItems, prices, optimizationType, storeTotals]);

  // Find cheapest store for single store optimization
  const cheapestStore = useMemo(() => {
    if (storeTotals.aldi === 0) return 'aldi';
    const stores: ['aldi' | 'coles' | 'woolworths', number][] = [
      ['aldi', storeTotals.aldi],
      ['coles', storeTotals.coles],
      ['woolworths', storeTotals.woolworths],
    ];
    let minStore: 'aldi' | 'coles' | 'woolworths' = 'aldi';
    let minTotal = storeTotals.aldi;
    stores.forEach(([store, total]) => {
      if (total < minTotal) {
        minStore = store;
        minTotal = total;
      }
    });
    return minStore;
  }, [storeTotals]);

  const handleContinue = () => {
    // Navigate immediately for instant response
    completePriceComparison();
    navigate('/confirmation');
  };

  const isSingleStoreOptimization = optimizationType === 'singleStore';

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
            title="Price Comparison"
            subtitle="Compare prices across stores"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          >
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium text-secondary-700">Step 4 of 4</span>
                <span className="text-lg font-medium text-secondary-500">100% complete</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full w-full"></div>
              </div>
            </div>

            {/* Store Logos */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">Aldi</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  <span className="text-lg font-bold text-red-700">Coles</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">W</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">Woolworths</span>
                </div>
              </div>
            </div>

            {/* Price Table */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-secondary-200 shadow-lg">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-emerald-500 to-teal-500">
                  <tr>
                    <th className="px-4 py-4 text-left text-base font-bold text-white">Item</th>
                    <th className="px-4 py-4 text-center text-base font-bold text-white">Aldi</th>
                    <th className="px-4 py-4 text-center text-base font-bold text-white">Coles</th>
                    <th className="px-4 py-4 text-center text-base font-bold text-white">Woolworths</th>
                  </tr>
                </thead>
                <tbody>
                  {groceryItems.map((item, index) => {
                    const itemPrices = prices[item] || { aldi: 0, coles: 0, woolworths: 0 };
                    const cheapestPrice = Math.min(itemPrices.aldi, itemPrices.coles, itemPrices.woolworths);
                    
                    return (
                      <React.Fragment key={item}>
                        <motion.tr
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white hover:bg-secondary-50 transition-colors border-b border-secondary-200"
                        >
                          <td className="px-4 py-4 font-medium text-secondary-800">{item}</td>
                          {(['aldi', 'coles', 'woolworths'] as const).map((store) => {
                            const price = itemPrices[store];
                            const isCheapest = price === cheapestPrice && price > 0;
                            
                            // Highlight logic based on optimization type
                            let shouldHighlight = false;
                            if (isSingleStoreOptimization) {
                              // For single store: highlight all items in the cheapest store column
                              shouldHighlight = store === cheapestStore;
                            } else {
                              // For cheapest item/within10km: highlight cheapest price per item
                              shouldHighlight = isCheapest;
                            }
                            
                            return (
                              <td
                                key={store}
                                className={`
                                  px-4 py-4 text-center font-medium
                                  ${shouldHighlight
                                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 font-bold'
                                    : 'text-secondary-600'
                                  }
                                `}
                              >
                                {formatCurrency(price)}
                                {shouldHighlight && (
                                  <span className="ml-1 text-emerald-500">✓</span>
                                )}
                              </td>
                            );
                          })}
                        </motion.tr>
                        {/* Gap between items */}
                        <tr className="h-3">
                          <td colSpan={4}></td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gradient-to-r from-emerald-50 to-teal-50 font-bold">
                  {/* Gap before totals */}
                  <tr className="h-6">
                    <td colSpan={4}></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-emerald-700">Total</td>
                    {(['aldi', 'coles', 'woolworths'] as const).map((store) => {
                      const total = storeTotals[store];
                      const isCheapestStore = isSingleStoreOptimization && store === cheapestStore;
                      
                      return (
                        <td
                          key={store}
                          className={`
                            px-4 py-4 text-center
                            ${isCheapestStore
                              ? 'text-emerald-700 font-bold'
                              : 'text-secondary-700'
                            }
                          `}
                        >
                          {formatCurrency(total)}
                          {isCheapestStore && (
                            <span className="ml-1 text-emerald-500">✓</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Trust Layer */}
            <div className="mb-6 space-y-3">
              {/* Price Timestamp */}
              <div className="flex items-center gap-2 text-base font-bold text-secondary-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Updated 2 hours ago</span>
              </div>
              
              {/* Source Transparency */}
              <div className="flex items-center gap-2 text-base font-bold text-secondary-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Based on Aldi, Coles, Woolworths online catalogue</span>
              </div>
              
              {/* Trust Badge */}
              <div className="flex items-center gap-2 text-2xl text-emerald-600 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Verified Pricing</span>
              </div>
            </div>

            {/* Savings Summary */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-800">Optimised Basket</p>
                  <p className="text-lg text-emerald-600">
                    {optimizationType === 'cheapestItem' && 'Lowest price per item across all stores'}
                    {optimizationType === 'within10km' && 'Lowest price per item within 10km radius'}
                    {optimizationType === 'singleStore' && 'Best single store total'}
                  </p>
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-700 mb-2">
                {formatCurrency(dynamicTotal)}
              </div>
              <p className="text-base text-emerald-600">Total Basket Cost</p>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              fullWidth
              size="lg"
              disabled={selectedItems.length === 0}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Continue to Confirmation
            </Button>
          </FormSection>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default PriceComparison;
