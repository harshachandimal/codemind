import React from 'react';
import PageShell from '../common/PageShell';
import Panel from '../common/Panel';
import Badge from '../common/Badge';

type AuthShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
};

const AuthShell = ({ children, title, subtitle }: AuthShellProps) => {
  return (
    <PageShell>
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 w-full">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-6">
              <Badge variant="muted">CodeMind</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              {title}
            </h1>
            <p className="text-sm text-white/50">{subtitle}</p>
          </div>

          {/* Form Panel */}
          <Panel className="p-6 sm:p-8 relative overflow-hidden">
            {/* Subtle top glow inside the panel */}
            <div
              className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-indigo-500/20 blur-2xl rounded-full"
              aria-hidden="true"
            />
            
            <div className="relative z-10">{children}</div>
          </Panel>
        </div>
      </div>
    </PageShell>
  );
};

export default AuthShell;
