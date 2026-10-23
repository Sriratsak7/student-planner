import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  CheckCircle2, Clock, AlertTriangle, TrendingUp, BookOpen,
  Zap, Star, Flame, Play, Calendar, Bot, ChevronDown,
  Target, Lightbulb,
} from 'lucide-react';
import { t } from '../utils/theme';

function calcStreak(tasks) {
  const done = tasks.filter(x => x.status === 'completed' && x.completedDate);
  if (!done.length) return 0;
  const dates = [...new Set(done.map(x => x.completedDate))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yest  = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dates[0] !== today && dates[0] !== yest) return 0;
  let s = 1;
  for (let i = 1; i < dates.length; i++) {
    if ((new Date(dates[i-1]) - new Date(dates[i])) / 86400000 === 1) s++;
    else break;
  }
  return s;
}

function daysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000); }

const pColor = { high: t.danger, medium: t.warning, low: t.success };
const pLabel = { high: 'สูง', medium: 'กลาง', low: 'ต่ำ' };

export default function Dashboard() {
  const { tasks, getSkillData, getWeeklyAnalysis, courses, getTaskAnalysis } = useApp();
  const navigate = useNavigate();

  const pending   = tasks.filter(x => x.status === 'pending');
  const completed = tasks.filter(x => x.status === 'completed');
  const overdue   = pending.filter(x => new Date(x.deadline) < new Date());
  const skillData = getSkillData();
  const urgent    = getWeeklyAnalysis().filter(w => w.urgency === 'high');
  const streak    = calcStreak(tasks);

  const todayTasks = [...pending]
    .sort((a, b) => {
      const dd = new Date(a.deadline) - new Date(b.deadline);
      const po = { high: 0, medium: 1, low: 2 };
      return dd !== 0 ? dd : po[a.priority] - po[b.priority];
    })
    .slice(0, 5);

  const today   = new Date();
  const dayTH   = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์'];
  const monthTH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  return (
    <div style={{ padding: '20px 16px 100px' }} className="mesh-bg">

      {/* ── Date + greeting ── */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>
          วัน{dayTH[today.getDay()]}ที่ {today.getDate()} {monthTH[today.getMonth()]} {today.getFullYear() + 543}
        </p>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: t.text, margin: '4px 0 0', letterSpacing: '-0.3px' }}>
          สวัสดี! พร้อมทำงานแล้วหรือยัง? 👋
        </h1>
      </div>

      {/* ── 4 stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        <StatCard value={tasks.length}     label="ทั้งหมด"   color={t.accentLight} bg={t.accentBg}   />
        <StatCard value={pending.length}   label="ค้างอยู่"  color={t.warning}    bg={t.warningBg}  />
        <StatCard value={completed.length} label="เสร็จแล้ว" color={t.success}    bg={t.successBg}  />
        <StatCard value={overdue.length}   label="เกินกำหนด" color={t.danger}     bg={t.dangerBg}   />
      </div>

      {/* ── AI Assistant shortcut ── */}
      <button
        onClick={() => navigate('/analysis')}
        style={{
          width: '100%', padding: '14px 16px',
          borderRadius: '16px', border: `1px solid ${t.borderLight}`,
          background: `linear-gradient(135deg, ${t.accentBg} 0%, #14103a 100%)`,
          display: 'flex', alignItems: 'center', gap: '12px',
          cursor: 'pointer', marginBottom: '20px',
          boxShadow: t.glowBlue,
        }}
      >
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: t.accentGrad2, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bot size={20} color="#fff" />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: t.text }}>
            ถาม AI Assistant
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: t.textMuted }}>
            วิเคราะห์งาน · วางแผน · ให้คำแนะนำ
          </p>
        </div>
        <div style={{
          padding: '6px 12px', borderRadius: '8px',
          background: 'rgba(59,130,246,0.2)', color: t.accentLight,
          fontSize: '12px', fontWeight: '600',
        }}>เปิด →</div>
      </button>

      {/* ── งานที่ควรทำวันนี้ ── */}
      <div style={{ marginBottom: '20px' }}>
        <SectionTitle icon={<Zap size={16} fill={t.danger} color={t.danger} />} title="งานที่ควรทำวันนี้" />

        {todayTasks.length === 0 ? (
          <EmptyCard icon={<CheckCircle2 size={32} color={t.success} />} text="ไม่มีงานค้างอยู่ 🎉" sub="เพิ่มงานใหม่เพื่อเริ่มวางแผน" />
        ) : todayTasks.map((task, i) => (
          <TaskRowCard key={task.id} task={task} rank={i} navigate={navigate} />
        ))}
      </div>

      {/* ── Streak + Skill ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {/* Streak */}
        <div style={{
          borderRadius: '16px', padding: '16px', position: 'relative', overflow: 'hidden',
          background: streak > 0
            ? 'linear-gradient(135deg, #92400e, #f59e0b)'
            : t.cardLight,
          border: `1px solid ${streak > 0 ? '#f59e0b40' : t.border}`,
          boxShadow: streak > 0 ? '0 4px 20px rgba(245,158,11,0.25)' : 'none',
        }}>
          <Flame size={20} color={streak > 0 ? '#fff' : t.textDim} style={{ marginBottom: '6px' }} />
          <p style={{ margin: 0, fontSize: '11px', color: streak > 0 ? 'rgba(255,255,255,0.75)' : t.textMuted }}>Study Streak</p>
          <p style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: '800', color: streak > 0 ? '#fff' : t.textDim }}>
            {streak} <span style={{ fontSize: '14px', fontWeight: '500' }}>วัน</span>
          </p>
        </div>

        {/* Skill accuracy */}
        <div style={{
          borderRadius: '16px', padding: '16px',
          background: t.accentGrad2, boxShadow: t.glowBlue,
          position: 'relative', overflow: 'hidden',
        }}>
          <TrendingUp size={20} color="rgba(255,255,255,0.8)" style={{ marginBottom: '6px' }} />
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>ความแม่นยำ</p>
          <p style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: '800', color: '#fff' }}>
            {skillData.accuracy} <span style={{ fontSize: '14px', fontWeight: '500' }}>%</span>
          </p>
        </div>
      </div>

      {/* ── Urgent this week ── */}
      {urgent.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <SectionTitle icon={<Calendar size={16} color={t.danger} />} title="ต้องเตรียมสัปดาห์นี้!" />
          {urgent.map(({ course, weekData, recommendation }) => (
            <div key={course.id} style={{
              background: t.dangerBg, border: `1px solid ${t.dangerBorder}`,
              borderRadius: '14px', padding: '12px', marginBottom: '8px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <span style={{
                    background: course.color, color: '#fff',
                    fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: '600',
                  }}>{course.code}</span>
                  <p style={{ margin: '6px 0 2px', fontWeight: '700', fontSize: '14px', color: t.text }}>{weekData?.topic}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: t.danger }}>{recommendation}</p>
                </div>
                <div style={{ display: 'flex', gap: '2px', marginLeft: '8px' }}>
                  {[...Array(weekData?.difficulty || 0)].map((_, i) => (
                    <Star key={i} size={11} fill={t.warning} color={t.warning} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Quick links ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <QuickLink icon={<BookOpen size={18} color={t.accentLight} />} title="ดูลำดับงาน" sub={`${pending.length} งานค้างอยู่`} onClick={() => navigate('/priority')} />
        <QuickLink icon={<Calendar size={18} color={t.accentLight} />} title="ตารางเรียน" sub={`${courses.length} วิชา`} onClick={() => navigate('/planner')} />
      </div>

      {/* ── AI Insights ── */}
      <AssistantPanel getTaskAnalysis={getTaskAnalysis} />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function SectionTitle({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
      {icon}
      <h3 style={{ fontSize: '15px', fontWeight: '700', color: t.text, margin: 0 }}>{title}</h3>
    </div>
  );
}

function EmptyCard({ icon, text, sub }) {
  return (
    <div style={{
      textAlign: 'center', padding: '28px 20px',
      background: t.card, borderRadius: '16px', border: `1px solid ${t.border}`,
    }}>
      <div style={{ marginBottom: '8px' }}>{icon}</div>
      <p style={{ fontSize: '15px', fontWeight: '600', color: t.textSec, margin: 0 }}>{text}</p>
      {sub && <p style={{ fontSize: '12px', color: t.textMuted, margin: '4px 0 0' }}>{sub}</p>}
    </div>
  );
}

function StatCard({ value, label, bg, color }) {
  return (
    <div style={{
      background: bg, borderRadius: '14px', padding: '12px 8px',
      textAlign: 'center', border: `1px solid ${color}25`,
    }}>
      <div style={{ fontSize: '26px', fontWeight: '800', color }}>{value}</div>
      <div style={{ fontSize: '10px', color: t.textMuted, marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function TaskRowCard({ task, rank, navigate }) {
  const days = daysUntil(task.deadline);
  const isOverdue = days < 0;
  const isUrgent  = days <= 1;
  const cColor    = isOverdue ? t.danger : isUrgent ? t.danger : days <= 3 ? t.warning : t.success;
  const cBg       = isOverdue ? t.dangerBg : isUrgent ? t.dangerBg : days <= 3 ? t.warningBg : t.successBg;
  const dayTxt    = isOverdue ? `เกิน ${Math.abs(days)} วัน` : days === 0 ? 'วันนี้!' : `${days} วัน`;
  const courseColor = '#3b82f6';

  return (
    <div style={{
      background: isOverdue ? t.dangerBg : t.card,
      border: `1px solid ${isOverdue ? t.dangerBorder : isUrgent ? t.warningBorder : t.border}`,
      borderRadius: '14px', padding: '12px 14px', marginBottom: '8px',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      {/* Rank badge */}
      <div style={{
        minWidth: '28px', height: '28px', borderRadius: '8px',
        background: rank === 0 ? t.danger : rank === 1 ? t.warning : t.cardLight,
        color: rank < 2 ? '#fff' : t.textSec,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '800', fontSize: '13px', flexShrink: 0,
        boxShadow: rank === 0 ? t.glowRed : rank === 1 ? '0 2px 8px rgba(251,191,36,0.3)' : 'none',
      }}>{rank + 1}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontWeight: '600', fontSize: '14px', color: t.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{task.title}</p>
        <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
          <span style={{
            fontSize: '11px', padding: '2px 7px', borderRadius: '6px',
            background: t.accentBg, color: t.accentLight, fontWeight: '600',
          }}>{task.subject}</span>
          <span style={{
            fontSize: '11px', padding: '2px 7px', borderRadius: '6px',
            background: pColor[task.priority] + '20', color: pColor[task.priority], fontWeight: '600',
          }}>{pLabel[task.priority]}</span>
          <span style={{ fontSize: '11px', color: t.textMuted }}>{task.estimatedTime < 1 ? `${task.estimatedTime * 60 | 0}นาที` : `${task.estimatedTime}ชม.`}</span>
        </div>
      </div>

      {/* Days badge */}
      <div style={{
        background: cBg, borderRadius: '10px', padding: '5px 9px',
        textAlign: 'center', flexShrink: 0, minWidth: '52px',
        border: `1px solid ${cColor}30`,
      }}>
        <div style={{ fontSize: '13px', fontWeight: '800', color: cColor, lineHeight: 1 }}>{dayTxt}</div>
        <div style={{ fontSize: '9px', color: cColor, opacity: 0.7, marginTop: '2px' }}>
          {isOverdue ? 'เกินกำหนด' : 'เหลือ'}
        </div>
      </div>

      {/* Play button */}
      <button
        onClick={() => navigate('/timer', { state: { taskId: task.id } })}
        style={{
          width: '34px', height: '34px', borderRadius: '10px', border: 'none',
          background: t.accentBg, color: t.accentLight, cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = t.accent}
        onMouseLeave={e => e.currentTarget.style.background = t.accentBg}
      >
        <Play size={15} fill={t.accentLight} color={t.accentLight} />
      </button>
    </div>
  );
}

function QuickLink({ icon, title, sub, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '14px', borderRadius: '14px', border: `1px solid ${t.border}`,
      background: t.card, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
      textAlign: 'left', transition: 'border-color 0.15s, background 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.background = t.cardHover; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.card; }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px', background: t.accentBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: t.text }}>{title}</p>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: t.textMuted }}>{sub}</p>
      </div>
    </button>
  );
}

function AssistantPanel({ getTaskAnalysis }) {
  const [open, setOpen] = useState(true);
  const insights = getTaskAnalysis().filter(i => i.severity === 'high' || i.severity === 'medium');
  if (!insights.length) return null;

  const sevColor = { high: t.danger,  medium: t.warning, low: t.accentLight };
  const sevBg    = { high: t.dangerBg, medium: t.warningBg, low: t.accentBg };
  const sevBorder= { high: t.dangerBorder, medium: t.warningBorder, low: t.borderLight };
  const icons    = { workload: Clock, warning: AlertTriangle, danger: AlertTriangle, recommend: Target, tip: Lightbulb, motivate: Flame };

  return (
    <div style={{
      marginTop: '20px',
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: '16px', overflow: 'hidden',
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: t.accentGrad2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={16} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: t.text }}>AI Insights</p>
            <p style={{ margin: '1px 0 0', fontSize: '11px', color: t.textMuted }}>{insights.length} ข้อแนะนำจากการวิเคราะห์</p>
          </div>
        </div>
        <ChevronDown size={18} color={t.textMuted} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {open && (
        <div style={{ padding: '0 12px 12px' }}>
          {insights.slice(0, 4).map((ins, i) => {
            const Icon  = icons[ins.type] || Lightbulb;
            const color = sevColor[ins.severity];
            return (
              <div key={i} style={{
                background: sevBg[ins.severity],
                border: `1px solid ${sevBorder[ins.severity]}`,
                borderRadius: '10px', padding: '10px 12px', marginBottom: '6px',
                display: 'flex', gap: '10px', alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '7px',
                  background: color + '20',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={14} color={color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: t.text }}>{ins.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: t.textSec, lineHeight: 1.4 }}>{ins.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
