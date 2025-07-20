'use client';
import React, { useState } from 'react';
import './diary.css';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig'; // או הנתיב שלך לקובץ config
import { auth } from '@/firebase/firebaseConfig';
import { useEffect } from 'react';
import { query, where, getDocs } from 'firebase/firestore';
import SideNav from '@/components/SideNav'; 


const parseDurationToMinutes = (duration: string): number => {
  if (!duration || typeof duration !== 'string') return NaN;

  const parts = duration.split(':').map(Number);

  if (parts.length !== 3 || parts.some(isNaN)) return NaN;

  const [hours, minutes, seconds] = parts;
  return hours * 60 + minutes + seconds / 60;
};



export default function DiaryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tooltip, setTooltip] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);



  const formattedDate = selectedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  useEffect(() => {
     setFormData(prev => ({
    ...prev,
    date: selectedDate.toISOString().split('T')[0],
  }));
  const fetchWorkout = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', user.uid),
      where('date', '==', selectedDate.toISOString().split('T')[0])
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0].data();
      setFormData({
        ...formData,
        ...doc,
      });
    } else {
      // אם אין אימון ביום הזה – אפס את השדות למעט התאריך
      setFormData({
        date: selectedDate.toISOString().split('T')[0],
        distance: '',
        duration: '',
        pace: '',
        heartRate: '',
        calories: '',
        location: '',
        runType: '',
        effort: 3,
        timeOfDay: '',
        notes: '',
      });
    }
    };
    

  fetchWorkout();
}, [selectedDate]);

  const [formData, setFormData] = useState({
    date: selectedDate.toISOString().split('T')[0],
    distance: '',
    duration: '',
    pace: '',
    heartRate: '',
    calories: '',
    location: '',
    runType: '',
    effort: 3,
    timeOfDay: '',
    notes: '',
  });

  
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value, type } = e.target;
  const newValue = type === 'number' ? parseFloat(value) || 0 : value;

  const updated = {
    ...formData,
    [name]: newValue,
  };

  let calculatedPace = formData.pace;

  const distance = parseFloat(updated.distance);
  const durationMinutes = parseDurationToMinutes(updated.duration);

  if (!isNaN(distance) && distance > 0 && !isNaN(durationMinutes) && durationMinutes > 0) {
    const paceDecimal = durationMinutes / distance;
    calculatedPace = formatPace(paceDecimal);
  }

  setFormData({
    ...updated,
    pace: calculatedPace,
  });
};

  const handleRunType = (type: string) => {
  setFormData(prev => ({
    ...prev,
    runType: type,
  }));
};

  const formatPace = (decimalPace: number): string => {
  const minutes = Math.floor(decimalPace);
  const seconds = Math.round((decimalPace - minutes) * 60);
  return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
};


  const selectTimeOfDay = (time: string) => {
    setFormData({ ...formData, timeOfDay: time });
  };

 
  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = parseInt(e.target.value);
  setFormData({ ...formData, effort: value });

  // חישוב אחוז מילוי
  const percent = ((value - 1) / 4) * 100;

  // בחירת צבע לפי רמה
  const getColor = (val: number) => {
    switch (val) {
      case 1: return '#7ED957'; // ירוק קל
      case 2: return '#F2C94C'; // צהוב
      case 3: return '#F2994A'; // כתום
      case 4: return '#EB5757'; // אדום
      case 5: return '#960018'; // אדום כהה
      default: return '#ccc';
    }
    };
    

  const color = getColor(value);
  e.target.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, #ccc ${percent}%, #ccc 100%)`;
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left; // מיקום עכבר בתוך הסליידר
  const width = rect.width;
  const step = width / 5;

  const index = Math.floor(x / step) + 1;

  const labels = {
  1: 'Easy',
  2: 'Moderate-Easy',
  3: 'Moderate',
  4: 'Hard',
  5: 'Very Hard',
};

  setTooltip(labels[index as keyof typeof labels] || '');
};

//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   const user = auth.currentUser;
//   if (!user) {
//     alert('You must be logged in to save your workout.');
//     return;
//   }

//   try {
//     const formattedPace = formData.pace;

//     await addDoc(collection(db, 'workouts'), {
//       ...formData,
//       pace: formattedPace, // ← שמור בפורמט טקסט
//       date: selectedDate.toISOString().split('T')[0],
//       userId: user.uid,
//       userEmail: user.email,
//       status: 'completed',
//       createdAt: Timestamp.now(),
//     });

