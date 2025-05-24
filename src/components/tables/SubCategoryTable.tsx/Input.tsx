import React from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  textarea?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  className = '',
  required = false,
  disabled = false,
  textarea = false,
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {textarea ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          rows={3}
          className={`block w-full rounded-md border-gray-300 shadow-sm 
            focus:border-primary focus:ring-primary sm:text-sm
            dark:bg-gray-800 dark:border-gray-700 dark:text-white
            ${disabled ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`block w-full rounded-md border-gray-300 shadow-sm 
            focus:border-primary focus:ring-primary sm:text-sm
            dark:bg-gray-800 dark:border-gray-700 dark:text-white
            ${disabled ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
        />
      )}
    </div>
  );
};

export default Input;