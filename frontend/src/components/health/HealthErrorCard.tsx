import Panel from '../common/Panel';
import StatusPill from '../common/StatusPill';

type Props = {
  message: string;
};

const HealthErrorCard = ({ message }: Props) => {
  return (
    <Panel className="p-8 text-center">
      <div className="text-3xl mb-5">⚠️</div>

      <div className="flex justify-center mb-4">
        <StatusPill label="Connection Issue" status="error" />
      </div>

      <p className="text-red-300/80 font-semibold text-sm mb-3">
        Could not reach the backend API.
      </p>
      <p className="text-white/35 text-xs leading-relaxed mb-6">
        {message}
      </p>

      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <p className="text-[11px] text-white/30">
          <span className="text-white/50 font-semibold">Hint:</span>{' '}
          Make sure Laravel is running at{' '}
          <span className="text-indigo-400/80 font-mono">http://127.0.0.1:8000</span>
        </p>
      </div>
    </Panel>
  );
};

export default HealthErrorCard;
