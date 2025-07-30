'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { doc,addDoc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { ensureGoogleCalendarAccess, fetchGoogleCalendarEvents, getFreeTimeSlotsUntilTargetDate } from '@/utils/googleCalendar';
import { format } from 'date-fns';
import './smartPlan.css';
import SideNav from '@/components/SideNav'; 
import toast from 'react-hot-toast';



export default function SmartPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [smartPlan, setSmartPlan] = useState<any>(null);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

useEffect(() => {
  const savedPlan = localStorage.getItem("savedSmartPlan");
  if (savedPlan) {
    const parsed = JSON.parse(savedPlan);

    // parsed.plan = כל התוכנית עם האימונים
    // parsed.userData = המידע של המשתמש (trainingGoal, targetDate וכו')

    setSmartPlan(parsed.plan);
    setUserData(parsed.userData);
  }
}, []);



  const generatePlan = async () => {
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      router.push('/');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    setUserData(userData);

    const workoutsRef = collection(db, 'workouts');
    const workoutsQuery = query(
      workoutsRef,
      where('userId', '==', user.uid),
      where('status', '==', 'completed'),
      orderBy('date', 'desc')
    );
    const workoutsSnap = await getDocs(workoutsQuery);
    const diaryData: any[] = workoutsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDiaryEntries(diaryData);

    const token = await ensureGoogleCalendarAccess();
    if (!token) {
      setLoading(false);
      return;
    }

    const events = await fetchGoogleCalendarEvents(token);
    const existingDates = diaryData.map(entry => entry.date);
    const preferredTime = userData.preferredTime || 'morning';
    const freeSlots = getFreeTimeSlotsUntilTargetDate(
      events,
      existingDates,
      preferredTime,
      new Date(userData.trainingGoal?.targetDate)
    );

    const response = await fetch('/api/smart-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trainingGoal: userData.trainingGoal,
        targetDate: userData.trainingGoal?.targetDate,
        preferredWorkoutsPerWeek: userData.preferredWorkoutsPerWeek,
        diaryEntries: diaryData,
        freeSlots,
      }),
    });

    const aiPlan = await response.json();
    setSmartPlan(aiPlan);
    console.log('🤖 AI Smart Plan:', aiPlan);

    setLoading(false);
  };

  const regeneratePlan = async () => {
  // מוחקים את הישנה מה-localStorage כדי לא להציג אותה יותר
  localStorage.removeItem("savedSmartPlan");
  await generatePlan();
};


  // פונקציה לקיבוץ לפי שבועות
function groupWorkoutsByWeek(workouts: any[]) {
  // קודם כל נמיין את האימונים לפי תאריך מהישן לחדש
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weeksMap = new Map<string, any[]>(); // key = startOfWeek (ISO string)

  sortedWorkouts.forEach((workout) => {
    const workoutDate = new Date(workout.date);

    // נמצא את יום ראשון של השבוע של האימון הזה
    const day = workoutDate.getDay(); // 0=Sunday, 1=Monday...
    const diffToSunday = day; // כי יום ראשון זה 0
    const sunday = new Date(workoutDate);
    sunday.setDate(workoutDate.getDate() - diffToSunday);
    sunday.setHours(0, 0, 0, 0);

    const sundayKey = sunday.toISOString();

    // מוסיפים את האימון לשבוע המתאים
    if (!weeksMap.has(sundayKey)) {
      weeksMap.set(sundayKey, []);
    }
    weeksMap.get(sundayKey)!.push(workout);
  });

  // ממירים את המפה למערך עם start + workouts, וממיינים לפי התאריך של ראשון
  const weeks = Array.from(weeksMap.entries()).map(([startKey, weekWorkouts]) => ({
    start: new Date(startKey),
    workouts: weekWorkouts,
  }));

  weeks.sort((a, b) => a.start.getTime() - b.start.getTime());

  return weeks;
}


// const savePlanToFirestore = async () => {
//   if (!auth.currentUser) return;

//   try {
//     const user = auth.currentUser;

//     for (const workout of smartPlan.workouts) {
//       await addDoc(collection(db, "workouts"), {
//         userId: user.uid,
//         date: workout.date,          // התאריך של האימון
//         time: workout.time,          // השעה שה-AI נתן
//         type: workout.type,          // סוג האימון
//         distance: workout.distance,  // המרחק
//         status: "planned",           // שומר כמתוכנן
//         createdAt: new Date().toISOString(),
//       });
//     }

//     alert("✅ Plan saved successfully! It will now appear in your Calendar.");
//   } catch (err) {
//     console.error("Error saving plan:", err);
//     alert("❌ Failed to save the plan. Try again.");
//   }
// };

const savePlanToFirestore = async () => {
  if (!auth.currentUser) return;

  try {
    const user = auth.currentUser;

    for (const workout of smartPlan.workouts) {
      await addDoc(collection(db, "workouts"), {
        userId: user.uid,
        date: workout.date,
        time: workout.time,
        type: workout.type,
        distance: workout.distance,
        status: "planned",
        createdAt: new Date().toISOString(),
      });
    }

    // ✅ כאן נוסיף שמירה ל-localStorage
    localStorage.setItem("savedSmartPlan", JSON.stringify(smartPlan));
    // ✅ נשמור גם את התוכנית וגם את userData
    localStorage.setItem(
      "savedSmartPlan",
      JSON.stringify({
        plan: smartPlan,
        userData: userData
      })
    );

  toast.success("Plan saved successfully! It will now appear in your Calendar.");
  } catch (err) {
    console.error("Error saving plan:", err);
  toast.error("❌ Failed to save the plan. Try again.");
  }
};


