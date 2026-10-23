import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, ListOrdered, Timer, BarChart2, BookOpen, LayoutDashboard, BrainCircuit } from 'lucide-react';
import { t } from '../utils/theme';
import { spring, easeIOS, dur } from '../utils/motion';

const navItems = [
  { path: '/',         icon: LayoutDashboard, label: 'หน้าหลัก'  },
  { path: '/add-task', icon: Plus,            label: 'เพิ่มงาน'  },
  { path: '/priority', icon: ListOrdered,     label: 'ลำดับงาน'  },
  { path: '/timer',    icon: Timer,           label: 'จับเวลา'   },
  { path: '/planner',  icon: BookOpen,        label: 'ตารางเรียน' },
  { path: '/analysis', icon: BrainCircuit,    label: 'AI'         },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pressed, setPressed] = useState(null);

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '430px',
      background: t.sidebar,
      borderTop: `1px solid ${t.sidebarBorder}`,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '6px 0',
      paddingBottom: 'max(6px, env(safe-area-inset-bottom, 6px))',
      zIndex: 100,
      boxShadow: '0 -1px 0 rgba(255,255,255,0.04)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      {navItems.map(({ path, icon: Icon, label }) => {
        const active  = location.pathname === path;
        const isPress = pressed === path;

        return (
          <button
            key={path}
            onPointerDown={() => setPressed(path)}
            onPointerUp={() => { setPressed(null); navigate(path); }}
            onPointerLeave={() => setPressed(null)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: active ? t.accentLight : t.textDim,
              minWidth: '48px', padding: '4px 0',
              transition: `color ${dur.normal}ms ${easeIOS}`,
              transform: isPress ? 'scale(0.85)' : 'scale(1)',
              transitionProperty: 'transform, color',
              transitionDuration: `${dur.fast}ms, ${dur.normal}ms`,
              transitionTimingFunction: `${spring}, ${easeIOS}`,
            }}
          >
            {/* Icon container with active bg pill */}
            <div style={{
              width: 36, height: 26, borderRadius: 9,
              background: active ? t.accentBg : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: `background ${dur.normal}ms ${easeIOS}`,
            }}>
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ transition: `stroke-width ${dur.normal}ms ${easeIOS}` }}
              />
            </div>

            {/* Label */}
            <span style={{
              fontSize: '10px',
              fontWeight: active ? '700' : '400',
              transition: `font-weight ${dur.normal}ms ${easeIOS}`,
              letterSpacing: '-0.1px',
            }}>
              {label}
            </span>

            {/* Active dot */}
            <div style={{
              width: 4, height: 4, borderRadius: '50%',
              background: t.accent,
              opacity: active ? 1 : 0,
              transform: active ? 'scale(1)' : 'scale(0)',
              transition: `opacity ${dur.normal}ms ${easeIOS}, transform ${dur.normal}ms ${spring}`,
            }} />
          </button>
        );
      })}
    </nav>
  );
}
