import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

const Panel = ({ children, className = '' }: Props) => {
  return (
    <div
      className={[
        'rounded-2xl border border-white/[0.07] bg-white/[0.03]',
        'shadow-xl shadow-black/30 backdrop-blur-sm',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
};

export default Panel;
