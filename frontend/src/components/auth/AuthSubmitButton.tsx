import React from 'react';

type AuthSubmitButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
};

const AuthSubmitButton = ({ children, loading = false }: AuthSubmitButtonProps) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full relative group overflow-hidden rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200
        ${
          loading
            ? 'opacity-80 cursor-not-allowed'
            : 'hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-900/40'
        }
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
};

export default AuthSubmitButton;
