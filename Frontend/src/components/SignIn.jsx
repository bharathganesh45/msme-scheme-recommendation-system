import React, { useState } from 'react';
import { authAPI } from '../services/api';
import '../styles/SignIn.css';

const SignIn = ({ onLoginSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setGeneralError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);

      if (response.success) {
        setFormData({ email: '', password: '' });
        setErrors({});
        if (onLoginSuccess) {
          onLoginSuccess(response.data.user);
        }
      }
    } catch (error) {
      setGeneralError(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = () => {
    if (onNavigate) {
      onNavigate('signup');
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-wrapper">
        <div className="signin-header">
          <h1>Sign In to Your Account</h1>
          <p>Access personalized scheme recommendations for your business</p>
        </div>

        <form onSubmit={handleSubmit} className="signin-form">
          {generalError && (
            <div className="error-message general-error">{generalError}</div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={errors.email ? 'input-error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={errors.password ? 'input-error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="forgot-password-container">
            <button
              type="button"
              className="forgot-password-btn"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('forgot-password');
                }
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="signin-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="signin-footer">
          <p>
            Don't have an account?{' '}
            <button className="signup-link" onClick={handleSignUp}>
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
