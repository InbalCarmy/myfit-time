import axios from 'axios';
import { isSameDay, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';


export const ensureGoogleCalendarAccess = async (): Promise<string | null> => {
  console.log('⚡ Running ensureGoogleCalendarAccess');

  const currentEmail = auth.currentUser?.email;
  const savedToken = localStorage.getItem('googleAccessToken');
  const savedEmail = localStorage.getItem('googleTokenUserEmail');

  // 🧪 בדיקה אם הטוקן שמור תואם למשתמש הנוכחי ועדיין תקף
  if (savedToken && currentEmail === savedEmail) {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${savedToken}`);
      const data = await response.json();
      if (!data.error) {
        console.log('✅ Using existing valid token for', currentEmail);
        return savedToken;
      } else {
        console.warn('⚠️ Token expired or invalid');
      }
    } catch (e) {
      console.error('❌ Token check failed:', e);
    }

    // ננקה את הטוקן הלא תקף
    localStorage.removeItem('googleAccessToken');
    localStorage.removeItem('googleTokenUserEmail');
  }

  // 🧑‍🚀 התחברות חדשה עם גוגל לקבלת טוקן חדש
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    provider.setCustomParameters({ prompt: 'select_account' });

    console.log('🔐 Signing in with Google...');
    const result = await signInWithPopup(auth, provider);

    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;

    if (token) {
      localStorage.setItem('googleAccessToken', token);
      localStorage.setItem('googleTokenUserEmail', result.user.email || '');
      console.log('🔐 Got new Google Calendar token for:', result.user.email);
      return token;
    } else {
      console.error('❌ No access token received');
      return null;
    }
  } catch (error) {
    console.error('❌ Google Calendar sign-in failed:', error);
    alert('Google Sign-In is required to access calendar features.');
    return null;
  }
};




export const fetchGoogleCalendarEvents = async (accessToken: string) => {
  const now = new Date().toISOString();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const response = await axios.get(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        timeMin: now,
        timeMax: nextWeek,
        singleEvents: true,
        orderBy: 'startTime',
      },
    }
  );

  return response.data.items;
};

type CalendarEvent = {
  start: { dateTime: string };
  end: { dateTime: string };
};

// export const getFreeTimeSlotsFiltered = (events: CalendarEvent[], existingWorkoutDates: string[]) => {
//   const now = new Date();
//   const today = startOfDay(now);
//   const startOfWeekDate = startOfWeek(today, { weekStartsOn: 0 });
//   const endOfWeekDate = endOfWeek(today, { weekStartsOn: 0 });

//   const sortedEvents = [...events]
//     .filter(e => e.start?.dateTime && e.end?.dateTime)
//     .map(e => ({
//       start: new Date(e.start.dateTime),
//       end: new Date(e.end.dateTime),
//     }))
//     .sort((a, b) => a.start.getTime() - b.start.getTime());

//   const freeSlots: { start: Date; end: Date }[] = [];

//   for (let d = new Date(today); d <= endOfWeekDate; d.setDate(d.getDate() + 1)) {
//     const dateStr = format(d, 'yyyy-MM-dd');

//     // דלג על ימים שיש בהם אימון מתוכנן/שבוצע
//     if (existingWorkoutDates.includes(dateStr)) continue;

//     const dayStart = new Date(d);
//     const dayEnd = endOfDay(dayStart);

//     // נתחיל משעה עגולה: אם זה היום, אז שעה קדימה מהשעה הנוכחית; אם זה יום אחר – 08:00
//     let currentHour = isSameDay(d, now)
//       ? now.getHours() + 1
//       : 8;

//     while (currentHour < 22) {
//       const slotStart = new Date(dayStart);
//       slotStart.setHours(currentHour, 0, 0, 0);

//       const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // שעה

//       // בדוק אם יש התנגשות עם אירועים
//       const hasConflict = sortedEvents.some(event =>
//         isWithinInterval(slotStart, { start: event.start, end: event.end }) ||
//         isWithinInterval(slotEnd, { start: event.start, end: event.end }) ||
//         (event.start <= slotStart && event.end >= slotEnd)
//       );

//       if (!hasConflict && slotEnd <= dayEnd) {
//         freeSlots.push({ start: slotStart, end: slotEnd });
//         break; // רק שעה אחת ליום
//       }

//       currentHour++;
//     }
//   }

//   console.log('🎯 כל ההצעות לשעה פנויה:', freeSlots);
//   return freeSlots;
// };
export const getFreeTimeSlotsFiltered = (
  events: CalendarEvent[],
  existingWorkoutDates: string[],
  preferredTime: 'morning' | 'afternoon' | 'evening' = 'morning'
) => {
  const now = new Date();
  const today = startOfDay(now);
  const startOfWeekDate = startOfWeek(today, { weekStartsOn: 0 });
  const endOfWeekDate = endOfWeek(today, { weekStartsOn: 0 });

  let earliest = 8;
  let latest = 22;

  if (preferredTime === 'morning') {
    earliest = 7;
    latest = 12;
  } else if (preferredTime === 'afternoon') {
    earliest = 12;
    latest = 17;
  } else if (preferredTime === 'evening') {
    earliest = 17;
    latest = 21;
  }

  const sortedEvents = [...events]
    .filter(e => e.start?.dateTime && e.end?.dateTime)
    .map(e => ({
      start: new Date(e.start.dateTime),
      end: new Date(e.end.dateTime),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const freeSlots: { start: Date; end: Date }[] = [];

  for (let d = new Date(today); d <= endOfWeekDate; d.setDate(d.getDate() + 1)) {
    const dateStr = format(d, 'yyyy-MM-dd');
    if (existingWorkoutDates.includes(dateStr)) continue;

    const dayStart = new Date(d);
    const dayEnd = endOfDay(dayStart);

    let currentHour = isSameDay(d, now)
      ? Math.max(now.getHours() + 1, earliest)
      : earliest;

    while (currentHour < latest) {
      const slotStart = new Date(dayStart);
      slotStart.setHours(currentHour, 0, 0, 0);

      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

      const hasConflict = sortedEvents.some(event =>
        isWithinInterval(slotStart, { start: event.start, end: event.end }) ||
        isWithinInterval(slotEnd, { start: event.start, end: event.end }) ||
        (event.start <= slotStart && event.end >= slotEnd)
      );

      if (!hasConflict && slotEnd <= dayEnd) {
        freeSlots.push({ start: slotStart, end: slotEnd });
        break;
      }

      currentHour++;
    }
  }

  console.log('🎯 כל ההצעות לשעה פנויה:', freeSlots);
  return freeSlots;
};

