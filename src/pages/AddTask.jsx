import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CheckCircle2, FileText, Calendar, Star, Clock, Tag, StickyNote, Plus } from 'lucide-react';
import { t } from '../utils/theme';

const priorityOptions = [
  { value: 'high', label: 'สูง', emoji: '🔴', bg: t.dangerBg, color: t.danger },
  { value: 'medium', label: 'กลาง', emoji: '🟡', bg: t.warningBg, color: t.warning },
  { value: 'low', label: 'ต่ำ', emoji: '🟢', bg: t.successBg, color: t.success },
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
  { value: 'homework', label: 'การบ้าน' },
  { value: 'report', label: 'รายงาน' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'exam', label: 'สอบ' },
  { value: 'project', label: 'Project' },
  { value: 'other', label: 'อื่นๆ' },
];

const difficultyOptions = [
  { value: 1, label: 'ง่ายมาก', stars: 1 },
  { value: 2, label: 'ง่าย', stars: 2 },
  { value: 3, label: 'ปานกลาง', stars: 3 },
  { value: 4, label: 'ยาก', stars: 4 },
  { value: 5, label: 'ยากมาก', stars: 5 },
];

const quickDates = [
  { label: 'วันนี้', days: 0 },
  { label: 'พรุ่งนี้', days: 1 },
  { label: '3 วัน', days: 3 },
  { label: 'สัปดาห์หน้า', days: 7 },
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

  const setQuickDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    set('deadline', d.toISOString().split('T')[0]);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return alert('กรุณากรอกชื่องาน');
    addTask(form);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); navigate('/priority'); }, 1500);
  };

  if (success) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '16px' }}>
      <CheckCircle2 size={64} color={t.success} />
      <p style={{ fontSize: '20px', fontWeight: '700', color: t.success }}>เพิ่มงานสำเร็จ!</p>
    </div>
  );

  return (
    <div style={{ padding: '20px 16px 120px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: t.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Plus size={22} color={t.accent} /> เพิ่มงานใหม่
      </h1>

      {/* ข้อมูลงาน */}
      <FormCard icon={<FileText size={16} />} title="ข้อมูลงาน">
        <Field label="ชื่องาน">
          <input value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="เช่น รายงานวิชา IT132..."
            style={inputStyle} />
        </Field>
        <Field label="วิชา">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {courses.map(c => (
              <Chip key={c.code} active={form.subject === c.code}
                onClick={() => set('subject', c.code)}
                color={c.color} label={c.code} />
            ))}
          </div>
        </Field>
      </FormCard>

      {/* กำหนดเวลา */}
      <FormCard icon={<Calendar size={16} />} title="กำหนดเวลา">
        <Field label="วันกำหนดส่ง">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            {quickDates.map(qd => {
              const d = new Date();
              d.setDate(d.getDate() + qd.days);
              const dateStr = d.toISOString().split('T')[0];
              const isActive = form.deadline === dateStr;
              return (
                <button key={qd.label} onClick={() => setQuickDate(qd.days)} style={{
                  flex: 1, padding: '8px 4px', borderRadius: '10px', border: '2px solid',
                  borderColor: isActive ? t.accent : t.border,
                  background: isActive ? t.accentBg : t.cardLight,
                  cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                  color: isActive ? t.accentLight : t.textSec
                }}>{qd.label}</button>
              );
            })}
          </div>
          <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
            style={inputStyle} />
        </Field>

        <Field label="เวลาที่คาดว่าจะใช้" icon={<Clock size={14} />}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {timeOptions.map(opt => (
              <button key={opt.value} onClick={() => set('estimatedTime', opt.value)} style={{
                padding: '8px 12px', borderRadius: '10px', border: '2px solid',
                borderColor: form.estimatedTime === opt.value ? t.accent : t.border,
                background: form.estimatedTime === opt.value ? t.accentBg : t.cardLight,
                cursor: 'pointer', fontSize: '13px', color: t.text,
                fontWeight: form.estimatedTime === opt.value ? '700' : '400'
              }}>{opt.label}</button>
            ))}
          </div>
        </Field>
      </FormCard>

      {/* ความสำคัญและความยาก */}
      <FormCard icon={<Star size={16} />} title="ความสำคัญและความยาก">
        <Field label="ระดับความสำคัญ">
          <div style={{ display: 'flex', gap: '8px' }}>
            {priorityOptions.map(opt => (
              <button key={opt.value} onClick={() => set('priority', opt.value)} style={{
                flex: 1, padding: '10px 4px', borderRadius: '10px', border: '2px solid',
                borderColor: form.priority === opt.value ? opt.color : 'transparent',
                background: form.priority === opt.value ? opt.bg : t.cardLight,
                cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: opt.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
              }}>
                <span style={{ fontSize: '16px' }}>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="ระดับความยาก">
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {difficultyOptions.map(opt => (
              <button key={opt.value} onClick={() => set('difficulty', opt.value)} style={{
                padding: '8px 10px', borderRadius: '10px', border: '2px solid',
                borderColor: form.difficulty === opt.value ? t.accent : t.border,
                background: form.difficulty === opt.value ? t.accentBg : t.cardLight,
                cursor: 'pointer', fontSize: '12px', color: t.text,
                fontWeight: form.difficulty === opt.value ? '700' : '400',
                display: 'flex', alignItems: 'center', gap: '3px'
              }}>
                <span style={{ display: 'flex', gap: '1px' }}>
                  {[...Array(opt.stars)].map((_, i) => (
                    <Star key={i} size={10} fill={form.difficulty === opt.value ? t.accent : t.textDim} color={form.difficulty === opt.value ? t.accent : t.textDim} />
                  ))}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="ประเภทงาน" icon={<Tag size={14} />}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categoryOptions.map(opt => (
              <button key={opt.value} onClick={() => set('category', opt.value)} style={{
                padding: '8px 12px', borderRadius: '10px', border: '2px solid',
                borderColor: form.category === opt.value ? t.accent : t.border,
                background: form.category === opt.value ? t.accentBg : t.cardLight,
                cursor: 'pointer', fontSize: '13px', color: t.text,
                fontWeight: form.category === opt.value ? '700' : '400'
              }}>{opt.label}</button>
            ))}
          </div>
        </Field>
      </FormCard>

      {/* รายละเอียดเพิ่มเติม */}
      <FormCard icon={<StickyNote size={16} />} title="รายละเอียดเพิ่มเติม">
        <Field label="หมายเหตุ (ถ้ามี)">
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับงาน..."
            rows={3} style={{ ...inputStyle, resize: 'none' }} />
        </Field>
      </FormCard>

      {/* Submit */}
      <button onClick={handleSubmit} style={{
        width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
        background: t.accentGrad,
        color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(59,130,246,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        position: 'sticky', bottom: '20px'
      }}>
        <Plus size={20} /> เพิ่มงาน
      </button>
    </div>
  );
}

function FormCard({ icon, title, children }) {
  return (
    <div style={{
      background: t.card, border: `1.5px solid ${t.border}`, borderRadius: '16px',
      padding: '16px', marginBottom: '14px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '10px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px', background: t.accentBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: t.text, margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '12px', fontWeight: '700', color: t.accentLight, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
        {icon}{label}
      </label>
      {children}
    </div>
  );
}

function Chip({ active, onClick, color, label }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 14px', borderRadius: '999px', border: '2px solid',
      borderColor: active ? color : t.border,
      background: active ? color : t.cardLight,
      color: active ? '#fff' : t.textSec,
      cursor: 'pointer', fontSize: '13px', fontWeight: '600'
    }}>{label}</button>
  );
}

const inputStyle = {
  width: '100%', padding: '12px', borderRadius: '10px',
  border: `1.5px solid ${t.inputBorder}`, fontSize: '14px',
  background: t.inputBg, outline: 'none', boxSizing: 'border-box',
  color: t.text, fontFamily: 'inherit'
};
