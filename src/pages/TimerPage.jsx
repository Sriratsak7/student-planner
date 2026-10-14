import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Play, Pause, Square, CheckCircle2 } from 'lucide-react';

export default function TimerPage() {
  const { tasks, completeTask } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedTaskId, setSelectedTaskId] = useState(location.state?.taskId || null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);
  const startRef = useRef(null);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const start = () => {
    if (!selectedTaskId) return alert('เลือกงานก่อนนะ!');
    startRef.current = Date.now() - elapsed * 1000;
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    setRunning(true);
  };

  const pause = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    if (elapsed > 0 && selectedTask) {
      const hours = elapsed / 3600;
      completeTask(selectedTaskId, parseFloat(hours.toFixed(2)));
      setFinished(true);
    }
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setElapsed(0);
    setFinished(false);
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const estimatedSecs = (selectedTask?.estimatedTime || 0) * 3600;
  const progress = estimatedSecs > 0 ? Math.min((elapsed / estimatedSecs) * 100, 100) : 0;
  const overTime = elapsed > estimatedSecs && estimatedSecs > 0;

  if (finished) {
    const actual = elapsed / 3600;
    const estimated = selectedTask?.estimatedTime || 1;
    const ratio = actual / estimated;
    const accuracy = Math.min((estimated / actual) * 100, 150);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '20px', textAlign: 'center' }}>
        <CheckCircle2 size={72} color="#388e3c" style={{ marginBottom: '16px' }} />
        <h2 style={{ color: '#3d2c1e', fontSize: '24px', fontWeight: '800', margin: '0 0 8px' }}>ทำงานเสร็จแล้ว! 🎉</h2>
        <p style={{ color: '#666', fontSize: '15px', margin: '0 0 24px' }}>{selectedTask?.title}</p>

        <div style={{ background: '#f5ede0', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '300px', marginBottom: '20px' }}>
          <Row label="เวลาที่ใช้จริง" value={`${actual.toFixed(2)} ชั่วโมง`} />
          <Row label="เวลาที่ประมาณไว้" value={`${estimated} ชั่วโมง`} />
          <Row label="ความแม่นยำ" value={`${Math.round(accuracy)}%`} color={accuracy >= 90 ? '#388e3c' : accuracy >= 70 ? '#f57c00' : '#e53935'} />
          <div style={{ marginTop: '12px', padding: '10px', background: '#fff', borderRadius: '10px', fontSize: '14px', color: '#3d2c1e' }}>
            {ratio <= 0.8 ? '🏆 ทำงานเร็วกว่าที่คาด! คุณถนัดงานนี้มากเลย' :
             ratio <= 1.1 ? '👍 ทำได้ตรงเวลามาก เยี่ยมเลย!' :
             ratio <= 1.5 ? '💪 ใช้เวลาเกินนิดหน่อย ครั้งหน้าตั้งค่าเวลาเพิ่มขึ้นได้' :
             '📚 งานนี้ยากกว่าที่คิด ลองเพิ่มเวลาประมาณการครั้งหน้า'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { reset(); setSelectedTaskId(null); }} style={btnStyle('#f5ede0', '#8B6914')}>
            จับเวลางานใหม่
          </button>
          <button onClick={() => navigate('/')} style={btnStyle('#8B6914', '#fff')}>
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#3d2c1e', marginBottom: '20px' }}>
        ⏱️ จับเวลาทำงาน
      </h1>

      {/* Select Task */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '13px', fontWeight: '700', color: '#8B6914', display: 'block', marginBottom: '8px' }}>
          เลือกงานที่จะทำ
        </label>
        {pendingTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#aaa', background: '#fafafa', borderRadius: '12px' }}>
            ไม่มีงานค้างอยู่ 🎉
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingTasks.map(t => (
              <button key={t.id} onClick={() => !running && setSelectedTaskId(t.id)} style={{
                padding: '12px', borderRadius: '12px', border: '2px solid',
                borderColor: selectedTaskId === t.id ? '#8B6914' : '#e0e0e0',
                background: selectedTaskId === t.id ? '#f5ede0' : '#fff',
                cursor: running ? 'not-allowed' : 'pointer', textAlign: 'left'
              }}>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#3d2c1e' }}>{t.title}</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                  {t.subject} · {t.estimatedTime} ชม. · กำหนดส่ง {t.deadline}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div style={{
        background: overTime ? 'linear-gradient(135deg, #e53935, #c62828)' : 'linear-gradient(135deg, #8B6914, #c4922a)',
        borderRadius: '20px', padding: '32px 20px', textAlign: 'center', marginBottom: '20px'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '0 0 8px' }}>
          {overTime ? '⚠️ เกินเวลาที่ประมาณไว้แล้ว!' : selectedTask ? `ประมาณการ: ${selectedTask.estimatedTime} ชม.` : 'เลือกงานก่อน'}
        </p>
        <div style={{ fontSize: '52px', fontWeight: '800', color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '2px' }}>
          {formatTime(elapsed)}
        </div>

        {/* Progress bar */}
        {estimatedSecs > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '999px', height: '6px' }}>
              <div style={{
                background: '#fff', borderRadius: '999px', height: '6px',
                width: `${progress}%`, transition: 'width 0.5s'
              }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '6px' }}>
              {Math.round(progress)}% ของเวลาที่ประมาณไว้
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {!running ? (
          <button onClick={start} style={{
            ...circleBtn, background: '#8B6914', color: '#fff', fontSize: '16px'
          }}>
            <Play size={28} fill="#fff" />
          </button>
        ) : (
          <button onClick={pause} style={{ ...circleBtn, background: '#f57c00', color: '#fff' }}>
            <Pause size={28} fill="#fff" />
          </button>
        )}
        <button onClick={stop} disabled={elapsed === 0} style={{
          ...circleBtn,
          background: elapsed > 0 ? '#388e3c' : '#eee',
          color: elapsed > 0 ? '#fff' : '#bbb'
        }}>
          <Square size={24} fill={elapsed > 0 ? '#fff' : '#bbb'} />
        </button>
        <button onClick={reset} style={{ ...circleBtn, background: '#f5f5f5', color: '#888' }}>
          ↺
        </button>
      </div>

      {running && selectedTask && (
        <p style={{ textAlign: 'center', color: '#8B6914', fontSize: '13px', marginTop: '16px', fontWeight: '600' }}>
          🔥 กำลังทำ: {selectedTask.title}
        </p>
      )}
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0e8d8' }}>
      <span style={{ fontSize: '13px', color: '#888' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: '700', color: color || '#3d2c1e' }}>{value}</span>
    </div>
  );
}

const circleBtn = {
  width: '64px', height: '64px', borderRadius: '50%', border: 'none',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
};

const btnStyle = (bg, color) => ({
  padding: '12px 20px', borderRadius: '12px', border: 'none',
  background: bg, color, cursor: 'pointer', fontWeight: '700', fontSize: '14px'
});
