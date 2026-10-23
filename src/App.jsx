import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import { easeIOS, dur } from './utils/motion';

// ── Desktop breakpoint ───────────────────────────────────────
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

// ── All routes ───────────────────────────────────────────────
function PageRoutes() {
  return (
    <Routes>
      <Route path="/"           element={<Dashboard />} />
      <Route path="/add-task"   element={<AddTask />} />
      <Route path="/priority"   element={<TaskPriority />} />
      <Route path="/timer"      element={<TimerPage />} />
      <Route path="/planner"    element={<CoursePlanner />} />
      <Route path="/add-course" element={<AddCourse />} />
      <Route path="/skills"     element={<SkillReport />} />
      <Route path="/analysis"   element={<TaskAnalysis />} />
    </Routes>
  );
}

// ── Floating timer — shows on every page ────────────────────
function TimerWidget({ isDesktop }) {
  const { timerState, getTimerElapsed, tasks } = useApp();
  const navigate = useNavigate();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!timerState.running) return;
    const interval = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(interval);
  }, [timerState.running]);

  const isActive = timerState.running || (timerState.taskId && timerState.elapsedSeconds > 0);
  if (!isActive) return null;

  const task     = tasks.find(tsk => tsk.id === timerState.taskId);
  const elapsed  = getTimerElapsed();
  const isPaused = !timerState.running && timerState.elapsedSeconds > 0;

  const bg = isPaused
    ? `linear-gradient(135deg, ${t.warning}, #d97706)`
    : t.accentGrad2;

  const fmt = (s) => {
    const h   = Math.floor(s / 3600).toString().padStart(2, '0');
    const m   = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const sharedStyle = {
    background: bg, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: isPaused
      ? '0 6px 22px rgba(245,158,11,0.35)'
      : '0 6px 22px rgba(59,130,246,0.35)',
  };

  if (isDesktop) {
    return (
      <div onClick={() => navigate('/timer')} style={{
        ...sharedStyle,
        position: 'fixed', bottom: 24, right: 24, zIndex: 999,
        borderRadius: 16, padding: '12px 18px', maxWidth: 320,
      }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Clock size={17} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
            {isPaused ? 'หยุดชั่วขณะ' : 'กำลังจับเวลา'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task?.title || 'ไม่ทราบชื่อ'}
          </p>
        </div>
        <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {fmt(elapsed)}
        </span>
        {isPaused && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>⏸</span>}
      </div>
    );
  }

  return (
    <div onClick={() => navigate('/timer')} style={{
      ...sharedStyle,
      position: 'fixed',
      bottom: 'calc(58px + env(safe-area-inset-bottom, 0px) + 8px)',
      left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 24px)', maxWidth: 406, zIndex: 998,
      borderRadius: 14, padding: '10px 16px',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Clock size={14} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
          {isPaused ? 'หยุดชั่วขณะ' : 'กำลังจับเวลา'}
        </p>
        <p style={{ margin: '1px 0 0', fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task?.title || 'ไม่ทราบชื่อ'}
        </p>
      </div>
      <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
        {fmt(elapsed)}
      </span>
      {isPaused && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>⏸</span>}
    </div>
  );
}

// ── Layout ───────────────────────────────────────────────────
function Layout() {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: t.bg }}>
        <SideNav />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{
            background: t.sidebar, borderBottom: `1px solid ${t.sidebarBorder}`,
            padding: '14px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <PageTitle />
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: t.accentGrad2, color: '#fff',
              fontWeight: 800, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: t.glowBlue,
            }}>S</div>
          </div>

          {/* Content */}
          <div className="scroll-y" style={{ flex: 1, padding: 28 }}>
            <div style={{
              maxWidth: 900, margin: '0 auto',
              background: t.card, borderRadius: 20,
              border: `1px solid ${t.border}`,
              boxShadow: '0 2px 30px rgba(0,0,0,0.35)',
              minHeight: 'calc(100vh - 100px)',
              overflow: 'hidden',
            }}>
              <PageRoutes />
            </div>
          </div>
        </div>
        <TimerWidget isDesktop />
      </div>
    );
  }

  // Mobile
  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <div style={{
        width: '100%', maxWidth: 430, minHeight: '100vh',
        margin: '0 auto', background: t.bg,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          background: t.sidebar,
          paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: `1px solid ${t.sidebarBorder}`,
          flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: t.accentGrad2, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: t.glowBlue,
          }}>
            <span style={{ fontSize: 16 }}>📚</span>
          </div>
          <div>
            <h2 style={{ color: t.text, fontSize: 15, fontWeight: 700, margin: 0 }}>Student Planner</h2>
            <p style={{ color: t.textMuted, fontSize: 10, margin: 0 }}>วางแผนการเรียนอัจฉริยะ</p>
          </div>
        </div>

        {/* Page */}
        <div className="scroll-y" style={{ flex: 1 }}>
          <PageRoutes />
        </div>

        <BottomNav />
        <TimerWidget isDesktop={false} />
      </div>
    </div>
  );
}

// ── Page title (desktop topbar) ──────────────────────────────
function PageTitle() {
  const location = useLocation();
  const titles = {
    '/':           'หน้าหลัก',
    '/add-task':   'เพิ่มงานใหม่',
    '/priority':   'ลำดับความสำคัญ',
    '/timer':      'จับเวลาทำงาน',
    '/planner':    'Course Planner',
    '/add-course': 'เพิ่มวิชาใหม่',
    '/skills':     'รายงานทักษะ',
    '/analysis':   'AI Assistant',
  };
  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: 0 }}>
        {titles[location.pathname] || 'Student Planner'}
      </h1>
      <p style={{ fontSize: 12, color: t.textMuted, margin: '2px 0 0' }}>
        {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AppProvider>
  );
}
