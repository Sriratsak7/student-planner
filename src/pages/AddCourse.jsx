import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, CheckCircle2, BookOpen } from 'lucide-react';
import { t } from '../utils/theme';

const colorOptions = [
  '#3b82f6', '#ef4444', '#22c55e', '#a855f7',
  '#f59e0b', '#06b6d4', '#ec4899', '#6366f1',
  '#14b8a6', '#eab308',
];

const defaultWeeks = Array.from({ length: 8 }, (_, i) => ({
  week: i + 1, topic: '', difficulty: 3, prepHours: 2
}));

export default function AddCourse() {
  const { addCourse, courses } = useApp();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    code: '', name: '', color: colorOptions[0],
    schedule: defaultWeeks.map(w => ({ ...w }))
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const updateWeek = (weekIndex, field, value) => {
    setForm(prev => ({
      ...prev,
      schedule: prev.schedule.map((w, i) =>
        i === weekIndex ? { ...w, [field]: value } : w
      )
    }));
  };

  const addWeek = () => {
    setForm(prev => ({
      ...prev,
      schedule: [...prev.schedule, {
        week: prev.schedule.length + 1,
        topic: '', difficulty: 3, prepHours: 2
      }]
    }));
  };

  const removeWeek = (idx) => {
    setForm(prev => ({
      ...prev,
      schedule: prev.schedule
        .filter((_, i) => i !== idx)
        .map((w, i) => ({ ...w, week: i + 1 }))
    }));
  };

  const handleSubmit = () => {
    if (!form.code.trim()) return alert('กรุณากรอกรหัสวิชา');
    if (!form.name.trim()) return alert('กรุณากรอกชื่อวิชา');
    if (courses.find(c => c.code === form.code.trim().toUpperCase())) {
      return alert('รหัสวิชานี้มีอยู่แล้ว');
    }
    addCourse({
      ...form,
      code: form.code.trim().toUpperCase(),
      schedule: form.schedule.filter(w => w.topic.trim())
    });
    setSuccess(true);
    setTimeout(() => navigate('/planner'), 1500);
  };

  if (success) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '16px' }}>
      <CheckCircle2 size={64} color={t.success} />
      <p style={{ fontSize: '20px', fontWeight: '700', color: t.success }}>เพิ่มวิชาสำเร็จ!</p>
    </div>
  );

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: t.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOpen size={22} color={t.accent} /> เพิ่มวิชาใหม่
      </h1>

      <Section label="รหัสวิชา (เช่น IT132, ENG101)">
        <input
          value={form.code}
          onChange={e => set('code', e.target.value.toUpperCase())}
          placeholder="IT132"
          maxLength={10}
          style={inputStyle}
        />
      </Section>

      <Section label="ชื่อวิชา">
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Information Technology"
          style={inputStyle}
        />
      </Section>

      <Section label="สีประจำวิชา">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {colorOptions.map(c => (
            <button key={c} onClick={() => set('color', c)} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: c, border: form.color === c ? `3px solid ${t.text}` : '3px solid transparent',
              cursor: 'pointer', boxShadow: form.color === c ? '0 0 0 2px rgba(255,255,255,0.3) inset' : 'none'
            }} />
          ))}
        </div>
        <div style={{
          marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: form.color + '20', padding: '6px 14px', borderRadius: '999px'
        }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: form.color }} />
          <span style={{ fontSize: '13px', fontWeight: '700', color: form.color }}>
            {form.code || 'CODE'} — {form.name || 'ชื่อวิชา'}
          </span>
        </div>
      </Section>

      <Section label={`ตารางเนื้อหา (${form.schedule.length} สัปดาห์)`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {form.schedule.map((week, idx) => (
            <div key={idx} style={{
              background: t.cardLight, border: `1.5px solid ${t.border}`,
              borderRadius: '12px', padding: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{
                  background: t.accentBg, color: t.accentLight,
                  fontSize: '12px', fontWeight: '700',
                  padding: '3px 10px', borderRadius: '999px'
                }}>สัปดาห์ {week.week}</span>
                <button onClick={() => removeWeek(idx)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: t.textDim
                }}>
                  <Trash2 size={14} />
                </button>
              </div>

              <input
                value={week.topic}
                onChange={e => updateWeek(idx, 'topic', e.target.value)}
                placeholder="หัวข้อที่เรียน..."
                style={{ ...inputStyle, marginBottom: '10px', fontSize: '13px', padding: '9px 12px' }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', color: t.textMuted, display: 'block', marginBottom: '4px' }}>ความยาก</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(d => (
                      <button key={d} onClick={() => updateWeek(idx, 'difficulty', d)} style={{
                        flex: 1, padding: '5px 0', borderRadius: '6px', border: 'none',
                        background: d <= week.difficulty
                          ? (week.difficulty >= 4 ? t.danger : week.difficulty >= 3 ? t.warning : t.success)
                          : t.border,
                        cursor: 'pointer', height: '24px'
                      }} />
                    ))}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', color: t.textMuted, display: 'block', marginBottom: '4px' }}>เตรียม (ชม.)</label>
                  <input
                    type="number" min="0" max="20" step="0.5"
                    value={week.prepHours}
                    onChange={e => updateWeek(idx, 'prepHours', parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%', padding: '6px 8px', borderRadius: '8px',
                      border: `1.5px solid ${t.inputBorder}`, fontSize: '13px',
                      fontFamily: 'inherit', color: t.text, textAlign: 'center',
                      boxSizing: 'border-box', background: t.inputBg
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addWeek} style={{
            padding: '12px', borderRadius: '12px', border: `2px dashed ${t.accent}`,
            background: 'transparent', color: t.accentLight, cursor: 'pointer',
            fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}>
            <Plus size={16} /> เพิ่มสัปดาห์
          </button>
        </div>
      </Section>

      <button onClick={handleSubmit} style={{
        width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
        background: t.accentGrad,
        color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(59,130,246,0.35)'
      }}>
        บันทึกวิชา
      </button>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <label style={{ fontSize: '13px', fontWeight: '700', color: t.accentLight, display: 'block', marginBottom: '8px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px', borderRadius: '10px',
  border: `1.5px solid ${t.inputBorder}`, fontSize: '14px',
  background: t.inputBg, outline: 'none', boxSizing: 'border-box',
  color: t.text, fontFamily: 'inherit'
};
