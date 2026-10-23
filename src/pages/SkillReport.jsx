import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { TrendingUp, Clock, Zap, Target, Award, Info, Calendar } from 'lucide-react';
import ActivityHeatmap from '../components/ActivityHeatmap';
import { t } from '../utils/theme';

export default function SkillReport() {
  const { tasks, getSkillData, courses, getWeeklyProgress } = useApp();
  const skillData = getSkillData();
  const completed = tasks.filter(tsk => tsk.status === 'completed' && tsk.actualTime);
  const weeklyData = getWeeklyProgress();

  const subjectData = Object.entries(skillData.bySubject).map(([code, data]) => ({
    name: code,
    accuracy: data.avgAccuracy,
    tasks: data.tasks,
  }));

  const timeComparisonData = completed.slice(-8).map(tsk => ({
    name: tsk.title.slice(0, 10) + '…',
    ประมาณ: tsk.estimatedTime,
    จริง: parseFloat(tsk.actualTime?.toFixed(2) || 0),
  }));

  const fastCount = completed.filter(tsk => tsk.actualTime < tsk.estimatedTime).length;
  const slowCount = completed.filter(tsk => tsk.actualTime > tsk.estimatedTime).length;

  const getLevel = (acc) => {
    if (acc >= 110) return { label: 'เร็วมาก', color: t.accent };
    if (acc >= 90) return { label: 'แม่นยำมาก', color: t.success };
    if (acc >= 70) return { label: 'ดี', color: t.warning };
    if (acc > 0) return { label: 'ต้องพัฒนา', color: t.danger };
    return { label: 'ยังไม่มีข้อมูล', color: t.textDim };
  };

  const level = getLevel(skillData.accuracy);

  const thisWeek = weeklyData[weeklyData.length - 1];
  const lastWeek = weeklyData[weeklyData.length - 2];
  const weekDiff = thisWeek && lastWeek ? thisWeek.count - lastWeek.count : 0;

  const formatWeekLabel = (weekStr) => {
    const d = new Date(weekStr);
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${d.getDate()} ${monthNames[d.getMonth()]}`;
  };

  const weeklyChartData = weeklyData.map(w => ({ ...w, label: formatWeekLabel(w.week) }));

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: t.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Award size={22} color={t.accent} /> รายงานทักษะ
      </h1>

      {/* Overall Score */}
      <div style={{
        background: `linear-gradient(135deg, ${t.sidebar}, ${t.accent})`,
        borderRadius: '20px', padding: '24px', marginBottom: '16px', color: '#fff'
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

      {/* Score explanation */}
      <div style={{
        background: t.accentBg, borderRadius: '14px', padding: '16px', marginBottom: '16px',
        border: `1px solid ${t.borderLight}`
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: t.accentLight, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={16} /> คะแนนมาจากอะไร?
        </h3>
        <div style={{ fontSize: '13px', color: t.textSec, lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 6px' }}>
            คะแนนความแม่นยำ = เวลาที่ประมาณไว้ ÷ เวลาที่ใช้จริง × 100
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            <ScoreBar label="100% = ประมาณไว้ตรงกับที่ใช้จริง" color={t.success} />
            <ScoreBar label="90-99% = ใช้เวลาใกล้เคียงกับที่คาด" color={t.success} />
            <ScoreBar label="70-89% = ใช้เวลาเกินกว่าคาดไว้เล็กน้อย" color={t.warning} />
            <ScoreBar label="< 70% = ใช้เวลาเกินมาก ควรปรับประมาณการ" color={t.danger} />
            <ScoreBar label="> 100% = ทำเร็วกว่าที่คาดไว้" color={t.accent} />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: t.textMuted }}>
            คะแนนคำนวณจากงานที่ทำเสร็จและบันทึกเวลาจริงแล้วเท่านั้น
          </p>
        </div>
      </div>

      {/* Weekly progress summary */}
      {weeklyData.length > 0 && (
        <div style={{
          background: t.card, borderRadius: '14px', padding: '16px', marginBottom: '16px',
          border: `1.5px solid ${t.border}`
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: t.text, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} color={t.accent} /> สรุปความคืบหน้ารายสัปดาห์
          </h3>

          {thisWeek && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                flex: 1, background: t.accentBg, borderRadius: '12px', padding: '12px', textAlign: 'center'
              }}>
                <p style={{ fontSize: '11px', color: t.accentLight, margin: 0 }}>สัปดาห์นี้</p>
                <p style={{ fontSize: '28px', fontWeight: '800', color: t.text, margin: '4px 0 0' }}>
                  {thisWeek.count}
                </p>
                <p style={{ fontSize: '11px', color: t.textMuted, margin: '2px 0 0' }}>งานเสร็จ</p>
              </div>
              <div style={{
                flex: 1, background: t.cardLight, borderRadius: '12px', padding: '12px', textAlign: 'center'
              }}>
                <p style={{ fontSize: '11px', color: t.textMuted, margin: 0 }}>สัปดาห์ก่อน</p>
                <p style={{ fontSize: '28px', fontWeight: '800', color: t.textSec, margin: '4px 0 0' }}>
                  {lastWeek ? lastWeek.count : 0}
                </p>
                <p style={{ fontSize: '11px', color: t.textDim, margin: '2px 0 0' }}>งานเสร็จ</p>
              </div>
              <div style={{
                flex: 1, borderRadius: '12px', padding: '12px', textAlign: 'center',
                background: weekDiff > 0 ? t.successBg : weekDiff < 0 ? t.dangerBg : t.cardLight
              }}>
                <p style={{ fontSize: '11px', color: t.textMuted, margin: 0 }}>เปลี่ยนแปลง</p>
                <p style={{
                  fontSize: '28px', fontWeight: '800', margin: '4px 0 0',
                  color: weekDiff > 0 ? t.success : weekDiff < 0 ? t.danger : t.textDim
                }}>
                  {weekDiff > 0 ? '+' : ''}{weekDiff}
                </p>
                <p style={{ fontSize: '11px', color: t.textMuted, margin: '2px 0 0' }}>งาน</p>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyChartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.accent} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={t.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: t.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: t.textMuted }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '10px', border: `1px solid ${t.border}`, fontSize: '12px', background: t.card, color: t.text }}
                formatter={(value) => [`${value} งาน`, 'เสร็จ']}
              />
              <Area
                type="monotone" dataKey="count" stroke={t.accent} strokeWidth={2}
                fill="url(#colorCount)" dot={{ r: 4, fill: t.accent }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Accuracy by Subject */}
      {subjectData.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: t.text, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={16} color={t.accent} /> ความแม่นยำแยกตามวิชา
          </h3>
          {subjectData.map(s => {
            const lv = getLevel(s.accuracy);
            const course = courses.find(c => c.code === s.name);
            return (
              <div key={s.name} style={{
                background: t.card, border: `1.5px solid ${t.border}`,
                borderRadius: '12px', padding: '12px', marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: course?.color || t.accent }} />
                    <span style={{ fontWeight: '700', fontSize: '14px', color: t.text }}>{s.name}</span>
                    <span style={{ fontSize: '12px', color: t.textMuted }}>({s.tasks} งาน)</span>
                  </div>
                  <span style={{ color: lv.color, fontWeight: '700', fontSize: '13px' }}>{lv.label}</span>
                </div>
                <div style={{ background: t.border, borderRadius: '999px', height: '8px' }}>
                  <div style={{
                    background: course?.color || t.accent, borderRadius: '999px', height: '8px',
                    width: `${Math.min(s.accuracy, 100)}%`, transition: 'width 0.6s'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: t.textDim }}>0%</span>
                  <span style={{ fontSize: '11px', color: t.text, fontWeight: '700' }}>{s.accuracy}%</span>
                  <span style={{ fontSize: '11px', color: t.textDim }}>100%+</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Time Comparison Chart */}
      {timeComparisonData.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: t.text, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color={t.accent} /> เปรียบเทียบเวลาประมาณ vs จริง
          </h3>
          <div style={{ background: t.card, borderRadius: '12px', padding: '16px', border: `1.5px solid ${t.border}` }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeComparisonData} barGap={2}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: t.textMuted }} />
                <YAxis tick={{ fontSize: 10, fill: t.textMuted }} unit="ชม" />
                <Tooltip contentStyle={{ borderRadius: '10px', border: `1px solid ${t.border}`, background: t.card, color: t.text }} />
                <Bar dataKey="ประมาณ" fill={t.accent} radius={[4, 4, 0, 0]} />
                <Bar dataKey="จริง" fill={t.success} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
              <LegendItem color={t.accent} label="ประมาณการ" />
              <LegendItem color={t.success} label="ใช้จริง" />
            </div>
          </div>
        </div>
      )}

      {/* Activity Heatmap */}
      <div style={{ marginBottom: '24px' }}>
        <ActivityHeatmap tasks={tasks} />
      </div>

      {/* Tips */}
      <div style={{ background: t.accentBg, borderRadius: '14px', padding: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: t.accentLight, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={16} /> คำแนะนำสำหรับคุณ
        </h3>
        {completed.length === 0 ? (
          <p style={{ fontSize: '13px', color: t.textMuted, margin: 0 }}>
            เริ่มทำงานและจับเวลาเพื่อให้ระบบวิเคราะห์ความสามารถของคุณได้
          </p>
        ) : skillData.accuracy >= 90 ? (
          <p style={{ fontSize: '13px', color: t.textSec, margin: 0 }}>
            คุณประมาณเวลาได้แม่นมาก ลองรับงานที่ท้าทายมากขึ้นได้เลย
          </p>
        ) : skillData.accuracy >= 70 ? (
          <p style={{ fontSize: '13px', color: t.textSec, margin: 0 }}>
            ดีมาก ลองเพิ่มเวลาประมาณการอีกนิดเพื่อให้ไม่กดดันตัวเองมากเกินไป
          </p>
        ) : (
          <p style={{ fontSize: '13px', color: t.textSec, margin: 0 }}>
            คุณมักใช้เวลามากกว่าที่คาด ลองตั้งเวลาประมาณการให้มากขึ้น 20-30% เพื่อผลลัพธ์ที่ดีขึ้น
          </p>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, flexShrink: 0 }} />
      <span style={{ color: t.textSec }}>{label}</span>
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
      <span style={{ fontSize: '12px', color: t.textSec }}>{label}</span>
    </div>
  );
}
