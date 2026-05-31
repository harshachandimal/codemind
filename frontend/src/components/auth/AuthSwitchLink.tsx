import { Link } from 'react-router-dom';

type AuthSwitchLinkProps = {
  text: string;
  linkText: string;
  to: string;
};

const AuthSwitchLink = ({ text, linkText, to }: AuthSwitchLinkProps) => {
  return (
    <div className="mt-6 text-center text-sm text-white/50">
      {text}{' '}
      <Link
        to={to}
        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
      >
        {linkText}
      </Link>
    </div>
  );
};

export default AuthSwitchLink;
