import Panel from '../common/Panel';
import StatusPill from '../common/StatusPill';
import HealthDetailItem from './HealthDetailItem';

type Props = {
  message: string;
  app: string;
  database: string;
};

const HealthSuccessCard = ({ message, app, database }: Props) => {
  return (
    <Panel className="p-8">
      <div className="flex items-center justify-between mb-6">
        <StatusPill label="Connected" status="connected" />
        <span className="text-[10px] text-white/20 uppercase tracking-widest font-semibold">
          All Systems
        </span>
      </div>

      <p className="text-sm text-emerald-300/80 font-medium mb-6 leading-relaxed">
        {message}
      </p>

      <div>
        <HealthDetailItem label="App" value={app} />
        <HealthDetailItem label="Database" value={database} />
      </div>
    </Panel>
  );
};

export default HealthSuccessCard;
