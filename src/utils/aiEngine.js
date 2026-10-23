// ─── Smart AI Engine (no external API) ──────────────────────
// Understands free-text Thai/English questions about tasks and
// generates detailed, context-aware responses.

const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);
const fmtHrs    = (h) => h < 1 ? `${Math.round(h * 60)} นาที` : `${h} ชม.`;
const todayStr  = () => new Date().toISOString().split('T')[0];
const priorityTH = { high: '🔴 สูง', medium: '🟡 กลาง', low: '🟢 ต่ำ' };
const catTH      = { homework: 'การบ้าน', report: 'รายงาน', presentation: 'Presentation', exam: 'สอบ', project: 'Project', other: 'อื่นๆ' };
const dayTH      = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์'];

// ── Intent classifier ────────────────────────────────────────
function classifyIntent(text) {
  const t = text.toLowerCase()
    .replace(/[?？。]/g, '')
    .trim();

  const match = (patterns) => patterns.some(p => new RegExp(p).test(t));

  if (match(['สวัสดี','หวัดดี','hello','hi ','ดีจ้า','ดีครับ']))                  return 'greet';
  if (match(['ขอบคุณ','thanks','thank you','โอเค','ok ','เยี่ยม']))                 return 'thanks';
  if (match(['คุณ(ทำ|ช่วย|คือ|เป็น)','ทำอะไรได้','ช่วยอะไร','คุณสมบัติ']))        return 'about';
  if (match(['วันนี้','ต้องทำอะไร','ทำก่อน','เริ่มจาก','ควรทำ']))                  return 'today';
  if (match(['เร่งด่วน','ด่วน','เร่ง','urgent','สำคัญที่สุด','ก่อน']))             return 'urgent';
  if (match(['เกินกำหนด','ค้าง','late','overdue','เลยเวลา','ช้า']))                return 'overdue';
  if (match(['ทั้งหมด','รวม','summary','สรุป','ภาพรวม','overview']))               return 'summary';
  if (match(['ชั่วโมง','เวลา','ภาระ','นานแค่ไหน','workload','กี่ชม']))             return 'workload';
  if (match(['แผน','วางแผน','ตาราง','schedule','plan','3 วัน','สัปดาห์นี้']))      return 'plan';
  if (match(['ทักษะ','skill','แม่นยำ','accuracy','score','คะแนน','ความสามารถ']))   return 'skills';
  if (match(['วิชา','subject','เยอะสุด','มากสุด','หนักสุด']))                       return 'subject';
  if (match(['ยาก','difficulty','ซับซ้อน','challenge','hard']))                     return 'hard';
  if (match(['ง่าย','easy','เร็ว','เล็กน้อย','เบา']))                               return 'easy';
  if (match(['deadline','ส่งเมื่อไ|ส่งวัน|กำหนด','due']))                          return 'deadline';
  if (match(['เสร็จ','done','complete','ผ่านมา','ที่ผ่าน']))                        return 'completed';
  if (match(['กำลังใจ','motivat','เหนื่อย','ท้อ','stressed','เครียด','กดดัน']))     return 'motivate';
  if (match(['คืนนี้','tonight','พรุ่งนี้','tomorrow']))                             return 'tomorrow';
  if (match(['tip','แนะนำ','เคล็ดลับ','advice','วิธี','ทำยังไง']))                 return 'tip';

  // Subject-specific detection
  const subjectMatch = text.match(/\b([A-Z]{2,6}\d{2,4})\b/i);
  if (subjectMatch) return { intent: 'subject_detail', code: subjectMatch[1].toUpperCase() };

  return 'general';
}

// ── Response generators ──────────────────────────────────────
function buildContext(tasks, courses, skillData) {
  const pending   = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');
  const overdue   = pending.filter(t => new Date(t.deadline) < new Date());
  const today     = pending.filter(t => t.deadline === todayStr());
  const urgent    = pending.filter(t => daysUntil(t.deadline) <= 2 && daysUntil(t.deadline) >= 0);

  const sorted = [...pending].sort((a, b) => {
    const dd = new Date(a.deadline) - new Date(b.deadline);
    const po = { high: 0, medium: 1, low: 2 };
    return dd !== 0 ? dd : po[a.priority] - po[b.priority];
  });

  const totalHrs = pending.reduce((s, t) => s + (t.estimatedTime || 0), 0);

  const bySub = {};
  pending.forEach(t => {
    if (!bySub[t.subject]) bySub[t.subject] = { count: 0, hrs: 0, tasks: [] };
    bySub[t.subject].count++;
    bySub[t.subject].hrs += t.estimatedTime || 0;
    bySub[t.subject].tasks.push(t);
  });

  return { pending, completed, overdue, today, urgent, sorted, totalHrs, bySub };
}

