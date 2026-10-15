import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import AddTask from './pages/AddTask';
import TaskPriority from './pages/TaskPriority';
import TimerPage from './pages/TimerPage';
import CoursePlanner from './pages/CoursePlanner';
import SkillReport from './pages/SkillReport';
import AddCourse from './pages/AddCourse';
import { BookMarked } from 'lucide-react';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
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
              padding: '8px 20px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#8B6914',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookMarked size={20} color="#fff" />
              </div>
              <div>
                <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: '800', margin: 0 }}>Student Planner</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: 0 }}>วางแผนการเรียนอัจฉริยะ</p>
              </div>
            </div>

            {/* Page content */}
            <div style={{ overflowY: 'auto', height: 'calc(100vh - 130px)', minHeight: '500px' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-task" element={<AddTask />} />
                <Route path="/priority" element={<TaskPriority />} />
                <Route path="/timer" element={<TimerPage />} />
                <Route path="/planner" element={<CoursePlanner />} />
                <Route path="/add-course" element={<AddCourse />} />
                <Route path="/skills" element={<SkillReport />} />
              </Routes>
            </div>

            <BottomNav />
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
