import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, CheckCircle2, BookOpen } from 'lucide-react';

const colorOptions = [
  '#8B6914', '#e53935', '#1565C0', '#2E7D32', '#6A1B9A',
  '#00838F', '#E65100', '#37474F', '#AD1457', '#558B2F',
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
      <CheckCircle2 size={64} color="#388e3c" />
      <p style={{ fontSize: '20px', fontWeight: '700', color: '#388e3c' }}>เพิ่มวิชาสำเร็จ!</p>
    </div>
  );

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#3d2c1e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOpen size={22} color="#8B6914" /> เพิ่มวิชาใหม่
      </h1>

      {/* รหัสวิชา */}
      <Section label="รหัสวิชา (เช่น IT132, ENG101)">
        <input
          value={form.code}
          onChange={e => set('code', e.target.value.toUpperCase())}
          placeholder="IT132"
          maxLength={10}
          style={inputStyle}
        />
      </Section>

      {/* ชื่อวิชา */}
      <Section label="ชื่อวิชา">
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Information Technology"
          style={inputStyle}
        />
      </Section>

      {/* สีวิชา */}
      <Section label="สีประจำวิชา">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {colorOptions.map(c => (
            <button key={c} onClick={() => set('color', c)} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: c, border: form.color === c ? '3px solid #3d2c1e' : '3px solid transparent',
              cursor: 'pointer', boxShadow: form.color === c ? '0 0 0 2px #fff inset' : 'none'
            }} />
          ))}
        </div>
        {/* Preview */}
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

      {/* ตารางเนื้อหา */}
      <Section label={`ตารางเนื้อหา (${form.schedule.length} สัปดาห์)`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {form.schedule.map((week, idx) => (
            <div key={idx} style={{
              background: '#fff', border: '1.5px solid #e8e0d5',
              borderRadius: '12px', padding: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{
                  background: '#f5ede0', color: '#8B6914',
                  fontSize: '12px', fontWeight: '700',
                  padding: '3px 10px', borderRadius: '999px'
                }}>สัปดาห์ {week.week}</span>
                <button onClick={() => removeWeek(idx)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#ccc'
                }}>
                  <Trash2 size={14} />
                </button>
              </div>

              {/* หัวข้อ */}
              <input
                value={week.topic}
                onChange={e => updateWeek(idx, 'topic', e.target.value)}
                placeholder="หัวข้อที่เรียน..."
                style={{ ...inputStyle, marginBottom: '10px', fontSize: '13px', padding: '9px 12px' }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                {/* ความยาก */}
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>ความยาก</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(d => (
                      <button key={d} onClick={() => updateWeek(idx, 'difficulty', d)} style={{
                        flex: 1, padding: '5px 0', borderRadius: '6px', border: 'none',
                        background: d <= week.difficulty
                          ? (week.difficulty >= 4 ? '#e53935' : week.difficulty >= 3 ? '#f57c00' : '#388e3c')
                          : '#f0f0f0',
                        cursor: 'pointer', height: '24px'
                      }} />
                    ))}
                  </div>
                </div>

                {/* เวลาเตรียม */}
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>เตรียม (ชม.)</label>
                  <input
                    type="number" min="0" max="20" step="0.5"
                    value={week.prepHours}
                    onChange={e => updateWeek(idx, 'prepHours', parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%', padding: '6px 8px', borderRadius: '8px',
                      border: '1.5px solid #e0d5c5', fontSize: '13px',
                      fontFamily: 'inherit', color: '#3d2c1e', textAlign: 'center',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* ปุ่มเพิ่มสัปดาห์ */}
          <button onClick={addWeek} style={{
            padding: '12px', borderRadius: '12px', border: '2px dashed #c4922a',
            background: 'transparent', color: '#8B6914', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}>
            <Plus size={16} /> เพิ่มสัปดาห์
          </button>
        </div>
      </Section>

      <button onClick={handleSubmit} style={{
        width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
        background: 'linear-gradient(135deg, #8B6914, #c4922a)',
        color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(139,105,20,0.4)'
      }}>
        บันทึกวิชา
      </button>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <label style={{ fontSize: '13px', fontWeight: '700', color: '#8B6914', display: 'block', marginBottom: '8px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px', borderRadius: '10px',
  border: '1.5px solid #e0d5c5', fontSize: '14px',
  background: '#fafafa', outline: 'none', boxSizing: 'border-box',
  color: '#3d2c1e', fontFamily: 'inherit'
};