// ── Answer builder ────────────────────────────────────────────
export function getAIResponse(userText, tasks, courses, skillData) {
  const intent = classifyIntent(userText);
  const ctx    = buildContext(tasks, courses, skillData);

  // Handle object intent (subject_detail)
  if (typeof intent === 'object') {
    return answerSubjectDetail(intent.code, ctx, courses);
  }

  switch (intent) {
    case 'greet':     return answerGreet(ctx);
    case 'thanks':    return answerThanks();
    case 'about':     return answerAbout();
    case 'today':     return answerToday(ctx);
    case 'urgent':    return answerUrgent(ctx);
    case 'overdue':   return answerOverdue(ctx);
    case 'summary':   return answerSummary(ctx, skillData);
    case 'workload':  return answerWorkload(ctx);
    case 'plan':      return answerPlan(ctx);
    case 'skills':    return answerSkills(skillData, ctx);
    case 'subject':   return answerSubject(ctx);
    case 'hard':      return answerHard(ctx);
    case 'easy':      return answerEasy(ctx);
    case 'deadline':  return answerDeadline(ctx);
    case 'completed': return answerCompleted(ctx, skillData);
    case 'motivate':  return answerMotivate(ctx, skillData);
    case 'tomorrow':  return answerTomorrow(ctx);
    case 'tip':       return answerTip(ctx, skillData);
    default:          return answerGeneral(ctx, userText);
  }
}

// ── Individual answerers ──────────────────────────────────────

function answerGreet(ctx) {
  const { pending, overdue, today } = ctx;
  const urgency = overdue.length > 0
    ? `\n\n⚠️ มีงานเกินกำหนด **${overdue.length} งาน** รอดูแลอยู่นะครับ`
    : today.length > 0
    ? `\n\n📋 วันนี้มีงานส่ง **${today.length} งาน** อย่าลืมทำด้วยครับ`
    : pending.length === 0
    ? `\n\n✨ ตอนนี้ไม่มีงานค้างเลย ดีมากครับ!`
    : `\n\n📚 มีงานค้างอยู่ **${pending.length} งาน** ถามเกี่ยวกับงานได้เลยครับ`;
  return {
    text: `สวัสดีครับ! 👋 ผมคือผู้ช่วย AI วิเคราะห์งานของคุณ\n\nผมสามารถช่วยได้ เช่น:\n• วิเคราะห์ว่าควรทำงานไหนก่อน\n• ประเมินภาระงานและเวลา\n• วางแผนการทำงาน\n• ให้คำแนะนำจากข้อมูลจริงของคุณ${urgency}`,
    tasks: [],
  };
}

function answerThanks() {
  const msgs = [
    'ยินดีเสมอครับ! 😊 มีอะไรให้ช่วยเพิ่มได้เลย',
    'ด้วยความยินดีครับ! 👍 งานไหนต้องการวิเคราะห์ต่อไหม?',
    'ขอบคุณที่ใช้งานนะครับ! 🤝 ถามได้ตลอดเลย',
  ];
  return { text: msgs[Math.floor(Math.random() * msgs.length)], tasks: [] };
}

function answerAbout() {
  return {
    text: `ผมคือผู้ช่วย AI วิเคราะห์งานของ Student Planner 🤖\n\n**ผมช่วยได้เรื่อง:**\n• 📋 วิเคราะห์ว่าควรทำงานไหนก่อน\n• ⏱️ ประเมินภาระงานรวมทั้งหมด\n• 🗓️ วางแผนการทำงาน 3-7 วัน\n• 📊 วิเคราะห์ทักษะและความแม่นยำ\n• ⚠️ เตือนงานเกินกำหนดและเร่งด่วน\n• 🎯 แนะนำกลยุทธ์บริหารเวลา\n\n**ตัวอย่างคำถาม:**\n"งานไหนควรทำก่อน?" / "ภาระงานสัปดาห์นี้เท่าไร?" / "วางแผนให้หน่อย"`,
    tasks: [],
  };
}

