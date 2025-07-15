'use client';

import { doc, getDoc, updateDoc, getDocs, collection, where, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import './profile.css';
import { auth, db } from '@/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  // const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  const [goalType, setGoalType] = useState('distance'); 
  const [goalValue, setGoalValue] = useState<number>(0);
  const [weeklyDistance, setWeeklyDistance] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalTime, setTotalTime] = useState<string>('');
  const [overallPace, setOverallPace] = useState('');
  const [trainingGoalType, setTrainingGoalType] = useState("general");
  const [targetDate, setTargetDate] = useState('');
  const [preferredWorkoutsPerWeek, setPreferredWorkoutsPerWeek] = useState<number | null>(null);

  interface UserData {
  name?: string;
  email?: string;
  photoURL?: string;
  weeklyGoal?: {
    type: string;
    value: number;
  };
  weeklyChallenge?: any;
  preferredTime?: 'morning' | 'afternoon' | 'evening';
  reminderEnabled?: boolean;
}

const [userData, setUserData] = useState<UserData | null>(null);



  const handleTimePreference = async (time: 'morning' | 'afternoon' | 'evening') => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      preferredTime: time,
    });
    setUserData(prev => ({ ...prev, preferredTime: time }));
  } catch (error) {
    console.error('❌ Failed to update preferred time:', error);
  }
};

  const handleLogout = async () => {
  try {
    await auth.signOut();
    router.push('/'); // משנה ל־login אם זה הנתיב שלך
  } catch (error) {
    console.error('❌ Error during logout:', error);
  }
};
const handleSaveTrainingGoal = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      trainingGoal: trainingGoalType === "general"
        ? { type: trainingGoalType }
        : { type: trainingGoalType, targetDate },     
          });
    alert('Training goal saved!');
  } catch (err) {
    console.error('Failed to save training goal:', err);
  }
};

  
const handleSaveWeeklyGoal = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
    weeklyGoal: {
      type: 'distance', // 🟢 תמיד "distance"
      value: goalValue,
    },
      trainingGoal: goalType, // 🟢 שדה נוסף ל-trainingGoal
    });
    alert('Goal saved!');
  } catch (err) {
    console.error('Failed to save goal:', err);
  }
};


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/');
        return;
      }

      // הבאת נתוני המשתמש
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        console.log('📦 userData loaded:', data);

        // ✅ הוספה: טעינת trainingGoal
        if (data.trainingGoal) {
          setTrainingGoalType(data.trainingGoal.type || 'general');
          if (data.trainingGoal.targetDate) {
            setTargetDate(data.trainingGoal.targetDate);
          } else {
            setTargetDate('');
          }
        }

        if (data.preferredWorkoutsPerWeek !== undefined) {
          setPreferredWorkoutsPerWeek(data.preferredWorkoutsPerWeek);
        }
      }


      // חישוב מרחק שבועי
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay(); // Sunday = 0
      startOfWeek.setDate(today.getDate() - dayOfWeek);

      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(q);

      let total = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        const workoutDate = new Date(data.date);
        workoutDate.setHours(0, 0, 0, 0);

        if (workoutDate >= startOfWeek && workoutDate <= today) {
          total += parseFloat(data.distance || '0');
        }
      });

      setWeeklyDistance(total);
      // 🟠 חישוב נתונים מצטברים מכל האימונים
      let runs = 0;
      let totalDist = 0;
      let totalDurMin = 0;
      let totalPaceSec = 0;
      let countPace = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        runs++;
        totalDist += parseFloat(data.distance || '0');

        const duration = data.duration || '';
        const [h = '0', m = '0', s = '0'] = duration.split(':');
        const durationMin = parseInt(h) * 60 + parseInt(m) + parseInt(s) / 60;
        totalDurMin += durationMin;

        if (data.pace && typeof data.pace === 'string') {
          const [minStr, secStr] = data.pace.split("'");
          const min = parseInt(minStr);
          const sec = parseInt(secStr?.replace('"', '') || '0');
          if (!isNaN(min) && !isNaN(sec)) {
            totalPaceSec += min * 60 + sec;
            countPace++;
          }
        }
      });

      setTotalRuns(runs);
      setTotalDistance(totalDist);
      // setTotalTime(totalDurMin);
      const totalSeconds = Math.round(totalDurMin * 60);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setTotalTime(formattedTime);

      if (countPace > 0) {
        const avgSec = Math.round(totalPaceSec / countPace);
        const min = Math.floor(avgSec / 60);
        const sec = avgSec % 60;
        setOverallPace(`${min}'${sec < 10 ? '0' : ''}${sec}"`);
      }

    });

    return () => unsubscribe();
  }, []);

  if (!userData) {
    return <div className="profile-container">Loading profile...</div>;
  }

  const {
    name,
    email,
    photoURL,
    weeklyGoal,
    weeklyChallenge,
    preferredTime,
    reminderEnabled
  } = userData;

    const handleSavePreferredWorkouts = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        preferredWorkoutsPerWeek,
      });
      alert('Preferred weekly workouts saved!');
    } catch (err) {
      console.error('❌ Failed to save preferred workouts:', err);
    }
  };


  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="user-info">
          <div className="user-photo">
            {photoURL ? <img src={photoURL} alt="profile" /> : <span>👤</span>}
          </div>
          <div className="user-text">
            <p className="user-name">{name}</p>
            <p className="user-email">{email}</p>
          </div>
        </div>
      </div>

        {/* 💡 עטפנו את כל התיבות ב-check על userData */}
  {userData && (
      <div className="profile-grid">
      <div className="profile-card profile-goal">
        <div className="profile-section goal">
          <h2 className="profile-title"># Weekly goal</h2>

          <div className="goal-box">
            <div className="goal-input-row">
              <span className="label-weekly-goal-distance">Distance (km)</span>

              <input
                type="number"
                placeholder="Set a goal"
                value={goalValue}
                onChange={(e) => setGoalValue(Number(e.target.value))}
                className="goal-input"
              />

              <button onClick={handleSaveWeeklyGoal} className="goal-save-btn">
                Save
              </button>
            </div>
              {userData.weeklyGoal && (
                <p className="goal-achieved-text">
                  Goal set: {userData.weeklyGoal.value} km
                </p>
              )}

              <p className="goal-progress-text">
                Progress this week: {weeklyDistance.toFixed(1)} km
              </p>

          </div>
        </div>
      </div>

        {/* 🟢 preferences – בעיצוב חדש */}
    <div className="profile-card profile-prefs">
      <div className="profile-section prefs">
        <h2 className="profile-title"># Preferences</h2>

        <div className="prefs-inner-box">
          <div className="prefs-checkbox-row">
          </div>
        <div className="prefs-time-row">
          <span className="prefs-label">
            Preferred time for training :
            <span className="time-icons">
              <img
                src="/sun-icon.png"
                alt="morning"
                className={userData?.preferredTime === 'morning' ? 'selected-time' : ''}
                onClick={() => handleTimePreference('morning')}
              />
              <img
                src="/sunrise-icon.png"
                alt="afternoon"
                className={userData?.preferredTime === 'afternoon' ? 'selected-time' : ''}
                onClick={() => handleTimePreference('afternoon')}
              />
              <img
                src="/moon-icon.png"
                alt="evening"
                className={userData?.preferredTime === 'evening' ? 'selected-time' : ''}
                onClick={() => handleTimePreference('evening')}
              />
            </span>
          </span>
        </div>

        <div className="prefs-workouts-row">
          <label htmlFor="preferredWorkouts" className="prefs-label">
            Workouts per week:
          </label>
          <input
            id="preferredWorkouts"
            type="number"
            min={0}
            className="goal-input"
            placeholder="e.g. 3"
            value={preferredWorkoutsPerWeek ?? ''}
            onChange={(e) => setPreferredWorkoutsPerWeek(Number(e.target.value))}
          />
          <button className="goal-save-btn" onClick={handleSavePreferredWorkouts}>
            Save
          </button>
        </div>

        </div>
      </div>
      </div>


      <div className="profile-card profile-challenge">
        <h2 className="profile-title"># Training Goal</h2>
        <div className="challenge-box">
          <label htmlFor="goalType" className="label-goal-type">
            Choose your goal:
          </label>
            <select
              id="goalType"
              className="goalT-select"
              value={trainingGoalType}
              onChange={(e) => setTrainingGoalType(e.target.value)}
            >
              <option value="general">General Fitness</option>
              <option value="5k">5K Race</option>
              <option value="10k">10K Race</option>
              <option value="half-marathon">Half Marathon</option>
              <option value="marathon">Marathon</option>
            </select>

            {trainingGoalType !== 'general' && (
            <div className="target-date-box">
              <label htmlFor="targetDate" className="label-target-date">
                Target date:
              </label>
              <input
                type="date"
                id="targetDate"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="goal-input"
              />
            </div>
          )}
            <button className="challenge-btn" onClick={handleSaveTrainingGoal}>
              Save Goal
            </button>
        </div>
      </div>



    <div className="profile-card profile-aggregate">
      <div className="profile-section aggregate">
        <h2 className="profile-title"># Aggregate data</h2>
        <div className="aggregate-box">
          <ul className="aggregate-list">
            <li>Total runs: {totalRuns}</li>
            <li>Total km: {totalDistance.toFixed(1)}</li>
            <li>Total time: {totalTime} hours</li>
            <li>Overall average pace: {overallPace}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)}

    <button className="logout-btn" onClick={handleLogout}>
      Logout
    </button>

    </div>
  );

}


