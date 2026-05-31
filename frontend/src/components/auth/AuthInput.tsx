import React from 'react';

type AuthInputProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
};

const AuthInput = ({
  label,
  name,
  type = 'text',
  value,
  placeholder,
  onChange,
  autoComplete,
  required = false,
}: AuthInputProps) => {
  return (
    <div className="flex flex-col gap-1.5 mb-5">
      <label htmlFor={name} className="text-xs font-medium text-white/70 ml-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 shadow-inner shadow-black/50"
      />
    </div>
  );
};

export default AuthInput;