function answerToday({ today, pending, sorted, overdue }) {
  if (pending.length === 0) {
    return { text: '🎉 ยอดเยี่ยมมาก! ไม่มีงานค้างอยู่เลยครับ ใช้เวลานี้ทบทวนบทเรียนหรือพักผ่อนได้เลย', tasks: [] };
  }

  if (today.length > 0) {
    const taskNames = today.map((t, i) => `${i + 1}. **${t.title}** (${t.subject}) — ${fmtHrs(t.estimatedTime)}`).join('\n');
    return {
      text: `📋 **วันนี้มีงานส่ง ${today.length} งาน:**\n\n${taskNames}\n\n⚡ ควรเริ่มทำทันทีครับ โดยเฉพาะงานที่ใช้เวลานาน`,
      tasks: today,
    };
  }

  if (overdue.length > 0) {
    return {
      text: `⚠️ วันนี้ไม่มีงานส่ง แต่มีงานเกินกำหนด **${overdue.length} งาน** ที่ต้องรีบจัดการครับ ควรติดต่ออาจารย์และเร่งส่งโดยเร็วที่สุด`,
      tasks: overdue.slice(0, 3),
    };
  }

  const next = sorted[0];
  const days = daysUntil(next.deadline);
  return {
    text: `📚 วันนี้ไม่มีงานส่งด่วนครับ แต่ควรเริ่มทำ **"${next.title}"** ไว้ก่อน เพราะเหลือเวลาแค่ **${days} วัน** และใช้เวลาทำประมาณ ${fmtHrs(next.estimatedTime)}`,
    tasks: sorted.slice(0, 3),
  };
}

function answerUrgent({ sorted, overdue, pending }) {
  if (pending.length === 0) return { text: '✅ ไม่มีงานค้างเลยครับ!', tasks: [] };

  const top  = sorted[0];
  const days = daysUntil(top.deadline);
  const dayTxt = days < 0 ? `⛔ เกินกำหนดไปแล้ว ${Math.abs(days)} วัน!` : days === 0 ? '🔥 ส่งวันนี้!' : `⏳ เหลือ ${days} วัน`;
  const dayOfWeek = new Date(top.deadline).getDay();

  let advice = '';
  if (days <= 0) advice = '\n\n🚨 **คำแนะนำ:** ติดต่ออาจารย์ทันที และส่งงานที่ทำได้ก่อน ดีกว่าไม่ส่งเลย';
  else if (top.difficulty >= 4) advice = `\n\n💡 **คำแนะนำ:** งานยากระดับ ${top.difficulty}⭐ ควรแบ่งทำเป็น ${Math.ceil(top.estimatedTime)} session ละ 1 ชม. อย่าทำทีเดียวนาน`;
  else if (top.estimatedTime >= 3) advice = `\n\n💡 **คำแนะนำ:** ใช้เวลานาน ${fmtHrs(top.estimatedTime)} ควรเริ่มวันนี้ อย่ารอถึงวัน${dayTH[dayOfWeek]}`;

  return {
    text: `🔥 **งานเร่งด่วนที่สุด:**\n\n📌 **${top.title}**\n• วิชา: ${top.subject}\n• ประเภท: ${catTH[top.category] || top.category}\n• กำหนดส่ง: ${top.deadline} (${dayTxt})\n• เวลาที่ต้องใช้: ${fmtHrs(top.estimatedTime)}\n• ความสำคัญ: ${priorityTH[top.priority]}\n• ความยาก: ${'⭐'.repeat(top.difficulty || 3)}${advice}`,
    tasks: sorted.slice(0, 3),
  };
}

