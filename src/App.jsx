import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav';
import Dashboard from './pages/Dashboard';
import AddTask from './pages/AddTask';
import TaskPriority from './pages/TaskPriority';
import TimerPage from './pages/TimerPage';
import CoursePlanner from './pages/CoursePlanner';
import SkillReport from './pages/SkillReport';
import AddCourse from './pages/AddCourse';
import { useEffect, useState } from 'react';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

function Layout() {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f0ebe3' }}>
        {/* Sidebar */}
        <SideNav />

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{
            background: '#fff', borderBottom: '1px solid #e8e0d5',
            padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <PageTitle />
            </div>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#8B6914', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '800', fontSize: '14px'
            }}>S</div>
          </div>

          {/* Page */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{
              maxWidth: '900px', margin: '0 auto',
              background: '#fff', borderRadius: '20px',
              boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
              minHeight: 'calc(100vh - 120px)'
            }}>
              <PageRoutes />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div style={{
      minHeight: '100vh',
      background: '#d4c4a8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        minHeight: '100vh',
        background: '#faf7f2',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        borderRadius: '40px',
      }}>
        {/* App header */}
        <div style={{
          background: '#3d2c1e',
          padding: '14px 20px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: '#8B6914',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: '16px' }}>📚</span>
          </div>
          <div>
            <h2 style={{ color: '#fff', fontSize: '15px', fontWeight: '800', margin: 0 }}>Student Planner</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', margin: 0 }}>วางแผนการเรียนอัจฉริยะ</p>
          </div>
        </div>

        <div style={{ overflowY: 'auto', height: 'calc(100vh - 120px)', minHeight: '500px' }}>
          <PageRoutes />
        </div>

        <BottomNav />
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
  };
  const path = window.location.pathname;
  return (
    <div>
      <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#3d2c1e', margin: 0 }}>
        {titles[path] || 'Student Planner'}
      </h1>
      <p style={{ fontSize: '12px', color: '#aaa', margin: '2px 0 0' }}>
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
