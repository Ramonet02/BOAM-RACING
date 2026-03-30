// Shared state between TopoButton and CursorTopoEffect.
// intensity is lerped inside the canvas tick — never set it from outside.

export const topoState: {
  target: { x: number; y: number } | null; // set by TopoButton
  pos:    { x: number; y: number } | null; // last known position (for lerp-out)
  intensity: number;                        // 0..1, lerped each frame in canvas
} = {
  target:    null,
  pos:       null,
  intensity: 0,
};
