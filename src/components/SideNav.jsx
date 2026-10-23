import { useLocation, useNavigate } from 'react-router-dom';
import {
  Plus, ListOrdered, Timer, BarChart2,
  BookOpen, LayoutDashboard, BookMarked, BrainCircuit,
} from 'lucide-react';
import { t } from '../utils/theme';
import { easeIOS, dur } from '../utils/motion';

const NAV = [
  { path: '/',          icon: LayoutDashboard, label: 'หน้าหลัก'    },
  { path: '/add-task',  icon: Plus,            label: 'เพิ่มงาน'    },
  { path: '/priority',  icon: ListOrdered,     label: 'ลำดับงาน'    },
  { path: '/timer',     icon: Timer,           label: 'จับเวลา'     },
  { path: '/planner',   icon: BookOpen,        label: 'ตารางเรียน'  },
  { path: '/analysis',  icon: BrainCircuit,    label: 'AI Assistant' },
  { path: '/skills',    icon: BarChart2,       label: 'ทักษะ'       },
];

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{
      width: 220, minHeight: '100vh', flexShrink: 0,
      background: t.sidebar,
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
      borderRight: `1px solid ${t.sidebarBorder}`,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${t.sidebarBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: t.accentGrad2, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: t.glowBlue,
          }}>
            <BookMarked size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ color: t.text, fontSize: 15, fontWeight: 700, margin: 0 }}>Student Planner</h2>
            <p style={{ color: t.textDim, fontSize: 11, margin: '2px 0 0' }}>วางแผนการเรียน</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 12, border: 'none',
                background: active ? t.accentBg : 'transparent',
                color: active ? t.accentLight : t.textDim,
                cursor: 'pointer', marginBottom: 2,
                textAlign: 'left', fontFamily: 'inherit',
                borderLeft: `3px solid ${active ? t.accent : 'transparent'}`,
                transition: `background ${dur.normal}ms ${easeIOS}, color ${dur.normal}ms ${easeIOS}, border-color ${dur.normal}ms ${easeIOS}`,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = t.cardHover; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{label}</span>
              {active && (
                <div style={{
                  marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
                  background: t.accent, boxShadow: `0 0 6px ${t.accent}`,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '14px 20px', borderTop: `1px solid ${t.sidebarBorder}` }}>
        <p style={{ color: t.textDim, fontSize: 11, margin: 0, textAlign: 'center' }}>
          Student Planner v2.0
        </p>
      </div>
    </div>
  );
}