const savePlanToGoogleCalendar = async () => {
  try {
    // מבטיחים שהמשתמש מחובר לגוגל ויש לנו token
    const token = await ensureGoogleCalendarAccess();
    if (!token) {
      console.warn("No Google Calendar token found");
      return;
    }

    for (const workout of smartPlan.workouts) {
      const workoutDate = new Date(workout.date);
      const [hour, minute] = workout.time.split(":").map(Number);

      // סט זמן התחלה
      workoutDate.setHours(hour, minute, 0, 0);

      // זמן סיום (נוסיף שעה אחת כברירת מחדל)
      const workoutEnd = new Date(workoutDate.getTime() + 60 * 60 * 1000);

      const event = {
        summary: `${workout.type} – ${workout.distance}`,
        description: "Planned by MyFitTime AI Smart Plan 🏃‍♀️",
        start: {
          dateTime: workoutDate.toISOString(),
          timeZone: "Asia/Jerusalem", // או לשנות לפי אזור זמן שלך
        },
        end: {
          dateTime: workoutEnd.toISOString(),
          timeZone: "Asia/Jerusalem",
        },
      };

      // שולחים לגוגל
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to create event:", errorData);
      }
    }

    toast.success("Your plan has been saved to Google Calendar!");
  } catch (err) {
    console.error("Error saving plan to Google Calendar:", err);
    toast.error("❌ Failed to save plan to Google Calendar.");
  }
};



const groupedByWeek = smartPlan?.workouts
  ? groupWorkoutsByWeek(smartPlan.workouts)
  : [];

  return (
    <div className="smart-plan-page">
      {/* תיבה שקופה עם gradient */}
      <div className="smart-plan-overlay">
        {/* מצב ראשוני */}
        {!smartPlan && !loading && (
          <div className="smart-plan-content">
            <h1 className="smart-plan-title">AI Smart Plan</h1>
            <button className="smart-plan-ai-btn" onClick={generatePlan}>
              <img src="/ai-icon.png" alt="AI Icon" />
            </button>
          </div>
        )}

        {/* בזמן טעינה */}
        {loading && (
          <div className="smart-plan-loading">
            Generating your plan...
          </div>
        )}

        {/* אחרי שהתוכנית מוכנה */}
        {smartPlan && (
          <div className="smart-plan-ready-container">
            <h2 className="smart-plan-ready">Your Smart Plan is Ready!</h2>
            <p className="smart-plan-subtitle">
              This plan was created based on your goal, past runs, availability and preferences
            </p>

            {groupedByWeek.length > 0 && (
              <div className="smart-plan-week">
                {/* ניווט שבועות */}
                <div className="week-header">
                  <button
                    disabled={currentWeekIndex === 0}
                    onClick={() => setCurrentWeekIndex((i) => Math.max(0, i - 1))}
                    className="week-nav-btn"
                  >
                    <img src="/left-arrow-blue.png" alt="Previous Week" />
                  </button>

                  <span className="week-range">
                    Week of {format(groupedByWeek[currentWeekIndex].start, "MMM dd")} –{" "}
                    {format(
                      new Date(
                        groupedByWeek[currentWeekIndex].start.getTime() + 6 * 24 * 60 * 60 * 1000
                      ),
                      "MMM dd"
                    )}
                  </span>


                  <button
                    disabled={currentWeekIndex === groupedByWeek.length - 1}
                    onClick={() =>
                      setCurrentWeekIndex((i) => Math.min(groupedByWeek.length - 1, i + 1))
                    }
                    className="week-nav-btn"
                  >
                    <img src="/right-arrow-blue.png" alt="Next Week" />
                  </button>
                </div>


                <hr />

                <ul className="week-workouts">
                  {groupedByWeek[currentWeekIndex].workouts.map((w, idx) => (
                <li key={idx}>
                  • {w.date ? format(new Date(w.date), 'EEEE') : 'Unknown Day'} – {w.type || 'N/A'}, {w.distance || '0'} km at {w.time || 'N/A'}
                </li>

                  ))}
                </ul>

                <hr />

                {/* סיכום */}
                <div className="smart-plan-summary">
                  <p>
                    <strong>Goal:</strong> {userData?.trainingGoal?.type} 
                  </p>
                  <p>
                <strong>Race Day:</strong>{' '}
                {userData?.trainingGoal?.targetDate
                  ? format(new Date(userData.trainingGoal.targetDate), 'MMM d, yyyy')
                  : 'N/A'}

                  </p>
                  <p>
                    Total weeks: {groupedByWeek.length} | Total sessions:{' '}
                    {smartPlan.workouts.length}
                  </p>
                </div>

                {/* כפתורים */}
              {loading ? (
                <div className="smart-plan-loading">Regenerating your plan...</div>
              ) : (
                <div className="smart-plan-actions">
                  <button className="plan-btn" onClick={savePlanToFirestore}>
                    Save This Plan
                  </button>
                  <button className="plan-btn" onClick={savePlanToGoogleCalendar}>
                    Save to Google Calendar
                  </button>
                  <button className="plan-btn" onClick={regeneratePlan}>
                    Regenerate Plan
                  </button>
                </div>
              )}

              </div>
            )}
          </div>
        )}
      </div>
        <SideNav />

    </div>
  );

  }
