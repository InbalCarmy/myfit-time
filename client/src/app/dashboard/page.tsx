// 'use client';
// import React from 'react';
// import './dashboard.css';
// import { useRouter } from 'next/navigation';

// export default function Dashboard() {
//   const router = useRouter();

//   return (
//     <main className="dashboard-main">

//       <h1 className="greeting">Good Morning Inbal!</h1>

//       <section className="top-section">
//         <div className="weekly-running">
//           <h3>This week running</h3>
//           <p className="date-range">1-7 April 2025</p>

//           <div className="row">
//             <div className="stats">
//               <span>756 kcal</span>
//               <span>9'54" Avg. Pace</span>
//             </div>
//             <div className="distance">10.59 km</div>
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


//         <div className="card next-workout">
//           <h4>Your Next Workout</h4>
//           <p>Saturday, April 7 | 6:00 PM</p>
//           <p>Port TLV</p>
//         </div>
//       </section>

//       <section className="middle-section">
//          <div className="card weekly-goal">
//           <h4>Your weekly goal</h4>
//           {/* <div className="circle-goal">
//             <span className="goal-value">15 km</span>
//           </div> */}
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
//               <div className="goal-label">15 km</div>

//           </div>

//         </div>

//         <div className="card challenge">
//           <div className="card-header">
//               <img src="/challenge-icon.png" alt="Challenge Icon" className="challenge-icon" />
//               <h4>Challenge of the week</h4>
//             </div>
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
import React from 'react';
import './dashboard.css';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  return (
    <main className="dashboard-main">
      <h1 className="greeting">Good Morning Inbal!</h1>

      <section className="dashboard-grid">

        <div className="weekly-running">
          <h3>This week running</h3>
          <p className="date-range">1-7 April 2025</p>

          <div className="row">
            <div className="stats">
              <span>756 kcal</span>
              <span>9'54" Avg. Pace</span>
            </div>
            <div className="distance">10.59 km</div>
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
          <p>Saturday, April 7 | 6:00 PM</p>
          <p>| Port TLV</p>
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
