/**
 * visualizer.ts
 * Shared TypeScript types for CodeMind visual explanation components.
 * These types define data contracts consumed by future visualizer UI components.
 * All data here represents *estimated* static analysis — not real runtime execution.
 */

// ─── Tone ────────────────────────────────────────────────────────────────────

/** Visual tone used to colour-code cards, badges, and indicators. */
export type VisualizerTone =
  | 'neutral'   // No particular signal — informational display.
  | 'success'   // Efficient / optimal — e.g. O(1), O(log n).
  | 'warning'   // Moderate cost — e.g. O(n), O(n log n).
  | 'danger'    // High cost — e.g. O(n²), O(2ⁿ).
  | 'accent';   // Highlighted / featured item without a pass/fail meaning.

// ─── Complexity ──────────────────────────────────────────────────────────────

/**
 * Represents a visual card for a single complexity metric such as
 * time complexity, space complexity, or a confidence-style indicator.
 */
export type ComplexityVisualItem = {
  /** Short human-readable label shown as the card heading (e.g. "Time Complexity"). */
  label: string;
  /** The complexity value to display prominently (e.g. "O(n²)"). */
  value: string;
  /** Sentence explaining what the value means in practical terms. */
  description: string;
  /** Tone used to colour the card border and badge. */
  tone: VisualizerTone;
};

// ─── Detected Patterns ───────────────────────────────────────────────────────

/**
 * Represents a detected code pattern such as single_loop, nested_loop,
 * recursion, or logarithmic_loop.
 */
export type PatternVisualItem = {
  /** Machine-friendly key that maps to the backend detected_patterns value (e.g. "nested_loop"). */
  key: string;
  /** Human-readable label displayed in the UI (e.g. "Nested Loop"). */
  label: string;
  /** Sentence explaining the pattern and its typical complexity impact. */
  description: string;
  /** Tone used to colour the pattern badge or chip. */
  tone: VisualizerTone;
};

// ─── Recursion Stack Preview ──────────────────────────────────────────────────

/**
 * Visual lifecycle state of a single recursion stack frame.
 * Used to animate conceptual stack depth — not actual runtime stack frames.
 */
export type RecursionStackFrameState =
  | 'waiting'    // Frame is queued but not yet entered.
  | 'active'     // Frame is currently executing (deepest call in the preview).
  | 'base-case'  // Frame has reached the recursion base case.
  | 'unwinding'; // Frame is returning — stack is being popped.

/**
 * Represents one conceptual frame in a recursion call-stack preview.
 * The preview is illustrative of call depth, not a live execution trace.
 */
export type RecursionStackFrame = {
  /** Unique identifier for this frame within the preview list. */
  id: string;
  /** Nesting depth of this frame — 0 is the initial call, higher values are deeper. */
  depth: number;
  /** Short label shown on the frame (e.g. "f(n)", "f(n-1)"). */
  label: string;
  /** Sentence describing what this call level represents. */
  description: string;
  /** Current visual state of the frame used to drive CSS animations. */
  state: RecursionStackFrameState;
};

// ─── Loop Preview ─────────────────────────────────────────────────────────────

/**
 * Represents one conceptual step in a loop-iteration explanation preview.
 * Steps are illustrative — they describe iteration behaviour, not logged values.
 */
export type LoopPreviewStep = {
  /** Unique identifier for this step within the preview list. */
  id: string;
  /** Short label shown on the step tile (e.g. "Iteration 1", "Final Pass"). */
  label: string;
  /** Sentence explaining what happens conceptually during this step. */
  description: string;
};

// ─── Combined Visual Explanation Model ───────────────────────────────────────

/**
 * Combines all visual sub-models into a single shape that visualizer components
 * can consume. Built from a backend Analysis result by a mapper/adapter utility.
 *
 * Any field may be an empty array when the analysis does not include that data.
 */
export type VisualExplanationModel = {
  /** Complexity cards — typically time and space complexity items. */
  complexityItems: ComplexityVisualItem[];
  /** Detected pattern chips derived from analysis.detected_patterns. */
  patterns: PatternVisualItem[];
  /** Conceptual recursion stack frames — populated only when recursion is detected. */
  recursionFrames: RecursionStackFrame[];
  /** Conceptual loop steps — populated only when loop patterns are detected. */
  loopSteps: LoopPreviewStep[];
};
