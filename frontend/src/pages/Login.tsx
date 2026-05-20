import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import FormSection from '../components/FormSection';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const response = await apiService.login({ email, password });
        // Store tokens in localStorage
        if (response.session.access_token) {
          localStorage.setItem('access_token', response.session.access_token);
          // Set access token in context for API calls
          setAccessToken(response.session.access_token);
        }
        if (response.session.refresh_token) {
          localStorage.setItem('refresh_token', response.session.refresh_token);
        }
        // Update user context
        setUser({ 
          email: response.user.email, 
          firstName: response.user.first_name,
          lastName: response.user.last_name
        });
        navigate('/preferences');
      } catch (error: any) {
        setErrors({ email: error.message || 'Login failed. Please try again.' });
      }
    }
  };

  return (
    <PageLayout showBack>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <FormSection
            title="Welcome Back"
            subtitle="Sign in to continue shopping smarter"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          >
            {/* Social Login Buttons */}
            <div className="mb-6 space-y-3">
              <Button
                variant="outline"
                fullWidth
                size="lg"
                className="bg-white border-2 border-secondary-200 text-secondary-800 hover:bg-gray-50 hover:border-secondary-300 shadow-sm flex items-center justify-center gap-5"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                size="lg"
                className="bg-white border-2 border-secondary-200 text-secondary-800 hover:bg-gray-50 hover:border-secondary-300 shadow-sm flex items-center justify-center gap-5"
              >
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continue with Apple
              </Button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200"></div>
              </div>
              <div className="relative flex justify-center text-base">
                <span className="px-4 bg-white text-secondary-500">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(value) => setEmail(value as string)}
                placeholder="Enter your email"
                required
                error={errors.email}
              />
              
              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={(value) => setPassword(value as string)}
                placeholder="Enter your password"
                required
                error={errors.password}
              />
              
              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500" />
                  <span className="ml-2 text-base text-secondary-600">Remember me</span>
                </label>
                <a href="#" className="text-base text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </a>
              </div>
              
              <Button
                type="submit"
                fullWidth
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Login
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-secondary-600">
                Not a member?{' '}
                <Link 
                  to="/register" 
                  className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                >
                  Register
                </Link>
              </p>
            </div>

            {/* Trust Signals */}
            <div className="mt-8 pt-6 border-t border-secondary-200">
              <div className="flex items-center justify-center gap-6 text-secondary-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-base font-medium">Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-base font-medium">Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-base font-medium">Free</span>
                </div>
              </div>
            </div>
          </FormSection>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Login;
