import React, { useState, useRef, useEffect } from "react";
import UserProfile from "./UserProfile";
import MyCollections from "./MyCollections";
import "../styles/Profile.css";

function ProfileDropdown({ isLoggedIn, user, onNavigate, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showMyCollections, setShowMyCollections] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignIn = () => {
    if (onNavigate) {
      onNavigate("signin");
      setIsDropdownOpen(false);
    }
  };

  const handleSignUp = () => {
    if (onNavigate) {
      onNavigate("signup");
      setIsDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      setIsDropdownOpen(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      {isLoggedIn && user ? (
        <>
          <button
            className="profile-avatar-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title={user.name}
          >
            <div className="avatar-circle">
              {user.name ? getInitials(user.name) : "U"}
            </div>
          </button>

          {isDropdownOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header">
                <div className="user-info">
                  <div className="user-avatar">{getInitials(user.name)}</div>
                  <div>
                    <h4 className="user-name">{user.name}</h4>
                    <p className="user-email">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <ul className="dropdown-menu-items">
                <li>
                  <button className="dropdown-menu-link" onClick={() => {
                    setShowUserProfile(true);
                    setIsDropdownOpen(false);
                  }}>
                    👤 My Profile
                  </button>
                </li>
                <li>
                  <button className="dropdown-menu-link" onClick={() => {
                    setShowMyCollections(true);
                    setIsDropdownOpen(false);
                  }}>
                    📋 My Saved Schemes
                  </button>
                </li>
              </ul>

              <div className="dropdown-divider"></div>

              <button
                className="dropdown-logout-btn"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <button
            className="profile-auth-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            👤 Account
          </button>

          {isDropdownOpen && (
            <div className="auth-dropdown-menu">
              <button className="auth-btn signin-btn-dropdown" onClick={handleSignIn}>
                🔐 Sign In
              </button>
              <button className="auth-btn signup-btn-dropdown" onClick={handleSignUp}>
                ✍️ Sign Up
              </button>
            </div>
          )}
        </>
      )}

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile 
          user={user} 
          onClose={() => setShowUserProfile(false)} 
          onNavigate={onNavigate}
        />
      )}

      {/* My Collections Modal */}
      {showMyCollections && (
        <MyCollections 
          onClose={() => setShowMyCollections(false)}
          savedSchemes={user?.savedSchemes || []}
        />
      )}
    </div>
  );
}

export default ProfileDropdown;
