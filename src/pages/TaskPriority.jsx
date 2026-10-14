import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Play, CheckCircle2, Star, Timer, X, Clock } from 'lucide-react';

const priorityColor = { high: '#e53935', medium: '#f57c00', low: '#388e3c' };
const priorityLabel = { high: 'สูง', medium: 'กลาง', low: 'ต่ำ' };

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / 86400000);
}

// Modal สำหรับบันทึกเวลาจริง
function CompleteModal({ task, onConfirm, onCancel }) {
  const [hours, setHours] = useState(task.estimatedTime);

  const timeOptions = [0.25, 0.5, 1, 1.5, 2, 3, 4, 5];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onCancel} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 200, backdropFilter: 'blur(2px)'
      }} />
      {/* Modal */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px',
        background: '#fff', borderRadius: '24px 24px 0 0',
        padding: '24px 20px 40px', zIndex: 201,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.2)'
      }}>
        {/* Handle */}
        <div style={{
          width: '40px', height: '4px', borderRadius: '2px',
          background: '#e0e0e0', margin: '0 auto 20px'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#3d2c1e', margin: '0 0 4px' }}>
              บันทึกเวลาที่ใช้จริง
            </h3>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{task.title}</p>
          </div>
          <button onClick={onCancel} style={{
            background: '#f5f5f5', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={16} color="#666" />
          </button>
        </div>

        {/* ประมาณการ */}
        <div style={{
          background: '#f5ede0', borderRadius: '10px', padding: '10px 14px',
          display: 'flex', justifyContent: 'space-between', marginBottom: '16px'
        }}>
          <span style={{ fontSize: '13px', color: '#8B6914' }}>เวลาที่ประมาณไว้</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#8B6914' }}>
            {task.estimatedTime} ชั่วโมง
          </span>
        </div>

        {/* เลือกเวลา */}
        <p style={{ fontSize: '13px', fontWeight: '700', color: '#3d2c1e', marginBottom: '10px' }}>
          ใช้เวลาจริงกี่ชั่วโมง?
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {timeOptions.map(t => (
            <button key={t} onClick={() => setHours(t)} style={{
              padding: '8px 14px', borderRadius: '10px', border: '2px solid',
              borderColor: hours === t ? '#8B6914' : '#e0e0e0',
              background: hours === t ? '#f5ede0' : '#fafafa',
              color: hours === t ? '#8B6914' : '#555',
              cursor: 'pointer', fontSize: '13px', fontWeight: hours === t ? '700' : '400'
            }}>
              {t < 1 ? `${t * 60} นาที` : `${t} ชม.`}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Clock size={16} color="#8B6914" />
          <span style={{ fontSize: '13px', color: '#666' }}>ระบุเอง:</span>
          <input
            type="number" min="0.1" max="24" step="0.1"
            value={hours}
            onChange={e => setHours(parseFloat(e.target.value) || 0)}
            style={{
              width: '80px', padding: '8px 10px', borderRadius: '8px',
              border: '1.5px solid #e0d5c5', fontSize: '14px',
              fontFamily: 'inherit', textAlign: 'center', color: '#3d2c1e'
            }}
          />
          <span style={{ fontSize: '13px', color: '#666' }}>ชั่วโมง</span>
        </div>

        {/* Feedback preview */}
        {hours > 0 && (
          <div style={{
            background: hours <= task.estimatedTime ? '#e8f5e9' : '#fff8e1',
            borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
            fontSize: '13px', color: hours <= task.estimatedTime ? '#388e3c' : '#f57c00'
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
            background: hours > 0 ? 'linear-gradient(135deg, #388e3c, #4caf50)' : '#e0e0e0',
            color: '#fff', fontSize: '15px', fontWeight: '700',
            cursor: hours > 0 ? 'pointer' : 'not-allowed',
            boxShadow: hours > 0 ? '0 4px 12px rgba(56,142,60,0.3)' : 'none'
          }}>
          บันทึกและทำเครื่องหมายเสร็จแล้ว
        </button>
      </div>
    </>
  );
}

// Modal ยืนยันการลบ
function DeleteModal({ task, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 200, backdropFilter: 'blur(2px)'
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px',
        background: '#fff', borderRadius: '24px 24px 0 0',
        padding: '24px 20px 40px', zIndex: 201
      }}>
        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#e0e0e0', margin: '0 auto 20px' }} />
        <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#3d2c1e', margin: '0 0 8px' }}>ลบงานนี้?</h3>
        <p style={{ fontSize: '14px', color: '#888', margin: '0 0 24px' }}>"{task.title}" จะถูกลบออกถาวร</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '13px', borderRadius: '12px', border: '2px solid #e0e0e0',
            background: '#fff', color: '#666', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
          }}>ยกเลิก</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '13px', borderRadius: '12px', border: 'none',
            background: '#e53935', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '14px'
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
  const [completeModal, setCompleteModal] = useState(null); // task object
  const [deleteModal, setDeleteModal] = useState(null);     // task object

  const filtered = tasks
    .filter(t => filter === 'all' ? true : t.status === filter)
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      const urgencyA = (new Date(a.deadline) - new Date()) / 3600000 / (a.estimatedTime || 1);
      const urgencyB = (new Date(b.deadline) - new Date()) / 3600000 / (b.estimatedTime || 1);
      return urgencyA - urgencyB;
    });

  const getCourseColor = (code) => courses.find(c => c.code === code)?.color || '#8B6914';

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#3d2c1e', marginBottom: '8px' }}>
        ลำดับความสำคัญ
      </h1>
      <p style={{ color: '#999', fontSize: '13px', marginBottom: '16px' }}>
        เรียงตามความเร่งด่วนและวันกำหนดส่ง
      </p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[['pending', 'งานค้าง'], ['completed', 'เสร็จแล้ว'], ['all', 'ทั้งหมด']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: '8px 14px', borderRadius: '999px', border: '2px solid',
            borderColor: filter === val ? '#8B6914' : '#e0e0e0',
            background: filter === val ? '#8B6914' : 'white',
            color: filter === val ? '#fff' : '#666',
            cursor: 'pointer', fontSize: '13px', fontWeight: '600'
          }}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#ccc' }}>
          <CheckCircle2 size={48} style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '16px' }}>ไม่มีงานในรายการนี้</p>
        </div>
      ) : filtered.map((task, i) => {
        const days = daysUntil(task.deadline);
        const isOverdue = days < 0 && task.status === 'pending';
        const isUrgent = days <= 1 && task.status === 'pending';

        return (
          <div key={task.id} style={{
            background: task.status === 'completed' ? '#f9f9f9' : '#fff',
            border: `1.5px solid ${isOverdue ? '#ffcdd2' : isUrgent ? '#ffe0b2' : '#e8e0d5'}`,
            borderRadius: '14px', padding: '14px', marginBottom: '10px',
            opacity: task.status === 'completed' ? 0.7 : 1
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              {task.status === 'pending' && (
                <div style={{
                  minWidth: '28px', height: '28px', borderRadius: '50%',
                  background: i === 0 ? '#8B6914' : i === 1 ? '#c4922a' : '#e8e0d5',
                  color: i < 2 ? '#fff' : '#8B6914',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '13px'
                }}>{i + 1}</div>
              )}
              {task.status === 'completed' && (
                <CheckCircle2 size={24} color="#388e3c" style={{ flexShrink: 0, marginTop: '2px' }} />
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{
                    margin: 0, fontWeight: '700', fontSize: '15px', color: '#3d2c1e',
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%'
                  }}>{task.title}</p>
                  <span style={{
                    background: priorityColor[task.priority] + '20',
                    color: priorityColor[task.priority],
                    fontSize: '11px', padding: '3px 8px', borderRadius: '999px', fontWeight: '700', flexShrink: 0
                  }}>{priorityLabel[task.priority]}</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Tag color={getCourseColor(task.subject)} text={task.subject} />
                  <Tag color="#666" text={`${task.estimatedTime}ชม.`} icon={<Timer size={10} />} />
                  {task.actualTime && (
                    <Tag color="#388e3c" text={`ใช้จริง ${task.actualTime.toFixed(1)}ชม.`} icon={<CheckCircle2 size={10} />} />
                  )}
                  <Tag
                    color={isOverdue ? '#e53935' : isUrgent ? '#f57c00' : '#888'}
                    text={isOverdue ? `เกิน ${Math.abs(days)} วัน` : days === 0 ? 'วันนี้!' : `อีก ${days} วัน`}
                  />
                  <div style={{ display: 'flex', gap: '1px' }}>
                    {[...Array(task.difficulty || 3)].map((_, idx) => (
                      <Star key={idx} size={10} fill="#f57c00" color="#f57c00" />
                    ))}
                  </div>
                </div>

                {task.notes && (
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#aaa' }}>{task.notes}</p>
                )}
              </div>
            </div>

            {task.status === 'pending' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => navigate('/timer', { state: { taskId: task.id } })} style={{
                  flex: 1, padding: '9px', borderRadius: '10px', border: 'none',
                  background: '#f5ede0', color: '#8B6914', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}>
                  <Play size={14} /> เริ่มทำ
                </button>
                <button onClick={() => setCompleteModal(task)} style={{
                  flex: 1, padding: '9px', borderRadius: '10px', border: 'none',
                  background: '#e8f5e9', color: '#388e3c', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}>
                  <CheckCircle2 size={14} /> เสร็จแล้ว
                </button>
                <button onClick={() => setDeleteModal(task)} style={{
                  padding: '9px 12px', borderRadius: '10px', border: 'none',
                  background: '#ffebee', color: '#e53935', cursor: 'pointer',
                  display: 'flex', alignItems: 'center'
                }}>
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Complete Modal */}
      {completeModal && (
        <CompleteModal
          task={completeModal}
          onConfirm={(hours) => {
            completeTask(completeModal.id, hours);
            setCompleteModal(null);
          }}
          onCancel={() => setCompleteModal(null)}
        />
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <DeleteModal
          task={deleteModal}
          onConfirm={() => {
            deleteTask(deleteModal.id);
            setDeleteModal(null);
          }}
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
      background: color + '18', color, fontWeight: '600',
      display: 'inline-flex', alignItems: 'center', gap: '3px'
    }}>
      {icon}{text}
    </span>
  );
}
