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
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { t } from './utils/theme';
import { spring, easeIOS, dur } from './utils/motion';

// ── Responsive breakpoint ────────────────────────────────────
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

// ── Page transition wrapper — re-mounts on route change ──────
function AnimatedRoutes() {
  const location = useLocation();
  const [displayLoc, setDisplayLoc] = useState(location);
  const [stage, setStage] = useState('idle'); // idle | exit | enter
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;

    // Tiny exit then enter
    setStage('exit');
    const t1 = setTimeout(() => {
      setDisplayLoc(location);
      setStage('enter');
    }, 80);
    const t2 = setTimeout(() => setStage('idle'), 80 + 280);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [location]);

  const style = {
    transition: `opacity ${dur.normal}ms ${easeIOS}, transform ${dur.normal}ms ${easeIOS}`,
    opacity:   stage === 'exit' ? 0   : 1,
    transform: stage === 'exit' ? 'translateY(4px) scale(0.99)'
             : stage === 'enter' ? 'translateY(4px) scale(0.99)'
             : 'translateY(0) scale(1)',
  };

  return (
    <div style={style}>
      <Routes location={displayLoc}>
        <Route path="/"           element={<Dashboard />} />
        <Route path="/add-task"   element={<AddTask />} />
        <Route path="/priority"   element={<TaskPriority />} />
        <Route path="/timer"      element={<TimerPage />} />
        <Route path="/planner"    element={<CoursePlanner />} />
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/skills"     element={<SkillReport />} />
        <Route path="/analysis"   element={<TaskAnalysis />} />
      </Routes>
    </div>
  );
}

// ── Floating timer widget — persists across every page ───────
function TimerWidget({ isDesktop }) {
  const { timerState, getTimerElapsed, tasks } = useApp();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!timerState.running) return;
    const interval = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(interval);
  }, [timerState.running]);

  const isActive = timerState.running || (timerState.taskId && timerState.elapsedSeconds > 0);
  if (!isActive) return null;

  const task      = tasks.find(tsk => tsk.id === timerState.taskId);
  const elapsed   = getTimerElapsed();
  const isPaused  = !timerState.running && timerState.elapsedSeconds > 0;
  const widgetBg  = isPaused
    ? `linear-gradient(135deg, ${t.warning}, #d97706)`
    : t.accentGrad2;

  const fmt = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const pressH = {
    onMouseDown:  () => setPressed(true),
    onMouseUp:    () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    onTouchStart: () => setPressed(true),
    onTouchEnd:   () => setPressed(false),
  };

  const commonStyle = {
    background: widgetBg,
    display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
    transition: `transform ${dur.fast}ms ${spring}, box-shadow ${dur.normal}ms ${easeIOS}`,
    transform: pressed ? 'scale(0.96)' : 'scale(1)',
  };

  if (isDesktop) {
    return (
      <div
        onClick={() => navigate('/timer')}
        {...pressH}
        style={{
          ...commonStyle,
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
          borderRadius: '16px', padding: '12px 18px', maxWidth: '320px',
          boxShadow: isPaused
            ? '0 8px 28px rgba(245,158,11,0.4)'
            : '0 8px 28px rgba(59,130,246,0.4)',
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Clock size={18} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
            {isPaused ? 'หยุดชั่วขณะ' : 'กำลังจับเวลา'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task?.title || 'ไม่ทราบชื่อ'}
          </p>
        </div>
        <span style={{ fontSize: '18px', fontWeight: '800', color: '#fff', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {fmt(elapsed)}
        </span>
        {isPaused && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>⏸</span>}
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate('/timer')}
      {...pressH}
      style={{
        ...commonStyle,
        position: 'fixed',
        bottom: 'calc(60px + env(safe-area-inset-bottom, 0px) + 8px)',
        left: '50%', transform: pressed ? 'translateX(-50%) scale(0.96)' : 'translateX(-50%) scale(1)',
        width: 'calc(100% - 28px)', maxWidth: '402px', zIndex: 998,
        borderRadius: '14px', padding: '10px 16px',
        boxShadow: isPaused
          ? '0 6px 22px rgba(245,158,11,0.35)'
          : '0 6px 22px rgba(59,130,246,0.35)',
      }}
    >
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Clock size={15} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
          {isPaused ? 'หยุดชั่วขณะ' : 'กำลังจับเวลา'}
        </p>
        <p style={{ margin: '1px 0 0', fontSize: '13px', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task?.title || 'ไม่ทราบชื่อ'}
        </p>
      </div>
      <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
        {fmt(elapsed)}
      </span>
      {isPaused && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>⏸</span>}
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
          }}>
            <PageTitle />
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: t.accentGrad2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '800', fontSize: '14px',
              boxShadow: t.glowBlue,
            }}>S</div>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }} className="scroll-smooth">
            <div style={{
              maxWidth: '900px', margin: '0 auto',
              background: t.card, borderRadius: '20px',
              border: `1px solid ${t.border}`,
              boxShadow: '0 2px 30px rgba(0,0,0,0.35)',
              minHeight: 'calc(100vh - 100px)',
              overflow: 'hidden',
            }}>
              <AnimatedRoutes />
            </div>
          </div>
        </div>
        <TimerWidget isDesktop={true} />
      </div>
    );
  }

  // ── Mobile ─────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: t.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: '430px', minHeight: '100vh',
        background: t.bg, position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Mobile header */}
        <div style={{
          background: t.sidebar,
          padding: `${10 + 'px'} 20px 10px`,
          paddingTop: 'max(10px, env(safe-area-inset-top, 10px))',
          display: 'flex', alignItems: 'center', gap: '10px',
          borderBottom: `1px solid ${t.sidebarBorder}`,
          flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '10px',
            background: t.accentGrad2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: t.glowBlue,
          }}>
            <span style={{ fontSize: '16px' }}>📚</span>
          </div>
          <div>
            <h2 style={{ color: t.text, fontSize: '15px', fontWeight: '800', margin: 0 }}>Student Planner</h2>
            <p style={{ color: t.textMuted, fontSize: '10px', margin: 0 }}>วางแผนการเรียนอัจฉริยะ</p>
          </div>
        </div>

        {/* Page content */}
        <div
          style={{ flex: 1, overflowY: 'auto' }}
          className="scroll-smooth"
        >
          <AnimatedRoutes />
        </div>

        <BottomNav />
        <TimerWidget isDesktop={false} />
      </div>
    </div>
  );
}

// ── Page title ───────────────────────────────────────────────
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
      <h1 style={{ fontSize: '18px', fontWeight: '700', color: t.text, margin: 0, letterSpacing: '-0.2px' }}>
        {titles[location.pathname] || 'Student Planner'}
      </h1>
      <p style={{ fontSize: '12px', color: t.textMuted, margin: '2px 0 0' }}>
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
