import Panel from '../common/Panel';
import StatusPill from '../common/StatusPill';

const HealthLoadingCard = () => {
  return (
    <Panel className="p-8 text-center">
      <div className="flex justify-center mb-5">
        <div className="w-9 h-9 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
      <div className="flex justify-center mb-3">
        <StatusPill label="Checking" status="checking" />
      </div>
      <p className="text-xs text-white/30 leading-relaxed">
        Connecting React frontend to Laravel API…
      </p>
    </Panel>
  );
};

export default HealthLoadingCard;
