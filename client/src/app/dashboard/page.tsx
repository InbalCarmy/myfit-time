// 'use client';
// import React, { useEffect, useState } from 'react';
// import './dashboard.css';
// import { useRouter } from 'next/navigation';
// import { collection, getDocs, query, where } from 'firebase/firestore';
// import { db, auth } from '@/firebase/firebaseConfig';
// import { onAuthStateChanged } from 'firebase/auth';



// export default function Dashboard() {
//   const router = useRouter();
//   const [weeklyDistance, setWeeklyDistance] = useState(0);
//   const [weeklyCalories, setWeeklyCalories] = useState(0);
//   const [averagePace, setAveragePace] = useState('0');


//   useEffect(() => {
//   const unsubscribe = onAuthStateChanged(auth, async (user) => {
//     if (!user) return;

//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // אפס את השעה של היום

//     const startOfWeek = new Date(today);
//     const dayOfWeek = today.getDay(); // Sunday = 0
//     startOfWeek.setDate(today.getDate() - dayOfWeek);
//     startOfWeek.setHours(0, 0, 0, 0);

//     const q = query(
//       collection(db, 'workouts'),
//       where('userId', '==', user.uid)
//     );

//     const snapshot = await getDocs(q);
//     let totalDistance = 0;
//     let totalCalories = 0;
//     let totalPace = 0;
//     let paceCount = 0;

//     snapshot.forEach(doc => {
//       const data = doc.data();

//       if (!data.date) return;

//       const workoutDate = new Date(data.date);
//       workoutDate.setHours(0, 0, 0, 0);

//       if (workoutDate >= startOfWeek && workoutDate <= today) {
//         totalDistance += parseFloat(data.distance || '0');
//         totalCalories += parseFloat(data.calories || '0');

//         if (data.pace && typeof data.pace === 'string') {
//           const [minStr, secStr] = data.pace.split("'");
//           const min = parseInt(minStr);
//           const sec = parseInt(secStr?.replace('"', ''));

//           if (!isNaN(min) && !isNaN(sec)) {
//             totalPace += min * 60 + sec;
//             paceCount++;
//           }
//         }
//       }
//     });

//     setWeeklyDistance(totalDistance);
//     setWeeklyCalories(totalCalories);

//     if (paceCount > 0) {
//       const avgSeconds = Math.round(totalPace / paceCount);
//       const avgMin = Math.floor(avgSeconds / 60);
//       const avgSec = avgSeconds % 60;
//       setAveragePace(`${avgMin}'${avgSec < 10 ? '0' : ''}${avgSec}"`);
//     }
//   });

//   return () => unsubscribe();
// }, []);
//   const user = auth.currentUser;
//   let displayName = user?.displayName;
//   if (!displayName && user?.email) {
//   displayName = user.email.split('@')[0]; // כל מה שלפני ה-@
// }

//   const hour = new Date().getHours();
//   let greeting = 'Good morning';

//   if (hour >= 12 && hour < 18) {
//     greeting = 'Good afternoon';
//   } else if (hour >= 18 || hour < 5) {
//     greeting = 'Good evening';
//   }



//   return (
//     <main className="dashboard-main">
//       <h1 className="greeting">{`${greeting}, ${displayName}!`}</h1>


//       <section className="dashboard-grid">
//         <div className="weekly-running">
//           <h3>This week running</h3>

//           <div className="row">
//             <div className="stats">
//               <span>{weeklyCalories} kcal</span>
//               <span>{averagePace} Avg. Pace</span>
//             </div>
//             <div className="distance">{weeklyDistance.toFixed(2)} km</div>
//           </div>

//           <div className="dots">
//             <div className="dot green"></div>
//             <div className="dot white"></div>
//             <div className="dot white"></div>
//             <div className="dot white"></div>
//             <div className="dot green"></div>
//             <div className="dot white"></div>
//             <div className="dot dark"></div>
//           </div>
//         </div>

//         <div className="next-workout card">
//           <h4>Your Next Workout</h4>
//           <p>Saturday, April 7 | 6:00 PM</p>
//           <p>| Port TLV</p>
//         </div>

//         <div className="weekly-goal card">
//           <h4>Your weekly goal</h4>
//           <div className="circle-goal">
//             <svg width="130" height="130" viewBox="0 0 40 40" className="progress-ring">
//               <path
//                 className="progress-bg"
//                 d="M18 2.0845
//                   a 15.9155 15.9155 0 0 1 0 31.831
//                   a 15.9155 15.9155 0 0 1 0 -31.831"
//                 fill="none"
//                 stroke="#eeeeee"
//                 strokeWidth="5"
//               />
//               <path
//                 className="progress-bar"
//                 d="M18 2.0845
//                   a 15.9155 15.9155 0 0 1 0 31.831
//                   a 15.9155 15.9155 0 0 1 0 -31.831"
//                 fill="none"
//                 stroke="#4e7077"
//                 strokeWidth="5"
//                 strokeDasharray="75, 100"
//               />
//             </svg>
//             <div className="goal-label">15 km</div>
//           </div>
//         </div>

