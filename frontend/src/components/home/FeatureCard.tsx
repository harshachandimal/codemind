import Panel from '../common/Panel';

type Props = {
  title: string;
  description: string;
  label?: string;
};

const FeatureCard = ({ title, description, label }: Props) => {
  return (
    <Panel className="flex flex-col gap-4 p-6 hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all duration-300 text-left">
      {label && (
        <span className="text-[10px] font-bold tracking-widest text-indigo-400/70 uppercase">
          {label}
        </span>
      )}
      <h3 className="text-sm font-semibold text-white/90 leading-snug">{title}</h3>
      <p className="text-xs text-white/40 leading-relaxed">{description}</p>
    </Panel>
  );
};

export default FeatureCard;
