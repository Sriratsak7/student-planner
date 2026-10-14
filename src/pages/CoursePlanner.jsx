import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, AlertTriangle, CheckCircle2, Plus, Bot } from 'lucide-react';

const urgencyStyle = {
  high: { bg: '#fff5f5', border: '#ffcdd2', badge: '#e53935', label: 'ต้องเตรียม', icon: 'alert' },
  medium: { bg: '#fff8e1', border: '#ffe082', badge: '#f57c00', label: 'ควรเตรียม', icon: 'pin' },
  normal: { bg: '#f9f9f9', border: '#e8e0d5', badge: '#388e3c', label: 'ปกติ', icon: 'check' },
};

export default function CoursePlanner() {
  const { courses, currentWeek, setCurrentWeek, getWeeklyAnalysis, addTask } = useApp();
  const navigate = useNavigate();
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [addingTask, setAddingTask] = useState(null);

  const analysis = getWeeklyAnalysis();

  const handleAutoAddTask = (courseCode, weekData) => {
    addTask({
      title: `เตรียมตัว: ${weekData.topic}`,
      subject: courseCode,
      priority: weekData.difficulty >= 4 ? 'high' : weekData.difficulty >= 3 ? 'medium' : 'low',
      estimatedTime: weekData.prepHours,
      deadline: getTodayPlusDays(2),
      category: 'homework',
      difficulty: weekData.difficulty,
      notes: `เตรียมตัวสำหรับสัปดาห์ที่ ${currentWeek}: ${weekData.topic}`
    });
    setAddingTask(courseCode);
    setTimeout(() => setAddingTask(null), 2000);
  };

  const getTodayPlusDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const difficultyBar = (val) => (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width: '16px', height: '6px', borderRadius: '3px',
          background: i <= val ? (val >= 4 ? '#e53935' : val >= 3 ? '#f57c00' : '#388e3c') : '#e0e0e0'
        }} />
      ))}
    </div>
  );

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#3d2c1e', margin: 0 }}>
          Course Planner
        </h1>
        <button onClick={() => navigate('/add-course')} style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: '#f5ede0', border: 'none', borderRadius: '999px',
          padding: '7px 14px', cursor: 'pointer', color: '#8B6914', fontWeight: '700', fontSize: '13px'
        }}>
          <Plus size={14} /> เพิ่มวิชา
        </button>
      </div>
      <p style={{ color: '#999', fontSize: '13px', marginBottom: '20px' }}>
        วิเคราะห์ตารางเรียนและแนะนำการเตรียมตัว
      </p>

      {/* Week Selector */}
      <div style={{
        background: 'linear-gradient(135deg, #8B6914, #c4922a)',
        borderRadius: '16px', padding: '16px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <button onClick={() => setCurrentWeek(w => Math.max(1, w - 1))} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
          width: '36px', height: '36px', cursor: 'pointer', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0 }}>สัปดาห์ที่</p>
          <p style={{ color: '#fff', fontSize: '36px', fontWeight: '800', margin: '0' }}>{currentWeek}</p>
        </div>
        <button onClick={() => setCurrentWeek(w => Math.min(16, w + 1))} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
          width: '36px', height: '36px', cursor: 'pointer', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekly Analysis Cards */}
      {analysis.map(({ course, weekData, recommendation, urgency }) => {
        const style = urgencyStyle[urgency] || urgencyStyle.normal;
        const isExpanded = expandedCourse === course.id;
        const justAdded = addingTask === course.code;

        return (
          <div key={course.id} style={{
            background: style.bg, border: `1.5px solid ${style.border}`,
            borderRadius: '14px', marginBottom: '12px', overflow: 'hidden'
          }}>
            {/* Course header */}
            <div style={{ padding: '14px', cursor: 'pointer' }}
              onClick={() => setExpandedCourse(isExpanded ? null : course.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      background: course.color, color: '#fff',
                      fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: '700'
                    }}>{course.code}</span>
                    <span style={{
                      background: style.badge + '20', color: style.badge,
                      fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: '600',
                      display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                      {style.icon === 'alert' && <AlertTriangle size={10} />}
                      {style.icon === 'check' && <CheckCircle2 size={10} />}
                      {style.label}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#3d2c1e' }}>
                    {weekData ? weekData.topic : 'ไม่มีข้อมูลสัปดาห์นี้'}
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#777' }}>
                    {course.name}
                  </p>
                </div>
                <span style={{ color: '#aaa', fontSize: '18px' }}>{isExpanded ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Expanded detail */}
            {isExpanded && weekData && (
              <div style={{ padding: '0 14px 14px', borderTop: '1px solid ' + style.border }}>
                <div style={{ paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>ความยาก:</span>
                    {difficultyBar(weekData.difficulty)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>ควรเตรียมล่วงหน้า:</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#3d2c1e' }}>
                      {weekData.prepHours} ชั่วโมง
                    </span>
                  </div>

                  <div style={{
                    background: '#fff', borderRadius: '10px', padding: '12px',
                    fontSize: '13px', color: '#555', marginBottom: '12px',
                    borderLeft: `4px solid ${style.badge}`,
                    display: 'flex', gap: '8px', alignItems: 'flex-start'
                  }}>
                    <Bot size={14} color={style.badge} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span><strong>คำแนะนำ:</strong> {recommendation}</span>
                  </div>

                  <button onClick={() => handleAutoAddTask(course.code, weekData)} style={{
                    width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                    background: justAdded ? '#e8f5e9' : '#f5ede0',
                    color: justAdded ? '#388e3c' : '#8B6914',
                    cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}>
                    {justAdded ? <><CheckCircle2 size={16} /> เพิ่มงานแล้ว!</> : <><Plus size={16} /> สร้าง Task เตรียมตัวอัตโนมัติ</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Full schedule view */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#3d2c1e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookOpen size={16} color="#8B6914" /> ตารางเรียนทั้งหมด
        </h3>
        {courses.map(course => (
          <div key={course.id} style={{
            background: '#fff', border: '1.5px solid #e8e0d5',
            borderRadius: '14px', padding: '14px', marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: course.color }} />
              <span style={{ fontWeight: '700', fontSize: '15px', color: '#3d2c1e' }}>{course.code}</span>
              <span style={{ fontSize: '13px', color: '#888' }}>{course.name}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {course.schedule.map(week => (
                <div key={week.week} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', borderRadius: '8px',
                  background: week.week === currentWeek ? '#f5ede0' : 'transparent',
                  border: week.week === currentWeek ? '1.5px solid #c4922a' : '1.5px solid transparent'
                }}>
                  <span style={{
                    minWidth: '28px', height: '28px', borderRadius: '50%',
                    background: week.week === currentWeek ? '#8B6914' : '#f0f0f0',
                    color: week.week === currentWeek ? '#fff' : '#888',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '700'
                  }}>{week.week}</span>
                  <span style={{ flex: 1, fontSize: '13px', color: '#3d2c1e', fontWeight: week.week === currentWeek ? '700' : '400' }}>
                    {week.topic}
                  </span>
                  {difficultyBar(week.difficulty)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
