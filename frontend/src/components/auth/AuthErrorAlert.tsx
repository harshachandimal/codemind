type AuthErrorAlertProps = {
  message: string | null;
};

const AuthErrorAlert = ({ message }: AuthErrorAlertProps) => {
  if (!message) return null;

  return (
    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-medium">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default AuthErrorAlert;