function answerOverdue({ overdue, pending }) {
  if (overdue.length === 0) {
    return {
      text: `✅ ยอดเยี่ยมครับ! ไม่มีงานเกินกำหนดเลย สู้ต่อไปนะครับ!${pending.length > 0 ? `\n\nมีงานค้างอยู่ ${pending.length} งาน แต่ยังอยู่ในกำหนดครับ` : ''}`,
      tasks: [],
    };
  }

  const rows = overdue.map((t, i) => {
    const d = Math.abs(daysUntil(t.deadline));
    return `${i + 1}. **${t.title}** (${t.subject}) — เกิน ${d} วัน`;
  }).join('\n');

  const totalLate = overdue.reduce((s, t) => s + Math.abs(daysUntil(t.deadline)), 0);
  const advice = totalLate > 14
    ? '\n\n🚨 สถานการณ์เร่งด่วนมาก ควรประชุมกับอาจารย์ทุกวิชาโดยเร็ว'
    : '\n\n⚡ ติดต่ออาจารย์เพื่อขอส่งงานช้าและเร่งทำทันที';

  return {
    text: `⚠️ **งานเกินกำหนด ${overdue.length} งาน:**\n\n${rows}${advice}`,
    tasks: overdue,
  };
}

function answerSummary({ pending, completed, overdue, urgent, totalHrs, bySub }, skillData) {
  const subLines = Object.entries(bySub)
    .sort((a, b) => b[1].hrs - a[1].hrs)
    .map(([s, v]) => `• ${s}: ${v.count} งาน (${fmtHrs(v.hrs)})`).join('\n');

  const accTxt = skillData.accuracy > 0 ? `\n\n📊 **ทักษะ:** ความแม่นยำประมาณเวลา ${skillData.accuracy}%` : '';
  const statusEmoji = overdue.length > 0 ? '🔴' : urgent.length > 0 ? '🟡' : '🟢';

  return {
    text: `${statusEmoji} **ภาพรวมสถานะงาน:**\n\n📌 งานทั้งหมด: ${pending.length + completed.length} งาน\n✅ เสร็จแล้ว: ${completed.length} งาน\n⏳ ค้างอยู่: ${pending.length} งาน (${fmtHrs(totalHrs)})\n⚠️ เกินกำหนด: ${overdue.length} งาน\n🔥 เร่งด่วน: ${urgent.length} งาน\n\n**แยกตามวิชา:**\n${subLines || '• ไม่มีงานค้าง'}${accTxt}`,
    tasks: [],
  };
}

function answerWorkload({ pending, totalHrs, bySub, sorted }) {
  if (pending.length === 0) return { text: '✨ ไม่มีภาระงานค้างอยู่เลยครับ', tasks: [] };

  const subLines = Object.entries(bySub)
    .sort((a, b) => b[1].hrs - a[1].hrs)
    .map(([s, v]) => `  ${s}: ${v.count} งาน = ${fmtHrs(v.hrs)}`).join('\n');

  const days3 = Math.ceil(totalHrs / 3);
  const days6 = Math.ceil(totalHrs / 6);
  const perDay = (totalHrs / 7).toFixed(1);
  const nextDeadline = sorted[0];
  const daysLeft = daysUntil(nextDeadline.deadline);
  const fit = totalHrs <= daysLeft * 3 ? '✅ เวลาพอทำได้ทัน' : '⚠️ อาจตึงถ้าไม่เริ่มเร็ว';

  return {
    text: `⏱️ **ภาระงานทั้งหมด: ${fmtHrs(totalHrs)}** (${pending.length} งาน)\n\n**แยกตามวิชา:**\n${subLines}\n\n**ประมาณการ:**\n• ทำวันละ 3 ชม. → เสร็จใน ${days3} วัน\n• ทำวันละ 6 ชม. → เสร็จใน ${days6} วัน\n• เฉลี่ยต่อวัน (7 วัน) = ${perDay} ชม./วัน\n\n${fit}`,
    tasks: sorted.slice(0, 4),
  };
}

