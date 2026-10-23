// ─── Reusable Motion Components ─────────────────────────────
// Wraps pages/cards/lists with iOS-feel animations.
import { useEffect, useRef, useState } from 'react';
import { t } from '../utils/theme';
import { spring, easeIOS, dur, press } from '../utils/motion';

// ── PageView — wraps every page with enter animation ────────
export function PageView({ children, style = {} }) {
  return (
    <div
      className="page-enter"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', ...style }}
    >
      {children}
    </div>
  );
}

// ── AnimatedList — staggered fade-in for list items ─────────
export function AnimatedList({ children, style = {} }) {
  return (
    <div className="stagger" style={style}>
      {children}
    </div>
  );
}

// ── PressCard — card with iOS press scale ───────────────────
export function PressCard({ children, onClick, style = {}, disabled = false }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={()   => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => !disabled && setPressed(true)}
      onTouchEnd={()   => setPressed(false)}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        transition: `transform ${dur.fast}ms ${spring}, opacity ${dur.fast}ms ${easeIOS}`,
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        opacity:   pressed ? 0.88 : 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── IOSButton — primary/secondary with spring feedback ──────
export function IOSButton({
  children, onClick, variant = 'primary', size = 'md',
  fullWidth = false, disabled = false, icon, style = {},
}) {
  const [pressed, setPressed] = useState(false);

  const bg = {
    primary:   t.accentGrad2,
    secondary: t.cardLight,
    danger:    `linear-gradient(135deg, ${t.danger}, #dc2626)`,
    success:   `linear-gradient(135deg, ${t.success}, #10b981)`,
    ghost:     'transparent',
  }[variant] ?? t.accentGrad2;

  const color = {
    primary:   '#fff',
    secondary: t.textSec,
    danger:    '#fff',
    success:   '#fff',
    ghost:     t.accentLight,
  }[variant] ?? '#fff';

  const border = {
    ghost: `1.5px solid ${t.border}`,
  }[variant] ?? 'none';

  const pad = { sm: '8px 14px', md: '11px 18px', lg: '14px 22px' }[size] ?? '11px 18px';
  const fs  = { sm: 13, md: 14, lg: 15 }[size] ?? 14;
  const rad = { sm: 10, md: 12, lg: 14 }[size] ?? 12;

  const shadow = {
    primary: pressed ? 'none' : '0 4px 14px rgba(59,130,246,0.28)',
    success: pressed ? 'none' : '0 4px 14px rgba(52,211,153,0.25)',
    danger:  pressed ? 'none' : '0 4px 14px rgba(248,113,113,0.25)',
  }[variant] ?? 'none';

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={()   => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => !disabled && setPressed(true)}
      onTouchEnd={()   => setPressed(false)}
      style={{
        background: disabled ? t.disabled : bg,
        color: disabled ? t.disabledText : color,
        border,
        borderRadius: rad,
        padding: pad,
        fontSize: fs,
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        transition: `transform ${dur.fast}ms ${spring}, opacity ${dur.fast}ms ${easeIOS}, box-shadow ${dur.normal}ms ${easeIOS}`,
        transform: pressed && !disabled ? 'scale(0.94)' : 'scale(1)',
        opacity:   pressed && !disabled ? 0.85 : 1,
        boxShadow: disabled ? 'none' : shadow,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
        ...style,
      }}
    >
      {icon && icon}
      {children}
    </button>
  );
}

// ── BottomSheet — slides up like iOS action sheet ───────────
export function BottomSheet({ show, onClose, children, maxWidth = 430 }) {
  const [visible, setVisible] = useState(show);
  const [anim,    setAnim]    = useState(show ? 'in' : 'out');

  useEffect(() => {
    if (show) {
      setVisible(true);
      requestAnimationFrame(() => setAnim('in'));
    } else {
      setAnim('out');
      const timer = setTimeout(() => setVisible(false), 320);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: t.overlay,
          backdropFilter: 'blur(6px)',
          transition: `opacity ${dur.slow}ms ${easeIOS}`,
          opacity: anim === 'in' ? 1 : 0,
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: '50%', zIndex: 201,
          transform: anim === 'in'
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(100%)',
          transition: `transform ${dur.slow}ms ${spring}, opacity ${dur.slow}ms ${easeIOS}`,
          opacity: anim === 'in' ? 1 : 0.3,
          width: '100%', maxWidth,
          background: t.card,
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: t.border, margin: '12px auto 4px',
        }} />
        {children}
      </div>
    </>
  );
}

// ── SegmentedControl — iOS-style pill tab switcher ──────────
export function SegmentedControl({ options, value, onChange }) {
  const [activeIdx, setActiveIdx] = useState(options.findIndex(o => o.value === value));
  const containerRef = useRef(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const idx = options.findIndex(o => o.value === value);
    setActiveIdx(idx);
    const container = containerRef.current;
    if (!container) return;
    const btns = container.querySelectorAll('.seg-btn');
    if (btns[idx]) {
      const btn = btns[idx];
      setPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
    }
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex', alignItems: 'center', position: 'relative',
        background: t.cardLight, borderRadius: 12,
        padding: 3, gap: 0,
      }}
    >
      {/* Sliding pill */}
      <div style={{
        position: 'absolute',
        left: pillStyle.left + 3, width: pillStyle.width,
        top: 3, bottom: 3,
        background: t.accentBg,
        borderRadius: 9,
        border: `1px solid ${t.borderLight}`,
        transition: `left ${dur.normal}ms ${spring}, width ${dur.normal}ms ${spring}`,
        pointerEvents: 'none',
      }} />

      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            className="seg-btn"
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1, padding: '7px 10px', borderRadius: 9, border: 'none',
              background: 'transparent',
              color: isActive ? t.accentLight : t.textMuted,
              fontSize: 13, fontWeight: isActive ? '700' : '500',
              cursor: 'pointer', position: 'relative', zIndex: 1,
              transition: `color ${dur.normal}ms ${easeIOS}`,
              userSelect: 'none',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── CheckSpring — animated iOS-style checkbox ───────────────
export function CheckSpring({ checked, onChange, label }) {
  const [anim, setAnim] = useState(false);

  const toggle = () => {
    setAnim(true);
    onChange(!checked);
    setTimeout(() => setAnim(false), 300);
  };

  return (
    <button
      onClick={toggle}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '4px 0',
      }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: checked ? t.success : 'transparent',
        border: `2px solid ${checked ? t.success : t.textDim}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: `background ${dur.fast}ms ${spring}, border-color ${dur.fast}ms ${spring}`,
        transform: anim ? 'scale(1.2)' : 'scale(1)',
        flexShrink: 0,
      }}>
        {checked && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {label && <span style={{ fontSize: 14, color: t.textSec }}>{label}</span>}
    </button>
  );
}

// ── IOSSwitch — toggle switch like iOS settings ─────────────
export function IOSSwitch({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 51, height: 31, borderRadius: 16,
        background: value ? t.success : t.cardLight,
        border: `2px solid ${value ? t.success : t.border}`,
        padding: 0, cursor: 'pointer', position: 'relative',
        transition: `background ${dur.normal}ms ${spring}, border-color ${dur.normal}ms ${spring}`,
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2,
        left: value ? 'calc(100% - 25px)' : 2,
        width: 23, height: 23, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        transition: `left ${dur.normal}ms ${spring}`,
      }} />
    </button>
  );
}
