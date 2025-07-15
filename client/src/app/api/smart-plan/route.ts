// app/api/smart-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { format, differenceInCalendarWeeks, addDays } from 'date-fns';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
const {
  trainingGoal,
  targetDate,
  weeklyGoal,
  preferredWorkoutsPerWeek,
  diaryEntries,
  freeSlots
} = await req.json();

if (!targetDate || !preferredWorkoutsPerWeek) {
  return NextResponse.json({ error: 'Missing target date or preferred workouts per week' }, { status: 400 });
}



    const startDate = new Date();
    const endDate = new Date(targetDate);
    const numWeeks = differenceInCalendarWeeks(endDate, startDate) + 1;
    const totalSessions = numWeeks * preferredWorkoutsPerWeek;

    // Sort slots and select up to totalSessions
    const sortedSlots = freeSlots.sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const selectedSlots = sortedSlots.slice(0, totalSessions);

    // const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    //   // {
    //   //   role: 'system',
    //   //   content:
    //   //   'You are a smart running coach. Your task is to generate a personalized weekly training plan that gradually builds the user\'s running capacity toward their training goal. Use the user\'s workout history and available time slots. Each week must include the number of sessions specified by the user. The plan must be spread evenly from today until the target date. Use a balanced mix of the following workout types: easy run, intervals, tempo run, long run, recovery run. The final workout must be scheduled on the exact target date and must match the training goal (e.g., 21 km for a Half Marathon). Format your response as JSON: { workouts: [{ date, time, distance, type }] }'
    //   //   // 'You are a smart running coach. Create a full training plan until the target date, including progressively harder workouts based on the user\'s history and availability.Use these workout types to build a balanced plan: - easy run - intervals - tempo run - long run - recovery run - race run .The final workout must match the training goal (e.g., 21 km for Half Marathon). Output JSON format: { workouts: [{ date, time, distance, type }] }',
    //   // },
    //   {
    //     role: 'system',
    //     content: `You are a smart running coach. Your job is to generate a personalized training plan tailored to the user's goal and schedule.

    //   The user has defined:
    //   - A specific training goal (e.g., 10K, half marathon)
    //   - A target date for completing that goal
    //   - A preferred number of workouts per week
    //   - Preferred workout times during the day
    //   - A history of past workouts
    //   - A list of available time slots for future workouts

    //   Your task is to:
    //   1. Plan a balanced and progressive running program **from today until the target date**.
    //   2. Respect the user's **preferred time of day**, **past workout history**, and **available time slots**.
    //   3. Try to include the user's preferred number of workouts per week. If availability is limited, reduce frequency accordingly, while keeping the training effective.
    //   4. Use a mix of workout types: **easy run, intervals, tempo run, long run, recovery run**.
    //   5. ✅ The **final workout must be scheduled exactly on the target date** and should be a **race run** that exactly matches the user's training goal (e.g., 21 km for a half marathon).

    //   The training plan must be returned in this format:
    //   \`\`\`json
    //   {
    //     "workouts": [
    //       { "date": "YYYY-MM-DD", "time": "HH:mm", "distance": "X km", "type": "Run Type" }
    //     ]
    //   }
    //   \`\`\``
    //   },
    //   {
    // role: 'user',
    // content: `Goal: ${trainingGoal?.type}
    // Target date: ${targetDate}
    // Weekly goal: ${weeklyGoal?.type} – ${weeklyGoal?.value} sessions/week
    // Total sessions: ${totalSessions}
    // Past workouts:
    // ${diaryEntries.map((entry: any) => `${entry.date} – ${entry.distance} km – ${entry.runType || 'Run'}`).join('\n')}

    // Available time slots:
    // ${selectedSlots.map((slot: any) => `${format(new Date(slot.start), 'yyyy-MM-dd')} ${format(new Date(slot.start), 'HH:mm')} - ${format(new Date(slot.end), 'HH:mm')}`).join('\n')}

    // Please ensure the final workout is on the target date (${targetDate}) and exactly matches the training goal (e.g., 21 km race run for half marathon).
    // `,

    //   },
    // ];
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are a smart running coach. Your job is to generate a personalized training plan for a user.

  The user has provided:
  - A running goal (e.g., 10K, half-marathon)
  - A target date for reaching the goal
  - Preferred number of workouts per week
  - A history of past workouts
  - Preferred time of day for workouts
  - A list of available time slots for the next few weeks

  Your task is to:
  1. Plan a progressive and balanced running program **from today until the target date**.
  2. Use the provided free time slots to set the structure and rhythm for the first weeks.
  3. After those slots run out, continue the training plan in a similar pattern (same number of workouts per week and similar days/times).
  4. Use a mix of these run types: **easy run, intervals, tempo run, long run, recovery run**.
  5. ✅ The **final workout must be on the target date** and should be a **race run** that matches the user's goal exactly (e.g., 21 km for a half marathon).

  Return the training plan in this exact format:
  \`\`\`json
  {
    "workouts": [
      { "date": "YYYY-MM-DD", "time": "HH:mm", "distance": "X km", "type": "Run Type" }
    ]
  }
  \`\`\``
    },
    {
      role: 'user',
      content: `Goal: ${trainingGoal?.type}
  Target date: ${targetDate}
  Preferred workouts per week: ${preferredWorkoutsPerWeek}

  Past workouts:
  ${diaryEntries.map((entry: any) => `${entry.date} – ${entry.distance} km – ${entry.runType || 'Run'}`).join('\n')}

  Available time slots for next weeks:
  ${selectedSlots.slice(0, 28).map((slot: any) =>
    `${format(new Date(slot.start), 'yyyy-MM-dd')} ${format(new Date(slot.start), 'HH:mm')} - ${format(new Date(slot.end), 'HH:mm')}`
  ).join('\n')}

  🟩 Please ensure:
- The training continues weekly until the target date, even if time slots are no longer provided.
- ⏰ The final workout **must be scheduled exactly on the target date (${targetDate})**, and it must be a **race run** of type "${trainingGoal?.type}" (e.g., 21 km for half marathon).
- If no free time slots are available for that date, **you must still include the race run anyway.**
`,
    }
  ];


    console.log('📤 Sent to GPT:', messages);
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const rawText = response.choices[0]?.message?.content || '{}';

    try {
      const parsed = JSON.parse(rawText);
      return NextResponse.json(parsed);
    } catch (error) {
      console.error('❌ Failed to parse AI response:', rawText);
      return NextResponse.json({ error: 'Failed to parse AI response', raw: rawText }, { status: 500 });
    }
  } catch (err: any) {
    console.error('❌ Smart Plan API error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
