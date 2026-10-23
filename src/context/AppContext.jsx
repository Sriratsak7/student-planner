import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'รายงานวิชา IT', subject: 'IT132', priority: 'high', estimatedTime: 3, actualTime: null, deadline: '2026-10-15', status: 'pending', category: 'report' },
      { id: 2, title: 'การบ้าน English', subject: 'ENG101', priority: 'medium', estimatedTime: 1.5, actualTime: null, deadline: '2026-10-14', status: 'pending', category: 'homework' },
      { id: 3, title: 'Presentation', subject: 'BUS201', priority: 'low', estimatedTime: 2, actualTime: null, deadline: '2026-10-16', status: 'pending', category: 'presentation' },
    ];
  });

  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('courses');
    return saved ? JSON.parse(saved) : [
      {
        id: 1, code: 'IT132', name: 'Information Technology', color: '#8B6914',
        schedule: [
          { week: 1, topic: 'Introduction to IT', difficulty: 2, prepHours: 1 },
          { week: 2, topic: 'Hardware & Software', difficulty: 2, prepHours: 1 },
          { week: 3, topic: 'Networking Basics', difficulty: 3, prepHours: 2 },
          { week: 4, topic: 'Internet & Web', difficulty: 2, prepHours: 1.5 },
          { week: 5, topic: 'Database Design', difficulty: 4, prepHours: 3 },
          { week: 6, topic: 'Programming Concepts', difficulty: 4, prepHours: 3 },
          { week: 7, topic: 'Security & Privacy', difficulty: 3, prepHours: 2 },
          { week: 8, topic: 'Midterm Review', difficulty: 5, prepHours: 4 },
        ]
      },
      {
        id: 2, code: 'ENG101', name: 'English Communication', color: '#2E7D32',
        schedule: [
          { week: 1, topic: 'Grammar Review', difficulty: 2, prepHours: 1 },
          { week: 2, topic: 'Reading Skills', difficulty: 2, prepHours: 1 },
          { week: 3, topic: 'Writing Paragraphs', difficulty: 3, prepHours: 2 },
          { week: 4, topic: 'Listening & Speaking', difficulty: 3, prepHours: 2 },
          { week: 5, topic: 'Vocabulary Building', difficulty: 2, prepHours: 1.5 },
          { week: 6, topic: 'Essay Writing', difficulty: 4, prepHours: 3 },
          { week: 7, topic: 'Presentation Skills', difficulty: 4, prepHours: 3 },
          { week: 8, topic: 'Midterm Exam', difficulty: 5, prepHours: 4 },
        ]
      },
      {
        id: 3, code: 'BUS201', name: 'Business Management', color: '#1565C0',
        schedule: [
          { week: 1, topic: 'Intro to Business', difficulty: 1, prepHours: 0.5 },
          { week: 2, topic: 'Management Theories', difficulty: 3, prepHours: 2 },
          { week: 3, topic: 'Marketing Basics', difficulty: 2, prepHours: 1.5 },
          { week: 4, topic: 'Financial Concepts', difficulty: 4, prepHours: 3 },
          { week: 5, topic: 'Human Resources', difficulty: 2, prepHours: 1.5 },
          { week: 6, topic: 'Strategic Planning', difficulty: 4, prepHours: 3 },
          { week: 7, topic: 'Leadership Skills', difficulty: 3, prepHours: 2 },
          { week: 8, topic: 'Case Study Analysis', difficulty: 5, prepHours: 4 },
        ]
      },
    ];
  });

  // Timer state — persisted to localStorage so it survives page navigation and refresh
  const [timerState, setTimerState] = useState(() => {
    const saved = localStorage.getItem('timerState');
    if (saved) {
      const parsed = JSON.parse(saved);
      // If timer was running when the page was closed, account for elapsed time
      if (parsed.running && parsed.startTime) {
        const additionalSeconds = Math.floor((Date.now() - parsed.startTime) / 1000);
        parsed.elapsedSeconds = (parsed.elapsedSeconds || 0) + additionalSeconds;
        parsed.startTime = Date.now();
      }
      return parsed;
    }
    return { taskId: null, elapsedSeconds: 0, running: false, startTime: null };
  });

  // Completed lessons tracking — which course weeks are marked as studied
  const [completedLessons, setCompletedLessons] = useState(() => {
    const saved = localStorage.getItem('completedLessons');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentWeek, setCurrentWeek] = useState(5);

  const [teachers, setTeachers] = useState(() => {
    const saved = localStorage.getItem('teachers');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('courses', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('timerState', JSON.stringify(timerState)); }, [timerState]);
  useEffect(() => { localStorage.setItem('completedLessons', JSON.stringify(completedLessons)); }, [completedLessons]);

  const addTeacher = (teacher) => {
    setTeachers(prev => [...prev, { ...teacher, id: Date.now() }]);
  };

  const deleteTeacher = (id) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const addTask = (task) => {
    const newTask = { ...task, id: Date.now(), status: 'pending', actualTime: null };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const completeTask = (id, actualTime) => {
    const today = new Date().toISOString().split('T')[0];
    const task = tasks.find(t => t.id === id);
    // Include any previously logged time from timer sessions
    const totalActual = parseFloat(((task?.loggedTime || 0) + actualTime).toFixed(2));
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'completed', actualTime: totalActual, completedDate: today, loggedTime: 0 } : t
    ));
  };

  const addCourse = (course) => {
    const newCourse = { ...course, id: Date.now() };
    setCourses(prev => [...prev, newCourse]);
  };

  // ─── Timer functions ──────────────────────────────────────────

  // Returns current elapsed seconds (computes from startTime when running)
  const getTimerElapsed = () => {
    if (timerState.running && timerState.startTime) {
      return timerState.elapsedSeconds + Math.floor((Date.now() - timerState.startTime) / 1000);
    }
    return timerState.elapsedSeconds;
  };

  // Start a fresh timer for a task — saves any existing timer's elapsed time first
  const timerStart = (taskId) => {
    // If there's an existing timer running for a different task, save its elapsed time
    if (timerState.taskId && timerState.taskId !== taskId) {
      const elapsedSeconds = getTimerElapsed();
      const hours = parseFloat((elapsedSeconds / 3600).toFixed(3));
      if (hours > 0) {
        const oldTask = tasks.find(t => t.id === timerState.taskId);
        if (oldTask && oldTask.status === 'pending') {
          setTasks(prev => prev.map(t =>
            t.id === timerState.taskId
              ? { ...t, loggedTime: (t.loggedTime || 0) + hours }
              : t
          ));
        }
      }
    }
    setTimerState({ taskId, elapsedSeconds: 0, running: true, startTime: Date.now() });
  };

  // Pause the running timer, preserving elapsed time
  const timerPause = () => {
    setTimerState(prev => {
      if (!prev.running) return prev;
      const elapsed = prev.elapsedSeconds + Math.floor((Date.now() - prev.startTime) / 1000);
      return { ...prev, running: false, elapsedSeconds: elapsed, startTime: null };
    });
  };

  // Resume a paused timer
  const timerResume = () => {
    setTimerState(prev => ({ ...prev, running: true, startTime: Date.now() }));
  };

  // Reset timer completely without saving
  const timerReset = () => {
    setTimerState({ taskId: null, elapsedSeconds: 0, running: false, startTime: null });
  };

  // Stop timer, save actual time to the task, and mark as completed
  const timerFinish = () => {
    const totalSeconds = getTimerElapsed();
    const hours = parseFloat((totalSeconds / 3600).toFixed(2));
    const taskId = timerState.taskId;
    let totalHours = 0;
    if (taskId && hours > 0) {
      const task = tasks.find(t => t.id === taskId);
      totalHours = parseFloat(((task?.loggedTime || 0) + hours).toFixed(2));
      completeTask(taskId, hours);
    }
    setTimerState({ taskId: null, elapsedSeconds: 0, running: false, startTime: null });
    return { hours: totalHours, taskId };
  };

  // ─── Lesson completion functions ──────────────────────────────

  const toggleLesson = (courseId, week) => {
    setCompletedLessons(prev => {
      const key = String(courseId);
      const current = prev[key] || [];
      if (current.includes(week)) {
        return { ...prev, [key]: current.filter(w => w !== week) };
      }
      return { ...prev, [key]: [...current, week] };
    });
  };

  const isLessonCompleted = (courseId, week) => {
    return (completedLessons[String(courseId)] || []).includes(week);
  };

  const getCourseProgress = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return { completed: 0, total: 0, percentage: 0 };
    const completedWeeks = completedLessons[String(courseId)] || [];
    const completed = completedWeeks.filter(w =>
      course.schedule.some(s => s.week === w)
    ).length;
    const total = course.schedule.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  // ─── Skill calculation ─────────────────────────────────────────

  const getSkillData = () => {
    const completed = tasks.filter(t => t.status === 'completed' && t.actualTime);
    if (completed.length === 0) return { accuracy: 0, velocity: 0, bySubject: {} };

    const bySubject = {};
    completed.forEach(t => {
      if (!bySubject[t.subject]) bySubject[t.subject] = { tasks: 0, totalAcc: 0 };
      const acc = Math.min((t.estimatedTime / t.actualTime) * 100, 150);
      bySubject[t.subject].tasks++;
      bySubject[t.subject].totalAcc += acc;
    });

    Object.keys(bySubject).forEach(s => {
      bySubject[s].avgAccuracy = Math.round(bySubject[s].totalAcc / bySubject[s].tasks);
    });

    const overallAcc = Math.round(completed.reduce((sum, t) => {
      return sum + Math.min((t.estimatedTime / t.actualTime) * 100, 150);
    }, 0) / completed.length);

    return { accuracy: overallAcc, velocity: completed.length, bySubject };
  };

  // Weekly progress for skill report — groups completed tasks by ISO week
  const getWeeklyProgress = () => {
    const completed = tasks.filter(t => t.status === 'completed' && t.completedDate);
    if (completed.length === 0) return [];

    const weekMap = {};
    completed.forEach(t => {
      const date = new Date(t.completedDate);
      // Find the Monday of that week
      const day = date.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(date);
      monday.setDate(date.getDate() + diff);
      const weekKey = monday.toISOString().split('T')[0];

      if (!weekMap[weekKey]) {
        weekMap[weekKey] = {
          week: weekKey,
          count: 0,
          totalEstimated: 0,
          totalActual: 0,
        };
      }
      weekMap[weekKey].count++;
      weekMap[weekKey].totalEstimated += t.estimatedTime || 0;
      weekMap[weekKey].totalActual += t.actualTime || 0;
    });

    return Object.values(weekMap)
      .sort((a, b) => new Date(a.week) - new Date(b.week))
      .slice(-8);
  };

  // ─── Weekly analysis (for Course Planner) ─────────────────────

  const getWeeklyAnalysis = () => {
    return courses.map(course => {
      const weekData = course.schedule.find(s => s.week === currentWeek);
      const skillData = getSkillData();
      const subjectSkill = skillData.bySubject[course.code];
      const teacher = teachers.find(t => t.courseCode === course.code);

      let recommendation = '';
      let urgency = 'normal';

      if (weekData) {
        if (weekData.difficulty >= 4) {
          urgency = 'high';
          recommendation = `หัวข้อนี้ยากมาก ควรเริ่มเตรียมตัวล่วงหน้า ${weekData.prepHours * 2} ชั่วโมง`;
        } else if (weekData.difficulty >= 3) {
          urgency = 'medium';
          recommendation = `ควรเตรียมตัวล่วงหน้า ${weekData.prepHours} ชั่วโมง`;
        } else {
          recommendation = `เนื้อหาไม่ยากมาก เตรียมตัว ${weekData.prepHours} ชั่วโมงก็พอ`;
        }

        if (subjectSkill && subjectSkill.avgAccuracy < 80) {
          recommendation += ` (แนะนำเพิ่มเวลา เพราะคุณมักใช้เวลาเกินกว่าที่ประมาณไว้ในวิชานี้)`;
          urgency = 'high';
        }

        if (teacher) {
          const access = teacher.ratings.accessibility;
          const speed = teacher.ratings.responseSpeed;
          if (access <= 2 || speed <= 2) {
            recommendation += ` และอาจารย์วิชานี้เข้าถึงยาก ควรเตรียมตัวให้พร้อมก่อน ไม่ควรรอถามอาจารย์`;
            urgency = 'high';
          } else if (access >= 4 && speed >= 4) {
            recommendation += ` อาจารย์วิชานี้เข้าถึงง่ายและตอบเร็ว ถ้าติดปัญหาสามารถถามได้เลย`;
          }
        }
      }

      return { course, weekData, recommendation, urgency, teacher };
    });
  };

  // ─── Smart Task Analysis (ผู้ช่วยวิเคราะห์งาน) ─────────────────
  const getTaskAnalysis = () => {
    const pending = tasks.filter(tsk => tsk.status === 'pending');
    const completedTasks = tasks.filter(tsk => tsk.status === 'completed');
    const insights = [];

    const daysUntilCalc = (dateStr) => {
      const diff = new Date(dateStr) - new Date();
      return Math.ceil(diff / 86400000);
    };

    // 1. Workload analysis
    const totalEstimated = pending.reduce((sum, tsk) => sum + (tsk.estimatedTime || 0), 0);
    if (pending.length > 0) {
      const daysNeeded = Math.ceil(totalEstimated / 3);
      insights.push({
        type: 'workload',
        title: 'ภาระงาน',
        message: `คุณมีงานค้าง ${pending.length} งาน รวมเวลาประมาณ ${totalEstimated} ชม. ถ้าทำวันละ 3 ชม. จะใช้เวลา ${daysNeeded} วัน`,
        severity: totalEstimated > 20 ? 'high' : totalEstimated > 10 ? 'medium' : 'low'
      });
    }

    // 2. Deadline clustering
    const deadlineMap = {};
    pending.forEach(tsk => {
      if (!deadlineMap[tsk.deadline]) deadlineMap[tsk.deadline] = [];
      deadlineMap[tsk.deadline].push(tsk);
    });
    const clustered = Object.entries(deadlineMap)
      .filter(([, tsks]) => tsks.length >= 2)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]));
    if (clustered.length > 0) {
      const [date, tsks] = clustered[0];
      const days = daysUntilCalc(date);
      insights.push({
        type: 'warning',
        title: 'งานซ้อนกัน',
        message: `มี ${tsks.length} งานส่งพร้อมกันในวันที่ ${date} ${days > 0 ? `(อีก ${days} วัน)` : days === 0 ? '(วันนี้!)' : '(เกินกำหนดแล้ว!)'} ควรเริ่มทำล่วงหน้า`,
        severity: days <= 3 ? 'high' : 'medium'
      });
    }

    // 3. Overdue tasks
    const overdue = pending.filter(tsk => new Date(tsk.deadline) < new Date());
    if (overdue.length > 0) {
      const mostOverdue = overdue.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];
      const days = Math.abs(daysUntilCalc(mostOverdue.deadline));
      insights.push({
        type: 'danger',
        title: 'งานเกินกำหนด',
        message: `มี ${overdue.length} งานเกินกำหนดส่งแล้ว โดย "${mostOverdue.title}" เกินไปแล้ว ${days} วัน ควรจัดลำดับทำก่อน`,
        severity: 'high'
      });
    }

    // 4. Most urgent task
    if (pending.length > 0) {
      const sorted = [...pending].sort((a, b) => {
        const dd = new Date(a.deadline) - new Date(b.deadline);
        if (dd !== 0) return dd;
        const po = { high: 0, medium: 1, low: 2 };
        return po[a.priority] - po[b.priority];
      });
      const mostUrgent = sorted[0];
      const days = daysUntilCalc(mostUrgent.deadline);
      insights.push({
        type: 'recommend',
        title: 'ควรเริ่มจาก',
        message: `"${mostUrgent.title}" (${mostUrgent.subject}) — ${days < 0 ? 'เกินกำหนดแล้ว!' : days === 0 ? 'ส่งวันนี้!' : `เหลือ ${days} วัน`} · ประมาณ ${mostUrgent.estimatedTime} ชม. · ความสำคัญ${mostUrgent.priority === 'high' ? 'สูง' : mostUrgent.priority === 'medium' ? 'กลาง' : 'ต่ำ'}`,
        severity: days <= 1 ? 'high' : days <= 3 ? 'medium' : 'low'
      });
    }

    // 5. Time estimation accuracy
    const skillData = getSkillData();
    if (skillData.accuracy > 0 && skillData.accuracy < 70) {
      const lowSubjects = Object.entries(skillData.bySubject)
        .filter(([, data]) => data.avgAccuracy < 70)
        .map(([code]) => code);
      insights.push({
        type: 'tip',
        title: 'การประมาณเวลา',
        message: `คุณมักใช้เวลามากกว่าที่ประมาณไว้ (ความแม่นยำ ${skillData.accuracy}%)${lowSubjects.length > 0 ? ` โดยเฉพาะวิชา ${lowSubjects.join(', ')}` : ''} ลองเพิ่มเวลาประมาณการ 20-30%`,
        severity: 'medium'
      });
    }

    // 6. Subject balance
    const subjectCount = {};
    pending.forEach(tsk => {
      subjectCount[tsk.subject] = (subjectCount[tsk.subject] || 0) + 1;
    });
    const maxSubject = Object.entries(subjectCount).sort((a, b) => b[1] - a[1])[0];
    if (maxSubject && maxSubject[1] >= 3 && Object.keys(subjectCount).length > 1) {
      insights.push({
        type: 'tip',
        title: 'สมดุลวิชา',
        message: `คุณมีงาน ${maxSubject[1]} งานในวิชา ${maxSubject[0]} (มากที่สุด) ควรกระจายการทำงานให้ทุกวิชาได้`,
        severity: 'low'
      });
    }

    // 7. Hard tasks approaching
    const hardTasks = pending.filter(tsk => (tsk.difficulty || 3) >= 4);
    if (hardTasks.length > 0) {
      const minDays = Math.min(...hardTasks.map(tsk => daysUntilCalc(tsk.deadline)));
      if (minDays <= 7) {
        insights.push({
          type: 'warning',
          title: 'งานยากใกล้ถึงกำหนด',
          message: `มี ${hardTasks.length} งานยากที่จะถึงกำหนดภายใน ${minDays < 0 ? 'เกินกำหนดแล้ว' : minDays === 0 ? 'วันนี้' : `${minDays} วัน`} ควรเริ่มทำทันที อย่ารอถึงวันสุดท้าย`,
          severity: minDays <= 2 ? 'high' : 'medium'
        });
      }
    }

    // 8. Motivation
    if (completedTasks.length > 0) {
      const dates = [...new Set(completedTasks.filter(tsk => tsk.completedDate).map(tsk => tsk.completedDate))].sort().reverse();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      let streak = 0;
      if (dates[0] === today || dates[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / 86400000;
          if (diff === 1) streak++;
          else break;
        }
      }
      if (streak >= 2) {
        insights.push({
          type: 'motivate',
          title: 'กำลังใจ',
          message: streak >= 7 ? `ทำติดต่อกัน ${streak} วันแล้ว! ยอดเยี่ยมมาก ไปต่อ! 🔥` : `ทำติดต่อกัน ${streak} วัน อย่าหยุดนะ! 💪`,
          severity: 'low'
        });
      }
    }

    // 9. Free time suggestion
    if (pending.length > 0 && overdue.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayTasks = pending.filter(tsk => tsk.deadline === today);
      if (todayTasks.length === 0) {
        const nextTask = [...pending].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];
        const days = daysUntilCalc(nextTask.deadline);
        if (days >= 3) {
          insights.push({
            type: 'tip',
            title: 'ไม่มีงานด่วนวันนี้',
            message: `วันนี้ไม่มีงานส่งด่วน งานเร็วที่สุดคือ "${nextTask.title}" (อีก ${days} วัน) ใช้เวลาว่างทบทวนบทเรียนหรือเริ่มงานล่วงหน้าได้`,
            severity: 'low'
          });
        }
      }
    }

    // 10. Completion rate
    if (completedTasks.length >= 3) {
      const recentCompleted = completedTasks.slice(-5);
      const avgAccuracy = recentCompleted.reduce((sum, tsk) => sum + Math.min((tsk.estimatedTime / tsk.actualTime) * 100, 150), 0) / recentCompleted.length;
      if (avgAccuracy >= 90) {
        insights.push({
          type: 'motivate',
          title: 'ทำได้ดีมาก',
          message: `5 งานล่าสุด คุณประมาณเวลาได้แม่น ${Math.round(avgAccuracy)}% ลองรับงานที่ท้าทายมากขึ้นได้`,
          severity: 'low'
        });
      }
    }

    return insights;
  };

  return (
    <AppContext.Provider value={{
      tasks, courses, timerState, completedLessons, currentWeek, teachers,
      addTask, updateTask, deleteTask, completeTask,
      addCourse, addTeacher, deleteTeacher,
      getTimerElapsed, timerStart, timerPause, timerResume, timerReset, timerFinish,
      toggleLesson, isLessonCompleted, getCourseProgress,
      getSkillData, getWeeklyAnalysis, getWeeklyProgress, getTaskAnalysis,
      setCurrentWeek
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
