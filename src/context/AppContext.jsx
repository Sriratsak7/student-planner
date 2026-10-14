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

  const [timerState, setTimerState] = useState({ taskId: null, startTime: null, elapsed: 0, running: false });
  const [currentWeek, setCurrentWeek] = useState(5);

  useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('courses', JSON.stringify(courses)); }, [courses]);

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
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'completed', actualTime, completedDate: today } : t
    ));
  };

  const addCourse = (course) => {
    const newCourse = { ...course, id: Date.now() };
    setCourses(prev => [...prev, newCourse]);
  };

  const startTimer = (taskId) => {
    setTimerState({ taskId, startTime: Date.now(), elapsed: 0, running: true });
  };

  const stopTimer = () => {
    if (!timerState.running) return 0;
    const elapsed = (Date.now() - timerState.startTime) / 3600000; // hours
    setTimerState(prev => ({ ...prev, running: false, elapsed }));
    return elapsed;
  };

  // Skill calculation
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

  // Weekly analysis
  const getWeeklyAnalysis = () => {
    return courses.map(course => {
      const weekData = course.schedule.find(s => s.week === currentWeek);
      const skillData = getSkillData();
      const subjectSkill = skillData.bySubject[course.code];
      
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
      }

      return { course, weekData, recommendation, urgency };
    });
  };

  return (
    <AppContext.Provider value={{
      tasks, courses, timerState, currentWeek,
      addTask, updateTask, deleteTask, completeTask,
      addCourse, startTimer, stopTimer,
      getSkillData, getWeeklyAnalysis,
      setCurrentWeek
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
