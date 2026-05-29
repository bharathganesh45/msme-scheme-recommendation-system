import React, { useState, useEffect } from 'react';
import '../styles/ForgotPassword.css';

const ForgotPassword = ({ onNavigate }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const validateEmail = (emailValue) => {
    return /\S+@\S+\.\S+/.test(emailValue);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStep(2);
      setOtpTimer(300); // 5 minutes
      setSuccessMsg('OTP sent to your email');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStep(3);
      setSuccessMsg('');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStep(4);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToSignIn = () => {
    if (onNavigate) {
      onNavigate('signin');
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-wrapper">
        {step === 1 && (
          <>
            <div className="forgot-password-header">
              <h1>Reset Password</h1>
              <p>Enter your email to receive OTP</p>
            </div>

            <form onSubmit={handleSendOtp} className="forgot-password-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                  placeholder="your@email.com"
                  className="form-input"
                />
              </div>

              <button type="submit" className="reset-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            <div className="forgot-password-footer">
              <button className="back-to-signin-btn" onClick={handleBackToSignIn}>
                ← Back to Sign In
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="forgot-password-header">
              <h1>Enter OTP</h1>
              <p>Check your email for the code</p>
            </div>

            {successMsg && <div className="success-message">{successMsg}</div>}

            <form onSubmit={handleVerifyOtp} className="forgot-password-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="otp">OTP Code *</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  placeholder="000000"
                  maxLength="6"
                  className="form-input otp-input"
                />
              </div>

              <div className="otp-timer">
                {otpTimer > 0 ? (
                  <p>OTP expires in: <strong>{formatTimer(otpTimer)}</strong></p>
                ) : (
                  <p>OTP expired. <button type="button" onClick={() => setStep(1)} className="resend-link">Resend OTP</button></p>
                )}
              </div>

              <button type="submit" className="reset-btn" disabled={isSubmitting || otpTimer === 0}>
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <div className="forgot-password-footer">
              <button className="back-to-signin-btn" onClick={handleBackToSignIn}>
                ← Back to Sign In
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="forgot-password-header">
              <h1>Set New Password</h1>
              <p>Create a strong password</p>
            </div>

            <form onSubmit={handleResetPassword} className="forgot-password-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
                  required
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  required
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>

              <button type="submit" className="reset-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="forgot-password-footer">
              <button className="back-to-signin-btn" onClick={handleBackToSignIn}>
                ← Back to Sign In
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <div className="success-message-container">
            <div className="success-icon">✓</div>
            <h2>Password Reset Successful</h2>
            <p>Your password has been updated</p>
            <button className="back-to-signin-btn success-btn" onClick={handleBackToSignIn}>
              ← Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
