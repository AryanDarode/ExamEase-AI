/* ============================================
   Simulated AI Engine for ExamEase AI
   Smart template-based logic for:
   - Study plan generation
   - Personalized recommendations
   - Chatbot responses
   ============================================ */

import { getExams, getStressLogs, getLatestStressLog, getDaysUntil, getUser } from './storage';

// ============================================
// Study Plan Generator
// ============================================

export function generateStudyPlan(subjects, availableHours) {
  // subjects: [{ name, difficulty, prepLevel }]
  // availableHours: number

  if (!subjects || subjects.length === 0) return [];

  // Weight by difficulty
  const difficultyWeights = { hard: 3, medium: 2, easy: 1 };
  const totalWeight = subjects.reduce(
    (sum, s) => sum + (difficultyWeights[s.difficulty] || 2),
    0
  );

  const tasks = [];
  let currentTime = 9 * 60; // Start at 9:00 AM in minutes

  // Allocate time proportionally
  subjects.forEach((subject, idx) => {
    const weight = difficultyWeights[subject.difficulty] || 2;
    const allocatedMinutes = Math.round((weight / totalWeight) * availableHours * 60);

    // Split into sessions (max 60 min each)
    let remaining = allocatedMinutes;
    let sessionNum = 1;
    while (remaining > 0) {
      const sessionLen = Math.min(remaining, 60);
      const startH = Math.floor(currentTime / 60);
      const startM = currentTime % 60;
      const endTime = currentTime + sessionLen;
      const endH = Math.floor(endTime / 60);
      const endM = endTime % 60;

      const formatT = (h, m) =>
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      const topicHint = getTopicHint(subject, sessionNum);

      tasks.push({
        id: `task-${idx}-${sessionNum}`,
        time: `${formatT(startH, startM)} – ${formatT(endH, endM)}`,
        subject: subject.name,
        activity: topicHint,
        duration: sessionLen,
        difficulty: subject.difficulty,
        completed: false,
        type: 'study',
      });

      currentTime = endTime;
      remaining -= sessionLen;
      sessionNum++;

      // Add break after each session
      if (remaining > 0 || idx < subjects.length - 1) {
        const breakLen = 15;
        const breakStart = currentTime;
        const breakEnd = currentTime + breakLen;
        tasks.push({
          id: `break-${idx}-${sessionNum}`,
          time: `${formatT(Math.floor(breakStart / 60), breakStart % 60)} – ${formatT(Math.floor(breakEnd / 60), breakEnd % 60)}`,
          subject: 'Break',
          activity: getBreakActivity(),
          duration: breakLen,
          completed: false,
          type: 'break',
        });
        currentTime = breakEnd;
      }
    }
  });

  return tasks;
}

function getTopicHint(subject, sessionNum) {
  const hints = {
    hard: [
      `Core concepts & theory`,
      `Problem solving practice`,
      `Revision & formula review`,
      `Mock questions`,
    ],
    medium: [
      `Key topics review`,
      `Practice exercises`,
      `Summary notes`,
    ],
    easy: [
      `Quick revision`,
      `Practice problems`,
      `Self-test`,
    ],
  };
  const pool = hints[subject.difficulty] || hints.medium;
  return pool[(sessionNum - 1) % pool.length];
}

function getBreakActivity() {
  const activities = [
    '☕ Stretch & hydrate',
    '🚶 Short walk',
    '🧘 Deep breathing',
    '🎵 Listen to music',
    '☕ Tea/coffee break',
    '👀 Rest your eyes',
  ];
  return activities[Math.floor(Math.random() * activities.length)];
}

// ============================================
// Recommendation Engine
// ============================================

