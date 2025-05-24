import React from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
  disabled = false,
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`block w-full rounded-md border-gray-300 shadow-sm 
          focus:border-primary focus:ring-primary sm:text-sm
          dark:bg-gray-800 dark:border-gray-700 dark:text-white
          ${disabled ? "bg-gray-100 dark:bg-gray-700" : ""}`}
      />
    </div>
  );
};

export default Input;