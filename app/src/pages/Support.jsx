import React from 'react';
import {
  LifeBuoy,
  Phone,
  Mail,
  Building,
  Heart,
  ShieldAlert,
  HelpCircle,
  Clock,
  School,
  Users,
  MessageCircleHeart,
} from 'lucide-react';
import { getUser, isUnder18User } from '../utils/storage';
import './Support.css';

const FAQS = [
  {
    q: 'How does the AI Study Planner work for school and college students?',
    a: 'It analyzes your academic grade (Grades 6–12) or college major, exam dates, subject difficulty weights (1x for Easy, 2x for Medium, 3x for Hard), and available study hours. It generates structured sessions of maximum 45–60 minutes with built-in 15-minute relaxation breaks to keep learning fresh.',
  },
  {
    q: 'Does ExamEase AI diagnose anxiety, burnout, or medical conditions?',
    a: 'No. ExamEase AI is strictly an academic organization and student wellbeing tool. It never provides medical, clinical, or psychiatric diagnoses. If you experience persistent distress, please speak to your parents/guardians, school/college counsellor, or a healthcare professional.',
  },
  {
    q: 'How is student data kept private and safe?',
    a: 'All study schedules, self-reported mood check-ins, and syllabus progress are stored securely in your browser session and associated with your student account. We do not sell or broadcast student information.',
  },
  {
    q: 'What should school students do when feeling overwhelmed by exams?',
    a: 'Take a step back, try the guided breathing on the Quick Reset page, and talk openly with your parents, guardians, or favorite teacher. Remember that school tests are just practice steps for learning and do not define your worth!',
  },
];

