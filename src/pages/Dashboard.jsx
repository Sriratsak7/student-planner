import { useApp } from '../context/AppContext';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, BookOpen, Zap, Star, Flame } from 'lucide-react';
import ActivityHeatmap from '../components/ActivityHeatmap';

// คำนวณ streak จาก completed tasks
function calcStreak(tasks) {
  const completed = tasks.filter(t => t.status === 'completed' && t.completedDate);
  if (completed.length === 0) return 0;

  const dates = [...new Set(completed.map(t => t.completedDate))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev - curr) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export default function Dashboard() {
  const { tasks, getSkillData, getWeeklyAnalysis, currentWeek } = useApp();

  const pending = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');
  const overdue = pending.filter(t => new Date(t.deadline) < new Date());
  const skillData = getSkillData();
  const weeklyAnalysis = getWeeklyAnalysis();
  const urgent = weeklyAnalysis.filter(w => w.urgency === 'high');
  const streak = calcStreak(tasks);

  const today = new Date();
  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const topTasks = [...pending].sort((a, b) => {
    const dateDiff = new Date(a.deadline) - new Date(b.deadline);
    if (dateDiff !== 0) return dateDiff;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  }).slice(0, 3);

  const priorityColor = { high: '#e53935', medium: '#f57c00', low: '#388e3c' };
  const priorityLabel = { high: 'สูง', medium: 'กลาง', low: 'ต่ำ' };

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>
          วัน{dayNames[today.getDay()]}ที่ {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear() + 543}
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#3d2c1e', margin: '4px 0 0' }}>
          สวัสดี! พร้อมทำงานแล้วหรือยัง?
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <StatCard icon={<Clock size={18} color="#f57c00" />} value={pending.length} label="งานค้างอยู่" bg="#fff8f0" />
        <StatCard icon={<CheckCircle2 size={18} color="#388e3c" />} value={completed.length} label="เสร็จแล้ว" bg="#f0fff4" />
        <StatCard icon={<AlertTriangle size={18} color="#e53935" />} value={overdue.length} label="เกินกำหนด" bg="#fff5f5" />
      </div>

      {/* Streak */}
      <div style={{
        background: streak > 0 ? 'linear-gradient(135deg, #e65100, #ff8f00)' : '#f5f5f5',
        borderRadius: '14px', padding: '14px 18px', marginBottom: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flame size={28} color={streak > 0 ? '#fff' : '#ccc'} />
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: streak > 0 ? 'rgba(255,255,255,0.8)' : '#aaa' }}>
              Study Streak
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '22px', fontWeight: '800', color: streak > 0 ? '#fff' : '#bbb' }}>
              {streak} วัน
            </p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: streak > 0 ? 'rgba(255,255,255,0.85)' : '#bbb', maxWidth: '120px', textAlign: 'right' }}>
          {streak === 0 ? 'ทำงานวันนี้เพื่อเริ่ม streak!'
           : streak < 3 ? 'เริ่มต้นดีมาก!'
           : streak < 7 ? 'ไปต่อได้เลย!'
           : 'ยอดเยี่ยมมาก!'}
        </p>
      </div>

      {/* Skill Score */}
      <div style={{
        background: 'linear-gradient(135deg, #8B6914, #c4922a)',
        borderRadius: '16px', padding: '18px', marginBottom: '20px', color: '#fff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.85 }}>ความแม่นยำในการประมาณเวลา</p>
            <h2 style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: '800' }}>
              {skillData.accuracy}%
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>
              {skillData.accuracy >= 90 ? 'เยี่ยมมาก!' : skillData.accuracy >= 70 ? 'ดีมาก' : skillData.accuracy > 0 ? 'ต้องพัฒนา' : 'ยังไม่มีข้อมูล'}
            </p>
          </div>
          <TrendingUp size={48} opacity={0.3} />
        </div>
        <div style={{ marginTop: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '999px', height: '6px' }}>
            <div style={{
              background: '#fff', borderRadius: '999px', height: '6px',
              width: `${Math.min(skillData.accuracy, 100)}%`, transition: 'width 0.5s'
            }} />
          </div>
        </div>
      </div>

      {/* Urgent this week */}
      {urgent.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Zap size={16} color="#e53935" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#3d2c1e', margin: 0 }}>
              ต้องเตรียมสัปดาห์นี้!
            </h3>
          </div>
          {urgent.map(({ course, weekData, recommendation }) => (
            <div key={course.id} style={{
              background: '#fff5f5', border: '1px solid #ffcdd2',
              borderRadius: '12px', padding: '12px', marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{
                    background: course.color, color: '#fff',
                    fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: '600'
                  }}>{course.code}</span>
                  <p style={{ margin: '6px 0 0', fontWeight: '600', fontSize: '14px', color: '#3d2c1e' }}>
                    {weekData?.topic}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#e53935' }}>
                    {recommendation}
                  </p>
                </div>
                <div style={{ textAlign: 'center', minWidth: '40px', display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
                  {[...Array(weekData?.difficulty || 0)].map((_, i) => (
                    <Star key={i} size={12} fill="#f57c00" color="#f57c00" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Heatmap */}
      <div style={{ marginBottom: '20px' }}>
        <ActivityHeatmap tasks={tasks} />
      </div>

      {/* Top Tasks */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <BookOpen size={16} color="#8B6914" />
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#3d2c1e', margin: 0 }}>
            งานที่ควรทำก่อน
          </h3>
        </div>
        {topTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
            <CheckCircle2 size={40} style={{ marginBottom: '8px' }} />
            <p>ไม่มีงานค้างอยู่</p>
          </div>
        ) : topTasks.map((task, i) => (
          <div key={task.id} style={{
            background: '#fff', border: '1px solid #e8e0d5',
            borderRadius: '12px', padding: '12px', marginBottom: '8px',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: i === 0 ? '#8B6914' : '#f5ede0',
              color: i === 0 ? '#fff' : '#8B6914',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '14px', flexShrink: 0
            }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#3d2c1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {task.title}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#999' }}>
                {task.subject} · กำหนดส่ง {task.deadline}
              </p>
            </div>
            <span style={{
              background: priorityColor[task.priority] + '20',
              color: priorityColor[task.priority],
              fontSize: '11px', padding: '3px 8px', borderRadius: '999px', fontWeight: '600', flexShrink: 0
            }}>{priorityLabel[task.priority]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, bg }) {
  return (
    <div style={{ background: bg, borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: '#3d2c1e' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#888' }}>{label}</div>
    </div>
  );
}
