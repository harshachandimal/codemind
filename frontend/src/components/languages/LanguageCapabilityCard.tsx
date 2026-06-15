import React, { useState } from 'react';
import { LanguageCapability } from '../../types/languageCapabilities';
import Panel from '../common/Panel';
import StatusPill from '../common/StatusPill';

type Props = {
  capability: LanguageCapability;
};

export const LanguageCapabilityCard: React.FC<Props> = ({ capability }) => {
  const [openSupported, setOpenSupported] = useState(false);
  const [openUnsupported, setOpenUnsupported] = useState(false);

  return (
    <Panel className="p-6 flex flex-col h-full gap-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-xl font-bold text-white mb-0">{capability.displayName}</h4>
        <div className="flex gap-2 flex-col items-end">
          <StatusPill 
            label={capability.status.toUpperCase()} 
            status={capability.status === 'stable' ? 'connected' : 'checking'} 
          />
          {capability.experimental && <StatusPill label="EXPERIMENTAL" status="error" />}
        </div>
      </div>

      <div className="flex flex-col gap-3 my-2 border-y border-white/10 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Static Analysis</span>
          {capability.staticAnalysisSupported ? (
            <span className="text-emerald-400 font-medium">Supported</span>
          ) : (
            <span className="text-rose-400 font-medium">Unsupported</span>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Runtime Trace</span>
          {capability.runtimeTraceSupported ? (
            <span className="text-emerald-400 font-medium">Supported</span>
          ) : (
            <span className="text-rose-400 font-medium">Unsupported</span>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Runtime Status</span>
          {capability.runtimeTraceEnabled ? (
            <span className="text-emerald-400 font-medium">Enabled</span>
          ) : (
            <span className="text-amber-400 font-medium">Disabled</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-2">
        <button 
          onClick={() => setOpenSupported(!openSupported)} 
          className="flex-1 py-1.5 px-3 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/20 transition-colors text-center"
        >
          {openSupported ? 'Hide Supported' : 'Show Supported'}
        </button>
        <button 
          onClick={() => setOpenUnsupported(!openUnsupported)} 
          className="flex-1 py-1.5 px-3 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 transition-colors text-center"
        >
          {openUnsupported ? 'Hide Unsupported' : 'Show Unsupported'}
        </button>
      </div>

      {openSupported && (
        <div className="mt-2 bg-black/20 p-3 rounded-lg border border-white/5">
          <h6 className="text-emerald-400 text-xs uppercase tracking-wider mb-2 font-semibold">Supported Features</h6>
          <div className="flex flex-wrap gap-1.5">
            {capability.supportedFeatures.map((f, i) => (
              <span key={i} className="px-2 py-1 bg-emerald-500/10 text-emerald-300 text-[10px] rounded border border-emerald-500/20">{f}</span>
            ))}
          </div>
        </div>
      )}

      {openUnsupported && (
        <div className="mt-2 bg-black/20 p-3 rounded-lg border border-white/5">
          <h6 className="text-rose-400 text-xs uppercase tracking-wider mb-2 font-semibold">Unsupported Features</h6>
          <div className="flex flex-wrap gap-1.5">
            {capability.unsupportedFeatures.map((f, i) => (
              <span key={i} className="px-2 py-1 bg-rose-500/10 text-rose-300 text-[10px] rounded border border-rose-500/20">{f}</span>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
};
