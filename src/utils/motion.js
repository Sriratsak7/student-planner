// ─── iOS-style Motion Utilities ─────────────────────────────

// Spring easing strings
export const spring    = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
export const easeIOS   = 'cubic-bezier(0.23, 1, 0.32, 1)';
export const easeOut   = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

// Durations (ms)
export const dur = { fast: 120, normal: 220, slow: 360 };

// ── Transition string helpers ──────────────────────────────
export const trans = {
  // Button press feel
  button: `transform ${dur.fast}ms ${spring}, opacity ${dur.fast}ms ${easeOut}`,
  // Card hover/press
  card: `transform ${dur.normal}ms ${spring}, box-shadow ${dur.normal}ms ${easeIOS}, border-color ${dur.normal}ms ${easeIOS}`,
  // Color / background
  color: `background ${dur.normal}ms ${easeIOS}, color ${dur.normal}ms ${easeIOS}, border-color ${dur.normal}ms ${easeIOS}`,
  // All (for simple cases)
  all: `all ${dur.normal}ms ${easeIOS}`,
};

// ── Button style helper — adds iOS tap scale ──────────────
// Usage: <button style={{ ...btnBase(t.accent, '#fff'), ...customStyles }}>
export function btnBase(bg, color, opts = {}) {
  const { radius = 12, padding = '10px 16px', fontSize = 14 } = opts;
  return {
    background: bg,
    color,
    border: 'none',
    borderRadius: radius,
    padding,
    fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    transition: trans.button,
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

// ── Press handlers for inline style buttons ───────────────
// Returns { onMouseDown, onMouseUp, onTouchStart, onTouchEnd }
export function pressHandlers(activeStyle, defaultStyle) {
  return {
    onMouseDown:  (e) => Object.assign(e.currentTarget.style, activeStyle),
    onMouseUp:    (e) => Object.assign(e.currentTarget.style, defaultStyle),
    onMouseLeave: (e) => Object.assign(e.currentTarget.style, defaultStyle),
    onTouchStart: (e) => Object.assign(e.currentTarget.style, activeStyle),
    onTouchEnd:   (e) => Object.assign(e.currentTarget.style, defaultStyle),
  };
}

// ── Hover/press style presets ──────────────────────────────
export const press = {
  // Subtle scale — for cards, list rows
  scale: pressHandlers(
    { transform: 'scale(0.97)', opacity: '0.9' },
    { transform: 'scale(1)',    opacity: '1'   }
  ),
  // Strong scale — for primary action buttons
  scaleStrong: pressHandlers(
    { transform: 'scale(0.93)', opacity: '0.85' },
    { transform: 'scale(1)',    opacity: '1'    }
  ),
  // Lift — for floating elements
  lift: pressHandlers(
    { transform: 'scale(0.96) translateY(1px)', opacity: '0.9' },
    { transform: 'scale(1) translateY(0)',      opacity: '1'   }
  ),
};
