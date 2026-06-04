# Visualizer Components

Visualizer components render CodeMind's explanation data as educational UI.
They should teach concepts clearly and stay small/reusable.

## Component Map

| Component | Purpose |
|---|---|
| `ComplexityVisualCard` | Single complexity metric card (time or space) |
| `PatternVisualCard` | Single detected pattern chip with description |
| `PatternVisualGrid` | Responsive grid of PatternVisualCards |
| `ComplexityLensPanel` | Top-level panel combining complexity cards + pattern grid |
| `RecursionStackFrameCard` | Single conceptual stack frame with depth + state styling |
| `RecursionStackPreview` | Depth-indented stack list of RecursionStackFrameCards |

## Design Rules

- Every component stays **under 100 lines**.
- Tone-based colour accents are defined locally per component — not via global CSS.
- No pattern-mapping logic lives here — use `buildVisualExplanation` in `src/utils/`.
- All explanations frame results as **estimated static analysis**, not runtime tracing.

## Recursion Preview Notes

- `RecursionStackPreview` explains conceptual stack growth and unwinding based on
  detected recursion patterns — it does **not** claim to have executed the code.
- If no recursion frames are present, `RecursionStackPreview` renders nothing (`null`),
  so it is safe to include unconditionally in a layout.
- Future phases may replace the static conceptual frames in `buildVisualExplanation`
  with backend-generated execution trace data without changing these components.
