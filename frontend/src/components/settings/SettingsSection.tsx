import type { ReactNode } from 'react';

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

const SettingsSection = ({ title, description, children }: SettingsSectionProps) => {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.03] shadow-xl shadow-black/30 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-white/[0.07]">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description && <p className="mt-1 text-sm text-white/40">{description}</p>}
      </div>
      <div className="p-6 space-y-6">
        {children}
      </div>
    </section>
  );
};

export default SettingsSection;
