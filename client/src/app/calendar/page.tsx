

'use client';

import React, { useState, useEffect } from 'react';
import './calendar.css';
import PlanWorkoutModal from '@/components/PlanWorkoutModal';
import { collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseConfig';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { fetchGoogleCalendarEvents, getFreeTimeSlotsFiltered } from '@/utils/googleCalendar';



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
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [freeTimeSlots, setFreeTimeSlots] = useState<{ start: Date; end: Date }[]>([]);



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
      fetchWorkouts(userId);
    }
  };

  const handleGoogleCalendarAuth = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
    provider.addScope('https://www.googleapis.com/auth/calendar.events');

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (token) {
        console.log('Access token:', token);

        // שליפת אירועים מהיומן
        const events = await fetchGoogleCalendarEvents(token);
        console.log('📅 Google Calendar events:', events);
        setCalendarEvents(events);

        // הפקת חלונות זמן פנויים
        const existingWorkoutDates = Object.keys(workouts); // מתוך ה-Firestore
        
        console.log('📅 תאריכי אימונים:', existingWorkoutDates);

      const freeSlots = getFreeTimeSlotsFiltered(events, existingWorkoutDates);
      console.log('🟢 Filtered Free time slots:', freeSlots);
      setFreeTimeSlots(freeSlots);

      }
    } catch (error) {
      console.error('Google Calendar auth failed:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
      console.log('👤 Email:', user.email);
      console.log('🆔 UID:', user.uid);
      console.log('📛 Display Name:', user.displayName);

        setUserId(user.uid);
        fetchWorkouts(user.uid);
      } else {
        console.log('❌ No user is signed in');
        
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
                      <button onClick={() => handleCancelWorkout(day)} className="cancel-btn">Cancel</button>
                    </div>
                  )
                ) : (
                  <div className="add-workout" onClick={() => handleOpenModal(day)} style={{ cursor: 'pointer' }}>
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

      <button className="find-time-btn" onClick={handleGoogleCalendarAuth}>
        <img src="/clock.png" alt="clock" className="btn-icon" />
        Find time for a workout
      </button>

      <div className="suggested-section">
        <p className="suggested-title">
          <img src="/calendar.png" alt="calendar icon" className="suggested-icon" />
          Suggested slots:
        </p>

        <div className="suggested-boxes">
          {freeTimeSlots.length > 0 ? (
            freeTimeSlots.map((slot, i) => {
              const start = new Date(slot.start);
              const end = new Date(slot.end);
              const day = start.toLocaleDateString('en-US', { weekday: 'short' });
              const timeRange = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

              return (
                <div key={i} className="suggested-slot">
                  <span>• {day} • {timeRange}</span>
                  <button className="add-slot-btn">＋</button>
                </div>
              );
            })
          ) : (
            <p>No free slots available</p>
          )}
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
