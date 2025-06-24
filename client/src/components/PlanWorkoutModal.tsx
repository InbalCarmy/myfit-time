'use client';

import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

interface PlanWorkoutModalProps {
  date: string; // yyyy-mm-dd
  onClose: () => void;
  onSave: () => void;
  userId: string;
}

const PlanWorkoutModal: React.FC<PlanWorkoutModalProps> = ({ date, onClose, onSave, userId }) => {
  const [type, setType] = useState('Easy');
  const [time, setTime] = useState('');
  const [distanceOrDuration, setDistanceOrDuration] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!time || !distanceOrDuration) return alert('Please fill all fields');
    setLoading(true);
    try {
      await setDoc(doc(db, 'workouts', `${userId}_${date}`), {
        date,
        userId,
        type,
        time,
        // planned: true,
        // completed: false,
        status: 'planned',
        distanceOrDuration,
      });
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

        <div className="modal-actions">
          <button onClick={onClose} disabled={loading}>Cancel</button>
          <button onClick={handleSave} disabled={loading}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default PlanWorkoutModal;
