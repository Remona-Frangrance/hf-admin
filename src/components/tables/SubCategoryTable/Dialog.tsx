import React from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 mt-10">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Dialog container */}
      <div className="relative w-full max-h-[80vh] overflow-y-auto pt-10">
        {/* Dialog panel */}
        <div
          className={`relative mx-auto ${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all max-h-[70vh] flex flex-col`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3
              className="text-xl font-semibold text-gray-900 dark:text-white"
              id="modal-headline"
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content - scrollable */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(80vh - 72px)' }} // adjust for header height
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
