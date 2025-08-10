import { Router } from 'express';
import OpenAI from 'openai';
import { format, differenceInCalendarWeeks } from 'date-fns';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';

const router = Router();

let openai: OpenAI;

const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

router.post('/generate', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      trainingGoal,
      targetDate,
      weeklyGoal,
      preferredWorkoutsPerWeek,
      diaryEntries,
      freeSlots
    } = req.body;

    if (!targetDate || !preferredWorkoutsPerWeek) {
      return res.status(400).json({ 
        error: 'Missing target date or preferred workouts per week' 
      });
    }

    const startDate = new Date();
    const endDate = new Date(targetDate);
    const numWeeks = differenceInCalendarWeeks(endDate, startDate) + 1;
    const totalSessions = numWeeks * preferredWorkoutsPerWeek;

    // Sort slots and select up to totalSessions
    const sortedSlots = freeSlots.sort((a: any, b: any) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    const selectedSlots = sortedSlots.slice(0, totalSessions);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `
You are an experienced **running coach** who builds smart, progressive training plans for different running goals.

The user will provide:
- A running goal: 5K, 10K, Half Marathon (21 km), or Marathon (42 km)
- A target race date
- Preferred number of workouts per week (e.g. 3–6)
- Past workout history (distance and type)
- Available free time slots for the next few weeks

Your job is to create a **progressive weekly plan** that prepares the user for their goal safely and effectively.

RULES:
1. **Adapt the plan to the goal**:
  - **5K goal** → shorter distances, more speed/interval work.
  - **10K goal** → moderate distances, mix of tempo & intervals.
  - **Half Marathon** → gradually increase long runs up to ~18–20 km.
  - **Marathon** → gradually increase long runs up to ~32–35 km.
2. Respect the user's **preferred workouts per week**.
3. Each week must include a logical mix of:
  - Easy runs (recovery pace)
  - Interval/speed runs
  - Tempo runs (moderate sustained pace)
  - Long runs (gradually increasing)
4. Long runs should **progressively increase ~5–10% per week**.
5. Every 3–4 weeks, include a **cutback week** (reduced volume for recovery).
6. The **final workout** must be on the target race date and match the goal:
  - 5 km race
  - 10 km race
  - Half Marathon (21 km)
  - Marathon (42 km)
7. Use the **provided free slots** for the first weeks; after they run out, maintain the same weekday pattern.

DISTANCE GUIDELINES:
- Easy Runs: 4–8 km (or 20–40 min)
- Interval Runs: 5–8 km (e.g. 6×400m, 4×800m)
- Tempo Runs: 6–12 km depending on the goal
- Long Runs:
  - 5K goal → max ~10 km
  - 10K goal → max ~14–16 km
  - Half Marathon → max ~18–20 km
  - Marathon → max ~32–35 km

Return ONLY JSON in this format:
\`\`\`json
{
  "workouts": [
    { "date": "YYYY-MM-DD", "time": "HH:mm", "distance": "X km", "type": "Run Type" }
  ]
}
\`\`\`
`
      },
      {
        role: "user",
        content: `Goal: ${trainingGoal?.type}  
Target date: ${targetDate}  
Preferred workouts per week: ${preferredWorkoutsPerWeek}  

Past workouts:  
${diaryEntries.map((entry: any) => 
  `${entry.date} – ${entry.distance} km – ${entry.runType || 'Run'}`
).join('\n')}  

Available time slots for the next weeks:  
${selectedSlots.slice(0, 28).map((slot: any) =>
  `${format(new Date(slot.start), 'yyyy-MM-dd')} ${format(new Date(slot.start), 'HH:mm')} - ${format(new Date(slot.end), 'HH:mm')}`
).join('\n')}  

🟩 Please ensure:
- Weekly progression makes sense for **${trainingGoal?.type}**.
- Long runs and distances gradually progress toward the race distance.
- Include recovery/cutback weeks.
- Final run MUST be on ${targetDate} and exactly match the goal (${trainingGoal?.type}).`
      }
    ];

    console.log('📤 Sent to GPT:', messages);
    
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const rawText = response.choices[0]?.message?.content || '{}';

    try {
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', rawText);
      return res.status(500).json({ 
        error: 'Failed to parse AI response', 
        raw: rawText 
      });
    }
  } catch (error) {
    return next(error);
  }
});

export { router as smartPlanRoutes };