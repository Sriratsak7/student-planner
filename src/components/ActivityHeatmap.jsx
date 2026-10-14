import { useState } from 'react';

// สร้าง map ของ completed tasks ตามวันที่
function buildActivityMap(tasks) {
  const map = {};
  tasks
    .filter(t => t.status === 'completed')
    .forEach(t => {
      const date = t.completedDate || t.deadline; // ใช้ deadline เป็น fallback
      if (date) {
        map[date] = (map[date] || 0) + 1;
      }
    });
  return map;
}

// สร้าง grid 12 สัปดาห์ย้อนหลัง
function buildGrid() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // หา Sunday ของ 12 สัปดาห์ที่แล้ว
  const start = new Date(today);
  start.setDate(start.getDate() - (12 * 7) + 1);

  const weeks = [];
  let current = new Date(start);

  for (let w = 0; w < 12; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function getColor(count) {
  if (count === 0) return '#ede8e0';
  if (count === 1) return '#d4b483';
  if (count === 2) return '#c4922a';
  if (count === 3) return '#a07010';
  return '#6b4a0a';
}

const dayLabels = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export default function ActivityHeatmap({ tasks }) {
  const [tooltip, setTooltip] = useState(null); // { date, count, x, y }
  const activityMap = buildActivityMap(tasks);
  const weeks = buildGrid();

  const toKey = (d) => d.toISOString().split('T')[0];
  const today = toKey(new Date());

  // หาเดือนที่ควรแสดง label (แสดงเมื่อสัปดาห์นั้นเริ่มเดือนใหม่)
  const monthLabels = weeks.map((week, i) => {
    const firstDay = week[0];
    if (i === 0 || firstDay.getDate() <= 7) {
      return monthNames[firstDay.getMonth()];
    }
    return '';
  });

  const cellSize = 18;
  const gap = 3;

  return (
    <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', border: '1.5px solid #e8e0d5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#3d2c1e', margin: 0 }}>
          Activity ย้อนหลัง 12 สัปดาห์
        </h3>
        <span style={{ fontSize: '12px', color: '#aaa' }}>
          {tasks.filter(t => t.status === 'completed').length} งานทั้งหมด
        </span>
      </div>

      {/* Month labels */}
      <div style={{ display: 'flex', gap: `${gap}px`, marginBottom: '4px', paddingLeft: '22px' }}>
        {weeks.map((week, i) => (
          <div key={i} style={{ width: `${cellSize}px`, fontSize: '9px', color: '#aaa', textAlign: 'center', flexShrink: 0 }}>
            {monthLabels[i]}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', gap: `${gap}px`, alignItems: 'flex-start' }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, marginRight: '2px' }}>
          {dayLabels.map((d, i) => (
            <div key={i} style={{
              width: '18px', height: `${cellSize}px`,
              fontSize: '9px', color: '#bbb',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              paddingRight: '2px'
            }}>{i % 2 === 0 ? d : ''}</div>
          ))}
        </div>

        {/* Cells */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
            {week.map((day, di) => {
              const key = toKey(day);
              const count = activityMap[key] || 0;
              const isToday = key === today;
              const isFuture = day > new Date();

              return (
                <div
                  key={di}
                  onMouseEnter={(e) => setTooltip({ date: key, count, rect: e.target.getBoundingClientRect() })}
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    width: `${cellSize}px`, height: `${cellSize}px`,
                    borderRadius: '3px',
                    background: isFuture ? 'transparent' : getColor(count),
                    border: isToday ? '2px solid #8B6914' : '2px solid transparent',
                    cursor: count > 0 ? 'pointer' : 'default',
                    transition: 'transform 0.1s',
                    flexShrink: 0,
                    opacity: isFuture ? 0 : 1
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '10px', color: '#bbb' }}>น้อย</span>
        {[0, 1, 2, 3, 4].map(v => (
          <div key={v} style={{
            width: '12px', height: '12px', borderRadius: '2px',
            background: getColor(v === 4 ? 5 : v)
          }} />
        ))}
        <span style={{ fontSize: '10px', color: '#bbb' }}>เยอะ</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          marginTop: '8px', padding: '8px 12px',
          background: '#3d2c1e', color: '#fff',
          borderRadius: '8px', fontSize: '12px', textAlign: 'center'
        }}>
          {tooltip.date} — {tooltip.count > 0 ? `ทำงานเสร็จ ${tooltip.count} ชิ้น` : 'ไม่มีงานสำเร็จ'}
        </div>
      )}
    </div>
  );
}
