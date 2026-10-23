import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav';
import Dashboard from './pages/Dashboard';
import AddTask from './pages/AddTask';
import TaskPriority from './pages/TaskPriority';
import TimerPage from './pages/TimerPage';
import CoursePlanner from './pages/CoursePlanner';
import SkillReport from './pages/SkillReport';
import AddCourse from './pages/AddCourse';
import TaskAnalysis from './pages/TaskAnalysis';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { t } from './utils/theme';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

// ─── Floating Timer Widget ──────────────────────────────────
// Shows on every page when the timer is running.
function TimerWidget({ isDesktop }) {
  const { timerState, getTimerElapsed, tasks } = useApp();
  const navigate = useNavigate();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!timerState.running) return;
    const interval = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(interval);
  }, [timerState.running]);

  // Show when timer is running OR paused (has task + elapsed time)
  const isActive = timerState.running || (timerState.taskId && timerState.elapsedSeconds > 0);
  if (!isActive) return null;

  const task = tasks.find(tsk => tsk.id === timerState.taskId);
  const elapsed = getTimerElapsed();
  const isPaused = !timerState.running && timerState.elapsedSeconds > 0;
  const widgetBg = isPaused
    ? `linear-gradient(135deg, ${t.warning}, #d97706)`
    : t.accentGrad;

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Desktop: floating bar at bottom-right
  if (isDesktop) {
    return (
      <div
        onClick={() => navigate('/timer')}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 999,
          background: widgetBg, borderRadius: '14px', padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
          boxShadow: isPaused ? '0 8px 25px rgba(245,158,11,0.35)' : '0 8px 25px rgba(59,130,246,0.35)',
          maxWidth: '320px'
        }}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Clock size={18} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{isPaused ? 'หยุดชั่วขณะ' : 'กำลังจับเวลา'}</p>
          <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task?.title || 'งานไม่ทราบชื่อ'}
          </p>
        </div>
        <span style={{ fontSize: '18px', fontWeight: '800', color: '#fff', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {formatTime(elapsed)}
        </span>
        {isPaused && (
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginLeft: '4px' }}>⏸</span>
        )}
      </div>
    );
  }

  // Mobile: bar above bottom nav
  return (
    <div
      onClick={() => navigate('/timer')}
      style={{
        position: 'fixed', bottom: '60px', left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: '400px', zIndex: 998,
        background: widgetBg, borderRadius: '14px', padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
        boxShadow: isPaused ? '0 6px 20px rgba(245,158,11,0.3)' : '0 6px 20px rgba(59,130,246,0.3)'
      }}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Clock size={16} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{isPaused ? 'หยุดชั่วขณะ' : 'กำลังจับเวลา'}</p>
        <p style={{ margin: '1px 0 0', fontSize: '13px', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task?.title || 'งานไม่ทราบชื่อ'}
        </p>
      </div>
      <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
        {formatTime(elapsed)}
      </span>
      {isPaused && (
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>⏸</span>
      )}
    </div>
  );
}

function Layout() {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: t.bg }}>
        <SideNav />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{
            background: t.card, borderBottom: `1px solid ${t.border}`,
            padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <PageTitle />
            </div>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '800', fontSize: '14px'
            }}>S</div>
          </div>

          {/* Page */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{
              maxWidth: '900px', margin: '0 auto',
              background: t.card, borderRadius: '20px',
              boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
              minHeight: 'calc(100vh - 120px)'
            }}>
              <PageRoutes />
            </div>
          </div>
        </div>

        <TimerWidget isDesktop={true} />
      </div>
    );
  }

  // Mobile layout
  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        minHeight: '100vh',
        background: t.bg,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* App header */}
        <div style={{
          background: t.sidebar,
          padding: '14px 20px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: `1px solid ${t.border}`
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: t.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: '16px' }}>📚</span>
          </div>
          <div>
            <h2 style={{ color: t.text, fontSize: '15px', fontWeight: '800', margin: 0 }}>Student Planner</h2>
            <p style={{ color: t.textMuted, fontSize: '10px', margin: 0 }}>วางแผนการเรียนอัจฉริยะ</p>
          </div>
        </div>

        <div style={{ overflowY: 'auto', height: 'calc(100vh - 120px)', minHeight: '500px' }}>
          <PageRoutes />
        </div>

        <BottomNav />
        <TimerWidget isDesktop={false} />
      </div>
    </div>
  );
}

function PageTitle() {
  const titles = {
    '/': 'หน้าหลัก',
    '/add-task': 'เพิ่มงานใหม่',
    '/priority': 'ลำดับความสำคัญ',
    '/timer': 'จับเวลาทำงาน',
    '/planner': 'Course Planner',
    '/add-course': 'เพิ่มวิชาใหม่',
    '/skills': 'รายงานทักษะ',
    '/analysis': 'ผู้ช่วยวิเคราะห์งาน',
  };
  const path = window.location.pathname;
  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: '800', color: t.text, margin: 0 }}>
        {titles[path] || 'Student Planner'}
      </h1>
      <p style={{ fontSize: '12px', color: t.textMuted, margin: '2px 0 0' }}>
        {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
}

function PageRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/add-task" element={<AddTask />} />
      <Route path="/priority" element={<TaskPriority />} />
      <Route path="/timer" element={<TimerPage />} />
      <Route path="/planner" element={<CoursePlanner />} />
      <Route path="/add-course" element={<AddCourse />} />
      <Route path="/skills" element={<SkillReport />} />
      <Route path="/analysis" element={<TaskAnalysis />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AppProvider>
  );
}
