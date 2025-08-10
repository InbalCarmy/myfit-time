import { Router } from 'express';
import { google } from 'googleapis';
import { isSameDay, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';

const router = Router();

// Get calendar events
router.post('/events', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { accessToken, timeMin, timeMax } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return res.json(response.data.items || []);
  } catch (error) {
    return next(error);
  }
});

// Get free time slots
router.post('/free-slots', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { 
      events, 
      existingWorkoutDates = [], 
      preferredTime = 'morning',
      targetDate 
    } = req.body;

    const now = new Date();
    const today = startOfDay(now);
    const endDate = targetDate ? new Date(targetDate) : endOfWeek(today, { weekStartsOn: 0 });

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

    const sortedEvents = (events || [])
      .filter((e: any) => e.start?.dateTime && e.end?.dateTime)
      .map((e: any) => ({
        start: new Date(e.start.dateTime),
        end: new Date(e.end.dateTime),
      }))
      .sort((a: any, b: any) => a.start.getTime() - b.start.getTime());

    const freeSlots: { start: Date; end: Date }[] = [];

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
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

        const hasConflict = sortedEvents.some((event: any) =>
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

    console.log('🎯 Free time slots generated:', freeSlots.length);
    return res.json(freeSlots);
  } catch (error) {
    return next(error);
  }
});

export { router as calendarRoutes };