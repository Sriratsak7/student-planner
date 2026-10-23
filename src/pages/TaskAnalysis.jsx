import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../utils/theme';
import { getAIResponse } from '../utils/aiEngine';
import { Bot, Send, Play, Sparkles, Clock, AlertTriangle, Target, Lightbulb, Flame, ChevronRight } from 'lucide-react';

// ── Quick-question chips ──────────────────────────────────────
const QUICK = [
  { id: 'q1', icon: '🔥', text: 'งานเร่งด่วนที่สุด?' },
  { id: 'q2', icon: '📋', text: 'วันนี้ต้องทำอะไร?' },
  { id: 'q3', icon: '🗓️', text: 'วางแผน 3 วัน' },
  { id: 'q4', icon: '⏱️', text: 'ภาระงานรวมกี่ชั่วโมง?' },
  { id: 'q5', icon: '📊', text: 'วิเคราะห์ทักษะของฉัน' },
  { id: 'q6', icon: '⚠️', text: 'งานเกินกำหนดมีอะไรบ้าง?' },
  { id: 'q7', icon: '💡', text: 'ให้เคล็ดลับการทำงาน' },
  { id: 'q8', icon: '📚', text: 'งานแยกตามวิชา' },
];

// ── Main page ─────────────────────────────────────────────────
export default function TaskAnalysis() {
  const { tasks, courses, getSkillData } = useApp();
  const navigate   = useNavigate();
  const skillData  = getSkillData();
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 0, from: 'bot',
      text: 'สวัสดีครับ! 👋 ผมคือผู้ช่วย AI วิเคราะห์งานของคุณ\n\nผมรู้จักงานและข้อมูลทั้งหมดของคุณ สามารถถามได้เลยว่า:\n• ควรทำงานไหนก่อน?\n• ภาระงานรวมเท่าไร?\n• วางแผนการเรียนให้หน่อย\n\nหรือกดปุ่มคำถามด้านล่างได้เลยครับ',
      tasks: [],
    }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = (text) => {
    if (!text.trim() || loading) return;
    setInput('');

    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text }]);
    setLoading(true);

    // Simulate ~600ms AI thinking
    const delay = 400 + Math.random() * 400;
    setTimeout(() => {
      const res = getAIResponse(text, tasks, courses, skillData);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, from: 'bot',
        text: res.text,
        tasks: res.tasks || [],
        action: res.action,
      }]);
      setLoading(false);
    }, delay);
  };

  // Stats for header bar
  const pending   = tasks.filter(t => t.status === 'pending');
  const overdue   = pending.filter(t => new Date(t.deadline) < new Date());
  const today     = pending.filter(t => t.deadline === new Date().toISOString().split('T')[0]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 130px)', minHeight: '500px',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${t.border}`,
        background: t.card,
        display: 'flex', alignItems: 'center', gap: '12px',
        flexShrink: 0,
      }}>
        {/* Avatar with glow */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '14px',
          background: t.accentGrad2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: t.glowBlue,
          position: 'relative',
        }}>
          <Bot size={22} color="#fff" />
          <span style={{
            position: 'absolute', bottom: '-2px', right: '-2px',
            width: '12px', height: '12px', borderRadius: '50%',
            background: t.success, border: `2px solid ${t.card}`,
            animation: 'pulse 2s infinite',
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: t.text, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            AI Assistant
            <span style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '999px',
              background: t.successBg, color: t.success, fontWeight: '600', border: `1px solid ${t.successBorder}`,
            }}>Online</span>
          </h2>
          <p style={{ fontSize: '11px', color: t.textMuted, margin: '2px 0 0' }}>
            วิเคราะห์จาก {tasks.length} งาน · ตอบทันทีโดยไม่ต้องรอ
          </p>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          {overdue.length > 0 && (
            <div style={{
              padding: '4px 10px', borderRadius: '8px',
              background: t.dangerBg, border: `1px solid ${t.dangerBorder}`,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <AlertTriangle size={12} color={t.danger} />
              <span style={{ fontSize: '12px', fontWeight: '700', color: t.danger }}>{overdue.length}</span>
            </div>
          )}
          {today.length > 0 && (
            <div style={{
              padding: '4px 10px', borderRadius: '8px',
              background: t.warningBg, border: `1px solid ${t.warningBorder}`,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <Clock size={12} color={t.warning} />
              <span style={{ fontSize: '12px', fontWeight: '700', color: t.warning }}>{today.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onStartTimer={(taskId) => navigate('/timer', { state: { taskId } })}
          />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '12px',
              background: t.accentGrad2, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={18} color="#fff" />
            </div>
            <div style={{
              background: t.cardLight, border: `1px solid ${t.border}`,
              borderRadius: '4px 14px 14px 14px',
              padding: '12px 16px', display: 'flex', gap: '5px', alignItems: 'center',
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: t.accent, opacity: 0.7,
                  animation: `bounce 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick questions ── */}
      <div style={{
        padding: '8px 12px',
        borderTop: `1px solid ${t.border}`,
        display: 'flex', gap: '6px', overflowX: 'auto', flexShrink: 0,
      }}
        className="no-scrollbar"
      >
        {QUICK.map(q => (
          <button key={q.id} onClick={() => sendMessage(q.text)} style={{
            padding: '7px 13px', borderRadius: '10px',
            border: `1px solid ${t.border}`,
            background: t.cardLight,
            color: t.textSec, cursor: 'pointer',
            fontSize: '12px', fontWeight: '500',
            whiteSpace: 'nowrap', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '5px',
            transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
          >
            <span>{q.icon}</span> {q.text}
          </button>
        ))}
      </div>

      {/* ── Input ── */}
      <div style={{
        padding: '10px 14px 16px',
        background: t.card,
        borderTop: `1px solid ${t.border}`,
        display: 'flex', gap: '8px', alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="พิมพ์คำถาม เช่น งานไหนควรทำก่อน? ..."
            style={{
              width: '100%', padding: '11px 14px',
              borderRadius: '14px',
              border: `1.5px solid ${t.border}`,
              background: t.inputBg,
              color: t.text, fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none', resize: 'none',
              lineHeight: 1.5, overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = t.accent}
            onBlur={e => e.target.style.borderColor = t.border}
          />
        </div>
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          style={{
            width: '44px', height: '44px', borderRadius: '14px', border: 'none',
            background: input.trim() && !loading ? t.accentGrad2 : t.disabled,
            color: '#fff', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s',
            boxShadow: input.trim() ? t.glowBlue : 'none',
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────────
function MessageBubble({ msg, onStartTimer }) {
  const isBot = msg.from === 'bot';

  // Parse **bold** markdown inline
  const renderText = (raw) => {
    return raw.split('\n').map((line, li) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={li} style={{ margin: li === 0 ? 0 : '5px 0 0', fontSize: '13.5px', lineHeight: 1.6, color: t.text }}>
          {parts.map((p, pi) =>
            p.startsWith('**') && p.endsWith('**')
              ? <strong key={pi} style={{ color: t.text, fontWeight: '700' }}>{p.slice(2, -2)}</strong>
              : p
          )}
        </p>
      );
    });
  };

  return (
    <div style={{
      display: 'flex', gap: '10px',
      flexDirection: isBot ? 'row' : 'row-reverse',
      animation: 'fadeIn 0.2s ease',
    }}
      className="fade-in"
    >
      {/* Avatar */}
      {isBot && (
        <div style={{
          width: '36px', height: '36px', borderRadius: '12px',
          background: t.accentGrad2, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(59,130,246,0.2)',
        }}>
          <Bot size={18} color="#fff" />
        </div>
      )}

      <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Text bubble */}
        <div style={{
          background: isBot ? t.cardLight : t.accentBg,
          border: `1px solid ${isBot ? t.border : t.borderLight}`,
          borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
          padding: '12px 16px',
          boxShadow: isBot ? 'none' : '0 2px 12px rgba(59,130,246,0.12)',
        }}>
          {renderText(msg.text)}
        </div>

        {/* Task cards */}
        {msg.tasks && msg.tasks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {msg.tasks.slice(0, 5).map(task => (
              <TaskMiniCard key={task.id} task={task} onStartTimer={onStartTimer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mini task card inside chat ─────────────────────────────────
function TaskMiniCard({ task, onStartTimer }) {
  const days    = Math.ceil((new Date(task.deadline) - new Date()) / 86400000);
  const dayColor = days < 0 ? t.danger : days <= 1 ? t.danger : days <= 3 ? t.warning : t.success;
  const dayBg    = days < 0 ? t.dangerBg : days <= 1 ? t.dangerBg : days <= 3 ? t.warningBg : t.successBg;
  const dayTxt   = days < 0 ? `เกิน ${Math.abs(days)} วัน` : days === 0 ? 'วันนี้!' : `${days} วัน`;
  const pColor   = { high: t.danger, medium: t.warning, low: t.success };

  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: '12px', padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: '10px',
      transition: 'border-color 0.15s',
    }}>
      {/* Priority dot */}
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: pColor[task.priority] || t.accent,
        flexShrink: 0, boxShadow: `0 0 6px ${pColor[task.priority] || t.accent}80`,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: '13px', fontWeight: '700', color: t.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{task.title}</p>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: t.textMuted }}>
          {task.subject} · {task.estimatedTime < 1 ? `${task.estimatedTime * 60 | 0} นาที` : `${task.estimatedTime} ชม.`}
        </p>
      </div>

      {/* Day badge */}
      <span style={{
        fontSize: '11px', fontWeight: '700', color: dayColor,
        background: dayBg, padding: '3px 8px', borderRadius: '7px', flexShrink: 0,
        border: `1px solid ${dayColor}30`,
      }}>{dayTxt}</span>

      {/* Start timer button */}
      <button
        onClick={() => onStartTimer(task.id)}
        title="เริ่มจับเวลา"
        style={{
          width: '30px', height: '30px', borderRadius: '8px', border: 'none',
          background: t.accentBg, color: t.accentLight,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = t.accent}
        onMouseLeave={e => e.currentTarget.style.background = t.accentBg}
      >
        <Play size={13} fill={t.accentLight} color={t.accentLight} />
      </button>
    </div>
  );
}
