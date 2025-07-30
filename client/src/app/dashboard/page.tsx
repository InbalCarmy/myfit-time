'use client';
import React, { useEffect, useState } from 'react';
import './dashboard.css';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc} from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { calculateWeeklyProgress, RunEntry, WeeklyGoal } from '@/utils/calculateWeeklyProgress';
import { ensureGoogleCalendarAccess, fetchGoogleCalendarEvents, getFreeTimeSlotsFiltered, } from '@/utils/googleCalendar';
import Link from 'next/link';
import SideNav from '@/components/SideNav'; 



export default function Dashboard() {
  const router = useRouter();
  const [weeklyDistance, setWeeklyDistance] = useState(0);
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  const [averagePace, setAveragePace] = useState('0');
  const [nextWorkout, setNextWorkout] = useState<any>(null);
  const [weeklyStatus, setWeeklyStatus] = useState<string[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [goalText, setGoalText] = useState('');   
  const [freeTimeSlots, setFreeTimeSlots] = useState<{ start: Date; end: Date }[]>([]);
  const [preferredTime, setPreferredTime] = useState('morning');
  interface UserData {
  name?: string;
  email?: string;
  photoURL?: string;
  weeklyGoal?: {
    type: string;
    value: number;
  };
  weeklyChallenge?: any;
  preferredTime?: 'morning' | 'afternoon' | 'evening';
  reminderEnabled?: boolean;
}

const [userData, setUserData] = useState<UserData | null>(null);
  const handleFindTime = async () => {
    const token = await ensureGoogleCalendarAccess();
    if (!token) return;

    const events = await fetchGoogleCalendarEvents(token);

    const allWorkouts = await getDocs(
      query(collection(db, 'workouts'), where('userId', '==', auth.currentUser?.uid))
    );

    const workoutDates = allWorkouts.docs.map((doc) => {
      const data = doc.data();
      const workoutDate = new Date(data.date.toDate?.() ?? data.date);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.toISOString().split('T')[0];
    });

    const suggestions = getFreeTimeSlotsFiltered(events, workoutDates, preferredTime as 'morning' | 'afternoon' | 'evening' );
    setFreeTimeSlots(suggestions);
  };

  function parseDurationToMinutes(duration: string): number {
  const [minStr, secStr] = duration.split(':');
  const minutes = parseInt(minStr || '0');
  const seconds = parseInt(secStr || '0');
  return isNaN(minutes) ? 0 : minutes + Math.floor((seconds || 0) / 60);
  }
  
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay(); // Sunday = 0
    const offset = dayOfWeek === 0 ? 0 : -dayOfWeek;
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', user.uid)
    );

    const snapshot = await getDocs(q);

    let totalDistance = 0;
    let totalCalories = 0;
    let totalPace = 0;
    let paceCount = 0;

    const weeklyMap: Record<string, string> = {};

    const completedRuns: RunEntry[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.date) return;

      const workoutDate = new Date(data.date.toDate?.() ?? data.date);
      workoutDate.setHours(0, 0, 0, 0);
      const dateStr = workoutDate.toISOString().split('T')[0];

      // סטטוסים לשבוע
      if (workoutDate >= startOfWeek && workoutDate <= endOfWeek) {
        weeklyMap[dateStr] = data.status;
      }

      // חישובים רק לאימונים שבוצעו
      if (
        workoutDate >= startOfWeek &&
        workoutDate <= today &&
        data.status === 'completed'
      ) {
        totalDistance += parseFloat(data.distance || '0');
        totalCalories += parseFloat(data.calories || '0');

        // לסטטוס ההתקדמות
        completedRuns.push({
          date: data.date,
          distance: parseFloat(data.distance || '0'),
          durationMin: parseDurationToMinutes(data.duration || ''),
        });

        // ממוצע קצב
        if (data.pace && typeof data.pace === 'string') {
          const [minStr, secStr] = data.pace.split("'");
          const min = parseInt(minStr);
          const sec = parseInt(secStr?.replace('"', ''));

          if (!isNaN(min) && !isNaN(sec)) {
            totalPace += min * 60 + sec;
            paceCount++;
          }
        }
      }
    });

    setWeeklyDistance(totalDistance);
    setWeeklyCalories(totalCalories);

    if (paceCount > 0) {
      const avgSeconds = Math.round(totalPace / paceCount);
      const avgMin = Math.floor(avgSeconds / 60);
      const avgSec = avgSeconds % 60;
      setAveragePace(`${avgMin}'${avgSec < 10 ? '0' : ''}${avgSec}"`);
    }

    // יצירת סטטוסים מראשון עד שבת
    const days: string[] = Array.from({ length: 7 }, (_, i) =>
      new Date(startOfWeek.getTime() + i * 86400000).toISOString().split('T')[0]
    );

    const statuses = days.map((d) =>
      weeklyMap[d] === 'completed'
        ? 'dark'
        : weeklyMap[d] === 'planned'
        ? 'green'
        : 'white'
    );
    setWeeklyStatus(statuses);

    // 🔄 חישוב התקדמות לעבר מטרה
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const weeklyGoal = userData.weeklyGoal;

      if (weeklyGoal) {
        const percent = calculateWeeklyProgress(weeklyGoal, completedRuns)*100;
        setProgressPercent(percent);

        const label =
          weeklyGoal.value +
          ' ' +
          (weeklyGoal.type === 'distance'
            ? 'km'
            : weeklyGoal.type === 'runs'
            ? 'workouts'
            : 'minutes');

        setGoalText(label);
      }
        setPreferredTime(userData.preferredTime || 'morning');

    }

  // שליפת כל האימונים המתוכננים מהעתיד
    const plannedQuery = query(
      collection(db, 'workouts'),
      where('userId', '==', user.uid),
      where('status', '==', 'planned')
    );

    const plannedSnapshot = await getDocs(plannedQuery);
    const now = new Date();

    let closestWorkout: any = null;
    let minDiff = Infinity;

    plannedSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.date || !data.time) return;

      const workoutDate = new Date(`${data.date}T${data.time}`);
      const diff = workoutDate.getTime() - now.getTime();

      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        closestWorkout = data;
      }
    });

    if (closestWorkout) {
      setNextWorkout(closestWorkout);
    } else {
      setNextWorkout(null);
    }

  });

  return () => unsubscribe();
}, []);


  const user = auth.currentUser;
  let displayName = user?.displayName;
  if (!displayName && user?.email) {
    displayName = user.email.split('@')[0];
  }

  const hour = new Date().getHours();
  let greeting = 'Good morning';

  if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon';
  } else if (hour >= 18 || hour < 5) {
    greeting = 'Good evening';
  }

  return (
    <main className="dashboard-main">
      <h1 className="greeting">{`${greeting}, ${displayName}!`}</h1>

      <section className="dashboard-grid">
        <div className="weekly-running">
          <h3>This Week Running</h3>

          <div className="row">
            <div className="stats">
              <span>{weeklyCalories} kcal</span>
              <span>{averagePace} Avg. Pace</span>
            </div>
            <div className="distance">{weeklyDistance.toFixed(2)} km</div>
          </div>
          <div className="dots">
            {weeklyStatus.map((status, index) => (
              <div key={index} className={`dot ${status}`}></div>
            ))}
          </div>
        </div>
        
        <div className="next-workout card">
          <h4>Your Next Workout</h4>
          {nextWorkout ? (
            <>
              <p>
                {new Date(nextWorkout.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })} | {nextWorkout.time}
              </p>
              <p>| {nextWorkout.type}</p>
            </>
          ) : (
            <div className="dashboard-suggestions">
              <p>Free to train? Try these times:</p>
              <button className="find-time-btn dashboard-btn" onClick={handleFindTime}>
                <img src="/blue-clock.png" alt="clock" className="btn-icon" />
                Find time for a workout
              </button>

              {freeTimeSlots.length > 0 && (
                <div className="suggested-section">
                  <p className="suggested-title dashboard-suggested">
                    <img src="/blue-calendar.png" alt="calendar icon" className="suggested-icon dashboard-icon" />
                    Suggested slots:
                  </p>
                  <div className="suggested-boxes">
                    {freeTimeSlots.map((slot, i) => {
                      const start = new Date(slot.start);
                      const timeRange = `${start.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} - ${new Date(slot.end).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`;
                      return (
                        <div key={i} className="suggested-slot">
                          • {start.toLocaleDateString('en-US', { weekday: 'short' })} • {timeRange}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

          <div className="smart-plan card">
            <div className="smart-plan-header">
              <img src="/ai-icon.png" alt="Smart Plan Icon" className="smart-plan-icon" />
              <h4 className="smart-plan-title">Smart Plan</h4>
            </div>
            <button className="smart-plan-btn" onClick={() => router.push('/smart-plan')}>
              Generate Smart Plan
            </button>
          </div>

        <div className="weekly-goal card">
          <h4>Your Weekly Goal</h4>
          <div className="circle-goal">
            <svg width="130" height="130" viewBox="0 0 40 40" className="progress-ring">
              <path
                className="progress-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#fff" strokeWidth="5"
              />
              <path
                className="progress-bar"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#4e7077" strokeWidth="5"
                strokeDasharray={`${progressPercent}, 100`}
              />
            </svg>
            <div className="goal-label">{goalText}</div>
          </div>
        </div>
      </section>

        <SideNav />

    </main>
  );
}
