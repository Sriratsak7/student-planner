import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, ListOrdered, Timer, BarChart2, BookOpen, LayoutDashboard, BookMarked, BrainCircuit } from 'lucide-react';
import { t } from '../utils/theme';
import { spring, easeIOS, dur } from '../utils/motion';

const navItems = [
  { path: '/',          icon: LayoutDashboard, label: 'หน้าหลัก'  },
  { path: '/add-task',  icon: Plus,            label: 'เพิ่มงาน'  },
  { path: '/priority',  icon: ListOrdered,     label: 'ลำดับงาน'  },
  { path: '/timer',     icon: Timer,           label: 'จับเวลา'   },
  { path: '/planner',   icon: BookOpen,        label: 'ตารางเรียน' },
  { path: '/analysis',  icon: BrainCircuit,    label: 'AI Assistant' },
  { path: '/skills',    icon: BarChart2,       label: 'ทักษะ'     },
];

export default function SideNav() {
  const location = useLocation();
  const navigate  = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [pressed, setPressed] = useState(null);

  return (
    <div style={{
      width: '220px', minHeight: '100vh', flexShrink: 0,
      background: t.sidebar,
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
      borderRight: `1px solid ${t.sidebarBorder}`,
    }}>
      {/* Logo */}
      <div style={{ padding: '26px 20px 22px', borderBottom: `1px solid ${t.sidebarBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '12px',
            background: t.accentGrad2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: t.glowBlue,
          }}>
            <BookMarked size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ color: t.text, fontSize: '15px', fontWeight: '700', margin: 0, letterSpacing: '-0.2px' }}>
              Student Planner
            </h2>
            <p style={{ color: t.textDim, fontSize: '11px', margin: '2px 0 0' }}>วางแผนการเรียน</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const active  = location.pathname === path;
          const hover   = hovered === path && !active;
          const isPress = pressed === path;

          return (
            <button
              key={path}
              onPointerDown={() => setPressed(path)}
              onPointerUp={() => { setPressed(null); navigate(path); }}
              onPointerLeave={() => { setPressed(null); setHovered(null); }}
              onMouseEnter={() => setHovered(path)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '12px', border: 'none',
                background: active ? t.accentBg : hover ? t.cardHover : 'transparent',
                color: active ? t.accentLight : hover ? t.textSec : t.textDim,
                cursor: 'pointer', marginBottom: '2px',
                transition: `background ${dur.normal}ms ${easeIOS}, color ${dur.normal}ms ${easeIOS}, transform ${dur.fast}ms ${spring}`,
                transform: isPress ? 'scale(0.96)' : 'scale(1)',
                textAlign: 'left', fontFamily: 'inherit',
                borderLeft: active ? `3px solid ${t.accent}` : '3px solid transparent',
              }}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: '14px', fontWeight: active ? '600' : '400' }}>{label}</span>
              {active && (
                <div style={{
                  marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
                  background: t.accent,
                  boxShadow: `0 0 8px ${t.accent}`,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 20px', borderTop: `1px solid ${t.sidebarBorder}` }}>
        <p style={{ color: t.textDim, fontSize: '11px', margin: 0, textAlign: 'center' }}>
          Student Planner v2.0
        </p>
      </div>
    </div>
  );
}
