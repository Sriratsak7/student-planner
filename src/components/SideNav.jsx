import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, ListOrdered, Timer, BarChart2, BookOpen, LayoutDashboard, BookMarked, BrainCircuit } from 'lucide-react';
import { t } from '../utils/theme';

const navItems = [
  { path: '/',          icon: LayoutDashboard, label: 'หน้าหลัก'   },
  { path: '/add-task',  icon: Plus,            label: 'เพิ่มงาน'   },
  { path: '/priority',  icon: ListOrdered,     label: 'ลำดับงาน'   },
  { path: '/timer',     icon: Timer,           label: 'จับเวลา'    },
  { path: '/planner',   icon: BookOpen,        label: 'ตารางเรียน'  },
  { path: '/analysis',  icon: BrainCircuit,    label: 'ผู้ช่วย AI'  },
  { path: '/skills',    icon: BarChart2,       label: 'ทักษะ'      },
];

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{
      width: '220px', minHeight: '100vh', flexShrink: 0,
      background: t.sidebar,
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh'
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 24px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: t.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookMarked size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ color: t.text, fontSize: '15px', fontWeight: '800', margin: 0 }}>Student Planner</h2>
            <p style={{ color: t.textMuted, fontSize: '11px', margin: '2px 0 0' }}>วางแผนการเรียน</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button key={path} onClick={() => navigate(path)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 14px', borderRadius: '12px', border: 'none',
              background: active ? t.accent : 'transparent',
              color: active ? '#fff' : t.textSec,
              cursor: 'pointer', marginBottom: '4px',
              transition: 'all 0.2s', textAlign: 'left',
              fontFamily: 'inherit'
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = t.sidebarHover }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: '14px', fontWeight: active ? '700' : '400' }}>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${t.border}` }}>
        <p style={{ color: t.textDim, fontSize: '11px', margin: 0, textAlign: 'center' }}>
          Student Planner v2.0
        </p>
      </div>
    </div>
  );
}
