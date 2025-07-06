'use client';

import { doc, getDoc, updateDoc, getDocs, collection, where, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import './profile.css';
import { auth, db } from '@/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  const [goalType, setGoalType] = useState('distance'); 
  const [goalValue, setGoalValue] = useState<number>(0);
  const [weeklyDistance, setWeeklyDistance] = useState(0);


  const handleSaveGoal = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      weeklyGoal: {
        type: goalType,
        value: goalValue,
      },
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
        setUserData(docSnap.data());
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

      <div className="profile-grid">
        
        {/* 🟢 Weekly Goal – בעיצוב חדש */}
        {/* <div className="profile-card profile-goal">
        <div className="profile-section goal">
          <h2 className="profile-title"># Weekly goal :</h2>
          <div className="goal-box">
            <div className="goal-input-row">
              <input
                type="number"
                placeholder="Set a weekly goal"
                className="goal-input"
              />
              <button className="goal-save-btn">save</button>
            </div>
            <p className="goal-achieved-text">Already achieved: 8.2 km</p>
          </div>
          </div>
        </div> */}
      <div className="profile-card profile-goal">
        <div className="profile-section goal">
          <h2 className="profile-title"># Weekly goal :</h2>

          <div className="goal-box">
            <div className="goal-input-row">
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
                className="goal-select"
              >
                <option value="distance">Distance (km)</option>
                <option value="workouts">Number of workouts</option>
                <option value="time">Total minutes</option>
              </select>

              <input
                type="number"
                placeholder="Set a goal"
                value={goalValue}
                onChange={(e) => setGoalValue(Number(e.target.value))}
                className="goal-input"
              />

              <button onClick={handleSaveGoal} className="goal-save-btn">
                Save
              </button>
            </div>

            {userData.weeklyGoal && (
              <p className="goal-achieved-text">
                Goal set: {userData.weeklyGoal.value}{" "}
                {goalType === "distance"
                  ? "km"
                  : goalType === "time"
                  ? "minutes"
                  : "workouts"}
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
            <input type="checkbox" checked={reminderEnabled} readOnly />
            <span className="checkbox-text">Get reminders</span>
          </div>
        <div className="prefs-time-row">
          <span className="prefs-label">
            Preferred time for training :
            <span className="time-icons">
              <img src="/sun-icon.png" alt="morning" />
              <img src="/sunrise-icon.png" alt="noon" />
              <img src="/moon-icon.png" alt="evening" />
            </span>
          </span>
        </div>
        </div>
      </div>
      </div>


        {/* 🟠 Weekly Challenge – מעוצב */}
     <div className="profile-card profile-challenge">
   
      <div className="profile-section challenge">
        <h2 className="profile-title"># Weekly challenge :</h2>

        <div className="challenge-box">
          <p className="challenge-text">3 5 km runs this week</p>
          <p className="challenge-date">Defined on: 30.6.2025</p>

          <div className="challenge-buttons">
            <button className="challenge-btn">Update challenge</button>
            <button className="challenge-btn">
              <img src="/ai-icon.png" alt="AI" />
              Automatic challenge
            </button>
          </div>
        </div>
      </div>
      </div>

    <div className="profile-card profile-aggregate">
      <div className="profile-section aggregate">
        <h2 className="profile-title"># Aggregate data</h2>
        <div className="aggregate-box">
          <ul className="aggregate-list">
            <li>Total runs: 24</li>
            <li>Total km: 131.4</li>
            <li>Total time: 11:23:00 hours</li>
            <li>Overall average pace: 5:47</li>
          </ul>
        </div>
      </div>
    </div>


      </div>

      <button className="logout-btn" onClick={() => auth.signOut()}>
        Logout
      </button>
    </div>
  );

}


