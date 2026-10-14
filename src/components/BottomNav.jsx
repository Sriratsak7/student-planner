import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, ListOrdered, Timer, BarChart2, BookOpen, LayoutDashboard } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'หน้าหลัก' },
  { path: '/add-task', icon: Plus, label: 'เพิ่มงาน' },
  { path: '/priority', icon: ListOrdered, label: 'ลำดับงาน' },
  { path: '/timer', icon: Timer, label: 'จับเวลา' },
  { path: '/planner', icon: BookOpen, label: 'ตารางเรียน' },
  { path: '/skills', icon: BarChart2, label: 'ทักษะ' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '430px',
      background: '#fff', borderTop: '1px solid #e8e0d5',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '8px 0 12px', zIndex: 100,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
    }}>
      {navItems.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <button key={path} onClick={() => navigate(path)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: active ? '#8B6914' : '#aaa',
            transition: 'color 0.2s',
            minWidth: '50px'
          }}>
            <div style={{
              background: active ? '#f5ede0' : 'transparent',
              borderRadius: '12px', padding: '6px 10px',
              transition: 'background 0.2s'
            }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: active ? '700' : '400' }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