function answerPlan({ sorted, overdue, totalHrs }) {
  if (sorted.length === 0) return { text: '🎉 ไม่มีงานค้างให้วางแผนครับ', tasks: [] };

  const plan  = [];
  let remaining = [...sorted];
  const today  = new Date();

  for (let day = 0; day < 3; day++) {
    const d    = new Date(today);
    d.setDate(today.getDate() + day);
    const lbl  = day === 0 ? '📅 วันนี้' : day === 1 ? '📅 พรุ่งนี้' : `📅 วันมะรืน (${d.getDate()}/${d.getMonth() + 1})`;
    const MAX  = 4;
    let hrs    = 0;
    const pick = [];

    // priority: overdue first, then nearest deadline
    for (let i = 0; i < remaining.length && hrs < MAX; i++) {
      const task     = remaining[i];
      const dLeft    = daysUntil(task.deadline);
      const fits     = hrs + task.estimatedTime <= MAX;
      const isUrgent = dLeft <= day + 1;
      if (isUrgent || fits) {
        pick.push(task);
        hrs += task.estimatedTime;
        remaining = remaining.filter(x => x.id !== task.id);
      }
    }

    if (pick.length > 0) {
      const rows = pick.map(t =>
        `  ▸ ${t.title} (${t.subject}) — ${fmtHrs(t.estimatedTime)}`
      ).join('\n');
      plan.push(`${lbl} — รวม **${fmtHrs(hrs)}**\n${rows}`);
    } else {
      plan.push(`${lbl} — ไม่มีงานที่กำหนดไว้`);
    }
  }

  if (remaining.length > 0) {
    plan.push(`📌 ยังเหลืออีก **${remaining.length} งาน** (${fmtHrs(remaining.reduce((s, t) => s + t.estimatedTime, 0))}) ควรวางแผนวันถัดไปเพิ่ม`);
  }

  return {
    text: `🗓️ **แผนการทำงาน 3 วันข้างหน้า:**\n\n${plan.join('\n\n')}\n\n💡 เคล็ดลับ: แบ่งงานยากออกเป็นหลาย session ละ 45-60 นาที แล้วพัก 10 นาที (Pomodoro)`,
    tasks: sorted.slice(0, 5),
  };
}

function answerSkills(skillData, { pending, completed }) {
  if (completed.length === 0) {
    return {
      text: `📊 ยังไม่มีข้อมูลทักษะครับ เพราะยังไม่มีงานที่เสร็จและบันทึกเวลาจริง\n\n**วิธีเพิ่มข้อมูล:**\n1. ไปหน้าจับเวลา → เลือกงาน → เริ่ม\n2. หรือไปหน้าลำดับงาน → กด "ทำเสร็จแล้ว" → ใส่เวลาที่ใช้จริง`,
      tasks: [],
    };
  }

  const { accuracy, bySubject } = skillData;
  const level = accuracy >= 110 ? '⚡ เร็วมาก' : accuracy >= 90 ? '🎯 แม่นยำมาก' : accuracy >= 70 ? '👍 ดี' : '📚 ต้องพัฒนา';

  const subLines = Object.entries(bySubject)
    .map(([code, d]) => {
      const lv = d.avgAccuracy >= 90 ? '✅' : d.avgAccuracy >= 70 ? '⚠️' : '❌';
      return `  ${lv} ${code}: ${d.avgAccuracy}% (${d.tasks} งาน)`;
    }).join('\n');

  const advice = accuracy < 70
    ? '\n\n💡 คุณมักใช้เวลามากกว่าที่คาด ลองเพิ่มเวลาประมาณการ 30% ในครั้งหน้า'
    : accuracy >= 90
    ? '\n\n🏆 ประมาณเวลาได้แม่นมาก! ลองรับงานที่ท้าทายมากขึ้นได้เลย'
    : '\n\n💡 กำลังพัฒนาดีขึ้น ทำต่อไปเรื่อยๆ';

  return {
    text: `📊 **รายงานทักษะของคุณ:**\n\nระดับ: **${level}**\nความแม่นยำโดยรวม: **${accuracy}%**\nงานที่เสร็จแล้ว: ${completed.length} งาน\n\n**แยกตามวิชา:**\n${subLines}${advice}`,
    tasks: [],
  };
}

