import React from 'react';
import { motion } from 'framer-motion';

interface ServiceTabsProps {
  services: string[];
  selectedService: string;
  onServiceSelect: (service: string) => void;
}

const ServiceTabs: React.FC<ServiceTabsProps> = ({
  services,
  selectedService,
  onServiceSelect
}) => {
  return (
    <div className="backdrop-blur-lg bg-white/95 border-b border-slate-200 px-4 sm:px-6 py-4 shadow-md">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent"
      >
        {services.map((service, index) => {
          const isSelected = selectedService === service;
          return (
            <motion.button
              key={service}
              onClick={() => onServiceSelect(service)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`group relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap overflow-hidden ${
                isSelected
                  ? 'text-white shadow-lg'
                  : 'text-slate-700 bg-white backdrop-blur-sm hover:bg-white hover:shadow-md border border-slate-300'
              }`}
            >
              {/* Animated gradient background for active tab */}
              {isSelected && (
                <motion.div
                  layoutId="activeServiceTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Service icon badge */}
              <div className={`relative z-10 flex items-center gap-2 ${
                isSelected ? 'text-white' : 'text-slate-700 group-hover:text-blue-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isSelected
                    ? 'bg-white shadow-md'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600 opacity-70 group-hover:opacity-100'
                }`}></div>
                <span className="font-semibold tracking-wide">
                  {service.toUpperCase()}
                </span>
              </div>

              {/* Hover gradient effect for inactive tabs */}
              {!isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              )}

              {/* Glow effect on hover */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};

export default ServiceTabs;
