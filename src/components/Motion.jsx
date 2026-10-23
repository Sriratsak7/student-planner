// ─── Motion Components (minimal) ────────────────────────────
import { useEffect, useState } from 'react';
import { t } from '../utils/theme';
import { easeIOS, dur } from '../utils/motion';

// ── BottomSheet — slides up smoothly, no spring bounce ──────
export function BottomSheet({ show, onClose, children, maxWidth = 430 }) {
  const [visible, setVisible] = useState(show);
  const [open, setOpen]       = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // one-frame delay so CSS transition triggers
      requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
    } else {
      setOpen(false);
      const timer = setTimeout(() => setVisible(false), 260);
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
          background: 'rgba(0,3,12,0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0,
          transition: `opacity 250ms ${easeIOS}`,
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', zIndex: 201,
        width: '100%', maxWidth,
        background: t.card,
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.5)',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
        transform: open ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100%)',
        transition: `transform 280ms ${easeIOS}`,
      }}>
        {/* Handle bar */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: t.border, margin: '12px auto 4px',
        }} />
        {children}
      </div>
    </>
  );
}

// ── IOSButton — consistent button with smooth bg transition ──
export function IOSButton({
  children, onClick, variant = 'primary', size = 'md',
  fullWidth = false, disabled = false, icon, style = {},
}) {
  const bg = {
    primary:   t.accentGrad2,
    secondary: t.cardLight,
    danger:    t.danger,
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

  const border = variant === 'ghost' ? `1.5px solid ${t.border}` : 'none';
  const pad = { sm: '8px 14px', md: '11px 18px', lg: '14px 22px' }[size] ?? '11px 18px';
  const fs  = { sm: 13, md: 14, lg: 15 }[size] ?? 14;
  const rad = { sm: 10, md: 12, lg: 14 }[size] ?? 12;

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
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
        transition: `opacity 100ms ease`,
        ...style,
      }}
    >
      {icon}{children}
    </button>
  );
}
