import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CheckCircle2 } from 'lucide-react';

const priorityOptions = [
  { value: 'high', label: '🔴 สูง', bg: '#ffebee', color: '#e53935' },
  { value: 'medium', label: '🟡 กลาง', bg: '#fff8e1', color: '#f57c00' },
  { value: 'low', label: '🟢 ต่ำ', bg: '#e8f5e9', color: '#388e3c' },
];

const timeOptions = [
  { value: 0.5, label: '30 นาที' },
  { value: 1, label: '1 ชม.' },
  { value: 1.5, label: '1.5 ชม.' },
  { value: 2, label: '2 ชม.' },
  { value: 3, label: '3 ชม.' },
  { value: 4, label: '4 ชม.' },
  { value: 5, label: '5+ ชม.' },
];

const categoryOptions = [
  { value: 'homework', label: ' การบ้าน' },
  { value: 'report', label: ' รายงาน' },
  { value: 'presentation', label: ' Presentation' },
  { value: 'exam', label: ' สอบ' },
  { value: 'project', label: ' Project' },
  { value: 'other', label: ' อื่นๆ' },
];

const difficultyOptions = [
  { value: 1, label: '⭐ ง่ายมาก' },
  { value: 2, label: '⭐⭐ ง่าย' },
  { value: 3, label: '⭐⭐⭐ ปานกลาง' },
  { value: 4, label: '⭐⭐⭐⭐ ยาก' },
  { value: 5, label: '⭐⭐⭐⭐⭐ ยากมาก' },
];

export default function AddTask() {
  const { addTask, courses } = useApp();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: '', subject: courses[0]?.code || '',
    priority: 'medium', estimatedTime: 1,
    deadline: defaultDate, category: 'homework',
    difficulty: 3, notes: ''
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    if (!form.title.trim()) return alert('กรุณากรอกชื่องาน');
    addTask(form);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); navigate('/priority'); }, 1500);
  };

  if (success) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '16px' }}>
      <CheckCircle2 size={64} color="#388e3c" />
      <p style={{ fontSize: '20px', fontWeight: '700', color: '#388e3c' }}>เพิ่มงานสำเร็จ!</p>
    </div>
  );

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#3d2c1e', marginBottom: '20px' }}>
        ➕ เพิ่มงานใหม่
      </h1>

      {/* Title */}
      <Section label="ชื่องาน">
        <input value={form.title} onChange={e => set('title', e.target.value)}
          placeholder="เช่น รายงานวิชา IT132..."
          style={inputStyle} />
      </Section>

      {/* Subject */}
      <Section label="วิชา">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {courses.map(c => (
            <Chip key={c.code} active={form.subject === c.code}
              onClick={() => set('subject', c.code)}
              color={c.color} label={c.code} />
          ))}
        </div>
      </Section>

      {/* Deadline */}
      <Section label="วันกำหนดส่ง">
        <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
          style={inputStyle} />
      </Section>

      {/* Priority */}
      <Section label="ระดับความสำคัญ">
        <div style={{ display: 'flex', gap: '8px' }}>
          {priorityOptions.map(opt => (
            <button key={opt.value} onClick={() => set('priority', opt.value)} style={{
              flex: 1, padding: '10px 4px', borderRadius: '10px', border: '2px solid',
              borderColor: form.priority === opt.value ? opt.color : 'transparent',
              background: form.priority === opt.value ? opt.bg : '#f5f5f5',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: opt.color
            }}>{opt.label}</button>
          ))}
        </div>
      </Section>

      {/* Difficulty (Scale) */}
      <Section label="ระดับความยากของงาน (Scale)">
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {difficultyOptions.map(opt => (
            <button key={opt.value} onClick={() => set('difficulty', opt.value)} style={{
              padding: '8px 10px', borderRadius: '10px', border: '2px solid',
              borderColor: form.difficulty === opt.value ? '#8B6914' : '#e0e0e0',
              background: form.difficulty === opt.value ? '#f5ede0' : '#fafafa',
              cursor: 'pointer', fontSize: '12px', color: '#3d2c1e', fontWeight: form.difficulty === opt.value ? '700' : '400'
            }}>{opt.label}</button>
          ))}
        </div>
      </Section>

      {/* Estimated Time */}
      <Section label="เวลาที่คาดว่าจะใช้">
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {timeOptions.map(opt => (
            <button key={opt.value} onClick={() => set('estimatedTime', opt.value)} style={{
              padding: '8px 12px', borderRadius: '10px', border: '2px solid',
              borderColor: form.estimatedTime === opt.value ? '#8B6914' : '#e0e0e0',
              background: form.estimatedTime === opt.value ? '#f5ede0' : '#fafafa',
              cursor: 'pointer', fontSize: '13px', color: '#3d2c1e',
              fontWeight: form.estimatedTime === opt.value ? '700' : '400'
            }}>{opt.label}</button>
          ))}
        </div>
      </Section>

      {/* Category */}
      <Section label="ประเภทงาน">
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categoryOptions.map(opt => (
            <button key={opt.value} onClick={() => set('category', opt.value)} style={{
              padding: '8px 12px', borderRadius: '10px', border: '2px solid',
              borderColor: form.category === opt.value ? '#8B6914' : '#e0e0e0',
              background: form.category === opt.value ? '#f5ede0' : '#fafafa',
              cursor: 'pointer', fontSize: '13px', color: '#3d2c1e',
              fontWeight: form.category === opt.value ? '700' : '400'
            }}>{opt.label}</button>
          ))}
        </div>
      </Section>

      {/* Notes */}
      <Section label="หมายเหตุ (ถ้ามี)">
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="รายละเอียดเพิ่มเติม..."
          rows={3} style={{ ...inputStyle, resize: 'none' }} />
      </Section>

      <button onClick={handleSubmit} style={{
        width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
        background: 'linear-gradient(135deg, #8B6914, #c4922a)',
        color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(139,105,20,0.4)'
      }}>
        + เพิ่มงาน
      </button>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ fontSize: '13px', fontWeight: '700', color: '#8B6914', display: 'block', marginBottom: '8px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Chip({ active, onClick, color, label }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 14px', borderRadius: '999px', border: '2px solid',
      borderColor: active ? color : '#e0e0e0',
      background: active ? color : '#fafafa',
      color: active ? '#fff' : '#555',
      cursor: 'pointer', fontSize: '13px', fontWeight: '600'
    }}>{label}</button>
  );
}

const inputStyle = {
  width: '100%', padding: '12px', borderRadius: '10px',
  border: '1.5px solid #e0d5c5', fontSize: '14px',
  background: '#fafafa', outline: 'none', boxSizing: 'border-box',
  color: '#3d2c1e', fontFamily: 'inherit'
};