export default function Support() {
  const user = getUser();
  const isSchool = user?.student_type === 'school';
  const isUnder18 = isUnder18User(user);

  return (
    <div className="support-page animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="support-icon-badge">
            <LifeBuoy size={28} />
          </div>
          <div>
            <h1 className="page-title">
              {isSchool ? 'School Student & Wellbeing Support Hub' : 'Student Wellbeing & Support Hub'}
            </h1>
            <p className="page-subtitle">
              {isSchool
                ? 'Safe guidance, school counsellor contacts, parent communication tips, and 24/7 student helplines.'
                : 'Confidential campus counselling resources, national student helplines, and wellbeing guidance.'}
            </p>
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="support-safety-card glass-card">
        <div className="support-safety-icon">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h3>Academic Wellbeing & Safety Notice</h3>
          <p>
            ExamEase AI is designed to help you organize revision and practice healthy study habits. It is <strong>not a medical diagnostic tool</strong>. If you feel overwhelmed, severely anxious, or hopeless, please immediately reach out to{' '}
            <strong>your parents/guardians</strong>, your <strong>{isSchool ? 'school counsellor / class teacher' : 'university counsellor / faculty mentor'}</strong>, or one of the confidential 24/7 helplines below.
          </p>
        </div>
      </div>

      {/* Dedicated Under-18 / School Student Guidance Callout */}
      {isUnder18 && (
        <div className="glass-card under18-guide-card animate-fade-in" style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(20, 184, 166, 0.08))',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <MessageCircleHeart size={22} color="var(--accent-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
              Under-18 Safety & Talking With Your Parents / Guardians
            </h3>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Exam pressure can feel heavy at school, but you are never alone. If homework or exam anxiety is causing tears, trouble sleeping, or sadness:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
          }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                👨‍👩‍👧 1. Share How You Feel at Home
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Tell your parents or guardians: <em>"I'm feeling a bit stressed with my syllabus right now. Can we talk about a realistic daily study routine?"</em>
              </span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                🏫 2. Connect With Your School Counsellor
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Your school counselor and class teachers are trained to help balance homework, clarify doubts, and support emotional wellbeing.
              </span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                🕊️ 3. Take Mandatory Reset Breaks
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Spend 30 minutes playing outside, drawing, or listening to music after each school study block.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Support Contacts Grid */}
      <div className="grid-3 support-contacts-grid">
        {/* Card 1: School / Campus Counselling */}
        <div className="glass-card contact-card">
          <div className="contact-icon contact-icon--college">
            {isSchool ? <School size={24} /> : <Building size={24} />}
          </div>
          <h3 className="contact-title">
            {isSchool ? 'School Counsellor & Teachers' : 'Campus Counselling Center'}
          </h3>
          <p className="contact-desc">
            {isSchool
              ? 'Confidential guidance from your school counsellor, class teachers, and academic mentors to manage study pressure.'
              : 'Free, confidential psychological counseling and academic stress mentoring provided by university staff.'}
          </p>
          <div className="contact-meta">
            <div className="contact-meta-item">
              <Mail size={14} />
              <span>{isSchool ? 'counsellor@school.edu' : 'counselling@college.edu'}</span>
            </div>
            <div className="contact-meta-item">
              <Building size={14} />
              <span>{isSchool ? 'School Student Guidance Room' : 'Student Wellness Wing, Room 204'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: National Student & Youth Helplines */}
        <div className="glass-card contact-card">
          <div className="contact-icon contact-icon--helpline">
            <Phone size={24} />
          </div>
          <h3 className="contact-title">National Student & Youth Helplines</h3>
          <p className="contact-desc">
            Free, anonymous, 24/7 telephone listening and crisis support for school and college students.
          </p>
          <div className="contact-meta">
            {isUnder18 && (
              <div className="contact-meta-item">
                <Phone size={14} />
                <span><strong>Childline India (Under 18):</strong> 1098</span>
              </div>
            )}
            <div className="contact-meta-item">
              <Phone size={14} />
              <span><strong>Tele-MANAS (Govt of India):</strong> 14416</span>
            </div>
            <div className="contact-meta-item">
              <Phone size={14} />
              <span><strong>KIRAN Helpline:</strong> 1800-599-0019</span>
            </div>
            <div className="contact-meta-item">
              <Phone size={14} />
              <span><strong>Crisis Text Line:</strong> Text HOME to 741741</span>
            </div>
          </div>
        </div>

        {/* Card 3: Parents & Peer Mentors */}
        <div className="glass-card contact-card">
          <div className="contact-icon contact-icon--peer">
            {isSchool ? <Users size={24} /> : <Heart size={24} />}
          </div>
          <h3 className="contact-title">
            {isSchool ? 'Parents & Study Buddies' : 'Academic Peer Mentors'}
          </h3>
          <p className="contact-desc">
            {isSchool
              ? 'Connect with study group peers, elder siblings, and trusted family members who can listen and support your goals.'
              : 'Connect with senior students and peer tutors who have successfully completed the exact same syllabi.'}
          </p>
          <div className="contact-meta">
            <div className="contact-meta-item">
              <Mail size={14} />
              <span>{isSchool ? 'support@examease.ai' : 'peer.mentors@college.edu'}</span>
            </div>
            <div className="contact-meta-item">
              <Clock size={14} />
              <span>Available 7 Days a Week</span>
            </div>
          </div>
        </div>
      </div>

      {/* SDG Alignment Section */}
      <div className="grid-2 sdg-grid">
        <div className="glass-card sdg-card sdg-card--3">
          <div className="sdg-badge">UN SDG Goal 3</div>
          <h3 className="sdg-title">Good Health & Well-Being</h3>
          <p className="sdg-desc">
            Promoting healthy student lives and emotional resilience through real-time stress tracking, mandatory study breaks, and guided relaxation.
          </p>
        </div>

        <div className="glass-card sdg-card sdg-card--4">
          <div className="sdg-badge">UN SDG Goal 4</div>
          <h3 className="sdg-title">Quality Education</h3>
          <p className="sdg-desc">
            Enabling equitable, personalized academic support through adaptive study schedules, active recall techniques, and intelligent revision planning.
          </p>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="glass-card faq-section">
        <div className="box-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} color="var(--accent-primary)" />
            <h2 className="box-title">Frequently Asked Questions</h2>
          </div>
        </div>

        <div className="faqs-list">
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item">
              <h4 className="faq-question">{faq.q}</h4>
              <p className="faq-answer">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