function answerSubject({ bySub, sorted }) {
  if (Object.keys(bySub).length === 0) return { text: '✅ ไม่มีงานค้างในวิชาใดเลยครับ', tasks: [] };

  const top = Object.entries(bySub).sort((a, b) => b[1].hrs - a[1].hrs)[0];
  const rows = Object.entries(bySub)
    .sort((a, b) => b[1].hrs - a[1].hrs)
    .map(([s, v], i) => `${i + 1}. **${s}**: ${v.count} งาน — ${fmtHrs(v.hrs)}`)
    .join('\n');

  return {
    text: `📚 **งานแยกตามวิชา:**\n\n${rows}\n\n🔴 วิชาที่หนักสุด: **${top[0]}** (${fmtHrs(top[1].hrs)})\n\n💡 ควรให้ความสำคัญกับวิชานี้มากขึ้นครับ`,
    tasks: sorted.filter(t => t.subject === top[0]).slice(0, 3),
  };
}

function answerSubjectDetail(code, { bySub, sorted }, courses) {
  const subTasks = sorted.filter(t => t.subject.toUpperCase() === code);
  const course   = courses.find(c => c.code === code);

  if (subTasks.length === 0) {
    return {
      text: `✅ วิชา **${code}** ไม่มีงานค้างอยู่เลยครับ${course ? `\n(${course.name})` : ''}`,
      tasks: [],
    };
  }

  const rows = subTasks.map((t, i) => {
    const d = daysUntil(t.deadline);
    const dTxt = d < 0 ? `❌ เกิน ${Math.abs(d)} วัน` : d === 0 ? '🔥 วันนี้' : `⏳ ${d} วัน`;
    return `${i + 1}. **${t.title}** — ${dTxt} | ${fmtHrs(t.estimatedTime)} | ${priorityTH[t.priority]}`;
  }).join('\n');

  const totalHrs = subTasks.reduce((s, t) => s + t.estimatedTime, 0);
  return {
    text: `📚 **วิชา ${code}${course ? ` — ${course.name}` : ''}**\n\nงานค้าง ${subTasks.length} งาน (รวม ${fmtHrs(totalHrs)}):\n\n${rows}`,
    tasks: subTasks,
  };
}

function answerHard({ sorted }) {
  const hard = sorted.filter(t => (t.difficulty || 3) >= 4);
  if (hard.length === 0) return { text: '😌 งานที่ค้างอยู่ไม่มีงานยากระดับสูงครับ (ระดับ 4-5)', tasks: [] };

  const rows = hard.map((t, i) => {
    const d = daysUntil(t.deadline);
    return `${i + 1}. **${t.title}** (${t.subject}) — ${'⭐'.repeat(t.difficulty)} | เหลือ ${d < 0 ? `เกิน ${Math.abs(d)} วัน` : `${d} วัน`}`;
  }).join('\n');

  return {
    text: `😰 **งานยากระดับสูง (4-5 ดาว)** มี ${hard.length} งาน:\n\n${rows}\n\n💡 **คำแนะนำ:** งานยากควรเริ่มทำก่อนเพื่อน เพราะถ้าติดปัญหาจะได้มีเวลาถามอาจารย์`,
    tasks: hard,
  };
}

function answerEasy({ sorted }) {
  const easy = sorted.filter(t => (t.difficulty || 3) <= 2 && t.estimatedTime <= 1.5);
  if (easy.length === 0) return { text: '🤔 ไม่มีงานที่ง่ายและเร็วโดยเฉพาะครับ', tasks: sorted.slice(0, 3) };

  const rows = easy.map((t, i) =>
    `${i + 1}. **${t.title}** (${t.subject}) — ${fmtHrs(t.estimatedTime)}`
  ).join('\n');

  return {
    text: `⚡ **งานที่ทำเสร็จเร็ว ${easy.length} งาน:**\n\n${rows}\n\n💡 ลองทำงานเหล่านี้ก่อนเพื่อสร้าง momentum และลดจำนวนงานค้างได้เร็ว`,
    tasks: easy,
  };
}

function answerDeadline({ sorted }) {
  if (sorted.length === 0) return { text: '✅ ไม่มีงานที่ต้องส่งครับ', tasks: [] };

  const rows = sorted.slice(0, 6).map((t, i) => {
    const d    = daysUntil(t.deadline);
    const dow  = new Date(t.deadline).getDay();
    const dTxt = d < 0 ? `❌ เกินไป ${Math.abs(d)} วัน` : d === 0 ? '🔥 วันนี้!' : `${d} วัน (${dayTH[dow]})`;
    return `${i + 1}. **${t.title}** — ${t.deadline} [${dTxt}]`;
  }).join('\n');

  return {
    text: `📅 **กำหนดส่งงานทั้งหมด:**\n\n${rows}${sorted.length > 6 ? `\n\n...และอีก ${sorted.length - 6} งาน` : ''}`,
    tasks: sorted.slice(0, 5),
  };
}

