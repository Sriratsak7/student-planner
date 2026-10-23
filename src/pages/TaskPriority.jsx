import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Play, CheckCircle2, Star, Timer, X, Clock, AlertTriangle, Flame, Zap, Lightbulb } from 'lucide-react';
import { t } from '../utils/theme';

const priorityColor = { high: t.danger, medium: t.warning, low: t.success };
const priorityLabel = { high: 'สูง', medium: 'กลาง', low: 'ต่ำ' };

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / 86400000);
}

function getPriorityReason(task, index) {
  const days = daysUntil(task.deadline);
  const reasons = [];

  if (days < 0) {
    reasons.push({ icon: AlertTriangle, text: `เกินกำหนด ${Math.abs(days)} วันแล้ว`, color: t.danger });
  } else if (days === 0) {
    reasons.push({ icon: Zap, text: 'ถึงกำหนดส่งวันนี้!', color: t.danger });
  } else if (days <= 2) {
    reasons.push({ icon: Clock, text: `ใกล้ถึงกำหนด เหลือ ${days} วัน`, color: t.warning });
  }

  if (task.priority === 'high') {
    reasons.push({ icon: Star, text: 'ความสำคัญสูง', color: t.danger });
  }

  if (task.estimatedTime >= 3) {
    reasons.push({ icon: Timer, text: `ใช้เวลานาน ${task.estimatedTime} ชม.`, color: t.warning });
  }

  if (task.difficulty >= 4) {
    reasons.push({ icon: Flame, text: `งานยากระดับ ${task.difficulty}`, color: t.danger });
  }

  if (reasons.length === 0 && index === 0) {
    reasons.push({ icon: Lightbulb, text: 'เริ่มจากงานนี้ก่อน', color: t.accent });
  }

  return reasons;
}

function CompleteModal({ task, onConfirm, onCancel }) {
  const [hours, setHours] = useState(task.estimatedTime);
  const timeOptions = [0.25, 0.5, 1, 1.5, 2, 3, 4, 5];

  return (
    <>
      <div onClick={onCancel} style={{
        position: 'fixed', inset: 0, background: t.overlay,
        zIndex: 200, backdropFilter: 'blur(2px)'
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px',
        background: t.card, borderRadius: '24px 24px 0 0',
        padding: '24px 20px 40px', zIndex: 201,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.4)'
      }}>
        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: t.border, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: t.text, margin: '0 0 4px' }}>
              บันทึกเวลาที่ใช้จริง
            </h3>
            <p style={{ fontSize: '13px', color: t.textMuted, margin: 0 }}>{task.title}</p>
          </div>
          <button onClick={onCancel} style={{
            background: t.cardLight, border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={16} color={t.textSec} />
          </button>
        </div>

        <div style={{
          background: t.accentBg, borderRadius: '10px', padding: '10px 14px',
          display: 'flex', justifyContent: 'space-between', marginBottom: '16px'
        }}>
          <span style={{ fontSize: '13px', color: t.accentLight }}>เวลาที่ประมาณไว้</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: t.accentLight }}>
            {task.estimatedTime} ชั่วโมง
          </span>
        </div>

        <p style={{ fontSize: '13px', fontWeight: '700', color: t.text, marginBottom: '10px' }}>
          ใช้เวลาจริงกี่ชั่วโมง?
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {timeOptions.map(tm => (
            <button key={tm} onClick={() => setHours(tm)} style={{
              padding: '8px 14px', borderRadius: '10px', border: '2px solid',
              borderColor: hours === tm ? t.accent : t.border,
              background: hours === tm ? t.accentBg : t.cardLight,
              color: hours === tm ? t.accentLight : t.textSec,
              cursor: 'pointer', fontSize: '13px', fontWeight: hours === tm ? '700' : '400'
            }}>
              {tm < 1 ? `${tm * 60} นาที` : `${tm} ชม.`}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Clock size={16} color={t.accent} />
          <span style={{ fontSize: '13px', color: t.textMuted }}>ระบุเอง:</span>
          <input
            type="number" min="0.1" max="24" step="0.1"
            value={hours}
            onChange={e => setHours(parseFloat(e.target.value) || 0)}
            style={{
              width: '80px', padding: '8px 10px', borderRadius: '8px',
              border: `1.5px solid ${t.inputBorder}`, fontSize: '14px',
              fontFamily: 'inherit', textAlign: 'center', color: t.text,
              background: t.inputBg
            }}
          />
          <span style={{ fontSize: '13px', color: t.textMuted }}>ชั่วโมง</span>
        </div>

        {hours > 0 && (
          <div style={{
            background: hours <= task.estimatedTime ? t.successBg : t.warningBg,
            borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
            fontSize: '13px', color: hours <= task.estimatedTime ? t.success : t.warning
          }}>
            {hours <= task.estimatedTime * 0.9
              ? 'ทำได้เร็วกว่าที่คาดมาก! ยอดเยี่ยม'
              : hours <= task.estimatedTime
              ? 'ทำได้ตามเวลาที่คาดไว้ ดีมาก'
              : hours <= task.estimatedTime * 1.3
              ? 'ใช้เวลาเกินนิดหน่อย ไม่เป็นไร'
              : 'ใช้เวลาเกินกว่าที่คาด ครั้งหน้าลองตั้งเวลาให้มากขึ้น'}
          </div>
        )}

        <button
          onClick={() => hours > 0 && onConfirm(hours)}
          disabled={hours <= 0}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
            background: hours > 0 ? `linear-gradient(135deg, ${t.success}, #4ade80)` : t.disabled,
            color: '#fff', fontSize: '15px', fontWeight: '700',
            cursor: hours > 0 ? 'pointer' : 'not-allowed',
            boxShadow: hours > 0 ? '0 4px 12px rgba(34,197,94,0.3)' : 'none'
          }}>
          บันทึกและทำเครื่องหมายเสร็จแล้ว
        </button>
      </div>
    </>
  );
}

