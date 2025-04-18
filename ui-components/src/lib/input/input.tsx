import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, label, ...props }, ref) => {
    const inputClasses = `
      block w-full rounded-md border-gray-300 shadow-sm
      focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
      disabled:cursor-not-allowed disabled:opacity-50
      ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''}
      ${className}
    `;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 