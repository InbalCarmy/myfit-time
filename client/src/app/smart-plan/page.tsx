'use client';

import { useState } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { ensureGoogleCalendarAccess, fetchGoogleCalendarEvents, getFreeTimeSlotsUntilTargetDate } from '@/utils/googleCalendar';
import { format } from 'date-fns';

export default function SmartPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [smartPlan, setSmartPlan] = useState<any>(null); 

  const generatePlan = async () => {
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      router.push('/');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    setUserData(userData);

    const workoutsRef = collection(db, 'workouts');
    const workoutsQuery = query(
      workoutsRef,
      where('userId', '==', user.uid),
      where('status', '==', 'completed'),
      orderBy('date', 'desc')
    );
    const workoutsSnap = await getDocs(workoutsQuery);
    const diaryData: any[] = workoutsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDiaryEntries(diaryData);

    const token = await ensureGoogleCalendarAccess();
    if (!token) {
      setLoading(false);
      return;
    }

    const events = await fetchGoogleCalendarEvents(token);
    const existingDates = diaryData.map(entry => entry.date);
    const preferredTime = userData.preferredTime || 'morning';
    const freeSlots = getFreeTimeSlotsUntilTargetDate(events, existingDates, preferredTime, new Date(userData.trainingGoal?.targetDate));

    const response = await fetch('/api/smart-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trainingGoal: userData.trainingGoal,
        targetDate: userData.trainingGoal?.targetDate,
        // weeklyGoal: userData.weeklyGoal,
        preferredWorkoutsPerWeek: userData.preferredWorkoutsPerWeek,
        diaryEntries: diaryData,
        freeSlots,
      }),
    });

    const aiPlan = await response.json();
    setSmartPlan(aiPlan); // זה עכשיו אמור להיות אובייקט עם workouts
    console.log('🤖 AI Smart Plan:', aiPlan);

    setLoading(false);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">📅 Smart Plan</h1>

      {userData && (
        <>
          <p>Training goal: <strong>{userData.trainingGoal?.type || 'N/A'}</strong></p>
          <p>Target date: {userData.trainingGoal?.targetDate || 'None'}</p>
          <p>Weekly goal: {userData.weeklyGoal?.type} – {userData.weeklyGoal?.value}</p>
          <p>Preferred time: {userData.preferredTime || 'Not set'}</p>
        </>
      )}

      {!smartPlan && (
        <button
          onClick={generatePlan}
          className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Smart Plan'}
        </button>
      )}

      {diaryEntries.length > 0 && (
        <>
          <h2 className="text-xl mt-6 mb-2">Recent completed workouts:</h2>
          <ul className="list-disc ml-6">
            {diaryEntries.slice(0, 5).map((entry: any) => (
              <li key={entry.id}>
                {entry.date} – {entry.distance} km – {entry.type || 'Run'}
              </li>
            ))}
          </ul>
        </>
      )}

      {smartPlan?.workouts?.length > 0 && (
        <>
          <h2 className="text-xl mt-6 mb-2">🤖 AI Smart Plan:</h2>
          <ul className="list-disc ml-6">
            {smartPlan.workouts.map((item: any, i: number) => (
              <li key={i}>
                {item.date} at {item.time} – {item.distance} km – {item.type}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
