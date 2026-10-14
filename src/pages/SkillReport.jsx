import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Zap, Target, Award } from 'lucide-react';

export default function SkillReport() {
  const { tasks, getSkillData, courses } = useApp();
  const skillData = getSkillData();
  const completed = tasks.filter(t => t.status === 'completed' && t.actualTime);

  const subjectData = Object.entries(skillData.bySubject).map(([code, data]) => ({
    name: code,
    accuracy: data.avgAccuracy,
    tasks: data.tasks,
  }));

  const timeComparisonData = completed.slice(-8).map(t => ({
    name: t.title.slice(0, 10) + '…',
    ประมาณ: t.estimatedTime,
    จริง: parseFloat(t.actualTime?.toFixed(2) || 0),
  }));

  const fastCount = completed.filter(t => t.actualTime < t.estimatedTime).length;
  const slowCount = completed.filter(t => t.actualTime > t.estimatedTime).length;

  const getLevel = (acc) => {
    if (acc >= 110) return { label: 'เร็วมาก', color: '#1565C0' };
    if (acc >= 90) return { label: 'แม่นยำมาก', color: '#388e3c' };
    if (acc >= 70) return { label: 'ดี', color: '#f57c00' };
    if (acc > 0) return { label: 'ต้องพัฒนา', color: '#e53935' };
    return { label: 'ยังไม่มีข้อมูล', color: '#aaa' };
  };

  const level = getLevel(skillData.accuracy);

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#3d2c1e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Award size={22} color="#8B6914" /> รายงานทักษะ
      </h1>

      {/* Overall Score */}
      <div style={{
        background: 'linear-gradient(135deg, #3d2c1e, #8B6914)',
        borderRadius: '20px', padding: '24px', marginBottom: '20px', color: '#fff'
      }}>
        <p style={{ margin: '0 0 4px', opacity: 0.7, fontSize: '12px' }}>คะแนนความสามารถโดยรวม</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <span style={{ fontSize: '56px', fontWeight: '900', lineHeight: 1 }}>
            {skillData.accuracy || 0}
          </span>
          <span style={{ fontSize: '24px', opacity: 0.8, marginBottom: '8px' }}>%</span>
        </div>
        <span style={{
          background: 'rgba(255,255,255,0.2)', padding: '4px 12px',
          borderRadius: '999px', fontSize: '13px', fontWeight: '600'
        }}>{level.label}</span>

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <MiniStat icon={<Clock size={14} />} label="งานที่เสร็จ" value={completed.length} />
          <MiniStat icon={<Zap size={14} />} label="เร็วกว่าคาด" value={fastCount} />
          <MiniStat icon={<Target size={14} />} label="ช้ากว่าคาด" value={slowCount} />
        </div>
      </div>

      {/* Accuracy by Subject */}
      {subjectData.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#3d2c1e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={16} color="#8B6914" /> ความแม่นยำแยกตามวิชา
          </h3>
          {subjectData.map(s => {
            const lv = getLevel(s.accuracy);
            const course = courses.find(c => c.code === s.name);
            return (
              <div key={s.name} style={{
                background: '#fff', border: '1.5px solid #e8e0d5',
                borderRadius: '12px', padding: '12px', marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: course?.color || '#8B6914' }} />
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#3d2c1e' }}>{s.name}</span>
                    <span style={{ fontSize: '12px', color: '#aaa' }}>({s.tasks} งาน)</span>
                  </div>
                  <span style={{ color: lv.color, fontWeight: '700', fontSize: '13px' }}>{lv.label}</span>
                </div>
                <div style={{ background: '#f0f0f0', borderRadius: '999px', height: '8px' }}>
                  <div style={{
                    background: course?.color || '#8B6914', borderRadius: '999px', height: '8px',
                    width: `${Math.min(s.accuracy, 100)}%`, transition: 'width 0.6s'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#bbb' }}>0%</span>
                  <span style={{ fontSize: '11px', color: '#3d2c1e', fontWeight: '700' }}>{s.accuracy}%</span>
                  <span style={{ fontSize: '11px', color: '#bbb' }}>100%+</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Time Comparison Chart */}
      {timeComparisonData.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#3d2c1e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="#8B6914" /> เปรียบเทียบเวลาประมาณ vs จริง
          </h3>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1.5px solid #e8e0d5' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeComparisonData} barGap={2}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="ชม" />
                <Tooltip />
                <Bar dataKey="ประมาณ" fill="#c4922a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="จริง" fill="#388e3c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
              <LegendItem color="#c4922a" label="ประมาณการ" />
              <LegendItem color="#388e3c" label="ใช้จริง" />
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{ background: '#f5ede0', borderRadius: '14px', padding: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#8B6914', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={16} /> คำแนะนำสำหรับคุณ
        </h3>
        {completed.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            เริ่มทำงานและจับเวลาเพื่อให้ระบบวิเคราะห์ความสามารถของคุณได้
          </p>
        ) : skillData.accuracy >= 90 ? (
          <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
            คุณประมาณเวลาได้แม่นมาก ลองรับงานที่ท้าทายมากขึ้นได้เลย
          </p>
        ) : skillData.accuracy >= 70 ? (
          <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
            ดีมาก ลองเพิ่มเวลาประมาณการอีกนิดเพื่อให้ไม่กดดันตัวเองมากเกินไป
          </p>
        ) : (
          <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
            คุณมักใช้เวลามากกว่าที่คาด ลองตั้งเวลาประมาณการให้มากขึ้น 20-30% เพื่อผลลัพธ์ที่ดีขึ้น
          </p>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: 0.7, marginBottom: '2px' }}>
        {icon}
        <span style={{ fontSize: '11px' }}>{label}</span>
      </div>
      <span style={{ fontSize: '20px', fontWeight: '800' }}>{value}</span>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color }} />
      <span style={{ fontSize: '12px', color: '#555' }}>{label}</span>
    </div>
  );
}
