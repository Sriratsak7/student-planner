import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, CheckCircle2, Clock } from 'lucide-react';
import { t } from '../utils/theme';

export default function TimerPage() {
  const {
    tasks, timerState, getTimerElapsed,
    timerStart, timerPause, timerResume, timerReset, timerFinish,
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const navTaskId = location.state?.taskId;

  const [localTaskId, setLocalTaskId] = useState(navTaskId || timerState.taskId || null);

  useEffect(() => {
    if (timerState.taskId && timerState.running) {
      setLocalTaskId(timerState.taskId);
    }
  }, [timerState.taskId, timerState.running]);

  useEffect(() => {
    if (navTaskId && !timerState.running) {
      setLocalTaskId(navTaskId);
    }
  }, [navTaskId]);

  const selectedTaskId = localTaskId;
  const selectedTask = tasks.find(tsk => tsk.id === selectedTaskId);

  const [, setTick] = useState(0);
  useEffect(() => {
    if (!timerState.running) return;
    const interval = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(interval);
  }, [timerState.running]);

  const pendingTasks = tasks.filter(tsk => tsk.status === 'pending');
  const elapsed = getTimerElapsed();

  const displayElapsed = timerState.taskId === selectedTaskId ? elapsed : 0;

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const estimatedSecs = (selectedTask?.estimatedTime || 0) * 3600;
  const progress = estimatedSecs > 0 ? Math.min((displayElapsed / estimatedSecs) * 100, 100) : 0;
  const overTime = displayElapsed > estimatedSecs && estimatedSecs > 0;

  const isTimerForSelected = timerState.taskId === selectedTaskId;
  const isRunning = isTimerForSelected && timerState.running;
  const isPaused = isTimerForSelected && !timerState.running && timerState.elapsedSeconds > 0;

  const handleStart = () => {
    if (!selectedTaskId) return;
    if (isPaused) {
      timerResume();
    } else if (!isTimerForSelected || timerState.elapsedSeconds === 0) {
      timerStart(selectedTaskId);
    } else {
      timerResume();
    }
  };

  const handlePause = () => { timerPause(); };

  const [finishedData, setFinishedData] = useState(null);

  const handleFinish = () => {
    const result = timerFinish();
    setFinishedData(result);
  };

  const handleReset = () => {
    timerReset();
    setLocalTaskId(null);
  };

  if (finishedData) {
    const actual = finishedData.hours;
    const task = tasks.find(tsk => tsk.id === finishedData.taskId);
    const estimated = task?.estimatedTime || 1;
    const ratio = actual / estimated;
    const accuracy = Math.min((estimated / actual) * 100, 150);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '20px', textAlign: 'center' }}>
        <CheckCircle2 size={72} color={t.success} style={{ marginBottom: '16px' }} />
        <h2 style={{ color: t.text, fontSize: '24px', fontWeight: '800', margin: '0 0 8px' }}>ทำงานเสร็จแล้ว! 🎉</h2>
        <p style={{ color: t.textMuted, fontSize: '15px', margin: '0 0 24px' }}>{task?.title}</p>

        <div style={{ background: t.accentBg, borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '300px', marginBottom: '20px' }}>
          <Row label="เวลาที่ใช้จริง" value={`${actual.toFixed(2)} ชั่วโมง`} />
          <Row label="เวลาที่ประมาณไว้" value={`${estimated} ชั่วโมง`} />
          <Row label="ความแม่นยำ" value={`${Math.round(accuracy)}%`} color={accuracy >= 90 ? t.success : accuracy >= 70 ? t.warning : t.danger} />
          <div style={{ marginTop: '12px', padding: '10px', background: t.card, borderRadius: '10px', fontSize: '14px', color: t.text }}>
            {ratio <= 0.8 ? '🏆 ทำงานเร็วกว่าที่คาด! คุณถนัดงานนี้มากเลย' :
             ratio <= 1.1 ? '👍 ทำได้ตรงเวลามาก เยี่ยมเลย!' :
             ratio <= 1.5 ? '💪 ใช้เวลาเกินนิดหน่อย ครั้งหน้าตั้งค่าเวลาเพิ่มขึ้นได้' :
             '📚 งานนี้ยากกว่าที่คิด ลองเพิ่มเวลาประมาณการครั้งหน้า'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { setFinishedData(null); handleReset(); }} style={btnStyle(t.accentBg, t.accentLight)}>
            จับเวลางานใหม่
          </button>
          <button onClick={() => navigate('/')} style={btnStyle(t.accent, '#fff')}>
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: t.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={22} color={t.accent} /> จับเวลาทำงาน
      </h1>

      {/* Selected task name */}
      {selectedTask ? (
        <div style={{
          background: t.accentBg, borderRadius: '14px', padding: '16px',
          marginBottom: '16px', textAlign: 'center', border: `1.5px solid ${t.borderLight}`
        }}>
          <p style={{ fontSize: '11px', color: t.accentLight, margin: '0 0 4px', fontWeight: '600' }}>
            {isRunning ? 'กำลังจับเวลา' : isPaused ? 'หยุดชั่วขณะ' : 'งานที่เลือก'}
          </p>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: t.text, margin: 0 }}>
            {selectedTask.title}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: t.textMuted }}>{selectedTask.subject}</span>
            <span style={{ fontSize: '12px', color: t.textMuted }}>·</span>
            <span style={{ fontSize: '12px', color: t.textMuted }}>ประมาณ {selectedTask.estimatedTime} ชม.</span>
            <span style={{ fontSize: '12px', color: t.textMuted }}>·</span>
            <span style={{ fontSize: '12px', color: t.textMuted }}>ส่ง {selectedTask.deadline}</span>
          </div>
          {selectedTask.loggedTime > 0 && (
            <p style={{ fontSize: '11px', color: t.accentLight, marginTop: '6px', margin: '6px 0 0' }}>
              บันทึกเวลาไว้แล้ว {selectedTask.loggedTime.toFixed(1)} ชม. (จะรวมเมื่อทำเสร็จ)
            </p>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '20px', color: t.textMuted,
          background: t.cardLight, borderRadius: '14px', marginBottom: '16px',
          border: `1.5px dashed ${t.border}`
        }}>
          เลือกงานด้านล่างเพื่อเริ่มจับเวลา
        </div>
      )}

      {/* Timer Display */}
      <div style={{
        background: overTime
          ? `linear-gradient(135deg, ${t.danger}, #dc2626)`
          : t.accentGrad,
        borderRadius: '20px', padding: '32px 20px', textAlign: 'center', marginBottom: '20px'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: '0 0 8px', fontWeight: '600' }}>
          {overTime ? '⚠️ เกินเวลาที่ประมาณไว้แล้ว!' : selectedTask ? `ประมาณการ: ${selectedTask.estimatedTime} ชม.` : 'เลือกงานก่อน'}
        </p>
        <div style={{
          fontSize: '56px', fontWeight: '800', color: '#fff',
          fontVariantNumeric: 'tabular-nums', letterSpacing: '3px'
        }}>
          {formatTime(displayElapsed)}
        </div>

        {estimatedSecs > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '999px', height: '8px' }}>
              <div style={{
                background: '#fff', borderRadius: '999px', height: '8px',
                width: `${progress}%`, transition: 'width 0.5s'
              }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', marginTop: '6px', fontWeight: '600' }}>
              {Math.round(progress)}% ของเวลาที่ประมาณไว้
            </p>
          </div>
        )}
      </div>

      {/* Control buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={!selectedTaskId}
            style={{
              ...btnLargeStyle,
              background: selectedTaskId ? t.success : t.disabled,
              color: '#fff',
              cursor: selectedTaskId ? 'pointer' : 'not-allowed',
              boxShadow: selectedTaskId ? '0 4px 15px rgba(34,197,94,0.3)' : 'none'
            }}
          >
            <Play size={24} fill="#fff" />
            {isPaused ? 'ทำต่อ' : 'เริ่ม'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            style={{ ...btnLargeStyle, background: t.warning, color: '#fff', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}
          >
            <Pause size={24} fill="#fff" /> หยุดชั่วขณะ
          </button>
        )}
        <button
          onClick={handleFinish}
          disabled={displayElapsed === 0 && !(selectedTask?.loggedTime > 0)}
          style={{
            ...btnLargeStyle,
            background: displayElapsed > 0 || selectedTask?.loggedTime > 0 ? t.accent : t.disabled,
            color: '#fff',
            cursor: displayElapsed > 0 || selectedTask?.loggedTime > 0 ? 'pointer' : 'not-allowed',
            boxShadow: displayElapsed > 0 ? '0 4px 15px rgba(59,130,246,0.3)' : 'none'
          }}
        >
          <CheckCircle2 size={24} /> ทำเสร็จ
        </button>
        <button
          onClick={handleReset}
          disabled={!isTimerForSelected && displayElapsed === 0}
          style={{
            ...btnLargeStyle,
            background: (isTimerForSelected && (timerState.elapsedSeconds > 0 || timerState.running)) ? t.cardLight : t.disabled,
            color: (isTimerForSelected && (timerState.elapsedSeconds > 0 || timerState.running)) ? t.textSec : t.disabledText,
            cursor: (isTimerForSelected && (timerState.elapsedSeconds > 0 || timerState.running)) ? 'pointer' : 'not-allowed'
          }}
        >
          <RotateCcw size={24} /> รีเซ็ต
        </button>
      </div>

      {/* Task selection list */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: '700', color: t.accentLight, display: 'block', marginBottom: '10px' }}>
          เลือกงานที่จะทำ
        </label>
        {pendingTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: t.textMuted, background: t.cardLight, borderRadius: '12px' }}>
            ไม่มีงานค้างอยู่ 🎉
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingTasks.map(tsk => {
              const isSelected = selectedTaskId === tsk.id;
              const isTimerForThis = timerState.taskId === tsk.id;
              return (
                <button
                  key={tsk.id}
                  onClick={() => !isRunning && setLocalTaskId(tsk.id)}
                  style={{
                    padding: '12px', borderRadius: '12px', border: '2px solid',
                    borderColor: isSelected ? t.accent : t.border,
                    background: isSelected ? t.accentBg : t.card,
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    opacity: isRunning && !isSelected ? 0.5 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: t.text }}>{tsk.title}</span>
                      {isTimerForThis && timerState.running && (
                        <span style={{ marginLeft: '8px', fontSize: '11px', color: t.success, fontWeight: '600' }}>
                          ● กำลังจับเวลา
                        </span>
                      )}
                    </div>
                    {tsk.loggedTime > 0 && (
                      <span style={{ fontSize: '10px', color: t.accentLight, fontWeight: '600' }}>
                        {tsk.loggedTime.toFixed(1)} ชม.
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: t.textMuted, marginTop: '2px' }}>
                    {tsk.subject} · {tsk.estimatedTime} ชม. · ส่ง {tsk.deadline}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${t.border}` }}>
      <span style={{ fontSize: '13px', color: t.textMuted }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: '700', color: color || t.text }}>{value}</span>
    </div>
  );
}

const btnLargeStyle = {
  padding: '14px 16px', borderRadius: '14px', border: 'none',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
  fontSize: '12px', fontWeight: '700', fontFamily: 'inherit',
  minWidth: '80px'
};

const btnStyle = (bg, color) => ({
  padding: '12px 20px', borderRadius: '12px', border: 'none',
  background: bg, color, cursor: 'pointer', fontWeight: '700', fontSize: '14px'
});
