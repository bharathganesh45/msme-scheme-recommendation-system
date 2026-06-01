import React, { useState, useEffect } from 'react';
import '../styles/ForgotPassword.css';
import { authAPI } from '../services/api';

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
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authAPI.requestPasswordReset(email.trim());
      
      if (!response.success) {
        setError(response.message || 'Failed to send OTP. Please try again.');
        return;
      }

      // Clear sensitive fields when moving to next step
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setStep(2);
      setOtpTimer(600); // 10 minutes
      setSuccessMsg('OTP sent to your email. Check your inbox.');
    } catch (err) {
      setError('Failed to send OTP. Please check your connection and try again.');
      console.error('Send OTP error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (otpTimer === 0) {
      setError('OTP has expired. Please request a new one.');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authAPI.verifyPasswordResetOTP(email, otp);

      if (!response.success) {
        setError(response.message || 'Invalid OTP. Please try again.');
        return;
      }

      // Clear password fields when moving to next step
      setNewPassword('');
      setConfirmPassword('');
      setStep(3);
      setSuccessMsg('');
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
      console.error('Verify OTP error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check password strength: at least one uppercase, one lowercase, one number
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authAPI.resetPassword(email, otp, newPassword, confirmPassword);

      if (!response.success) {
        setError(response.message || 'Failed to reset password. Please try again.');
        return;
      }

      setStep(4);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToSignIn = () => {
    // Clear all sensitive data before navigating
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMsg('');
    setStep(1);
    setOtpTimer(0);
    if (onNavigate) {
      onNavigate('signin');
    }
  };

  const handleResendOtp = () => {
    setOtp('');
    setError('');
    setSuccessMsg('');
    setStep(1);
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
                  <p>OTP expired. <button type="button" onClick={handleResendOtp} className="resend-link">Resend OTP</button></p>
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
                <small className="password-hint">
                  Password must be at least 6 characters with one uppercase, one lowercase, and one number
                </small>
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
