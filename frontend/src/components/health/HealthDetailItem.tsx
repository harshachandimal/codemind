type Props = {
  label: string;
  value: string;
};

const HealthDetailItem = ({ label, value }: Props) => {
  return (
    <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
      <span className="text-xs font-medium text-white/35 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-semibold text-white/80 font-mono">
        {value}
      </span>
    </div>
  );
};

export default HealthDetailItem;
