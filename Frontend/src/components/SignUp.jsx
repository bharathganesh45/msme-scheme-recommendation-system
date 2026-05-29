import React, { useState } from 'react';
import { authAPI } from '../services/api';
import '../styles/SignUp.css';

const SignUp = ({ onSignupSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await authAPI.signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (response.success) {
        setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
        setErrors({});
        if (onSignupSuccess) {
          onSignupSuccess(response.data.user);
        }
      }
    } catch (error) {
      setGeneralError(
        error.response?.data?.message || 'Sign up failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = () => {
    if (onNavigate) {
      onNavigate('signin');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <div className="signup-header">
          <h1>Create Your Account</h1>
          <p>Join thousands of entrepreneurs finding the perfect schemes</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {generalError && (
            <div className="error-message general-error">{generalError}</div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className={errors.name ? 'input-error' : ''}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <span className="error-text">{errors.name}</span>
            )}
          </div>

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
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className={errors.phone ? 'input-error' : ''}
              placeholder="Enter your 10-digit phone number"
              maxLength="10"
            />
            {errors.phone && (
              <span className="error-text">{errors.phone}</span>
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
              placeholder="Enter your password (min 6 characters)"
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className={errors.confirmPassword ? 'input-error' : ''}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="signup-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <button className="signin-link" onClick={handleSignIn}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
