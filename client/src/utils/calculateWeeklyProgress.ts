// utils/calculateWeeklyProgress.ts
import { Timestamp } from 'firebase/firestore';

export type WeeklyGoalType = 'distance' | 'runs' | 'time';

export interface WeeklyGoal {
  type: WeeklyGoalType;
  value: number;
}

export interface RunEntry {
  date: Timestamp;          // תאריך האימון
  distance ?: number;      // מרחק בק"מ
  durationMin?: number;     // משך בדקות
}

export function calculateWeeklyProgress(goal: WeeklyGoal, runs: RunEntry[]): number {
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = now.getDay(); // 0 = Sunday
  const diffToSunday = day;
  startOfWeek.setDate(now.getDate() - diffToSunday);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // סינון אימונים שבוצעו השבוע
  const weeklyRuns = runs.filter((run) => {
const runDate = typeof run.date === 'string' ? new Date(run.date) : run.date.toDate();
    return runDate >= startOfWeek && runDate <= endOfWeek;
  });

  let progress = 0;

  switch (goal.type) {
    case 'distance':
      progress = weeklyRuns.reduce((acc, run) => acc + (run.distance  || 0), 0);
      break;
    case 'runs':
      progress = weeklyRuns.length;
      break;
    case 'time':
      progress = weeklyRuns.reduce((acc, run) => acc + (run.durationMin || 0), 0);
      break;
  }

  // החזרת ערך בין 0 ל-1
  return Math.min(progress / goal.value, 1);
}
