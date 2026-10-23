import { useLocation, useNavigate } from 'react-router-dom';
import {
  Plus, ListOrdered, Timer, BarChart2,
  BookOpen, LayoutDashboard, BrainCircuit,
} from 'lucide-react';
import { t } from '../utils/theme';
import { easeIOS, dur } from '../utils/motion';

const NAV = [
  { path: '/',         icon: LayoutDashboard, label: 'หน้าหลัก'   },
  { path: '/add-task', icon: Plus,            label: 'เพิ่มงาน'   },
  { path: '/priority', icon: ListOrdered,     label: 'ลำดับงาน'   },
  { path: '/timer',    icon: Timer,           label: 'จับเวลา'    },
  { path: '/planner',  icon: BookOpen,        label: 'ตารางเรียน' },
  { path: '/analysis', icon: BrainCircuit,    label: 'AI'          },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: t.sidebar,
      borderTop: `1px solid ${t.sidebarBorder}`,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '6px 0',
      paddingBottom: 'max(6px, env(safe-area-inset-bottom, 6px))',
      zIndex: 100,
    }}>
      {NAV.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;

        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none',
              color: active ? t.accentLight : t.textDim,
              minWidth: 48, padding: '4px 0',
              transition: `color ${dur.normal}ms ${easeIOS}`,
            }}
          >
            <div style={{
              width: 36, height: 26, borderRadius: 8,
              background: active ? t.accentBg : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: `background ${dur.normal}ms ${easeIOS}`,
            }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
