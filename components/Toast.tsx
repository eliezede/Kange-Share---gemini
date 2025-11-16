
import React, { useEffect, useState } from 'react';
import { useToast, ToastType } from '../hooks/useToast';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from './Icons';

interface ToastMessageProps {
  id: number;
  message: string;
  type: ToastType;
  onDismiss: (id: number) => void;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ id, message, type, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Set up dismissal
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Allow time for fade out animation before removing from DOM
      setTimeout(() => onDismiss(id), 300);
    }, 3500);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const typeStyles: Record<ToastType, { bg: string; iconColor: string; icon: React.ReactNode }> = {
    success: { bg: 'bg-green-500 dark:bg-green-600', iconColor: 'text-green-500', icon: <CheckCircleIcon className="w-6 h-6" /> },
    error: { bg: 'bg-red-500 dark:bg-red-600', iconColor: 'text-red-500', icon: <XCircleIcon className="w-6 h-6" /> },
    info: { bg: 'bg-blue-500 dark:bg-brand-blue', iconColor: 'text-blue-500', icon: <InformationCircleIcon className="w-6 h-6" /> },
    warning: { bg: 'bg-yellow-500 dark:bg-yellow-600', iconColor: 'text-yellow-500', icon: <ExclamationTriangleIcon className="w-6 h-6" /> },
  };

  const { icon, iconColor } = typeStyles[type];

  return (
    <div
      className={`
        flex items-center w-full max-w-sm p-4 text-gray-800 bg-white dark:bg-gray-800 rounded-xl shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}
      `}
      role="alert"
    >
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${iconColor}`}>
        {icon}
      </div>
      <div className="ml-3 text-sm font-medium dark:text-gray-200">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        aria-label="Close"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onDismiss(id), 300);
        }}
      >
        <span className="sr-only">Close</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm space-y-3">
      {toasts.map(toast => (
        <ToastMessage
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={removeToast}
        />
      ))}
    </div>
  );
};