export function generateRecommendation(userObj) {
  const user = userObj || getUser();
  const isSchool = user?.student_type === 'school';
  const stressLog = getLatestStressLog();
  const exams = getExams();
  const upcomingExams = exams
    .filter(e => getDaysUntil(e.examDate) > 0)
    .sort((a, b) => getDaysUntil(a.examDate) - getDaysUntil(b.examDate));

  const nearestExam = upcomingExams[0];
  const daysLeft = nearestExam ? getDaysUntil(nearestExam.examDate) : null;
  const prep = nearestExam ? nearestExam.preparationPct : 0;
  const stress = stressLog ? stressLog.stressScore : 5;
  const sleep = stressLog ? stressLog.sleepHours : 7;
  const studyH = stressLog ? stressLog.studyHours : 4;

  const tips = [];

  // Stress-based
  if (stress >= 8) {
    if (isSchool) {
      tips.push('🧘 Take a short break! Do 3 minutes of gentle breathing and chat with your parents or teacher about how you feel.');
      tips.push('💬 Remember: you don\'t have to be perfect. Take it one chapter at a time.');
    } else {
      tips.push('🧘 Your stress level is high. Take a 5-minute breathing exercise before your next study session.');
      tips.push('💬 Consider talking to a friend, family member, or counsellor about how you\'re feeling.');
    }
  } else if (stress >= 6) {
    tips.push(isSchool
      ? '⏱️ Try study sprints: 25 minutes of fun focus, then a 5-minute snack/water break!'
      : '⏱️ Use the Pomodoro technique: 25 min study + 5 min break to stay focused.'
    );
  } else {
    tips.push(isSchool
      ? '🌟 You are doing great! Keep a steady pace and enjoy your learning.'
      : '✅ Your stress is manageable — great job! Keep up the balanced approach.'
    );
  }

  // Sleep-based
  if (sleep < (isSchool ? 8 : 6)) {
    tips.push(isSchool
      ? '😴 Growing brains need 8–9 hours of sleep! Sleeping well helps you remember formulas and answers easily.'
      : '😴 You\'re not getting enough sleep. Aim for 7–8 hours — sleep significantly improves memory retention.'
    );
  } else if (sleep >= 8) {
    tips.push('😊 Awesome sleep schedule! A well-rested brain thinks clearly in tests.');
  }

  // Exam proximity
  if (daysLeft !== null && daysLeft <= 2) {
    tips.push(isSchool
      ? `📅 Your ${nearestExam.subject} test is in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}! Review your chapter summary notes and practice 3 important questions.`
      : `📅 Your ${nearestExam.subject} exam is in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}! Focus on the most important topics and do a quick revision.`
    );
    if (prep < 50) {
      tips.push(isSchool
        ? '⚡ Focus on the most frequently asked textbook questions and summary diagrams first.'
        : '⚡ Preparation is below 50% — prioritize the highest-weight topics and practice past questions.'
      );
    }
  } else if (daysLeft !== null && daysLeft <= 5) {
    tips.push(isSchool
      ? `📚 ${nearestExam.subject} is coming up in ${daysLeft} days. Break it into simple daily chunks!`
      : `📚 ${nearestExam.subject} exam in ${daysLeft} days. You have time — create a focused revision plan.`
    );
  }

  // Study hours
  if (studyH > (isSchool ? 6 : 8)) {
    tips.push(isSchool
      ? '⚠️ You have studied for a long time today! Step away from your desk, stretch, and get some fresh air.'
      : '⚠️ You\'ve been studying for over 8 hours. Take a proper break — diminishing returns set in after long sessions.'
    );
  } else if (studyH < 2) {
    tips.push(isSchool
      ? '📖 Try setting aside 1–2 hours of focused study after school today.'
      : '📖 Try to study for at least 3–4 hours today. Even small consistent effort adds up.'
    );
  }

  // Preparation level
  if (nearestExam && prep >= 80) {
    tips.push(`🎉 You're at ${prep}% preparation for ${nearestExam.subject} — super work! Review the tricky points and stay confident.`);
  }

  return tips.length > 0 ? tips : ['💡 Keep up the good work! Stay consistent with your study plan.'];
}

// ============================================
// Chat Bot (Simulated AI with Adaptive School & College Tone)
// ============================================

