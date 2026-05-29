import React, { useState, useEffect } from 'react';
import HomePage from './Home/Homepage.jsx';
import SignIn from './components/SignIn.jsx';
import SignUp from './components/SignUp.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import RecommendationForm from './components/RecommendationForm.jsx';
import RecommendedSchemes from './components/RecommendedSchemes.jsx';
import { authAPI } from './services/api';
import './styles/App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleShowRecommendation = () => {
    if (!isLoggedIn) {
      setCurrentPage('signin');
      return;
    }
    
    setShowRecommendationForm(true);
    setTimeout(() => {
      const element = document.getElementById('recommendation');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setCurrentPage('home');
  };

  const handleSignupSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('home');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };


  return (
    <div className="App">
      {currentPage === 'home' && (
        <>
          <HomePage 
            onFindSchemes={handleShowRecommendation}
            isLoggedIn={isLoggedIn}
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />

          {showRecommendationForm && (
            <section id="recommendation" className="recommendation-section">
              <div className="recommendation-container">
                <div className="recommendation-header">
                  <h2>Find Schemes Tailored For You</h2>
                  <p>Answer a few simple questions about your business, and we'll recommend the best schemes for you</p>
                </div>

                <div className="recommendation-content">
                  <RecommendationForm
                    onRecommendations={setRecommendations}
                    onLoading={setIsLoading}
                  />
                  <RecommendedSchemes schemes={recommendations} isLoading={isLoading} />
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {currentPage === 'signin' && (
        <SignIn 
          onLoginSuccess={handleLoginSuccess}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'signup' && (
        <SignUp 
          onSignupSuccess={handleSignupSuccess}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'forgot-password' && (
        <ForgotPassword 
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default App;
