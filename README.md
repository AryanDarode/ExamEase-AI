# 🎓 ExamEase AI

> **An AI-Powered Personalized Wellbeing & Study Management System for Students**

[![SDG 3](https://img.shields.io/badge/SDG%203-Good%20Health%20%26%20Well--Being-4CAF50)](https://sdgs.un.org/goals/goal3)
[![SDG 4](https://img.shields.io/badge/SDG%204-Quality%20Education-2196F3)](https://sdgs.un.org/goals/goal4)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-MVP%20In%20Development-orange)]()

---

## 📌 Problem Statement

> *Design an AI-powered personalized wellbeing system to help students manage exam-related stress, optimize study habits, and maintain healthy academic routines.*

---

## 🚩 The Problem

During exam preparation, students commonly experience:

| Problem | Impact |
|---|---|
| Exam-related stress | Reduced performance & wellbeing |
| Poor study planning | Last-minute cramming |
| Difficulty managing multiple subjects | Topic overload |
| Lack of regular breaks | Mental fatigue |
| Poor sleep & unhealthy routines | Cognitive impairment |
| Inability to gauge personal stress levels | No early intervention |
| Lack of personalized academic support | Generic, ineffective advice |

*The exact problems should be validated through student surveys and interviews.*

---

## 💡 Proposed Solution

**ExamEase AI** is an AI-powered web application that combines study management and student wellbeing support. It will:

- ✅ Create personalized study plans
- ✅ Track stress and mood over time
- ✅ Monitor study progress per subject
- ✅ Provide AI-based study assistance (chatbot)
- ✅ Recommend breaks and relaxation activities
- ✅ Generate personalized daily recommendations
- ✅ Estimate stress risk using ML models
- ✅ Connect students to appropriate human/college support

---

## 👥 Target Users

**Primary:** College / undergraduate students preparing for examinations.

---

## 🔐 Authentication — Email OTP Verification

### Registration & Login Flow

Students **must** authenticate using their **college/personal email address with OTP verification**:

```
Student visits ExamEase AI
        ↓
Enter Email Address
        ↓
OTP sent to email (6-digit code, valid 10 minutes)
        ↓
Student enters OTP
        ↓
Email Verified ✅
        ↓
First-time? → Profile Setup (Name, College, Course, Year)
Returning?  → Dashboard (all previous data loaded)
```

### Why OTP-Based Authentication?

- **No passwords to forget** — students log in with their email every time
- **Secure** — OTP expires after 10 minutes
- **Simple UX** — minimal friction for student onboarding
- **Verified identity** — ensures real email ownership

### Persistent User Data

All student data is stored securely in the database and persists across sessions. When a returning student logs in, their **entire history** is loaded automatically:

| Data Category | What is Stored |
|---|---|
| **Profile** | Name, email, college, course, year |
| **Exams** | Subject names, exam dates, topics, difficulty levels |
| **Study Logs** | Daily study hours, tasks completed, timestamps |
| **Stress Logs** | Daily mood, stress score (1–10), sleep hours, breaks taken |
| **Study Plans** | AI-generated schedules (current + historical) |
| **Progress** | Per-subject completion %, consistency score |
| **Chat History** | AI assistant conversation logs |
| **Recommendations** | Past AI recommendations with timestamps |
| **Relaxation Logs** | Completed breathing/meditation sessions |

> **Implementation:** Use **Supabase Auth** with Email OTP (Magic Link / OTP mode). All user data is tied to the authenticated `user_id` in Supabase PostgreSQL.

---

## 🗺️ Application Flow

```
Student
   ↓
📧 Email OTP Login / Registration
   ↓
👤 Profile Setup (first time) or Load Previous Data (returning)
   ↓
📚 Exam & Subject Details (stored persistently)
   ↓
🏠 Dashboard
   ↓
┌──────────────────┬─────────────────────┐
│  📅 Study Planner │ 😟 Stress Tracker   │
└────────┬─────────┴──────────┬──────────┘
         ↓                    ↓
         └──────────┬─────────┘
                    ↓
               🤖 AI / ML Engine
                    ↓
        💬 Personalized Recommendations
                    ↓
         📖 Study + Wellbeing Support
                    ↓
            📊 Progress Tracking
```

---

## 🚀 Core Features

### A. 🏠 Dashboard

The home screen shows at a glance:

- Upcoming exams with countdown timers
- Today's study tasks and completion %
- Current / recent stress level indicator
- Study progress per subject
- Personalized AI recommendation of the day

**Example Display:**

```
┌─────────────────────────────────────────────┐
│  📅 Mathematics Exam — 5 days remaining     │
│  Preparation: ████████░░  68%               │
│  Stress Level: 🟡 Moderate                  │
│  ─────────────────────────────────────────  │
│  💡 AI Tip: Revise Integration for 60 mins  │
│             then take a 15-minute break.    │
└─────────────────────────────────────────────┘
```

---

### B. 📅 AI Study Planner

Students enter:

- Subjects, exam dates, topics
- Topic difficulty (Easy / Medium / Hard)
- Available study hours per day
- Current preparation level (%)

The AI generates a personalized daily schedule that **adapts** when tasks are completed or missed.

**Example:**

*Input:*

```
Mathematics — Difficult
Physics    — Medium
Programming — Easy
Available: 4 hours
```

*AI Output:*

```
09:00–10:00  📘 Mathematics (Core Topics)
10:00–10:15  ☕ Break
10:15–11:15  ⚡ Physics
11:15–11:30  ☕ Break
11:30–12:30  📘 Mathematics Practice
12:30–01:00  💻 Programming Revision
```

---

### C. 😟 Stress & Mood Tracker

Daily self-check-in:

| Field | Input Type |
|---|---|
| Mood | Emoji selector (😊 😐 😟 😰) |
| Stress Level | Slider 1–10 |
| Sleep Hours | Number input |
| Study Hours | Number input |
| Number of Breaks | Number input |

All entries are saved to the student's history and displayed as **trends over time** (charts).

**Example Entry:**

```
Mood:    😟 Stressed
Stress:  7/10
Sleep:   6 hours
Study:   5 hours
Breaks:  2
```

---

### D. 🤖 AI Assistant (Chatbot)

Students can ask questions like:

- *"Make a revision plan for tomorrow."*
- *"Explain this topic in simple language."*
- *"Give me 5 practice questions on Calculus."*
- *"I have an exam tomorrow and 2 chapters remaining. Help me plan."*
- *"I'm feeling stressed about my exam. What can I do right now?"*

> ⚠️ The AI provides general **educational and wellbeing support only** — not medical diagnosis.

Chat history is saved per user so students can revisit past conversations.

---

### E. 🧘 Quick Reset / Relaxation Module

Short activities available on-demand:

- 2-minute breathing exercise
- 5-minute breathing exercise
- Short guided meditation timer
- Stretching reminder
- Custom break timer

**Breathing Exercise UI:**

```
        ┌─────────────────┐
        │   QUICK RESET   │
        │                 │
        │   Breathe In    │
        │     4 sec       │
        │                 │
        │     Hold        │
        │     4 sec       │
        │                 │
        │   Breathe Out   │
        │     4 sec       │
        │                 │
        │    [ START ]    │
        └─────────────────┘
```

---

### F. 📊 Progress Dashboard

Students can view:

- Total study hours (daily / weekly / monthly)
- Tasks completed vs. total
- Subject-wise progress bars
- Study consistency score
- Stress trend chart
- Sleep trend chart

**Example:**

```
Mathematics    ████████░░  75%
Physics        ██████░░░░  60%
Programming    █████████░  90%

Study Consistency: 82% 🔥

Stress Trend:
Mon  ████░░░░░░  4/10
Tue  █████░░░░░  5/10
Wed  ███████░░░  7/10
Thu  ██████░░░░  6/10
```

---

### G. 💡 AI Recommendation System

This is one of the **most important features**.

The system considers: study progress + stress score + sleep hours + exam proximity + study habits + break frequency + task completion

**Example:**

*Input Context:*

```
Stress: 8/10 | Sleep: 5 hrs | Study: 7 hrs
Exam: 2 days away | Preparation: 55%
```

*AI Recommendation:*

```
📌 Prioritize the 2 most important remaining topics.
⏱️ Use 45-min study blocks with 10-min breaks.
🧘 Include one 5-minute breathing exercise after each block.
😴 Sleep at least 7 hours tonight — it improves memory consolidation.
```

Recommendations are **supportive**, not medical or diagnostic.

---

### H. 🆘 Support & Resources

- College counsellor contact information
- Mental health helpline numbers
- Study skills resources
- Peer support group links

Accessible from any screen via a dedicated menu item.

---

## 🧠 ML Stress-Risk Estimation

### Objective

Estimate exam-related stress risk from the student's **historical self-reported data**.

### Input Features

| Feature | Description |
|---|---|
| Stress score | Daily 1–10 rating |
| Mood | Encoded emoji value |
| Sleep hours | Hours slept |
| Study hours | Hours studied |
| Break frequency | Breaks per study session |
| Exam days remaining | Countdown value |
| Task completion rate | % tasks completed |
| Stress trend (3-day) | Increasing / stable / decreasing |

### Output

```
Stress Risk:  LOW  |  MODERATE  |  ELEVATED
```

### Recommended ML Models

| Model | Reason |
|---|---|
| **Decision Tree** ⭐ | Easy to explain during viva, highly interpretable |
| Random Forest | More accurate, handles noisy data well |
| Logistic Regression | Simple baseline, explainable coefficients |

> **Recommendation:** Start with **Decision Tree** — it is the easiest to explain during your viva presentation.

> **Stack:** Python + scikit-learn  
> **Deployment:** Flask or FastAPI microservice

### ⚠️ Important Framing

- ❌ **Do NOT say:** *"Our ML model detects depression or anxiety."*
- ✅ **DO say:** *"Our ML model estimates exam-related stress risk using self-reported student data to suggest appropriate wellbeing support."*

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React / Next.js |
| **Styling** | Tailwind CSS / Vanilla CSS |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth — **Email OTP / Magic Link** |
| **AI (Chatbot & Recommendations)** | LLM API (OpenAI / Google Gemini) |
| **ML (Stress Risk)** | Python + scikit-learn |
| **Charts & Visualization** | Chart.js / Recharts |
| **Prototype** | Figma |
| **Rapid AI Development** | Lovable or similar AI builder |
| **Deployment** | Vercel (frontend) + Railway / Render (ML API) |

> The developer can change the stack according to their expertise.

---

## 🎨 Design Thinking Process

### Stage 1 — Empathize 👂

Conduct student surveys and interviews. Sample questions:

1. How stressful are exams for you? (Scale 1–10)
2. What causes your exam stress the most?
3. How many hours do you study per day during exam season?
4. How many hours do you sleep during exam season?
5. Do you make a study timetable? Do you follow it?
6. Do you take regular breaks while studying?
7. What happens when you fall behind on your study plan?
8. What type of support would help you the most?
9. Would you use an AI-powered study assistant?
10. What single feature would make exam preparation easier for you?

Also consider: teacher/counsellor interviews if possible.

---

### Stage 2 — Define 🎯

After collecting actual responses, identify common problems.

**Define Statement:**

> *"Students need a simple and personalized way to balance exam preparation and wellbeing because poor planning, academic pressure, and unhealthy study routines can contribute to exam-related stress."*

---

### Stage 3 — Ideate 💡

Ideas generated:

- AI study planner
- Stress & mood tracker
- Break reminders & relaxation module
- Exam countdown timer
- AI study assistant (chatbot)
- Progress dashboard with charts
- Personalized AI recommendations
- Counsellor / support information page

**Selected Solution:** ExamEase AI — combines all of the above into one integrated platform.

---

### Stage 4 — Prototype 🖥️

Screens to build:

1. **Login / Registration** — Email OTP verification
2. **Profile Setup** — Name, college, course, year (first-time only)
3. **Dashboard** — Overview of exams, progress, stress, AI tips
4. **AI Study Planner** — Generate & manage study schedules
5. **Stress & Mood Tracker** — Daily check-in form + trend charts
6. **AI Assistant** — Chat interface for study & wellbeing questions
7. **Quick Reset / Relaxation** — Breathing exercises & timers
8. **Progress Dashboard** — Subject-wise progress, consistency, trends
9. **Support / Resources** — Counsellor contacts, helplines

---

### Stage 5 — Test 🧪

Test with **5–10 students**. Ask them to:

- [ ] Register using email OTP verification
- [ ] Set up their profile
- [ ] Add exams and subjects
- [ ] Generate an AI study plan
- [ ] Record their daily stress check-in
- [ ] Ask the AI assistant a question
- [ ] Use the Quick Reset breathing exercise
- [ ] View their progress dashboard
- [ ] Find the support / counsellor section

**Record feedback on:**

| Feedback Area | What to Ask |
|---|---|
| What they liked | ✅ |
| What confused them | ❓ |
| What was difficult to use | 🔴 |
| What features they wanted added | ➕ |
| What should be changed | 🔄 |

Then create **Version 2** based on their feedback.

---

## 🌍 SDG Mapping

### SDG 3 — Good Health and Well-Being 💚

| Application Feature | SDG 3 Contribution |
|---|---|
| Stress & Mood Tracker | Monitors student mental wellbeing |
| Quick Reset / Relaxation | Promotes healthy coping strategies |
| Study/break routine recommendations | Prevents academic burnout |
| Wellbeing recommendations | Personalized health guidance |
| Counselling pathway | Connects students to human support |

**PPT Statement:**

> *"SDG 3: Our project supports student mental well-being by helping students monitor exam-related stress and maintain healthier study routines."*

---

### SDG 4 — Quality Education 📘

| Application Feature | SDG 4 Contribution |
|---|---|
| AI Study Planner | Personalized learning paths |
| AI Study Assistant | Accessible educational support |
| Progress Tracking | Data-driven study improvement |
| Revision planning | Structured exam preparation |
| Personalized recommendations | Tailored academic guidance |

**PPT Statement:**

> *"SDG 4: Our project supports quality education through personalized study planning, progress tracking, and AI-based learning assistance."*

---

## ⚠️ Safety & Ethical Requirements

1. **Not a medical tool** — ExamEase AI is a *study and wellbeing support application*, not a medical diagnostic tool.
2. **No disorder diagnosis** — The application **does not** diagnose mental health disorders.
3. **High-stress intervention** — If a student repeatedly reports very high stress (≥ 8/10 for 3+ consecutive days) or expresses serious distress in chat, the application must:
   - Display an empathetic, supportive message
   - Encourage the student to contact a college counsellor, trusted person, or support service
   - Provide emergency helpline numbers where appropriate
4. **Data privacy** — All student data is stored securely in Supabase with row-level security. OTP verification ensures only authenticated users access their own data.
5. **Transparent AI** — The AI assistant clearly indicates it is an AI and cannot replace professional support.

---

## 📦 Development Roadmap

### Phase 1 — MVP (Must-Have) 🟢

- [ ] Email OTP authentication (Supabase Auth)
- [ ] Student profile setup with persistent storage
- [ ] Exam & subject management (CRUD)
- [ ] AI Study Planner (LLM-powered schedule generation)
- [ ] Stress & Mood daily tracker with form input
- [ ] Dashboard with exam countdown, progress overview
- [ ] Progress dashboard with basic charts
- [ ] Basic personalized recommendations

### Phase 2 — AI Integration 🔵

- [ ] AI Chatbot with conversation interface (LLM API)
- [ ] Advanced recommendation engine (context-aware)
- [ ] Quick Reset / Relaxation module with timers
- [ ] Support / Counsellor information section
- [ ] Chat history persistence per user
- [ ] Adaptive study plan (adjusts when tasks are missed/completed)

### Phase 3 — ML & Analytics 🟣

- [ ] ML stress-risk estimation model (Python + scikit-learn)
- [ ] Stress trend predictions and early warnings
- [ ] Advanced analytics dashboard
- [ ] Data export for students
- [ ] Version 2 improvements based on user testing feedback

---

## 📁 Project Structure (Suggested)

```
examease-ai/
├── frontend/                       # React / Next.js application
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/               # OTP login, registration, email verify
│   │   │   ├── Dashboard/          # Main dashboard widgets
│   │   │   ├── Planner/            # AI study planner UI
│   │   │   ├── StressTracker/      # Mood & stress check-in forms
│   │   │   ├── AIAssistant/        # Chatbot interface
│   │   │   ├── Relaxation/         # Quick reset / breathing exercises
│   │   │   ├── Progress/           # Charts & analytics views
│   │   │   └── Support/            # Counsellor & helpline links
│   │   ├── pages/                  # Route pages
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── utils/                  # Helper functions
│   │   ├── services/               # API service layer
│   │   └── styles/                 # CSS / styling
│   ├── package.json
│   └── .env.example
│
├── ml-service/                     # Python ML microservice
│   ├── model/
│   │   ├── train.py                # Model training script
│   │   ├── predict.py              # FastAPI inference endpoint
│   │   └── stress_model.pkl        # Saved trained model
│   ├── data/                       # Training data (anonymized)
│   ├── requirements.txt
│   └── .env.example
│
├── supabase/                       # Database config
│   ├── migrations/                 # SQL migration files
│   └── seed.sql                    # Sample seed data
│
├── docs/                           # Documentation
│   ├── design-thinking/            # Survey results, personas
│   └── screenshots/                # App screenshots
│
├── README.md                       # ← You are here
├── LICENSE
└── .gitignore
```

---

## 🗄️ Database Schema (Key Tables)

```sql
-- ============================================
-- Profiles (extends Supabase Auth users)
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    full_name TEXT,
    college TEXT,
    course TEXT,
    year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Exams & Subjects
-- ============================================
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    exam_date DATE NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    preparation_pct INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Study Logs (daily entries)
-- ============================================
CREATE TABLE study_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    hours_studied NUMERIC(4,2),
    tasks_completed INTEGER DEFAULT 0,
    tasks_total INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- ============================================
-- Stress & Mood Logs (daily entries)
-- ============================================
CREATE TABLE stress_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    mood TEXT,
    stress_score INTEGER CHECK (stress_score BETWEEN 1 AND 10),
    sleep_hours NUMERIC(4,2),
    study_hours NUMERIC(4,2),
    breaks_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- ============================================
-- AI-Generated Study Plans
-- ============================================
CREATE TABLE study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    plan_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI Recommendations
-- ============================================
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recommendation_text TEXT NOT NULL,
    context_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Chat Messages (AI Assistant history)
-- ============================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS)
-- Users can only access their own data
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Example RLS policy (repeat for each table)
CREATE POLICY "Users can only access own data"
    ON profiles FOR ALL
    USING (auth.uid() = id);
```

---

## 🚀 Getting Started (Developer Setup)

### Prerequisites

- Node.js 18+
- Python 3.10+
- Supabase account (free tier works)
- LLM API key (OpenAI or Google Gemini)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/examease-ai.git
cd examease-ai
```

### 2. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your keys (see Environment Variables below)
npm run dev
```

### 3. Configure Supabase Auth (Email OTP)

In your Supabase dashboard:

1. Go to **Authentication → Providers → Email**
2. Enable **"Email OTP"** (Magic Link / OTP mode)
3. Set OTP expiry to **10 minutes**
4. Customize the email template with ExamEase AI branding
5. Run the SQL migrations from `supabase/migrations/` to create tables
6. Enable **Row Level Security** on all tables

### 4. Setup ML Service (Phase 3)

```bash
cd ml-service
pip install -r requirements.txt
python model/train.py           # Train the initial model
uvicorn predict:app --reload    # Start FastAPI server on port 8000
```

### 5. Environment Variables

**Frontend** (`.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key_here
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8000
```

**ML Service** (`.env`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

---

## 👨‍💻 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- Design Thinking methodology guided this project's user-centered development process
- Aligned with the United Nations Sustainable Development Goals (SDG 3 & SDG 4)
- Built to support student wellbeing during high-pressure academic periods

---

## 📋 Final Project Summary

| Item | Detail |
|---|---|
| **Project Name** | ExamEase AI |
| **Problem** | Exam stress + poor study management + unhealthy routines |
| **Target Users** | College / undergraduate students |
| **Solution** | AI-powered study & wellbeing web application |
| **Authentication** | Email OTP verification (no passwords) |
| **Data Persistence** | All user data stored & loaded on login |
| **AI** | Personalized study plans, chatbot, recommendations |
| **ML** | Stress-risk estimation (Decision Tree / Random Forest) |
| **Design Thinking** | Empathize → Define → Ideate → Prototype → Test → Improve |
| **SDGs** | SDG 3 (Health & Well-Being) + SDG 4 (Quality Education) |
| **Final Goal** | Help students prepare better for exams without sacrificing their wellbeing |

---

> ### 🌟 *ExamEase AI — Study Smart. Stay Well. Succeed.*