//         <div className="challenge card">
//           <div className="card-header">
//             <img src="/challenge-icon.png" alt="Challenge Icon" className="challenge-icon" />
//             <h4>Challenge of the week</h4>
//           </div>
//           <p>Sprint the last 500 meters of your third run this week</p>
//           <small>Push your limits and finish strong!</small>
//           <div className="challenge-icons">
//             <span className="pill">Run 1</span>
//             <span className="pill">Run 2</span>
//             <span className="pill-qlock">⏱</span>
//           </div>
//         </div>
//       </section>

//       <nav className="side-nav">
//         <button onClick={() => router.push('/diary')} className="nav-btn">
//           <img src="/diary.png" alt="Diary" />
//         </button>
//         <button onClick={() => router.push('/calendar')} className="nav-btn">
//           <img src="/calendar.png" alt="Calendar" />
//         </button>
//         <button onClick={() => router.push('/insights')} className="nav-btn">
//           <img src="/insights.png" alt="Insights" />
//         </button>
//         <button onClick={() => router.push('/profile')} className="nav-btn">
//           <img src="/profile.png" alt="Profile" />
//         </button>
//       </nav>
//     </main>
//   );
// }


'use client';
import React, { useEffect, useState } from 'react';
import './dashboard.css';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function Dashboard() {
  const router = useRouter();
  const [weeklyDistance, setWeeklyDistance] = useState(0);
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  const [averagePace, setAveragePace] = useState('0');
  const [nextWorkout, setNextWorkout] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      let totalDistance = 0;
      let totalCalories = 0;
      let totalPace = 0;
      let paceCount = 0;

      snapshot.forEach(doc => {
        const data = doc.data();

        if (!data.date) return;

        const workoutDate = new Date(data.date);
        workoutDate.setHours(0, 0, 0, 0);

        if (workoutDate >= startOfWeek && workoutDate <= today) {
          totalDistance += parseFloat(data.distance || '0');
          totalCalories += parseFloat(data.calories || '0');

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

      // 🔍 שליפת האימון הבא
      const todayStr = new Date().toISOString().split('T')[0];

      const plannedQuery = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid),
        where('status', '==', 'planned'),
        where('date', '>=', todayStr),
        orderBy('date'),
        limit(1)
      );

      const plannedSnapshot = await getDocs(plannedQuery);
      if (!plannedSnapshot.empty) {
        setNextWorkout(plannedSnapshot.docs[0].data());
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
          <h3>This week running</h3>

          <div className="row">
            <div className="stats">
              <span>{weeklyCalories} kcal</span>
              <span>{averagePace} Avg. Pace</span>
            </div>
            <div className="distance">{weeklyDistance.toFixed(2)} km</div>
          </div>

          <div className="dots">
            <div className="dot green"></div>
            <div className="dot white"></div>
            <div className="dot white"></div>
            <div className="dot white"></div>
            <div className="dot green"></div>
            <div className="dot white"></div>
            <div className="dot dark"></div>
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
            <p>No upcoming workout planned</p>
          )}
        </div>

        <div className="weekly-goal card">
          <h4>Your weekly goal</h4>
          <div className="circle-goal">
            <svg width="130" height="130" viewBox="0 0 40 40" className="progress-ring">
              <path
                className="progress-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#eeeeee"
                strokeWidth="5"
              />
              <path
                className="progress-bar"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#4e7077"
                strokeWidth="5"
                strokeDasharray="75, 100"
              />
            </svg>
            <div className="goal-label">15 km</div>
          </div>
        </div>

        <div className="challenge card">
          <div className="card-header">
            <img src="/challenge-icon.png" alt="Challenge Icon" className="challenge-icon" />
            <h4>Challenge of the week</h4>
          </div>
          <p>Sprint the last 500 meters of your third run this week</p>
          <small>Push your limits and finish strong!</small>
          <div className="challenge-icons">
            <span className="pill">Run 1</span>
            <span className="pill">Run 2</span>
            <span className="pill-qlock">⏱</span>
          </div>
        </div>
      </section>

      <nav className="side-nav">
        <button onClick={() => router.push('/diary')} className="nav-btn">
          <img src="/diary.png" alt="Diary" />
        </button>
        <button onClick={() => router.push('/calendar')} className="nav-btn">
          <img src="/calendar.png" alt="Calendar" />
        </button>
        <button onClick={() => router.push('/insights')} className="nav-btn">
          <img src="/insights.png" alt="Insights" />
        </button>
        <button onClick={() => router.push('/profile')} className="nav-btn">
          <img src="/profile.png" alt="Profile" />
        </button>
      </nav>
    </main>
  );
}
