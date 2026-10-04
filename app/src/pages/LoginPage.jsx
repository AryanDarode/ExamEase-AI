import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, saveUser, isProfileComplete } from '../utils/storage';
import { GraduationCap, Mail, KeyRound, ArrowRight, CheckCircle, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [countdown, setCountdown] = useState(60);
  const canResend = countdown === 0;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoCode, setDemoCode] = useState('849201');

  useEffect(() => {
    // If user already logged in and verified, redirect
    const existing = getUser();
    if (existing && existing.verified) {
      if (isProfileComplete()) {
        navigate('/dashboard');
      } else {
        navigate('/profile-setup');
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid college or personal email address');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Generate a realistic 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoCode(code);
      setLoading(false);
      setStep('otp');
      setCountdown(60);
    }, 600);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      // Check if existing user with this email has profile info
      const existingUser = getUser();
      let updatedUser = {
        email: email.trim().toLowerCase(),
        verified: true,
        lastLogin: new Date().toISOString(),
      };

      if (existingUser && existingUser.email === email.trim().toLowerCase()) {
        // Keep previous stored info
        updatedUser = {
          ...existingUser,
          verified: true,
          lastLogin: new Date().toISOString(),
        };
      }

      saveUser(updatedUser);
      setLoading(false);

      if (isProfileComplete()) {
        navigate('/dashboard');
      } else {
        navigate('/profile-setup');
      }
    }, 800);
  };

  const handleUseDemoCode = () => {
    setOtp(demoCode.split(''));
  };

  return (
    <div className="login-container">
      {/* 3D Animated Background Scene */}
      <AnimatedBackground />

      <div className="login-card glass-card animate-fade-in">
        {/* Logo and Brand */}
        <div className="login-header">
          <div className="login-logo">
            <GraduationCap size={32} />
          </div>
          <h1 className="login-title">ExamEase AI</h1>
          <p className="login-subtitle">
            AI-powered wellbeing & personalized study intelligence
          </p>
        </div>

        {error && (
          <div className="login-alert login-alert--error animate-fade-in">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                Student or School / College Email
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email-input"
                  type="email"
                  className="form-input with-padding"
                  placeholder="student@school.edu or name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <span className="input-hint">
                We'll send a one-time verification code. No password required.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send Verification Code
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="login-benefits">
              <div className="benefit-item">
                <ShieldCheck size={16} color="var(--color-success)" />
                <span>Zero passwords — fast & secure OTP sign-in</span>
              </div>
              <div className="benefit-item">
                <Sparkles size={16} color="var(--text-accent)" />
                <span>Previous study records auto-restored on login</span>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <div className="otp-banner">
              <div className="otp-banner-icon">
                <KeyRound size={20} />
              </div>
              <div>
                <p className="otp-banner-title">Enter Verification Code</p>
                <p className="otp-banner-sub">
                  Code sent to <strong>{email}</strong>
                </p>
              </div>
            </div>

            <div className="demo-otp-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Demo Code: <strong>{demoCode}</strong></span>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={handleUseDemoCode}
                >
                  Auto-fill
                </button>
              </div>
            </div>

            <div className="otp-inputs-grid">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  className="otp-digit-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <div className="otp-resend-row">
              {canResend ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setCountdown(60);
                    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                    setDemoCode(newCode);
                  }}
                >
                  Resend OTP
                </button>
              ) : (
                <span className="resend-timer">
                  Resend code in {countdown}s
                </span>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setStep('email')}
              >
                Change Email
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading || otp.join('').length < 6}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Continue
                  <CheckCircle size={18} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
