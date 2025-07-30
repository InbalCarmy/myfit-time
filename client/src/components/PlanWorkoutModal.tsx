'use client';

import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { ensureGoogleCalendarAccess, fetchGoogleCalendarEvents, getFreeTimeSlotsFiltered } from '@/utils/googleCalendar';


interface PlanWorkoutModalProps {
  date: string; // yyyy-mm-dd
  defaultTime?: string; // 'HH:MM' format
  onClose: () => void;
  onSave: () => void;
  userId: string;
}


const PlanWorkoutModal: React.FC<PlanWorkoutModalProps> = ({ date, defaultTime = '', onClose, onSave, userId }) => {
  const [type, setType] = useState('Easy');
  // const [time, setTime] = useState('');
  const [time, setTime] = useState(defaultTime);
  const [distanceOrDuration, setDistanceOrDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(false);

  const handleSave = async () => {
    if (!time || !distanceOrDuration) return alert('Please fill all fields');
    setLoading(true);

    try {
      let googleEventId: string | null = null;

      // 1. If user chose to save to Google Calendar too
      if (addToCalendar) {
        const token = await ensureGoogleCalendarAccess();
        if (!token) return;

        const start = new Date(`${date}T${time}`);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        const calendarEvent = {
          summary: `Workout: ${type}`,
          description: `Planned with MyFitTime\nType: ${type}\nDistance/Duration: ${distanceOrDuration}`,
          start: {
            dateTime: start.toISOString(),
            timeZone: 'Asia/Jerusalem',
          },
          end: {
            dateTime: end.toISOString(),
            timeZone: 'Asia/Jerusalem',
          },
        };

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calendarEvent),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Google Calendar Error:', errorData);
          alert('Failed to add workout to Google Calendar');
        } else {
          const data = await response.json();
          googleEventId = data.id;
          console.log('✅ Workout added to Google Calendar with event ID:', googleEventId);
        }
      }

      // 2. Save to Firestore (including googleEventId if exists)
      await setDoc(doc(db, 'workouts', `${userId}_${date}`), {
        date,
        userId,
        type,
        time,
        status: 'planned',
        distanceOrDuration,
        ...(googleEventId && { googleEventId }),
      });

      // 3. Finish
      onSave();
    } catch (err) {
      console.error('Error saving workout:', err);
    } finally {
      setLoading(false);
      onClose();
    }
  };



  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Plan Workout for {date}</h2>
        <label>Workout Type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>Easy</option>
          <option>Intervals</option>
          <option>Long Run</option>
          <option>Tempo</option>
          <option>Recovery</option>
        </select>

        <label>Time:</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

        <label>Distance / Duration:</label>
        <input
          type="text"
          placeholder="e.g. 5km or 40min"
          value={distanceOrDuration}
          onChange={(e) => setDistanceOrDuration(e.target.value)}
        />

        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="save-btn" onClick={handleSave} disabled={loading}>Save</button>
        </div>
  
        <div className="checkbox-container">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={addToCalendar}
              onChange={(e) => setAddToCalendar(e.target.checked)}
            />
            Add to Google Calendar
          </label>
        </div>
      </div>
    </div>
  );
};

export default PlanWorkoutModal;
