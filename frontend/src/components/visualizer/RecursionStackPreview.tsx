import type { RecursionStackFrame } from '../../types/visualizer';
import Panel from '../common/Panel';
import RecursionStackFrameCard from './RecursionStackFrameCard';

type Props = { frames: RecursionStackFrame[] };

const RecursionStackPreview = ({ frames }: Props) => {
  if (frames.length === 0) return null;

  return (
    <Panel className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold tracking-widest uppercase text-violet-400">
          Recursion Stack Preview
        </p>
        <p className="text-xs text-white/40 leading-relaxed max-w-lg">
          Conceptual view of stack growth and unwinding based on detected recursion patterns.
        </p>
      </div>

      {/* Stack frame list — indented by depth for visual stack feel */}
      <div className="flex flex-col gap-2">
        {frames.map((frame) => (
          <div
            key={frame.id}
            style={{ paddingLeft: `${(frame.depth - 1) * 16}px` }}
          >
            <RecursionStackFrameCard frame={frame} />
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-white/20 leading-relaxed border-t border-white/[0.05] pt-4">
        ⓘ This is a conceptual preview, not a real execution trace. Frames illustrate typical
        recursive call patterns detected by CodeMind's static analyser.
      </p>
    </Panel>
  );
};

export default RecursionStackPreview;