function DeleteModal({ task, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{
        position: 'fixed', inset: 0, background: t.overlay,
        zIndex: 200, backdropFilter: 'blur(2px)'
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px',
        background: t.card, borderRadius: '24px 24px 0 0',
        padding: '24px 20px 40px', zIndex: 201
      }}>
        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: t.border, margin: '0 auto 20px' }} />
        <h3 style={{ fontSize: '17px', fontWeight: '800', color: t.text, margin: '0 0 8px' }}>ลบงานนี้?</h3>
        <p style={{ fontSize: '14px', color: t.textMuted, margin: '0 0 24px' }}>"{task.title}" จะถูกลบออกถาวร</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '13px', borderRadius: '12px', border: `2px solid ${t.border}`,
            background: t.card, color: t.textSec, cursor: 'pointer', fontWeight: '600', fontSize: '14px'
          }}>ยกเลิก</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '13px', borderRadius: '12px', border: 'none',
            background: t.danger, color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '14px'
          }}>ลบเลย</button>
        </div>
      </div>
    </>
  );
}

export default function TaskPriority() {
  const { tasks, deleteTask, completeTask, courses } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('pending');
  const [completeModal, setCompleteModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const filtered = tasks
    .filter(tsk => filter === 'all' ? true : tsk.status === filter)
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      const urgencyA = (new Date(a.deadline) - new Date()) / 3600000 / (a.estimatedTime || 1);
      const urgencyB = (new Date(b.deadline) - new Date()) / 3600000 / (b.estimatedTime || 1);
      return urgencyA - urgencyB;
    });

  const getCourseColor = (code) => courses.find(c => c.code === code)?.color || t.accent;

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: t.text, marginBottom: '4px' }}>
        ลำดับความสำคัญ
      </h1>
      <p style={{ color: t.textMuted, fontSize: '13px', marginBottom: '16px' }}>
        เรียงตามความเร่งด่วนและวันกำหนดส่งอัตโนมัติ
      </p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[['pending', 'งานค้าง'], ['completed', 'เสร็จแล้ว'], ['all', 'ทั้งหมด']].map(([val, label]) => {
          const count = val === 'all' ? tasks.length : val === 'pending' ? tasks.filter(tsk => tsk.status === 'pending').length : tasks.filter(tsk => tsk.status === 'completed').length;
          return (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: '8px 14px', borderRadius: '999px', border: '2px solid',
              borderColor: filter === val ? t.accent : t.border,
              background: filter === val ? t.accent : t.card,
              color: filter === val ? '#fff' : t.textSec,
              cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              {label}
              <span style={{
                background: filter === val ? 'rgba(255,255,255,0.25)' : t.cardLight,
                borderRadius: '999px', padding: '1px 7px', fontSize: '11px'
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: t.textDim }}>
          <CheckCircle2 size={48} style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '16px' }}>ไม่มีงานในรายการนี้</p>
        </div>
      ) : filtered.map((task, i) => {
        const days = daysUntil(task.deadline);
        const isOverdue = days < 0 && task.status === 'pending';
        const isUrgent = days <= 1 && task.status === 'pending';
        const reasons = task.status === 'pending' ? getPriorityReason(task, i) : [];

        return (
          <div key={task.id} style={{
            background: task.status === 'completed' ? t.cardLight : t.card,
            border: `1.5px solid ${isOverdue ? t.dangerBorder : isUrgent ? t.warningBorder : t.border}`,
            borderRadius: '14px', padding: '14px', marginBottom: '10px',
            opacity: task.status === 'completed' ? 0.6 : 1
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              {task.status === 'pending' && (
                <div style={{
                  minWidth: '30px', height: '30px', borderRadius: '50%',
                  background: i === 0 ? t.danger : i === 1 ? t.warning : i === 2 ? t.accent : t.cardLight,
                  color: i < 3 ? '#fff' : t.accentLight,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '14px', flexShrink: 0
                }}>{i + 1}</div>
              )}
              {task.status === 'completed' && (
                <CheckCircle2 size={26} color={t.success} style={{ flexShrink: 0, marginTop: '2px' }} />
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <p style={{
                    margin: 0, fontWeight: '700', fontSize: '15px', color: t.text,
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%'
                  }}>{task.title}</p>
                  <span style={{
                    background: priorityColor[task.priority] + '25',
                    color: priorityColor[task.priority],
                    fontSize: '11px', padding: '3px 8px', borderRadius: '999px', fontWeight: '700', flexShrink: 0
                  }}>{priorityLabel[task.priority]}</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Tag color={getCourseColor(task.subject)} text={task.subject} />
                  <Tag color={t.textMuted} text={`กำหนดส่ง ${task.deadline}`} icon={<Clock size={10} />} />
                  <Tag color={t.accentLight} text={`${task.estimatedTime} ชม.`} icon={<Timer size={10} />} />
                  {task.loggedTime > 0 && (
                    <Tag color={t.accentLight} text={`บันทึกแล้ว ${task.loggedTime.toFixed(1)} ชม.`} icon={<Clock size={10} />} />
                  )}
                  {task.actualTime && (
                    <Tag color={t.success} text={`ใช้จริง ${task.actualTime.toFixed(1)} ชม.`} icon={<CheckCircle2 size={10} />} />
                  )}
                  <div style={{ display: 'flex', gap: '1px' }}>
                    {[...Array(task.difficulty || 3)].map((_, idx) => (
                      <Star key={idx} size={10} fill={t.warning} color={t.warning} />
                    ))}
                  </div>
                </div>

                {reasons.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {reasons.map((reason, ri) => {
                      const Icon = reason.icon;
                      return (
                        <span key={ri} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: reason.color + '20', color: reason.color,
                          fontSize: '11px', padding: '3px 8px', borderRadius: '8px', fontWeight: '600'
                        }}>
                          <Icon size={11} /> {reason.text}
                        </span>
                      );
                    })}
                  </div>
                )}

                {task.status === 'pending' && (
                  <div style={{
                    marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: isOverdue ? t.dangerBg : isUrgent ? t.dangerBg : days <= 3 ? t.warningBg : t.successBg,
                    borderRadius: '8px', padding: '4px 10px',
                  }}>
                    <span style={{
                      fontSize: '13px', fontWeight: '700',
                      color: isOverdue ? t.danger : isUrgent ? t.danger : days <= 3 ? t.warning : t.success
                    }}>
                      {isOverdue ? `เกิน ${Math.abs(days)} วัน` : days === 0 ? 'วันนี้!' : `เหลือ ${days} วัน`}
                    </span>
                  </div>
                )}

                {task.notes && (
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: t.textMuted }}>{task.notes}</p>
                )}
              </div>
            </div>

            {task.status === 'pending' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: `1px solid ${t.border}` }}>
                <button onClick={() => navigate('/timer', { state: { taskId: task.id } })} style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  background: t.accent, color: '#fff', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.25)'
                }}>
                  <Play size={15} fill="#fff" /> เริ่มทำ
                </button>
                <button onClick={() => setCompleteModal(task)} style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: `2px solid ${t.success}`,
                  background: t.successBg, color: t.success, cursor: 'pointer',
                  fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}>
                  <CheckCircle2 size={15} /> ทำเสร็จแล้ว
                </button>
                <button onClick={() => setDeleteModal(task)} style={{
                  padding: '10px 12px', borderRadius: '10px', border: `2px solid ${t.dangerBorder}`,
                  background: t.dangerBg, color: t.danger, cursor: 'pointer',
                  display: 'flex', alignItems: 'center'
                }}>
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {completeModal && (
        <CompleteModal
          task={completeModal}
          onConfirm={(hours) => { completeTask(completeModal.id, hours); setCompleteModal(null); }}
          onCancel={() => setCompleteModal(null)}
        />
      )}
      {deleteModal && (
        <DeleteModal
          task={deleteModal}
          onConfirm={() => { deleteTask(deleteModal.id); setDeleteModal(null); }}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
}

function Tag({ color, text, icon }) {
  return (
    <span style={{
      fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
      background: color + '20', color, fontWeight: '600',
      display: 'inline-flex', alignItems: 'center', gap: '3px'
    }}>
      {icon}{text}
    </span>
  );
}
