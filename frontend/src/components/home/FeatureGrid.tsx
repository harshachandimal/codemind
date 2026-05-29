import FeatureCard from './FeatureCard';

const features = [
  {
    label: 'Analysis',
    title: 'Complexity Analysis',
    description: 'Estimate time and space complexity from code structure.',
  },
  {
    label: 'Detection',
    title: 'Recursion Detection',
    description: 'Detect recursive calls, base cases, stack growth, and unwinding.',
  },
  {
    label: 'Tracing',
    title: 'Execution Flow',
    description: 'Trace variables, branches, loops, and function calls step by step.',
  },
  {
    label: 'Intelligence',
    title: 'Runtime Lens',
    description: 'Inspect code through complexity, recursion, memory, and optimization views.',
  },
];

const FeatureGrid = () => {
  return (
    <section className="w-full max-w-5xl px-6 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <FeatureCard key={f.title} title={f.title} description={f.description} label={f.label} />
        ))}
      </div>
    </section>
  );
};

export default FeatureGrid;