//     console.log('Workout saved!');
//   } catch (error) {
//     console.error('Error saving workout:', error);
//   }
// };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) {
    alert('You must be logged in to save your workout.');
    return;
  }

  try {
    const formattedPace = formData.pace;

    await addDoc(collection(db, 'workouts'), {
      ...formData,
      pace: formattedPace, // ← שמור בפורמט טקסט
      date: selectedDate.toISOString().split('T')[0],
      userId: user.uid,
      userEmail: user.email,
      status: 'completed',
      createdAt: Timestamp.now(),
    });

    console.log('Workout saved!');
    setSaveSuccess(true); // ← מציג את הודעת ה-Saved
    setTimeout(() => setSaveSuccess(false), 2000); // ← נעלם אחרי 2 שניות

  } catch (error) {
    console.error('Error saving workout:', error);
  }
};


  return (
    <main className="diary-container">
      <form className="diary-form" onSubmit={handleSubmit}>
        <div className="diary-date">{formattedDate}</div>
        <h2 className="diary-title">Great job showing up, ready to log your workout?</h2>

        <div className="input-row">
          <label>Distance:</label>
          <input type="number" name="distance" value={formData.distance} onChange={handleChange} />
          <label>Avg. Pace:</label>
          <div className="calculated-pace">{formData.pace}</div>
        </div>


        <div className="input-row">
          <label>Duration:</label>
            <input
              type="text"
              name="duration"
              placeholder="HH:MM:SS (e.g. 00:45:00)"
              pattern="^\d{2}:\d{2}:\d{2}$"
              title="Please enter duration in HH:MM:SS format"
              value={formData.duration}
              onChange={handleChange}
              required
            />


          <label>Calories:</label>
          <input type="number" name="calories" value={formData.calories} onChange={handleChange} />
        </div>

        <div className="input-row">
          <label>Heart Rate:</label>
          <input type="number" name="heartRate" value={formData.heartRate} onChange={handleChange} />
          <label>Location:</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} />
        </div>

    <div className="run-type">
      <label>Running type:</label>
      {/* <div className="run-buttons">
        <button type="button"
          className={formData.runType === 'Easy' ? 'selected' : ''}
          onClick={() => handleRunType('Easy')}
        >
          Easy
        </button>
        <button
          type="button"
          className={formData.runType === 'Intervals' ? 'selected' : ''}
          onClick={() => handleRunType('Intervals')}
        >
          Intervals
        </button>
      </div> */}
          <div className="run-buttons">
            {['Easy', 'Intervals', 'Tempo', 'Long Run', 'Recovery'].map(type => (
              <button
                key={type}
                type="button"
                className={formData.runType === type ? 'selected' : ''}
                onClick={() => handleRunType(type)}
              >
                {type}
              </button>
            ))}
          </div>

    </div>


        <div className="effort">
        <label>Effort Level:</label>
        <div className="slider-wrapper" onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip('')}>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.effort}
            onChange={handleSlider}
          />
          {tooltip && <div className="slider-tooltip">{tooltip}</div>}
        </div>
      </div>


        <div className="time-of-day">
          <label>Time of Day:</label>
          {/* <div className="icons">
            <button type="button" onClick={() => selectTimeOfDay('morning')} className={formData.timeOfDay === 'morning' ? 'selected' : ''}>🌅</button>
            <button type="button" onClick={() => selectTimeOfDay('noon')} className={formData.timeOfDay === 'noon' ? 'selected' : ''}>🌤️</button>
            <button type="button" onClick={() => selectTimeOfDay('night')} className={formData.timeOfDay === 'night' ? 'selected' : ''}>🌙</button>
          </div> */}
          <div className="icons">
            <button
              type="button"
              onClick={() => selectTimeOfDay('morning')}
              className={formData.timeOfDay === 'morning' ? 'selected' : ''}
            >
              <img src="/sun-icon.png" alt="morning" className="icon-img" />
            </button>
            <button
              type="button"
              onClick={() => selectTimeOfDay('noon')}
              className={formData.timeOfDay === 'noon' ? 'selected' : ''}
            >
              <img src="/sunrise-icon.png" alt="noon" className="icon-img" />
            </button>
            <button
              type="button"
              onClick={() => selectTimeOfDay('night')}
              className={formData.timeOfDay === 'night' ? 'selected' : ''}
            >
              <img src="/moon-icon.png" alt="night" className="icon-img" />
            </button>
          </div>

        </div>

        <label>Personal Notes:</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} />

        <button type="submit" className="submit-btn">Save Workout</button>
        {saveSuccess && (
        <div className="save-confirmation">
          <img src="/check.png" alt="Saved" className="checkmark-icon" />
          <span>Saved!</span>
        </div>
      )}

        {/* חצים */}
        <div className="navigation-arrows">
          <button type="button" onClick={() => changeDate(-1)} className="arrow-btn left-arrow">
            <img src="/arrow-left.png" alt="Previous Day" />
          </button>
          <button type="button" onClick={() => changeDate(1)} className="arrow-btn right-arrow">
            <img src="/arrow-right.png" alt="Next Day" />
          </button>
        </div>

      </form>
        <SideNav />

    </main>
  );
}
