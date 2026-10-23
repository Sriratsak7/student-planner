// ─── Minimal motion utilities ───────────────────────────────
// Only what's needed for a smooth, usable feel.

export const easeIOS = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
export const dur = { fast: 100, normal: 180 };

// Smooth color/bg transitions for interactive elements
export const trans = {
  color: `background ${dur.normal}ms ${easeIOS}, color ${dur.normal}ms ${easeIOS}, border-color ${dur.normal}ms ${easeIOS}`,
  opacity: `opacity ${dur.fast}ms ${easeIOS}`,
};
