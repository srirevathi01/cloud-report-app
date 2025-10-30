import React from 'react';

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
    <div className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="flex gap-2">
        {services.map((service) => (
          <button
            key={service}
            onClick={() => onServiceSelect(service)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedService === service
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {service.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceTabs;
