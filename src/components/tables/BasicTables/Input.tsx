import React from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  error?: string;
  multiple?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
  disabled = false,
  name,
  id,
  required = false,
  error,
  multiple = false,
}) => {
  const inputId = id || name || `input-${label?.toLowerCase().replace(/\s+/g, "-") || Math.random()}`;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        {...(type === 'file' ? {} : { value: value || '' })}
        onChange={onChange}
        disabled={disabled}
        required={required}
        multiple={multiple}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          block w-full rounded-md border px-3 py-2 shadow-sm sm:text-sm
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
          ${disabled ? "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400" : "bg-white dark:bg-gray-800 dark:text-white"}
          ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"}
        `}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs text-red-500 mt-1"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
