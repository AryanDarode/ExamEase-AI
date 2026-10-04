import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, saveUser, seedDefaultExamsForUser } from '../utils/storage';
import {
  User,
  School,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Layers,
  Award,
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import InstitutionAutocomplete from '../components/InstitutionAutocomplete';
import './ProfileSetup.css';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => {
    const user = getUser();
    return {
      fullName: user?.fullName || '',
      student_type: user?.student_type || 'college',
      school: user?.school || user?.college || '',
      grade: user?.grade || '10',
      board: user?.board || 'CBSE',
      stream: user?.stream || 'Science',
      college: user?.college || '',
      course: user?.course || '',
      year: user?.year || '2',
    };
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentTypeSelect = (type) => {
    setFormData((prev) => ({
      ...prev,
      student_type: type,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const currentUser = getUser() || {};
    const isSchool = formData.student_type === 'school';

    const updatedUser = {
      ...currentUser,
      ...formData,
      // Normalize school/college name
      college: isSchool ? formData.school : formData.college,
      school: isSchool ? formData.school : '',
      updatedAt: new Date().toISOString(),
    };

    saveUser(updatedUser);

    // Seed default tailored subjects/exams based on student grade/course
    seedDefaultExamsForUser(updatedUser);

    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  const isSchool = formData.student_type === 'school';
  const isSeniorSchool = isSchool && (formData.grade === '11' || formData.grade === '12');

  return (
    <div className="profile-container">
      {/* 3D Animated Background Scene */}
      <AnimatedBackground />

      <div className="profile-card glass-card animate-fade-in-up">
        <div className="profile-header">
          <div className="profile-badge">Onboarding • Step 2 of 2</div>
          <h1 className="profile-title">Complete Your Student Profile</h1>
          <p className="profile-subtitle">
            ExamEase AI adapts your study plans, syllabus topics, and wellbeing guidance to your specific academic level.
          </p>
        </div>

        {/* Step 1: Student Type Selection Cards */}
        <div className="student-type-selection-box">
          <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
            I am currently a:
          </label>
          <div className="student-type-grid">
            <button
              type="button"
              className={`student-type-btn ${isSchool ? 'selected' : ''}`}
              onClick={() => handleStudentTypeSelect('school')}
            >
              <div className="student-type-icon-box icon--school">
                <School size={22} />
              </div>
              <div className="student-type-content">
                <span className="student-type-title">School Student</span>
                <span className="student-type-desc">Grades 6 to 12 • CBSE, ICSE, State, IB</span>
              </div>
              {isSchool && <CheckCircle2 size={18} className="selected-check-icon" />}
            </button>

            <button
              type="button"
              className={`student-type-btn ${!isSchool ? 'selected' : ''}`}
              onClick={() => handleStudentTypeSelect('college')}
            >
              <div className="student-type-icon-box icon--college">
                <GraduationCap size={22} />
              </div>
              <div className="student-type-content">
                <span className="student-type-title">College / University</span>
                <span className="student-type-desc">Undergraduate, Bachelor's & Master's</span>
              </div>
              {!isSchool && <CheckCircle2 size={18} className="selected-check-icon" />}
            </button>
          </div>
        </div>

        {/* Step 2: Conditional Details Form */}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full Name
            </label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="form-input with-padding"
                placeholder="e.g. Alex Sharma"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Conditional School Fields */}
          {isSchool ? (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="school">
                  School Name
                </label>
                <InstitutionAutocomplete
                  type="school"
                  id="school"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  placeholder="Search or type school (e.g. Delhi Public School, St. Xavier's)"
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="grade">
                    Class / Grade
                  </label>
                  <div className="input-with-icon">
                    <Layers size={18} className="input-icon" />
                    <select
                      id="grade"
                      name="grade"
                      className="form-select with-padding"
                      value={formData.grade}
                      onChange={handleChange}
                      required
                    >
                      <option value="6">Class 6 (Middle School)</option>
                      <option value="7">Class 7 (Middle School)</option>
                      <option value="8">Class 8 (Middle School)</option>
                      <option value="9">Class 9 (High School)</option>
                      <option value="10">Class 10 (Secondary Board Exam)</option>
                      <option value="11">Class 11 (Senior Secondary)</option>
                      <option value="12">Class 12 (Senior Board Exam)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="board">
                    Education Board
                  </label>
                  <div className="input-with-icon">
                    <Award size={18} className="input-icon" />
                    <select
                      id="board"
                      name="board"
                      className="form-select with-padding"
                      value={formData.board}
                      onChange={handleChange}
                      required
                    >
                      <option value="CBSE">CBSE (Central Board)</option>
                      <option value="ICSE">ICSE / ISC</option>
                      <option value="State Board">State Board</option>
                      <option value="IB">IB (International Baccalaureate)</option>
                      <option value="Cambridge">Cambridge / IGCSE</option>
                      <option value="Other">Other Board</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stream for Class 11 & 12 */}
              {isSeniorSchool && (
                <div className="form-group animate-fade-in">
                  <label className="form-label" htmlFor="stream">
                    Academic Stream (Grades 11–12)
                  </label>
                  <div className="input-with-icon">
                    <BookOpen size={18} className="input-icon" />
                    <select
                      id="stream"
                      name="stream"
                      className="form-select with-padding"
                      value={formData.stream}
                      onChange={handleChange}
                    >
                      <option value="Science">Science (Physics, Chemistry, Math/Bio)</option>
                      <option value="Commerce">Commerce (Accounts, Business Studies, Eco)</option>
                      <option value="Humanities">Humanities / Arts (History, Pol Sci, Eco)</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Conditional College Fields */
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="college">
                  College or University Name
                </label>
                <InstitutionAutocomplete
                  type="college"
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="Search or type university (e.g. IIT Bombay, Stanford, DU)"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="course">
                  Degree / Major
                </label>
                <div className="input-with-icon">
                  <BookOpen size={18} className="input-icon" />
                  <input
                    id="course"
                    name="course"
                    type="text"
                    className="form-input with-padding"
                    placeholder="e.g. B.Tech Computer Science / B.Com"
                    value={formData.course}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )}


          <div className="profile-info-banner">
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span>
              All study data and adaptive preferences persist securely in your browser session.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading ? 'Setting up your personalized roadmap...' : (
              <>
                Go to Dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