function answerCompleted({ completed }, skillData) {
  if (completed.length === 0) return { text: '📭 ยังไม่มีงานที่เสร็จครับ เริ่มทำงานแรกได้เลย!', tasks: [] };

  const recent = completed.slice(-5).reverse();
  const rows   = recent.map((t, i) =>
    `${i + 1}. ✅ **${t.title}** (${t.subject})${t.actualTime ? ` — ใช้เวลา ${fmtHrs(t.actualTime)}` : ''}`
  ).join('\n');

  const avgAcc = skillData.accuracy > 0 ? `\n\nความแม่นยำเฉลี่ย: **${skillData.accuracy}%**` : '';
  return {
    text: `🏆 **งานที่เสร็จแล้ว ${completed.length} งาน**\n\n**5 งานล่าสุด:**\n${rows}${avgAcc}`,
    tasks: [],
  };
}

function answerMotivate({ pending, completed }, skillData) {
  const lines = [];

  if (completed.length > 0) {
    lines.push(`✅ คุณทำงานเสร็จไปแล้ว **${completed.length} งาน** — ไม่ใช่น้อยๆ นะครับ`);
  }

  if (skillData.accuracy >= 90) {
    lines.push(`🎯 ความแม่นยำในการประมาณเวลา **${skillData.accuracy}%** นั้นยอดเยี่ยมมาก`);
  }

  if (pending.length === 0) {
    lines.push(`🌟 ตอนนี้ไม่มีงานค้างเลย! ทำได้ดีมากครับ`);
  } else if (pending.length <= 3) {
    lines.push(`📌 งานที่เหลือแค่ **${pending.length} งาน** ใกล้เสร็จแล้วครับ สู้ๆ!`);
  }

  lines.push(`\n💪 ทุกงานที่คุณทำ ไม่ว่าเล็กหรือใหญ่ ล้วนพาคุณใกล้เป้าหมายขึ้น\n\n**เคล็ดลับ:** ถ้าเริ่มไม่ได้ ลองนั่งทำแค่ 5 นาทีก่อน แล้วค่อยๆ ต่อ — ส่วนใหญ่จะทำต่อได้เองครับ`);

  return { text: lines.join('\n'), tasks: [] };
}

function answerTomorrow({ pending, sorted }) {
  const tomorrowStr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })();
  const dueTomorrow = pending.filter(t => t.deadline === tomorrowStr);
  const upcoming    = sorted.filter(t => daysUntil(t.deadline) <= 3).slice(0, 4);

  if (dueTomorrow.length > 0) {
    const rows = dueTomorrow.map(t => `• **${t.title}** (${t.subject}) — ${fmtHrs(t.estimatedTime)}`).join('\n');
    return {
      text: `⏰ **พรุ่งนี้มีงานส่ง ${dueTomorrow.length} งาน:**\n\n${rows}\n\n🚨 ควรทำคืนนี้เลยครับ ก่อนจะสายไป!`,
      tasks: dueTomorrow,
    };
  }

  if (upcoming.length > 0) {
    const rows = upcoming.map(t => {
      const d = daysUntil(t.deadline);
      return `• **${t.title}** — เหลือ ${d} วัน`;
    }).join('\n');
    return {
      text: `📋 **พรุ่งนี้ไม่มีงานส่งโดยตรง** แต่งานเหล่านี้กำลังจะถึงกำหนด:\n\n${rows}\n\n💡 ใช้เวลาพรุ่งนี้เตรียมงานเหล่านี้ได้เลยครับ`,
      tasks: upcoming,
    };
  }

  return { text: '😊 พรุ่งนี้ไม่มีงานด่วนครับ ใช้เวลาทบทวนบทเรียนหรือพักผ่อนได้เลย', tasks: [] };
}

