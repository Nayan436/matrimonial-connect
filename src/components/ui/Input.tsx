import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function Input({ label, error, prefix, suffix, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className={`flex items-center bg-white border-2 rounded-2xl overflow-hidden transition-colors ${error ? 'border-red-400' : 'border-gray-200 focus-within:border-pink-500'}`}>
        {prefix && <span className="pl-4 text-gray-500 text-sm">{prefix}</span>}
        <input
          className={`flex-1 px-4 py-3 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400 ${className}`}
          {...props}
        />
        {suffix && <span className="pr-4 text-gray-500 text-sm">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className={`flex items-center bg-white border-2 rounded-2xl overflow-hidden transition-colors ${error ? 'border-red-400' : 'border-gray-200 focus-within:border-pink-500'}`}>
        <select
          className={`flex-1 px-4 py-3 text-sm outline-none bg-transparent text-gray-800 appearance-none ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        className={`w-full px-4 py-3 text-sm border-2 rounded-2xl outline-none bg-white text-gray-800 placeholder-gray-400 transition-colors resize-none ${error ? 'border-red-400' : 'border-gray-200 focus:border-pink-500'} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
