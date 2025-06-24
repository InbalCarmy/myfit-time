'use client';

import React, { useState, useEffect } from 'react';
import './calendar.css';
import PlanWorkoutModal from '@/components/PlanWorkoutModal';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseConfig';
import { startOfWeek, endOfWeek, format } from 'date-fns';



const getCurrentWeekDates = (): string[] => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
};

const formatTime = (time: string) => {
  const [h, m] = time.split(':');
  const date = new Date();
  date.setHours(Number(h));
  date.setMinutes(Number(m));
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const CalendarPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [workouts, setWorkouts] = useState<Record<string, any>>({});
  const [userId, setUserId] = useState<string | null>(null);

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
    if (userId) fetchWorkouts(userId);
  };

  const fetchWorkouts = async (uid: string) => {
    const start = format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd');
    const end = format(endOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd');

    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', uid),
      where('date', '>=', start),
      where('date', '<=', end)
    );

    const snapshot = await getDocs(q);
    const data: Record<string, any> = {};

    snapshot.forEach(doc => {
      const workout = doc.data();
      data[workout.date] = workout;
    });

    setWorkouts(data);
  };

  const handleCancelWorkout = async (date: string) => {
  if (!userId) return;

  const q = query(
    collection(db, 'workouts'),
    where('userId', '==', userId),
    where('date', '==', date),
    where('status', '==', 'planned')
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docRef = snapshot.docs[0].ref;
    await deleteDoc(docRef);
    fetchWorkouts(userId); // רענון
  }
};


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
        fetchWorkouts(user.uid);
      } else {
        setUserId(null);
        setWorkouts({});
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="calendar-container">
      <div className="week-bar">
        {getCurrentWeekDates().map((day, i) => {
          const workout = workouts[day];

          return (
            <div key={i} className="day-wrapper">
              <p className="day-label">
                {new Date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>

              <div className={`day-card fade-${i + 1}`}>
                {workout ? (
                  workout.status === 'completed' ? (
                    <div className="workout-complete">
                      <img src="/check.png" alt="check" className="day-icon" />
                      <p>Workout completed:</p>
                      <p>• {workout.distance} km</p>
                      <p>• {workout.calories} kcal</p>
                      <p>• {workout.pace} Avg. Pace</p>
                    </div>
                  ) : (
                    <div className="workout-time">
                      <img src="/clock.png" alt="clock" className="day-icon" />
                      <p>{formatTime(workout.time)} • {workout.type}</p>
                      <button
                        onClick={() => handleCancelWorkout(day)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>

                  )
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
          );
        })}
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

      {isModalOpen && userId && (
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