export function generateChatResponse(message, userObj) {
  const user = userObj || getUser();
  const isSchool = user?.student_type === 'school';
  const grade = user?.grade || '10';
  const board = user?.board || 'CBSE';
  const lowerMsg = message.toLowerCase().trim();

  // 1. Tomorrow / Daily Revision Plan
  if (lowerMsg.includes('revision plan') || lowerMsg.includes('plan for tomorrow') || lowerMsg.includes('schedule for tomorrow')) {
    if (isSchool) {
      return `Here is a fun and balanced **After-School Study Plan for Class ${grade} (${board})**:

📅 **Easy Daily Schedule:**
• **04:30 PM – 05:00 PM**: Unwind after school with a healthy snack & fresh water 🍎
• **05:00 PM – 05:45 PM** (Block 1): **Tricky Subject Focus** (Solve math problems or read science concepts)
• **05:45 PM – 06:00 PM**: 15-minute screen-free break (stretch or listen to a song) 🎵
• **06:00 PM – 06:45 PM** (Block 2): **Homework & Chapter Practice** (Short questions & textbook exercises)
• **06:45 PM – 07:15 PM**: Free playtime or quick walk outside 🏃
• **07:15 PM – 08:00 PM** (Block 3): **Language / Social Science Revision** (Key definitions & diagrams)
• **08:30 PM – 09:30 PM**: Dinner with family & relaxed review of today's notes
• **10:00 PM**: Lights out! (9 full hours of sleep so your memory stays razor-sharp!) 😴

💡 **Tip**: Open the **Study Planner** tab to generate your automatic timetable!`;
    }

    return `Here is a high-yield **Revision Plan for Tomorrow** designed to maximize retention while preventing burnout:

📅 **Recommended Daily Schedule:**
• **08:30 AM – 09:00 AM**: Healthy breakfast, hydration, and goal setting
• **09:00 AM – 11:00 AM** (Block 1): **Deep Work on Hardest Subject** (e.g., core problem-solving, difficult concepts)
• **11:00 AM – 11:20 AM**: 20-minute physical stretch & screen-free break
• **11:20 AM – 01:00 PM** (Block 2): **Active Recall & Past Year Questions**
• **01:00 PM – 02:00 PM**: Nutritious lunch & 15-minute relaxation
• **02:00 PM – 04:00 PM** (Block 3): **Secondary Subject Revision & Formula Sheets**
• **04:00 PM – 04:30 PM**: Outdoor walk or box breathing reset
• **04:30 PM – 06:30 PM** (Block 4): **Self-Testing & Flashcards (Leitner Method)**
• **08:00 PM – 09:00 PM**: Light summary review & organizing tomorrow's priorities
• **10:30 PM**: Sleep (7.5+ hours of sleep for memory consolidation)

💡 **Pro Tip**: Use the **Study Planner** tab on the left to customize this schedule to your exact registered subjects!`;
  }

  // 2. Last minute / 2 days left
  if (lowerMsg.includes('2 days') || lowerMsg.includes('3 chapters') || lowerMsg.includes('few days left') || lowerMsg.includes('cramming')) {
    if (isSchool) {
      return `Don't worry, you can easily finish this! Here is a simple **3-Step Game Plan**:

🌟 **Day 1: Master the Key Chapters:**
1. **Morning**: Read the chapter summaries at the back of each lesson. Write down all bold keywords.
2. **Afternoon**: Solve the main 4 practice questions at the end of each chapter.
3. **Evening**: Make a 1-page "Cheat Sheet" with formulas and neat labeled diagrams.

🌟 **Day 2: Quick Practice & Confidence:**
1. **Morning**: Try writing definitions from memory without looking.
2. **Afternoon**: Solve 1 sample question paper with a timer.
3. **Evening**: Pack your school bag (pens, pencils, geometry box) by 8:30 PM and sleep early!

Remember: Staying calm will help you write great answers tomorrow! You've got this! ✨`;
    }

    return `Don't panic! Having 3 chapters left with 2 days to go is completely manageable if you use the **80/20 High-Yield Strategy**:

🎯 **Day 1 (Master Core Chapters 1 & 2):**
1. **Chapter 1 (Morning)**: Skim summary notes & highlight top 5 most frequently tested derivations/theorems. Solve 3 representative problems.
2. **Chapter 2 (Afternoon)**: Use the **Blurting Technique** — read for 25 mins, close the book, and write down key concepts from memory.
3. **Evening Review**: Create a single one-page "Cheat Sheet" containing all formulas, definitions, and diagrams from both chapters.

🎯 **Day 2 (Chapter 3 & Full Mock):**
1. **Chapter 3 (Morning)**: Spend 2.5 focused hours on the highest-weighted sections. Don't read word-for-word; focus on examples and summaries.
2. **Afternoon (Timed Mini-Test)**: Solve 1 past question paper under exam conditions.
3. **Evening (Rest & Consolidate)**: Stop studying by 9:00 PM. Pack your exam kit (pens, hall ticket, calculator) and sleep 8 hours.

Remember: Clarity and calm thinking during the exam will fetch you far more marks than an all-nighter!`;
  }

  // 3. Stress / anxiety
  if (lowerMsg.includes('stress') || lowerMsg.includes('anxious') || lowerMsg.includes('worried') || lowerMsg.includes('panic') || lowerMsg.includes('overwhelm') || lowerMsg.includes('nervous')) {
    if (isSchool) {
      return `It is completely normal to feel nervous before school tests! Let's do a quick calm reset together:

🌈 **Quick 60-Second Reset:**
1. **Belly Breathing**: Take a slow breath in like smelling a flower, then gently blow it out like blowing bubbles. Do this 3 times! 🌸
2. **Relax Your Hands**: Open your hands wide, shake your fingers, and smile.
3. **Talk to Someone You Trust**: If exam pressure is making you sad or worried, talk openly with your **parents, family, or class teacher / school counselor**. They are always there to help you!

💡 **Remember**: One test does not define who you are. Just do your best, step by step! Try the guided breathing on our **Quick Reset** page!`;
    }

    return `I hear you, and it's completely normal to feel exam anxiety. Let's reset your physiology right now:

🧘 **Immediate 60-Second De-escalation:**
1. **The Physiological Sigh**: Take two quick inhales through your nose, then a long, slow exhale through your mouth. Do this 3 times right now.
2. **Drop Your Shoulders**: Unclench your jaw, drop your shoulders away from your ears, and relax your forehead.
3. **5-4-3-2-1 Sensory Anchor**:
   • Look for 5 colors around your desk
   • Touch 4 physical textures (desk, clothes, pen)
   • Notice 3 sounds
   • Identify 2 smells
   • Take 1 sip of cool water

💡 **Mental Reframing**: "I do not need to know everything perfectly; I only need to calmly write down what I know." Check the **Quick Reset** page for guided box breathing!`;
  }

  // 4. Study techniques / Pomodoro
  if (lowerMsg.includes('pomodoro') || lowerMsg.includes('technique') || lowerMsg.includes('feynman') || lowerMsg.includes('active recall') || lowerMsg.includes('study method')) {
    if (isSchool) {
      return `Here are 3 super fun study tricks that help school students score higher with less effort:

⏱️ **1. The 25-Minute Study Sprint:**
• Put away phones and toys for 25 minutes.
• Focus on just one single exercise or chapter topic.
• Ring a timer, then enjoy a 5-minute fun break!

🗣️ **2. Teach Your Teddy / Pet (Feynman Trick):**
• Pick any science or history concept.
• Explain it out loud to a sibling, pet, or imaginary friend in your own simple words.
• If you get stuck, look at your textbook to find the answer!

🃏 **3. Flashcard Quiz:**
• Write questions on one side of small paper cards and the answer on the back.
• Quiz yourself before dinner. It makes memory stick 3x faster!`;
    }

    return `Here are the top 3 scientifically validated study frameworks for students:

⏱️ **1. The Modified Pomodoro (50/10 or 25/5):**
• Study intensely with zero distractions for 50 minutes.
• Take a 10-minute restorative break (no scrolling social media).
• After 4 cycles, take an extended 30-minute break.

🧠 **2. The Feynman Technique:**
• Pick any complex topic.
• Explain it out loud in plain, simple English as if teaching a 10-year-old child.
• Whenever you get stuck or use jargon, consult your textbook to fill the gap.

📝 **3. Active Recall & Spaced Repetition:**
• Reading notes repeatedly gives an illusion of competence.
• Instead, test yourself before rereading notes. Flashcards and blurting improve long-term retention by up to 300%.`;
  }

  // 5. Practice questions
  if (lowerMsg.includes('question') || lowerMsg.includes('practice') || lowerMsg.includes('quiz') || lowerMsg.includes('test me') || lowerMsg.includes('mock')) {
    if (isSchool) {
      return `Here are 4 quick self-check questions to test your revision right now:

1. 📝 **What is the main definition in your current lesson?** Try writing it without looking.
2. 📐 **Can you draw or write the 3 key steps/formulas of this topic?**
3. ❓ **What is one question your teacher might ask in tomorrow's test?**
4. 🌟 **Can you explain the main difference between two opposite concepts in this chapter?**

💡 **Tip**: Reviewing the summary questions at the end of your textbook chapter is the best way to score full marks!`;
    }

    return `Here are 5 active practice questions you can test yourself on right now:

1. **What is the central concept or formula of your current study chapter?** Write it down without looking.
2. **Can you explain the difference between the top 2 related terms in your syllabus?** (e.g., Series vs Parallel, BFS vs DFS, Mitosis vs Meiosis).
3. **If this chapter appears on tomorrow's test, what is the most probable 5-mark question?** Outline its main points.
4. **Identify 1 common trap or mistake students make in this topic.**
5. **Solve 1 numerical or application question under a 5-minute timer.**

💡 **Recall Tip**: Check past year question papers (PYQs). More than 60% of test questions follow standard recurring patterns!`;
  }

  // 6. Technical / Subjects
  if (lowerMsg.includes('math') || lowerMsg.includes('calculus') || lowerMsg.includes('physics') || lowerMsg.includes('science') || lowerMsg.includes('coding') || lowerMsg.includes('chemistry')) {
    if (isSchool) {
      return `Here is an easy guide to score high in Science and Math for Class ${grade}:

📐 **For Mathematics:**
1. **Formula Diary**: Keep a small pocket notebook for all formulas and unit conversions.
2. **Step-by-Step Marks**: Write every step clearly — teachers give method marks even if the final calculation has a small slip!
3. **Solve Examples First**: Practice the solved textbook examples before doing exercise questions.

🧪 **For Science (Physics, Chemistry, Biology):**
1. Practice drawing clean, labeled diagrams with a sharp pencil.
2. Underline key scientific words (e.g., *photosynthesis, refraction, valency*).
3. Connect concepts to everyday life (like how a mirror reflects light!).`;
    }

    return `Here is a subject-mastery roadmap for technical subjects:

📐 **For Problem-Solving & Mathematics / Physics:**
1. **Derive, Don't Memorize**: Understand the root assumptions behind key formulas.
2. **Formula Sheet**: Maintain a 2-page master formula sheet with variable units and sign conventions.
3. **Error Logbook**: Keep track of questions you got wrong and redo them 24 hours later.

💻 **For Computer Science / Algorithms:**
1. Focus on standard patterns (Two pointers, Sliding window, BFS/DFS, DP memoization).
2. Trace code manually on paper with sample test inputs and boundary cases (empty input, negatives, overflow).

🧪 **For Chemistry / Theory:**
1. Group mechanisms and periodic trends using visual mind-maps.`;
  }

  // 7. Sleep & Nutrition
  if (lowerMsg.includes('sleep') || lowerMsg.includes('tired') || lowerMsg.includes('exhausted') || lowerMsg.includes('diet') || lowerMsg.includes('food')) {
    if (isSchool) {
      return `Here is why healthy sleep is your secret weapon for school success:

😴 **Sleep Superpower:**
• School students need **8 to 9 hours** of peaceful sleep every night.
• While you sleep, your brain organizes what you studied during the day into long-term memory.
• Never study late into the night before a test — sleeping well helps your mind think fast and accurately!

🍎 **Brain Food & Energy:**
• Drink plenty of fresh water throughout the day.
• Eat fresh fruits, nuts, and home-cooked meals instead of sugary snacks.`;
    }

    return `Sleep is the biological engine of memory consolidation. Here is your protocol:

😴 **Sleep Strategy:**
• Aim for **7 to 8 hours** of continuous sleep. Rapid Eye Movement (REM) sleep is when your brain organizes facts memorized during the day into long-term storage.
• All-nighters can drop cognitive recall and processing speed by over 35%.
• If feeling exhausted in the afternoon, take a **20-minute power nap** before 4:00 PM.

🍎 **Exam Nutrition:**
• **Stay Hydrated**: Even a 2% drop in hydration impairs concentration.
• **Avoid Sugar Crashes**: Prefer complex carbs, nuts, and fruit over heavy junk food or excessive energy drinks.
• **Cut Caffeine after 5 PM**: Caffeine has a 6-hour half-life that interferes with restorative deep sleep.`;
  }

  // 8. Greetings
  if (lowerMsg.match(/^(hi|hello|hey|greetings|good morning|good evening)\b/) || lowerMsg === 'hi' || lowerMsg === 'hello') {
    if (isSchool) {
      return `Hello! 👋 I'm your **ExamEase AI Study Buddy** for Class ${grade} (${board}).

I'm here to help you study easily, do your homework, and stay happy:
• 📅 **Daily Timetable**: Ask *"Make a revision plan for tomorrow"*
• 🧘 **Feeling Nervous?**: Ask *"I'm feeling stressed about my exam"*
• 🧠 **Fun Study Tricks**: Ask *"How do I memorize chapters faster?"*
• 📝 **Practice Questions**: Ask *"Give me quick quiz questions"*

You can type any question or tap the **microphone icon** to speak to me directly! 🎙️`;
    }

    return `Hello! 👋 I'm your **ExamEase AI Academic & Wellbeing Coach**.

I'm here to help you study smarter, ace your exams, and stay calm:
• 📅 **Timetable & Revision Plans**: Ask *"Make a revision plan for tomorrow"*
• 🧘 **Stress & Anxiety Relief**: Ask *"I'm feeling stressed about my exam"*
• 🧠 **Study Techniques**: Ask *"How do I use active recall?"*
• 📝 **Practice & Quizzes**: Ask *"Give me active practice questions"*

You can type any question or tap the **microphone icon** to speak to me directly! 🎙️`;
  }

  // 9. Thank you
  if (lowerMsg.includes('thank') || lowerMsg.includes('thanks') || lowerMsg.includes('appreciate')) {
    return isSchool
      ? `You are so welcome! 😊 You are doing an awesome job. Keep learning, take happy breaks, and you'll do wonderful in your tests! 🌟`
      : `You're very welcome! 😊 Keep up the consistent effort. Believe in your preparation, take regular breaks, and you will do great! 💪`;
  }

  // Dynamic Helpful Response for any other question
  return isSchool
    ? `Thank you for asking about **"${message}"**! Here are simple steps to help you:

🌟 **3 Easy Tips:**
1. **Take it Step-by-Step**: Break this topic into 20-minute fun reading chunks.
2. **Write It Down**: Explain the main points in your own words in your notebook.
3. **Take a Break**: Drink a glass of water and stretch after completing each section!

Would you like me to make a quick daily timetable or give you practice questions for this? 😊`
    : `Thank you for asking about **"${message}"**. Here is guidance to help you make progress:

🎯 **Key Academic Takeaways:**
1. **Break it Down**: Dissect complex requirements into bite-sized 25-minute study segments.
2. **Active Engagement**: Don't just passively read — take summary notes, solve sample problems, or explain concepts in your own words.
3. **Paced Review**: Alternate between high-focus study and restorative breaks to keep your energy high.

💡 **Next Steps:**
• Would you like me to build a customized study timetable for this?
• Or do you want rapid practice questions and active recall tips?

Feel free to ask or speak your next question anytime!`;
}

