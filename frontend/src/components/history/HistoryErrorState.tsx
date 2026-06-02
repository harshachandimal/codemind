import React from 'react';
import Panel from '../common/Panel';

type Props = {
  message: string;
};

const HistoryErrorState: React.FC<Props> = ({ message }) => {
  return (
    <Panel className="p-8 max-w-lg mx-auto mt-12 text-center border-red-500/20 bg-red-500/5">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-red-400 mb-2">Unable to load analysis history</h3>
      <p className="text-sm text-red-300/80">{message}</p>
    </Panel>
  );
};

export default HistoryErrorState;
