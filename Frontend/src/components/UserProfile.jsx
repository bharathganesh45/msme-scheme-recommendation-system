import React, { useState, useEffect } from 'react';
import '../styles/UserProfile.css';
import { authAPI } from '../services/api';

const UserProfile = ({ user, onClose, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayUser, setDisplayUser] = useState(user);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDisplayUser(user);
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.name) {
      newErrors.name = 'Name is required';
    }

    if (!profileData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!profileData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(profileData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    return newErrors;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authAPI.updateProfile({
        name: profileData.name,
        phone: profileData.phone
      });

      if (response.success) {
        // Fetch updated user data
        const userResponse = await authAPI.getCurrentUser();
        if (userResponse.success) {
          setDisplayUser(userResponse.data.user);
          setProfileData({
            name: userResponse.data.user.name || '',
            email: userResponse.data.user.email || '',
            phone: userResponse.data.user.phone || '',
          });
        }
        setSuccessMsg('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update profile';
      setErrors({ submit: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = () => {
    if (onNavigate) {
      onNavigate('forgot-password');
      onClose();
    }
  };

  return (
    <div className="user-profile-modal-overlay" onClick={onClose}>
      <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h2>My Profile</h2>
          <button className="profile-close-btn" onClick={onClose}>✕</button>
        </div>

        {successMsg && <div className="success-message">{successMsg}</div>}

        <div className="profile-content">
          {!isEditing ? (
            <>
              <div className="profile-info">
                <div className="profile-avatar-large">
                  {displayUser?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="profile-details">
                  <div className="profile-item">
                    <label>Name</label>
                    <p>{displayUser?.name || 'N/A'}</p>
                  </div>
                  <div className="profile-item">
                    <label>Email</label>
                    <p>{displayUser?.email || 'N/A'}</p>
                  </div>
                  <div className="profile-item">
                    <label>Phone Number</label>
                    <p>{displayUser?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  ✏️ Edit Profile
                </button>
                <button className="reset-password-btn" onClick={handleResetPassword}>
                  🔑 Reset Password
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'input-error' : ''}
                  disabled
                />
                <small>Email cannot be changed</small>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'input-error' : ''}
                  maxLength="10"
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="profile-form-actions">
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => {
                    setIsEditing(false);
                    setProfileData({
                      name: displayUser?.name || '',
                      email: displayUser?.email || '',
                      phone: displayUser?.phone || '',
                    });
                    setErrors({});
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
