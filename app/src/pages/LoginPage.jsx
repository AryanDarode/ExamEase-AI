import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getUser, saveUser, isProfileComplete } from '../utils/storage';
import { supabase } from '../supabaseClient';

import {
  GraduationCap,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  PartyPopper
} from 'lucide-react';

import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';

import './LoginPage.css';


export default function LoginPage() {

  const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    ''
  ]);

  const [step, setStep] = useState('email');

  const [countdown, setCountdown] = useState(60);

  const canResend = countdown === 0;

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [redirectIn, setRedirectIn] = useState(3);

  const [redirectTarget, setRedirectTarget] =
    useState('/dashboard');


  // ==================================================
  // Check existing local login
  // ==================================================

  useEffect(() => {

    const existing = getUser();

    if (existing && existing.verified) {

      if (isProfileComplete()) {
        navigate('/dashboard');
      } else {
        navigate('/profile-setup');
      }

    }

  }, [navigate]);


  // ==================================================
  // OTP RESEND COUNTDOWN
  // ==================================================

  useEffect(() => {

    if (step !== 'otp' || countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {

      setCountdown((current) => {

        if (current <= 1) {
          return 0;
        }

        return current - 1;

      });

    }, 1000);

    return () => clearInterval(timer);

  }, [step, countdown]);


  // ==================================================
  // SEND OTP
  // ==================================================

  const handleSendOtp = async (e) => {

    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    // Validate email
    if (!cleanEmail || !cleanEmail.includes('@')) {

      setError(
        'Please enter a valid college or personal email address.'
      );

      return;
    }

    setLoading(true);
    setError('');


    try {

      const { error } =
        await supabase.auth.signInWithOtp({
          email: cleanEmail
        });


      if (error) {

        // IMPORTANT:
        // Show exact Supabase error while testing
        console.error(
          'SUPABASE OTP ERROR:',
          error
        );

        setError(error.message);

        setLoading(false);

        return;
      }


      // OTP successfully sent
      setEmail(cleanEmail);

      setOtp([
        '',
        '',
        '',
        '',
        '',
        ''
      ]);

      setCountdown(60);

      setStep('otp');

    } catch (err) {

      console.error(
        'UNEXPECTED OTP ERROR:',
        err
      );

      setError(
        err?.message ||
        'Something went wrong while sending the OTP.'
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // OTP INPUT
  // ==================================================

  const handleOtpChange = (index, value) => {

    // Remove anything except numbers
    const cleanValue =
      value.replace(/\D/g, '');


    // --------------------------------------------------
    // Handle pasted OTP
    // --------------------------------------------------

    if (cleanValue.length > 1) {

      const pasted =
        cleanValue.slice(0, 6).split('');

      const newOtp = [
        '',
        '',
        '',
        '',
        '',
        ''
      ];

      pasted.forEach((char, i) => {

        if (i < 6) {
          newOtp[i] = char;
        }

      });

      setOtp(newOtp);


      const nextIndex =
        Math.min(pasted.length, 6) - 1;


      if (nextIndex >= 0) {

        const input =
          document.getElementById(
            `otp-input-${nextIndex}`
          );

        if (input) {
          input.focus();
        }

      }

      return;

    }


    // --------------------------------------------------
    // Normal single digit input
    // --------------------------------------------------

    const newOtp = [...otp];

    newOtp[index] = cleanValue;

    setOtp(newOtp);


    // Move to next input
    if (
      cleanValue &&
      index < 5
    ) {

      const nextInput =
        document.getElementById(
          `otp-input-${index + 1}`
        );

      if (nextInput) {
        nextInput.focus();
      }

    }

  };


  // ==================================================
  // OTP BACKSPACE
  // ==================================================

  const handleKeyDown = (index, e) => {

    if (
      e.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {

      const previousInput =
        document.getElementById(
          `otp-input-${index - 1}`
        );

      if (previousInput) {

        previousInput.focus();

      }

    }

  };


  // ==================================================
  // VERIFY OTP
  // ==================================================

  const handleVerifyOtp = async (e) => {

    e.preventDefault();

    const enteredCode =
      otp.join('');


    // Check 6 digits
    if (enteredCode.length !== 6) {

      setError(
        'Please enter the complete 6-digit verification code.'
      );

      return;

    }


    setLoading(true);
    setError('');


    try {

      const {
        data,
        error
      } = await supabase.auth.verifyOtp({

        email:
          email.trim().toLowerCase(),

        token:
          enteredCode,

        type:
          'email'

      });


      if (error) {

        console.error(
          'SUPABASE VERIFY OTP ERROR:',
          error
        );

        setError(
          error.message ||
          'Invalid or expired OTP. Please request a new code.'
        );

        setLoading(false);

        return;

      }


      // --------------------------------------------------
      // Check session
      // --------------------------------------------------

      if (!data?.session) {

        setError(
          'Verification succeeded, but no session was created. Please try again.'
        );

        setLoading(false);

        return;

      }


      // --------------------------------------------------
      // Save local user information
      // --------------------------------------------------

      const cleanEmail =
        email.trim().toLowerCase();

      const existingUser =
        getUser();


      let updatedUser = {

        email: cleanEmail,

        verified: true,

        lastLogin:
          new Date().toISOString()

      };


      // Preserve existing profile information
      if (
        existingUser &&
        existingUser.email === cleanEmail
      ) {

        updatedUser = {

          ...existingUser,

          email: cleanEmail,

          verified: true,

          lastLogin:
            new Date().toISOString()

        };

      }


      saveUser(updatedUser);


      // --------------------------------------------------
      // Decide next page
      // --------------------------------------------------

      const target =
        isProfileComplete()
          ? '/dashboard'
          : '/profile-setup';


      setRedirectTarget(target);

      setRedirectIn(3);

      setStep('success');

    } catch (err) {

      console.error(
        'UNEXPECTED VERIFY ERROR:',
        err
      );

      setError(
        err?.message ||
        'Something went wrong while verifying the OTP.'
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // RESEND OTP
  // ==================================================

  const handleResendOtp = async () => {

    if (
      !canResend ||
      loading
    ) {
      return;
    }


    const cleanEmail =
      email.trim().toLowerCase();


    setLoading(true);
    setError('');


    try {

      const {
        error
      } = await supabase.auth.signInWithOtp({

        email: cleanEmail

      });


      if (error) {

        console.error(
          'SUPABASE RESEND OTP ERROR:',
          error
        );

        setError(error.message);

        return;

      }


      setOtp([
        '',
        '',
        '',
        '',
        '',
        ''
      ]);

      setCountdown(60);


      // Focus first OTP input
      setTimeout(() => {

        const firstInput =
          document.getElementById(
            'otp-input-0'
          );

        if (firstInput) {
          firstInput.focus();
        }

      }, 50);


    } catch (err) {

      console.error(
        'UNEXPECTED RESEND ERROR:',
        err
      );

      setError(
        err?.message ||
        'Something went wrong while resending the OTP.'
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // CHANGE EMAIL
  // ==================================================

  const handleChangeEmail = () => {

    setStep('email');

    setOtp([
      '',
      '',
      '',
      '',
      '',
      ''
    ]);

    setError('');

    setCountdown(60);

  };


  // ==================================================
  // DEV RESET
  // ==================================================

  const handleResetData = () => {

    const keysToRemove =
      Object.keys(localStorage).filter(
        (key) =>
          key.startsWith('examease_')
      );


    keysToRemove.forEach(
      (key) =>
        localStorage.removeItem(key)
    );


    setEmail('');

    setOtp([
      '',
      '',
      '',
      '',
      '',
      ''
    ]);

    setStep('email');

    setError('');

    setCountdown(60);


    alert(
      `Reset done! Cleared ${keysToRemove.length} key(s).`
    );

  };


  // ==================================================
  // SUCCESS REDIRECT COUNTDOWN
  // ==================================================

  useEffect(() => {

    if (step !== 'success') {
      return;
    }


    if (redirectIn <= 0) {

      navigate(redirectTarget);

      return;

    }


    const timer =
      setTimeout(() => {

        setRedirectIn(
          (current) => current - 1
        );

      }, 1000);


    return () =>
      clearTimeout(timer);


  }, [
    step,
    redirectIn,
    navigate,
    redirectTarget
  ]);


  // ==================================================
  // UI
  // ==================================================

  return (

    <div className="login-container">

      <AnimatedBackground />


      <div className="login-card glass-card animate-fade-in">


        {/* BRAND */}

        <div className="login-header">

          <div className="login-logo">

            <GraduationCap size={32} />

          </div>


          <h1 className="login-title">
            ExamEase AI
          </h1>


          <p className="login-subtitle">
            AI-powered wellbeing & personalized study intelligence
          </p>

        </div>


        {/* ERROR */}

        {error && (

          <div className="login-alert login-alert--error animate-fade-in">

            {error}

          </div>

        )}


        {/* ==================================================
            EMAIL STEP
        ================================================== */}

        {step === 'email' ? (

          <form
            onSubmit={handleSendOtp}
            className="login-form"
          >

            <div className="form-group">

              <label
                className="form-label"
                htmlFor="email-input"
              >
                Student or School / College Email
              </label>


              <div className="input-with-icon">

                <Mail
                  size={18}
                  className="input-icon"
                />


                <input
                  id="email-input"
                  type="email"
                  className="form-input with-padding"
                  placeholder="student@school.edu or name@gmail.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  autoFocus
                />

              </div>


              <span className="input-hint">

                We'll send a one-time verification code.
                No password required.

              </span>

            </div>


            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >

              {loading ? (

                <>
                  <RefreshCw
                    size={18}
                    className="spin"
                  />

                  Sending OTP...
                </>

              ) : (

                <>
                  Send Verification Code

                  <ArrowRight size={18} />

                </>

              )}

            </button>


            {/* BENEFITS */}

            <div className="login-benefits">

              <div className="benefit-item">

                <ShieldCheck
                  size={16}
                  color="var(--color-success)"
                />

                <span>
                  Zero passwords — fast & secure OTP sign-in
                </span>

              </div>


              <div className="benefit-item">

                <Sparkles
                  size={16}
                  color="var(--text-accent)"
                />

                <span>
                  Previous study records auto-restored on login
                </span>

              </div>

            </div>


            {/* DEV TOOLS */}

            <div className="dev-reset-bar">

              <span className="dev-reset-label">
                🛠 Dev Tools
              </span>


              <button
                type="button"
                className="btn-dev-reset"
                onClick={handleResetData}
                title="Clears all localStorage so you can test profile setup again"
              >

                Reset All Data &amp; Re-onboard

              </button>

            </div>

          </form>


        ) : step === 'otp' ? (

          /* ==================================================
             OTP STEP
          ================================================== */

          <form
            onSubmit={handleVerifyOtp}
            className="login-form"
          >

            <div className="otp-banner">

              <div className="otp-banner-icon">

                <KeyRound size={20} />

              </div>


              <div>

                <p className="otp-banner-title">
                  Enter Verification Code
                </p>


                <p className="otp-banner-sub">

                  Code sent to{' '}

                  <strong>
                    {email}
                  </strong>

                </p>

              </div>

            </div>


            {/* OTP INPUTS */}

            <div className="otp-inputs-grid">

              {otp.map((digit, idx) => (

                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={
                    idx === 0
                      ? 'one-time-code'
                      : 'off'
                  }
                  maxLength={1}
                  className="otp-digit-input"
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(
                      idx,
                      e.target.value
                    )
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(
                      idx,
                      e
                    )
                  }
                  autoFocus={idx === 0}
                />

              ))}

            </div>


            {/* RESEND */}

            <div className="otp-resend-row">

              {canResend ? (

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleResendOtp}
                  disabled={loading}
                >

                  {loading ? (

                    <>
                      <RefreshCw
                        size={15}
                        className="spin"
                      />

                      Sending...

                    </>

                  ) : (

                    'Resend OTP'

                  )}

                </button>

              ) : (

                <span className="resend-timer">

                  Resend code in {countdown}s

                </span>

              )}


              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleChangeEmail}
                disabled={loading}
              >

                Change Email

              </button>

            </div>


            {/* VERIFY */}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={
                loading ||
                otp.join('').length !== 6
              }
            >

              {loading ? (

                <>
                  <RefreshCw
                    size={18}
                    className="spin"
                  />

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


        ) : (

          /* ==================================================
             SUCCESS STEP
          ================================================== */

          <div className="success-step animate-fade-in">

            <div className="success-icon-ring">

              <div className="success-icon-inner">

                <CheckCircle
                  size={48}
                  className="success-check-icon"
                />

              </div>


              <svg
                className="success-ring-svg"
                viewBox="0 0 120 120"
              >

                <circle
                  className="success-ring-track"
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  strokeWidth="4"
                />


                <circle
                  className="success-ring-progress"
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  strokeWidth="4"
                  strokeDasharray="339.3"
                  strokeDashoffset="0"
                />

              </svg>

            </div>


            <h2 className="success-title">
              Successfully Logged In!
            </h2>


            <p className="success-sub">

              Welcome back to{' '}

              <strong>
                ExamEase AI
              </strong>

              <br />

              <span className="success-email">
                {email}
              </span>

            </p>


            <div className="success-badge">

              <ShieldCheck size={16} />

              <span>
                Email verified &amp; session secured
              </span>

            </div>


            <div className="success-redirect-note">

              Redirecting automatically in{' '}

              <strong>
                {redirectIn}s
              </strong>

              ...

            </div>


            <button
              className="btn btn-primary btn-lg w-full"
              onClick={() =>
                navigate(redirectTarget)
              }
            >

              <PartyPopper size={18} />

              Go to Dashboard Now

              <ArrowRight size={18} />

            </button>

          </div>

        )}

      </div>

    </div>

  );

}