type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

const SectionHeader = ({ eyebrow, title, description }: Props) => {
  return (
    <div className="text-center">
      {eyebrow && (
        <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-4">
          {eyebrow}
        </p>
      )}
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-sm text-white/40 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
