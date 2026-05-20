import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ShoppingPreferences from './pages/ShoppingPreferences';
import GroceryList from './pages/GroceryList';
import BasketOptimiser from './pages/BasketOptimiser';
import PriceComparison from './pages/PriceComparison';
import Confirmation from './pages/Confirmation';

const App: React.FC = () => {
  return (
    <AppProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/preferences" element={
              <ProtectedRoute>
                <ShoppingPreferences />
              </ProtectedRoute>
            } />
            <Route path="/grocery-list" element={
              <ProtectedRoute>
                <GroceryList />
              </ProtectedRoute>
            } />
            <Route path="/basket-optimiser" element={
              <ProtectedRoute>
                <BasketOptimiser />
              </ProtectedRoute>
            } />
            <Route path="/price-comparison" element={
              <ProtectedRoute>
                <PriceComparison />
              </ProtectedRoute>
            } />
            <Route path="/confirmation" element={
              <ProtectedRoute>
                <Confirmation />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </AppProvider>
  );
};

export default App;