function answerTip({ pending, overdue }, skillData) {
  const tips = [
    '🍅 **Pomodoro Technique:** ทำงาน 25 นาที พัก 5 นาที ทำ 4 รอบแล้วพักยาว 15 นาที — ช่วยให้โฟกัสได้นานขึ้น',
    '📝 **Eat the Frog:** เริ่มจากงานที่ยากหรือน่าเบื่อที่สุดก่อนตอนเช้า พอทำเสร็จแล้วงานอื่นจะดูง่ายขึ้น',
    '📱 **Digital Detox:** วางโทรศัพท์ไว้ในห้องอื่นตอนทำงาน สมาธิจะดีขึ้น 40% ทันที',
    '🎯 **Time Boxing:** กำหนดเวลาทำงานแต่ละชิ้นไว้ล่วงหน้า เช่น "งานนี้ทำ 1 ชม." แล้วหยุดไม่ว่าจะเสร็จหรือไม่',
    '🛌 **Sleep First:** นอนพักก่อนแล้วตื่นมาทำตอนเช้า ดีกว่าอดนอนทำกลางคืน — สมองทำงานได้ดีกว่ามาก',
    '✂️ **Split Big Tasks:** แบ่งงานใหญ่ออกเป็นชิ้นเล็กๆ 30 นาที แล้วทำทีละชิ้น จะรู้สึกก้าวหน้าตลอดเวลา',
  ];

  let extra = '';
  if (skillData.accuracy > 0 && skillData.accuracy < 80) {
    extra = `\n\n💡 **เฉพาะตัวคุณ:** ความแม่นยำประมาณเวลาของคุณอยู่ที่ ${skillData.accuracy}% ลองเพิ่มเวลาประมาณการ 25% ในครั้งหน้า`;
  }
  if (overdue.length > 0) {
    extra += `\n\n⚠️ คุณมีงานเกินกำหนด ${overdue.length} งาน — ลองใช้เทคนิค "2-Minute Rule": ถ้างานไหนทำได้ใน 2 นาที ทำเลยทันที`;
  }

  const tip = tips[Math.floor(Math.random() * tips.length)];
  return { text: `${tip}${extra}`, tasks: [] };
}

function answerGeneral({ sorted, pending }, userText) {
  // Try to detect a task name in the question
  const taskMatch = pending.find(t =>
    userText.includes(t.title) || userText.toLowerCase().includes(t.title.toLowerCase())
  );

  if (taskMatch) {
    const d = daysUntil(taskMatch.deadline);
    return {
      text: `📌 **${taskMatch.title}**\n\n• วิชา: ${taskMatch.subject}\n• ประเภท: ${catTH[taskMatch.category] || taskMatch.category}\n• กำหนดส่ง: ${taskMatch.deadline} (${d < 0 ? `เกิน ${Math.abs(d)} วัน!` : d === 0 ? 'วันนี้!' : `อีก ${d} วัน`})\n• เวลาประมาณ: ${fmtHrs(taskMatch.estimatedTime)}\n• ความสำคัญ: ${priorityTH[taskMatch.priority]}\n• ความยาก: ${'⭐'.repeat(taskMatch.difficulty || 3)}\n\n${taskMatch.notes ? `📝 หมายเหตุ: ${taskMatch.notes}` : ''}`,
      tasks: [taskMatch],
    };
  }

  if (pending.length === 0) {
    return {
      text: `ขอโทษครับ ไม่แน่ใจว่าถามเรื่องอะไร 😅\n\nตอนนี้ไม่มีงานค้างเลยครับ! 🎉\n\nลองถามว่า "ช่วยอะไรได้บ้าง" เพื่อดูสิ่งที่ผมทำได้ครับ`,
      tasks: [],
    };
  }

  return {
    text: `ขอโทษครับ ไม่แน่ใจว่าถามเรื่องอะไร 😅\n\nลองถามแบบนี้ได้เลยครับ:\n• "งานเร่งด่วนคืออะไร?"\n• "ภาระงานรวมกี่ชั่วโมง?"\n• "วางแผน 3 วันให้หน่อย"\n• "งานวิชา IT132 มีอะไรบ้าง?"\n• "ให้เคล็ดลับการทำงาน"`,
    tasks: sorted.slice(0, 3),
  };
}
