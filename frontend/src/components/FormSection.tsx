import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  icon,
  children,
  className = '',
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        bg-gradient-to-br from-white/90 to-primary-50/80 
        backdrop-blur-sm 
        rounded-2xl 
        shadow-xl 
        p-10 
        border border-primary-100
        ${className}
      `}
      aria-labelledby="form-section-title"
    >
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          {icon && (
            <div className="text-primary-600 w-10 h-10 flex items-center justify-center">
              {icon}
            </div>
          )}
          <h2 
            id="form-section-title"
            className="text-3xl font-bold text-secondary-900"
          >
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-lg text-secondary-600 ml-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div>
        {children}
      </div>
    </motion.section>
  );
};

export default FormSection;