// ============================================
// ML Stress Risk (Simulated)
// ============================================

export function estimateStressRisk() {
  const logs = getStressLogs().sort((a, b) => b.date.localeCompare(a.date));
  if (logs.length === 0) return { level: 'UNKNOWN', score: 0 };

  const recent = logs.slice(0, 5);
  const avgStress = recent.reduce((s, l) => s + l.stressScore, 0) / recent.length;
  const avgSleep = recent.reduce((s, l) => s + l.sleepHours, 0) / recent.length;
  const avgBreaks = recent.reduce((s, l) => s + l.breaksCount, 0) / recent.length;

  // Simple decision tree simulation
  let riskScore = 0;
  if (avgStress >= 7) riskScore += 3;
  else if (avgStress >= 5) riskScore += 2;
  else riskScore += 1;

  if (avgSleep < 5) riskScore += 3;
  else if (avgSleep < 7) riskScore += 1;

  if (avgBreaks < 1) riskScore += 2;
  else if (avgBreaks < 3) riskScore += 1;

  // Check trend (increasing stress?)
  if (logs.length >= 3) {
    const trend = logs[0].stressScore - logs[2].stressScore;
    if (trend > 2) riskScore += 2;
    else if (trend > 0) riskScore += 1;
  }

  // Exam proximity
  const exams = getExams().filter(e => getDaysUntil(e.examDate) > 0);
  const nearestDays = exams.length > 0
    ? Math.min(...exams.map(e => getDaysUntil(e.examDate)))
    : 30;
  if (nearestDays <= 2) riskScore += 2;
  else if (nearestDays <= 5) riskScore += 1;

  if (riskScore >= 8) return { level: 'ELEVATED', score: riskScore };
  if (riskScore >= 5) return { level: 'MODERATE', score: riskScore };
  return { level: 'LOW', score: riskScore };
}
