import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertTriangle, CheckCircle2, Plus, Bot, CircleCheck, Circle } from 'lucide-react';
import { t } from '../utils/theme';

const urgencyStyle = {
  high:   { bg: t.dangerBg,  border: t.dangerBorder,  badge: t.danger,  label: 'ต้องเตรียม', icon: 'alert' },
  medium: { bg: t.warningBg, border: t.warningBorder, badge: t.warning, label: 'ควรเตรียม',  icon: 'pin'   },
  normal: { bg: t.card,      border: t.border,        badge: t.success, label: 'ปกติ',       icon: 'check' },
};

// ─── Horizontal scrollable week-picker ──────────────────────
function WeekPicker({ currentWeek, maxWeeks, onChange }) {
  const scrollRef = useRef(null);
  const btnRefs   = useRef({});

  // Auto-scroll to the current week button whenever it changes
  useEffect(() => {
    const btn = btnRefs.current[currentWeek];
    const container = scrollRef.current;
    if (!btn || !container) return;

    const btnLeft   = btn.offsetLeft;
    const btnWidth  = btn.offsetWidth;
    const cWidth    = container.offsetWidth;
    container.scrollTo({ left: btnLeft - cWidth / 2 + btnWidth / 2, behavior: 'smooth' });
  }, [currentWeek]);

  return (
    <div style={{
      background: t.accentGrad,
      borderRadius: '16px', padding: '16px', marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600' }}>เลือกสัปดาห์</span>
        <span style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>สัปดาห์ที่ {currentWeek}</span>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex', gap: '6px',
          overflowX: 'auto', paddingBottom: '4px',
          scrollbarWidth: 'none',   // Firefox
          msOverflowStyle: 'none',  // IE/Edge
        }}
      >
        {Array.from({ length: maxWeeks }, (_, i) => i + 1).map(w => {
          const active = w === currentWeek;
          return (
            <button
              key={w}
              ref={el => { btnRefs.current[w] = el; }}
              onClick={() => onChange(w)}
              style={{
                minWidth: '40px', height: '40px', borderRadius: '10px', border: 'none',
                background: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)',
                color: active ? t.accent : '#fff',
                cursor: 'pointer', fontSize: '14px', fontWeight: '700', flexShrink: 0,
                transition: 'background 0.15s',
                outline: active ? `2px solid white` : 'none',
                outlineOffset: '2px',
              }}
            >{w}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────
export default function CoursePlanner() {
  const {
    courses, currentWeek, setCurrentWeek, getWeeklyAnalysis, addTask,
    toggleLesson, isLessonCompleted, getCourseProgress,
  } = useApp();
  const navigate = useNavigate();
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [addingTask, setAddingTask]   = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const analysis  = getWeeklyAnalysis();
  const maxWeeks  = Math.max(...courses.map(c => c.schedule.length || 0), 8);
  const selectedCourse = selectedCourseId ? courses.find(c => c.id === selectedCourseId) : null;

  const getTodayPlusDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const handleAutoAddTask = (courseCode, weekData) => {
    addTask({
      title: `เตรียมตัว: ${weekData.topic}`,
      subject: courseCode,
      priority: weekData.difficulty >= 4 ? 'high' : weekData.difficulty >= 3 ? 'medium' : 'low',
      estimatedTime: weekData.prepHours,
      deadline: getTodayPlusDays(2),
      category: 'homework',
      difficulty: weekData.difficulty,
      notes: `เตรียมตัวสำหรับสัปดาห์ที่ ${currentWeek}: ${weekData.topic}`,
    });
    setAddingTask(courseCode);
    setTimeout(() => setAddingTask(null), 2000);
  };

  const difficultyBar = (val) => (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width: '16px', height: '6px', borderRadius: '3px',
          background: i <= val
            ? (val >= 4 ? t.danger : val >= 3 ? t.warning : t.success)
            : t.border,
        }} />
      ))}
    </div>
  );

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: t.text, margin: 0 }}>Course Planner</h1>
        <button onClick={() => navigate('/add-course')} style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: t.accentBg, border: 'none', borderRadius: '999px',
          padding: '7px 14px', cursor: 'pointer', color: t.accentLight, fontWeight: '700', fontSize: '13px',
        }}>
          <Plus size={14} /> เพิ่มวิชา
        </button>
      </div>
      <p style={{ color: t.textMuted, fontSize: '13px', marginBottom: '20px' }}>
        วิเคราะห์ตารางเรียนและแนะนำการเตรียมตัว
      </p>

      {/* Course tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        <TabBtn active={!selectedCourseId} onClick={() => setSelectedCourseId(null)} color={t.accent} label="ภาพรวม" />
        {courses.map(c => {
          const { percentage } = getCourseProgress(c.id);
          return (
            <TabBtn
              key={c.id}
              active={selectedCourseId === c.id}
              onClick={() => setSelectedCourseId(c.id)}
              color={c.color}
              label={c.code}
              badge={`${percentage}%`}
            />
          );
        })}
      </div>

      {/* ─── Detail view for single course ─── */}
      {selectedCourse ? (
        <CourseDetailView
          course={selectedCourse}
          getCourseProgress={getCourseProgress}
          toggleLesson={toggleLesson}
          isLessonCompleted={isLessonCompleted}
          difficultyBar={difficultyBar}
          currentWeek={currentWeek}
          onBack={() => setSelectedCourseId(null)}
          onAutoAddTask={handleAutoAddTask}
        />
      ) : (
        <>
          {/* Week picker */}
          <WeekPicker
            currentWeek={currentWeek}
            maxWeeks={maxWeeks}
            onChange={setCurrentWeek}
          />

          {/* Weekly analysis cards */}
          {analysis.map(({ course, weekData, recommendation, urgency }) => {
            const style    = urgencyStyle[urgency] || urgencyStyle.normal;
            const isExpanded  = expandedCourse === course.id;
            const justAdded   = addingTask === course.code;
            const { completed, total, percentage } = getCourseProgress(course.id);

            return (
              <div key={course.id} style={{
                background: style.bg, border: `1.5px solid ${style.border}`,
                borderRadius: '14px', marginBottom: '12px', overflow: 'hidden',
              }}>
                {/* Card header — click to expand */}
                <div
                  style={{ padding: '14px', cursor: 'pointer' }}
                  onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          background: course.color, color: '#fff',
                          fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: '700',
                        }}>{course.code}</span>
                        <span style={{
                          background: style.badge + '25', color: style.badge,
                          fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: '600',
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                        }}>
                          {style.icon === 'alert' && <AlertTriangle size={10} />}
                          {style.icon === 'check' && <CheckCircle2 size={10} />}
                          {style.label}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: t.text }}>
                        {weekData ? weekData.topic : 'ไม่มีข้อมูลสัปดาห์นี้'}
                      </p>
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: t.textMuted }}>{course.name}</p>

                      {/* Progress */}
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ fontSize: '11px', color: t.textMuted }}>ความคืบหน้า</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: course.color }}>
                            {completed}/{total} บท ({percentage}%)
                          </span>
                        </div>
                        <div style={{ background: t.border, borderRadius: '999px', height: '6px' }}>
                          <div style={{
                            background: course.color, borderRadius: '999px', height: '6px',
                            width: `${percentage}%`, transition: 'width 0.5s',
                          }} />
                        </div>
                      </div>
                    </div>
                    <span style={{ color: t.textMuted, fontSize: '18px', marginLeft: '8px' }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && weekData && (
                  <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${style.border}` }}>
                    <div style={{ paddingTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: t.textMuted }}>ความยาก:</span>
                        {difficultyBar(weekData.difficulty)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: t.textMuted }}>ควรเตรียมล่วงหน้า:</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: t.text }}>
                          {weekData.prepHours} ชั่วโมง
                        </span>
                      </div>

                      <div style={{
                        background: t.cardLight, borderRadius: '10px', padding: '12px',
                        fontSize: '13px', color: t.textSec, marginBottom: '12px',
                        borderLeft: `4px solid ${style.badge}`,
                        display: 'flex', gap: '8px', alignItems: 'flex-start',
                      }}>
                        <Bot size={14} color={style.badge} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span><strong style={{ color: t.text }}>คำแนะนำ:</strong> {recommendation}</span>
                      </div>

                      <button onClick={() => handleAutoAddTask(course.code, weekData)} style={{
                        width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                        background: justAdded ? t.successBg : t.accentBg,
                        color:      justAdded ? t.success   : t.accentLight,
                        cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      }}>
                        {justAdded
                          ? <><CheckCircle2 size={16} /> เพิ่มงานแล้ว!</>
                          : <><Plus size={16} /> สร้าง Task เตรียมตัวอัตโนมัติ</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Full schedule */}
          <FullSchedule
            courses={courses}
            currentWeek={currentWeek}
            toggleLesson={toggleLesson}
            isLessonCompleted={isLessonCompleted}
            getCourseProgress={getCourseProgress}
            difficultyBar={difficultyBar}
          />
        </>
      )}
    </div>
  );
}

// ─── Tab button helper ───────────────────────────────────────
function TabBtn({ active, onClick, color, label, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 14px', borderRadius: '999px', border: '2px solid',
        borderColor: active ? color : t.border,
        background:  active ? color : t.card,
        color:       active ? '#fff' : t.textSec,
        cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: '6px',
      }}
    >
      {label}
      {badge && (
        <span style={{
          background: active ? 'rgba(255,255,255,0.25)' : t.cardLight,
          borderRadius: '999px', padding: '1px 6px', fontSize: '10px',
        }}>{badge}</span>
      )}
    </button>
  );
}

// ─── Full schedule list (all courses + toggleable lessons) ───
function FullSchedule({ courses, currentWeek, toggleLesson, isLessonCompleted, getCourseProgress, difficultyBar }) {
  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{
        fontSize: '15px', fontWeight: '700', color: t.text, marginBottom: '12px',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <BookOpen size={16} color={t.accent} /> ตารางเรียนทั้งหมด
      </h3>

      {courses.map(course => {
        const { percentage } = getCourseProgress(course.id);
        return (
          <div key={course.id} style={{
            background: t.card, border: `1.5px solid ${t.border}`,
            borderRadius: '14px', padding: '14px', marginBottom: '12px',
          }}>
            {/* Course header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: course.color }} />
                <span style={{ fontWeight: '700', fontSize: '15px', color: t.text }}>{course.code}</span>
                <span style={{ fontSize: '13px', color: t.textMuted }}>{course.name}</span>
              </div>
              <span style={{
                fontSize: '12px', fontWeight: '700', color: course.color,
                background: course.color + '20', padding: '3px 10px', borderRadius: '999px',
              }}>{percentage}%</span>
            </div>

            {/* Overall progress bar */}
            <div style={{ background: t.border, borderRadius: '999px', height: '6px', marginBottom: '12px' }}>
              <div style={{
                background: course.color, borderRadius: '999px', height: '6px',
                width: `${percentage}%`, transition: 'width 0.5s',
              }} />
            </div>

            {/* Week rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {course.schedule.map(week => {
                const done      = isLessonCompleted(course.id, week.week);
                const isCurrent = week.week === currentWeek;
                return (
                  <div key={week.week} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', borderRadius: '8px',
                    background: isCurrent ? t.accentBg : done ? t.successBg : 'transparent',
                    border: isCurrent ? `1.5px solid ${t.accent}` : '1.5px solid transparent',
                  }}>
                    <button
                      onClick={() => toggleLesson(course.id, week.week)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                      title={done ? 'เรียนแล้ว — คลิกเพื่อยกเลิก' : 'คลิกเพื่อทำเครื่องหมายว่าเรียนแล้ว'}
                    >
                      {done
                        ? <CircleCheck size={22} color={t.success} fill={t.successBg} />
                        : <Circle    size={22} color={t.textDim} />}
                    </button>

                    <span style={{
                      minWidth: '24px', textAlign: 'center',
                      fontSize: '12px', fontWeight: '700',
                      color: done ? t.success : isCurrent ? t.accentLight : t.textMuted,
                    }}>{week.week}</span>

                    <span style={{
                      flex: 1, fontSize: '13px',
                      color:           done ? t.success : t.text,
                      fontWeight:      isCurrent && !done ? '700' : '400',
                      textDecoration:  done ? 'line-through' : 'none',
                    }}>{week.topic}</span>

                    {difficultyBar(week.difficulty)}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Single-course detail view ───────────────────────────────
function CourseDetailView({ course, getCourseProgress, toggleLesson, isLessonCompleted, difficultyBar, currentWeek, onBack, onAutoAddTask }) {
  const { completed: doneCount, total, percentage } = getCourseProgress(course.id);
  const completedLessons   = course.schedule.filter(w =>  isLessonCompleted(course.id, w.week));
  const incompleteLessons  = course.schedule.filter(w => !isLessonCompleted(course.id, w.week));

  return (
    <div>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        color: t.accentLight, fontSize: '13px', fontWeight: '600',
        display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px',
      }}>
        ← กลับสู่ภาพรวม
      </button>

      {/* Course header card */}
      <div style={{
        background: `linear-gradient(135deg, ${course.color}, ${course.color}cc)`,
        borderRadius: '16px', padding: '20px', marginBottom: '16px', color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px' }}>{course.code}</h2>
            <p style={{ fontSize: '14px', opacity: 0.85, margin: 0 }}>{course.name}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>{percentage}%</p>
            <p style={{ fontSize: '12px', opacity: 0.85, margin: '4px 0 0' }}>{doneCount}/{total} บทเรียน</p>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '999px', height: '8px', marginTop: '14px' }}>
          <div style={{
            background: '#fff', borderRadius: '999px', height: '8px',
            width: `${percentage}%`, transition: 'width 0.5s',
          }} />
        </div>
      </div>

      {/* Incomplete lessons */}
      {incompleteLessons.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel icon={<Circle size={16} color={t.textDim} />} text={`ยังไม่ได้เรียน (${incompleteLessons.length})`} color={t.text} />
          {incompleteLessons.map(week => (
            <LessonRow
              key={week.week}
              week={week} course={course} done={false}
              isCurrent={week.week === currentWeek}
              toggleLesson={toggleLesson}
              difficultyBar={difficultyBar}
              onAutoAddTask={onAutoAddTask}
            />
          ))}
        </div>
      )}

      {/* Completed lessons */}
      {completedLessons.length > 0 && (
        <div>
          <SectionLabel icon={<CircleCheck size={16} color={t.success} />} text={`เรียนแล้ว (${completedLessons.length})`} color={t.success} />
          {completedLessons.map(week => (
            <LessonRow
              key={week.week}
              week={week} course={course} done={true}
              isCurrent={week.week === currentWeek}
              toggleLesson={toggleLesson}
              difficultyBar={difficultyBar}
            />
          ))}
        </div>
      )}

      {incompleteLessons.length === 0 && completedLessons.length > 0 && (
        <div style={{
          textAlign: 'center', padding: '32px', color: t.success,
          background: t.successBg, borderRadius: '14px', marginTop: '8px',
        }}>
          <CheckCircle2 size={40} style={{ marginBottom: '8px' }} />
          <p style={{ fontSize: '16px', fontWeight: '700' }}>เรียนครบทุกบทแล้ว! 🎉</p>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ icon, text, color }) {
  return (
    <h3 style={{
      fontSize: '14px', fontWeight: '700', color, marginBottom: '10px',
      display: 'flex', alignItems: 'center', gap: '6px',
    }}>
      {icon} {text}
    </h3>
  );
}

function LessonRow({ week, course, done, isCurrent, toggleLesson, difficultyBar, onAutoAddTask }) {
  return (
    <div style={{
      background: done ? t.successBg : t.card,
      border: `1.5px solid ${isCurrent ? t.accent : done ? t.successBorder : t.border}`,
      borderRadius: '12px', padding: '12px', marginBottom: '8px',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <button
        onClick={() => toggleLesson(course.id, week.week)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
        title={done ? 'เรียนแล้ว — คลิกเพื่อยกเลิก' : 'คลิกเพื่อทำเครื่องหมายว่าเรียนแล้ว'}
      >
        {done
          ? <CircleCheck size={24} color={t.success} fill={t.successBg} />
          : <Circle    size={24} color={t.textDim} />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: isCurrent ? t.accentBg : t.cardLight,
            color: isCurrent ? t.accentLight : t.textMuted,
            fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px',
          }}>สัปดาห์ {week.week}</span>
          {isCurrent && <span style={{ fontSize: '10px', color: t.accentLight, fontWeight: '600' }}>← สัปดาห์นี้</span>}
        </div>
        <p style={{
          margin: '4px 0 0', fontSize: '14px', fontWeight: '600',
          color: done ? t.success : t.text,
          textDecoration: done ? 'line-through' : 'none',
        }}>{week.topic}</p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
          {difficultyBar(week.difficulty)}
          <span style={{ fontSize: '11px', color: t.textMuted }}>เตรียม {week.prepHours} ชม.</span>
        </div>
      </div>

      {!done && onAutoAddTask && (
        <button
          onClick={() => onAutoAddTask(course.code, week)}
          style={{
            padding: '6px 10px', borderRadius: '8px',
            border: `1.5px solid ${t.border}`,
            background: t.accentBg, color: t.accentLight,
            cursor: 'pointer', fontSize: '11px', fontWeight: '600', flexShrink: 0,
          }}
          title="สร้าง Task เตรียมตัวอัตโนมัติ"
        >+ Task</button>
      )}
    </div>
  );
}
