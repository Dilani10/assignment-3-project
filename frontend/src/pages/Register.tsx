import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import FormSection from '../components/FormSection';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAppContext();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
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
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const response = await apiService.register({
          email,
          password,
          firstName,
          lastName
        });
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
        setErrors({ email: error.message || 'Registration failed. Please try again.' });
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
            title="Create Account"
            subtitle="Join us and start saving on groceries"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
          >
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  type="text"
                  value={firstName}
                  onChange={(value) => setFirstName(value as string)}
                  placeholder="John"
                  required
                  error={errors.firstName}
                />
                
                <InputField
                  label="Last Name"
                  type="text"
                  value={lastName}
                  onChange={(value) => setLastName(value as string)}
                  placeholder="Doe"
                  required
                  error={errors.lastName}
                />
              </div>
              
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(value) => setEmail(value as string)}
                placeholder="john@example.com"
                required
                error={errors.email}
              />
              
              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={(value) => setPassword(value as string)}
                placeholder="At least 6 characters"
                required
                error={errors.password}
              />
              
              <InputField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(value) => setConfirmPassword(value as string)}
                placeholder="Confirm your password"
                required
                error={errors.confirmPassword}
              />
              
              <div className="mb-6">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-base text-secondary-600">
                    I agree to the{' '}
                    <span className="text-primary-600 font-medium">Terms and Conditions</span>
                    {' '}and{' '}
                    <span className="text-primary-600 font-medium">Privacy Policy</span>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="mt-2 text-sm text-red-600">{errors.agreeTerms}</p>
                )}
              </div>
              
              <Button
                type="submit"
                fullWidth
                size="lg"
              >
                Register and Login
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-base text-secondary-600">
                Already a member?{' '}
                <Link 
                  to="/login" 
                  className="text-primary-600 font-semibold hover:text-primary-700 transition-colors text-base"
                >
                  Login
                </Link>
              </p>
            </div>
          </FormSection>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Register;