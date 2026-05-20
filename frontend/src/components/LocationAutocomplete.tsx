import React, { useRef, useEffect, useState } from 'react';
import { LocationAddress } from '../types';

interface LocationAutocompleteProps {
  label: string;
  value: string;
  onChange: (address: LocationAddress | null) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

/**
 * LocationAutocomplete Component
 * 
 * A reusable address autocomplete input that integrates with Google Places API.
 * Falls back to a standard text input if Google Maps fails to load.
 * 
 * Features:
 * - Autocomplete suggestions restricted to Australia
 * - Structured address extraction (suburb, state, postcode)
 * - Consistent styling with existing InputField component
 * - Graceful fallback if API fails
 */
const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter your suburb or city in Australia',
  required = false,
  error,
  className = '',
  id,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate unique ID for accessibility
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  /**
   * Extract structured address components from Google Places result
   * Parses the address_components to extract suburb, state, and postcode
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractAddressComponents = (place: any): LocationAddress | null => {
    if (!place.address_components || !place.formatted_address) {
      return null;
    }

    let suburb = '';
    let state = '';
    let postcode = '';

    // Iterate through address components to find suburb, state, and postcode
    place.address_components.forEach((component: any) => {
      const types: string[] = component.types;

      // Extract suburb (locality or sublocality)
      if (types.includes('locality')) {
        suburb = component.long_name;
      } else if (types.includes('sublocality') && !suburb) {
        suburb = component.long_name;
      }

      // Extract state (administrative_area_level_1)
      if (types.includes('administrative_area_level_1')) {
        state = component.short_name; // Use short name for state (e.g., "VIC", "NSW")
      }

      // Extract postcode
      if (types.includes('postal_code')) {
        postcode = component.long_name;
      }
    });

    // Only return if we have at least a full address
    if (!place.formatted_address) {
      return null;
    }

    return {
      fullAddress: place.formatted_address,
      suburb: suburb || '',
      state: state || '',
      postcode: postcode || '',
    };
  };

  /**
   * Initialize Google Places Autocomplete
   * Sets up the autocomplete instance with Australian restrictions
   */
  useEffect(() => {
    const initializeAutocomplete = () => {
      // Check if Google Maps API is loaded
      const windowWithGoogle = window as Window & { google?: any };
      if (!windowWithGoogle.google?.maps?.places) {
        setIsLoading(false);
        return;
      }

      setIsGoogleLoaded(true);
      setIsLoading(false);

      if (!inputRef.current) return;

      // Create autocomplete instance with Australian restrictions
      autocompleteRef.current = new windowWithGoogle.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'au' }, // Restrict to Australia only
        fields: ['address_components', 'formatted_address'], // Only request needed fields
        types: ['address'], // Restrict to street-level addresses
      });

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        
        if (place && place.formatted_address) {
          const addressData = extractAddressComponents(place);
          
          if (addressData) {
            setInputValue(addressData.fullAddress);
            onChange(addressData);
          }
        }
      });
    };

    // Small delay to ensure Google Maps script has loaded
    const timer = setTimeout(() => {
      initializeAutocomplete();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Clean up autocomplete instance
      const windowWithGoogle = window as Window & { google?: any };
      if (autocompleteRef.current && windowWithGoogle.google?.maps?.event) {
        windowWithGoogle.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  /**
   * Sync external value changes with internal state
   */
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  /**
   * Handle manual input changes (for fallback mode)
   * Allows users to type freely if Google Maps fails to load
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // If Google Maps is not loaded, allow free-form text entry
    if (!isGoogleLoaded && newValue.trim()) {
      onChange({
        fullAddress: newValue,
        suburb: '',
        state: '',
        postcode: '',
      });
    } else if (!newValue.trim()) {
      // Clear the address if input is empty
      onChange(null);
    }
  };

  /**
   * Handle input blur to validate the entered address
   */
  const handleBlur = () => {
    // If user typed something but didn't select from autocomplete
    if (inputValue.trim() && !isGoogleLoaded) {
      // In fallback mode, accept what they typed
      onChange({
        fullAddress: inputValue,
        suburb: '',
        state: '',
        postcode: '',
      });
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      <label 
        htmlFor={inputId}
        className="block text-lg font-medium text-secondary-800 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={isLoading ? 'Loading...' : placeholder}
          disabled={isLoading}
          required={required}
          className={`
            w-full px-4 py-3 
            border-2 rounded-xl 
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${error 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-secondary-300 hover:border-secondary-400'
            }
            ${isLoading ? 'bg-secondary-50 cursor-not-allowed' : 'bg-white'}
            text-secondary-900
            placeholder-secondary-400
          `}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={error ? 'true' : 'false'}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Location Icon */}
        {!isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg 
              className="w-5 h-5 text-secondary-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </div>
        )}
      </div>

      {/* Fallback Notice */}
      {!isGoogleLoaded && !isLoading && (
        <p className="mt-2 text-sm text-secondary-500">
          Address autocomplete unavailable. You can still enter your address manually.
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p 
          id={`${inputId}-error`}
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Helpful Hint */}
      {!error && isGoogleLoaded && (
        <p className="mt-2 text-sm text-secondary-500">
          Start typing to see address suggestions
        </p>
      )}
    </div>
  );
};

export default LocationAutocomplete;