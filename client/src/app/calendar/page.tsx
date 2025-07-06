'use client';

import React, { useState, useEffect } from 'react';
import './calendar.css';
import PlanWorkoutModal from '@/components/PlanWorkoutModal';
import { collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseConfig';
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from 'date-fns';
import { ensureGoogleCalendarAccess, fetchGoogleCalendarEvents, getFreeTimeSlotsFiltered } from '@/utils/googleCalendar';

// const getWeekDates = (baseDate: Date): string[] => {
//   const sunday = startOfWeek(baseDate, { weekStartsOn: 0 });
//   return Array.from({ length: 7 }, (_, i) => {
//     const d = new Date(sunday);
//     d.setDate(sunday.getDate() + i);
//     return d.toISOString().split('T')[0];
//   });
// };
const getWeekDates = (baseDate: Date): string[] => {
  const date = new Date(baseDate);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - dayOfWeek); // מחזיר ליום ראשון של השבוע הנוכחי

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
  const [defaultTime, setDefaultTime] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const handleOpenModal = (date: string, time?: string) => {
    setSelectedDate(date);
    if (time) setDefaultTime(time);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleWorkoutSaved = () => {
    if (userId) fetchWorkouts(userId, currentWeek);
  };

  const fetchWorkouts = async (uid: string, baseDate: Date) => {
    const start = format(startOfWeek(baseDate, { weekStartsOn: 0 }), 'yyyy-MM-dd');
    const end = format(endOfWeek(baseDate, { weekStartsOn: 0 }), 'yyyy-MM-dd');

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
      const date = workout.date;
      if (!data[date] || workout.status === 'completed') {
        data[date] = workout;
      }
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
      const workoutData = snapshot.docs[0].data();
      const eventId = workoutData.googleEventId;
      if (eventId) {
        const token = localStorage.getItem('googleAccessToken');
        if (token) {
          try {
            await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (error) {
            console.error('❌ Failed to delete Google Calendar event:', error);
          }
        }
      }
      await deleteDoc(docRef);
      fetchWorkouts(userId, currentWeek);
    }
  };

  const handleGoogleCalendarAuth = async () => {
    const token = await ensureGoogleCalendarAccess();
    if (!token) return;
    try {
      const events = await fetchGoogleCalendarEvents(token);
      setCalendarEvents(events);
      const existingWorkoutDates = Object.keys(workouts);
      const freeSlots = getFreeTimeSlotsFiltered(events, existingWorkoutDates);
      setFreeTimeSlots(freeSlots);
    } catch (error) {
      console.error('❌ Failed to fetch calendar data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
        fetchWorkouts(user.uid, currentWeek);
      } else {
        setUserId(null);
        setWorkouts({});
      }
    });
      console.log('🗓 ימות השבוע שנשלפו:', getWeekDates(currentWeek).map(d => format(new Date(d), 'EEEE')));

    return () => unsubscribe();
  }, [currentWeek]);

  const handlePrevWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1));

  return (
    <div className="calendar-container">
      <div className="week-bar-wrapper">
        <button onClick={handlePrevWeek} className="arrow-button arrow-left">
          <img src="/arrow-left.png" alt="Previous week" />
        </button>

        <div className="week-bar">
          {getWeekDates(currentWeek).map((day, i) => {
            const workout = workouts[day];
            return (
              <div key={i} className="day-wrapper">
                <p className="day-label">
                  {/* {new Date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} */}
                  {format(new Date(day), 'EEE, MMM d')}

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
                        <div className="workout-controls">
                          {workout.googleEventId && (
                            <img src="/google-icon-outline.png" alt="Google Calendar" className="google-calendar-icon" />
                          )}
                          <button onClick={() => handleCancelWorkout(day)} className="cancel-btn">Cancel</button>
                        </div>
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

        <button onClick={handleNextWeek} className="arrow-button arrow-right">
          <img src="/arrow-right.png" alt="Next week" />
        </button>
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
              const dayStr = start.toISOString().split('T')[0];
              const timeStr = start.toTimeString().slice(0, 5);
              const dayLabel = start.toLocaleDateString('en-US', { weekday: 'short' });
              const timeRange = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

              return (
                <div key={i} className="suggested-slot">
                  <span>• {dayLabel} • {timeRange}</span>
                  <button className="add-slot-btn" onClick={() => handleOpenModal(dayStr, timeStr)}>
                    ＋
                  </button>
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
          defaultTime={defaultTime ?? ''}
          userId={userId}
          onClose={() => {
            handleCloseModal();
            setDefaultTime(null);
          }}
          onSave={handleWorkoutSaved}
        />
      )}
    </div>
  );
};

export default CalendarPage;
