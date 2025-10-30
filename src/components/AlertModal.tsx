import React from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from './icons';

export type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertModalProps {
  type: AlertType;
  title: string;
  message: string;
  onClose?: () => void;
  actions?: React.ReactNode;
  showCloseButton?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
  type,
  title,
  message,
  onClose,
  actions,
  showCloseButton = true
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: AlertCircle,
          iconBgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200',
          titleColor: 'text-red-900',
          messageColor: 'text-red-700'
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconBgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200',
          titleColor: 'text-green-900',
          messageColor: 'text-green-700'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          borderColor: 'border-yellow-200',
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-700'
        };
      case 'info':
        return {
          icon: Info,
          iconBgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-slideUp">
        {/* Header with close button */}
        {showCloseButton && onClose && (
          <div className="flex justify-end p-4 pb-0">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100 p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={`px-6 ${showCloseButton && onClose ? 'pt-2' : 'pt-6'} pb-6`}>
          {/* Icon */}
          <div className={`w-16 h-16 ${config.iconBgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>

          {/* Title */}
          <h3 className={`text-xl font-bold text-center mb-3 ${config.titleColor}`}>
            {title}
          </h3>

          {/* Message */}
          <p className={`text-center ${config.messageColor} mb-6 leading-relaxed`}>
            {message}
          </p>

          {/* Actions */}
          {actions ? (
            <div className="flex gap-3 justify-center">
              {actions}
            </div>
          ) : onClose ? (
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
