import axios from 'axios';
import { isSameDay, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns';

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

export const getFreeTimeSlotsFiltered = (events: CalendarEvent[], existingWorkoutDates: string[]) => {
  const now = new Date();
  const today = startOfDay(now);
  const startOfWeekDate = startOfWeek(today, { weekStartsOn: 0 });
  const endOfWeekDate = endOfWeek(today, { weekStartsOn: 0 });

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

    // דלג על ימים שיש בהם אימון מתוכנן/שבוצע
    if (existingWorkoutDates.includes(dateStr)) continue;

    const dayStart = new Date(d);
    const dayEnd = endOfDay(dayStart);

    // נתחיל משעה עגולה: אם זה היום, אז שעה קדימה מהשעה הנוכחית; אם זה יום אחר – 08:00
    let currentHour = isSameDay(d, now)
      ? now.getHours() + 1
      : 8;

    while (currentHour < 22) {
      const slotStart = new Date(dayStart);
      slotStart.setHours(currentHour, 0, 0, 0);

      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // שעה

      // בדוק אם יש התנגשות עם אירועים
      const hasConflict = sortedEvents.some(event =>
        isWithinInterval(slotStart, { start: event.start, end: event.end }) ||
        isWithinInterval(slotEnd, { start: event.start, end: event.end }) ||
        (event.start <= slotStart && event.end >= slotEnd)
      );

      if (!hasConflict && slotEnd <= dayEnd) {
        freeSlots.push({ start: slotStart, end: slotEnd });
        break; // רק שעה אחת ליום
      }

      currentHour++;
    }
  }

  console.log('🎯 כל ההצעות לשעה פנויה:', freeSlots);
  return freeSlots;
};

