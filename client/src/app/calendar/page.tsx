// // app/calendar/page.tsx
// 'use client';

// import React from 'react';
// import './calendar.css';

// const CalendarPage = () => {
//   const suggestedSlots = [
//     { day: 'Today', time: '18:00 - 18:45' },
//     { day: 'Wed', time: '07:00 - 07:30' },
//     { day: 'Fri', time: '14:00 - 15:00' }
//   ];

//   return (
//     <div className="calendar-container">
//       <div className="week-bar">
//         {[
//           'Sunday, April 1',
//           'Sunday, April 2',
//           'Sunday, April 3',
//           'Sunday, April 4',
//           'Sunday, April 5',
//           'Sunday, April 6',
//           'Sunday, April 7'
//         ].map((day, i) => (
//           <div key={i} className="day-wrapper">
//             <p className="day-label">{day}</p>

//           <div className={`day-card fade-${i + 1} ${i === 0 ? 'active' : ''}`}>
//             {i === 0 ? (
//               <div className="workout-complete">
//                 <img src="/check.png" alt="check" className="day-icon" />
//                 <p>running completed:</p>
//                 <p>• 6.4 km</p>
//                 <p>• 310 kcal</p>
//                 <p>• 6'04"</p>
//               </div>
//             ) : i === 1 || i === 5 || i === 6 ? (
//               <div className="workout-time">
//                 <img src="/clock.png" alt="clock" className="day-icon" />
//                 <p>
//                   {i === 1
//                     ? '6:00 PM'
//                     : i === 5
//                     ? '9:00 AM'
//                     : '10:00 PM'} • Intervals
//                 </p>
//               </div>
//             ) : (
//               <div className="add-workout">
//                 <img src="/plus.png" alt="plus" className="day-icon" />
//                 <p>Add workout</p>
//               </div>
//             )}
//           </div>

//           </div>
//         ))}
//       </div>

//       <div className="line-divider"></div>
//       <button className="find-time-btn">
//         <img src="/clock.png" alt="clock" className="btn-icon" />
//         Find time for a workout
//       </button>

//       <div className="suggested-section">
//         <p className="suggested-title">
//           <img src="/calendar.png" alt="calendar icon" className="suggested-icon" />
//           Suggested slots:
//         </p>

//         <div className="suggested-boxes">
//           {suggestedSlots.map((slot, i) => (
//             <div key={i} className="suggested-slot">
//               <span>• {slot.day} • {slot.time}</span>
//               <button className="add-slot-btn">＋</button>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="line-divider"></div>


//     </div>
//   );
// };

// export default CalendarPage;

'use client';

import React, { useState } from 'react';
import './calendar.css';
import PlanWorkoutModal from '@/components/PlanWorkoutModal';

const getCurrentWeekDates = (): string[] => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek); // התחלה מראשון

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d.toISOString().split('T')[0]; // yyyy-mm-dd
  });
};


const CalendarPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const userId = 'inbal'; // תחליפי ל־userId דינמי בעתיד

  const suggestedSlots = [
    { day: 'Today', time: '18:00 - 18:45' },
    { day: 'Wed', time: '07:00 - 07:30' },
    { day: 'Fri', time: '14:00 - 15:00' }
  ];

  const handleOpenModal = (date: string) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleWorkoutSaved = () => {
    // בעתיד תוסיפי כאן טעינה מחדש של האימונים
    console.log('Workout saved!');
  };

  return (
    <div className="calendar-container">
      <div className="week-bar">
        {getCurrentWeekDates().map((day, i) => (

          <div key={i} className="day-wrapper">
            <p className="day-label">
              {new Date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>


            <div className={`day-card fade-${i + 1}`}>
              {i === 1 || i === 5 || i === 6 ? (
                <div className="workout-time">
                  <img src="/clock.png" alt="clock" className="day-icon" />
                  <p>
                    {i === 1
                      ? '6:00 PM'
                      : i === 5
                      ? '9:00 AM'
                      : '10:00 PM'} • Intervals
                  </p>
                </div>
              ) : i === 0 ? (
                <div className="workout-complete">
                  <img src="/check.png" alt="check" className="day-icon" />
                  <p>running completed:</p>
                  <p>• 6.4 km</p>
                  <p>• 310 kcal</p>
                  <p>• 6'04\"</p>
                </div>
              ) : (
                <div
                  className="add-workout"
                  onClick={() => handleOpenModal(day)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src="/plus.png" alt="plus" className="day-icon" />
                  <p>Add workout</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="line-divider"></div>

      <button className="find-time-btn">
        <img src="/clock.png" alt="clock" className="btn-icon" />
        Find time for a workout
      </button>

      <div className="suggested-section">
        <p className="suggested-title">
          <img src="/calendar.png" alt="calendar icon" className="suggested-icon" />
          Suggested slots:
        </p>

        <div className="suggested-boxes">
          {suggestedSlots.map((slot, i) => (
            <div key={i} className="suggested-slot">
              <span>• {slot.day} • {slot.time}</span>
              <button className="add-slot-btn">＋</button>
            </div>
          ))}
        </div>
      </div>

      <div className="line-divider"></div>

      {isModalOpen && (
        <PlanWorkoutModal
          date={selectedDate}
          userId={userId}
          onClose={handleCloseModal}
          onSave={handleWorkoutSaved}
        />
      )}
    </div>
  );
};

export default CalendarPage;
