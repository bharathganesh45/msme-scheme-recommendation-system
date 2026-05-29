import React, { useEffect, useState, useCallback } from "react";
import { schemeAPI, collectionAPI, authAPI } from "../services/api";
import Profile from "../components/Profile.jsx";
import SchemeDetails from "../components/SchemeDetails.jsx";
import "../styles/Homepage.css";

function HomePage({ onFindSchemes, isLoggedIn, user, onNavigate, onLogout }) {
  const [allSchemes, setAllSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showMoreSchemes, setShowMoreSchemes] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [savingSchemeId, setSavingSchemeId] = useState(null);

  const fetchAllSchemes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await schemeAPI.getAllSchemes();
      // Handle both array and object response formats
      let schemes = Array.isArray(response) ? response : response.data || [];
      
      // Parse JSON fields if they're strings
      schemes = schemes.map(scheme => ({
        ...scheme,
        benefits: typeof scheme.benefits === 'string' ? JSON.parse(scheme.benefits) : scheme.benefits,
        rules: typeof scheme.rules === 'string' ? JSON.parse(scheme.rules) : scheme.rules,
        beneficiary_categories: typeof scheme.beneficiary_categories === 'string' ? JSON.parse(scheme.beneficiary_categories) : scheme.beneficiary_categories
      }));
      
      setAllSchemes(schemes);
      setError(null);
    } catch (err) {
      console.error("Error fetching schemes:", err);
      setError("Failed to load schemes. Please try again later.");
      setAllSchemes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedSchemes = useCallback(async () => {
    try {
      const response = await collectionAPI.getSavedSchemes();
      if (response.success) {
        setSavedSchemes(response.data.schemes || []);
      }
    } catch (err) {
      console.error("Error fetching saved schemes:", err);
    }
  }, []);

  // Handle saving/unsaving a scheme
  const handleToggleSaveScheme = useCallback(async (scheme) => {
    if (!isLoggedIn || !authAPI.isLoggedIn()) {
      onNavigate('signin');
      return;
    }

    const isSaved = savedSchemes.some(s => s.id === scheme.id);
    setSavingSchemeId(scheme.id);

    try {
      if (isSaved) {
        await collectionAPI.unsaveScheme(scheme.id);
        setSavedSchemes(savedSchemes.filter(s => s.id !== scheme.id));
      } else {
        await collectionAPI.saveScheme(scheme.id);
        setSavedSchemes([...savedSchemes, scheme]);
      }
    } catch (err) {
      console.error("Error toggling save scheme:", err);
    } finally {
      setSavingSchemeId(null);
    }
  }, [isLoggedIn, onNavigate, savedSchemes]);

  const filterSchemes = useCallback(() => {
    let results = allSchemes;

    // Filter by category
    if (selectedCategory !== "All") {
      results = results.filter(
        (scheme) => scheme.business_category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      results = results.filter(
        (scheme) =>
          scheme.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scheme.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSchemes(results);
  }, [allSchemes, selectedCategory, searchQuery]);

  // Fetch schemes on component mount
  useEffect(() => {
    fetchAllSchemes();
    if (isLoggedIn && authAPI.isLoggedIn()) {
      fetchSavedSchemes();
    }
  }, [isLoggedIn, fetchAllSchemes, fetchSavedSchemes]);

  // Filter schemes when search query or category changes
  useEffect(() => {
    if (allSchemes.length > 0) {
      filterSchemes();
    }
  }, [searchQuery, selectedCategory, allSchemes, filterSchemes]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by useEffect, no need to do anything here
  };

  const handleStartRecommendation = () => {
    if (onFindSchemes) {
      onFindSchemes();
    }
  };

  const handleLearnMore = (scheme) => {
    setSelectedScheme(scheme);
  };

  const handleBackFromSchemeDetails = () => {
    setSelectedScheme(null);
  };

  const getCategories = () => {
    const categories = ["All"];
    const uniqueCategories = new Set(allSchemes.map((s) => s.business_category));
    return categories.concat(Array.from(uniqueCategories).filter(Boolean));
  };

  const displayedSchemes = showMoreSchemes
    ? filteredSchemes.slice(0, 9)
    : filteredSchemes.slice(0, 2);

  return (
    <div id="home" className="home">

      {/* Header*/}

      <header className="header">
        <div className="header-wrapper">
          <div className="logo-section">
            <div className="logo">
              <img src="/msme logo.png" alt="MSME Logo" className="logo-icon" />
              <h1 className="logo-text">MSME Schemes</h1>
            </div>
          </div>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              className="search-input"
              type="search"
              placeholder="Search schemes by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn" type="submit">
              🔍 
            </button>
          </form>

          <nav className="nav">
            <a className="nav-link" href="#home">
              Home
            </a>
            <a className="nav-link" href="#schemes">
              Schemes
            </a>
            <a className="nav-link" href="#how-it-works">
              How It Works
            </a>
            <a className="nav-link" href="#contact">
              Contact
            </a>
          </nav>

          {isLoggedIn && user ? (
            <div className="auth-section">
              <span className="user-greeting">Welcome, {user.name}</span>
              <Profile
                isLoggedIn={isLoggedIn} 
                user={user} 
                onNavigate={onNavigate} 
                onLogout={onLogout} 
              />
            </div>
          ) : (
            <Profile
              isLoggedIn={isLoggedIn} 
              user={user} 
              onNavigate={onNavigate} 
              onLogout={onLogout} 
            />
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Find The Perfect Government Scheme For Your Business
          </h1>
          <p className="hero-subtitle">
            Unlock growth opportunities with government schemes tailored to your
            MSME needs
          </p>
          <button className="cta-btn" onClick={handleStartRecommendation}>
            🚀 Find Your Schemes
          </button>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="scheme-stats">
        <div className="stat-item">
          <h3 className="stat-number">{allSchemes.length || "50"}+</h3>
          <p className="stat-label">Active Schemes</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-number">10K+</h3>
          <p className="stat-label">Businesses Helped</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-number">₹1000Cr</h3>
          <p className="stat-label">Funds Distributed</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <p className="section-subtitle">Process</p>
        <h2 className="section-title">Easy Steps to Find & Apply for Schemes</h2>

        <div className="steps">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3 className="step-title">Enter Your Details</h3>
            <p className="step-desc">
              Provide information about your business type, turnover, and location
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3 className="step-title">Get Recommendations</h3>
            <p className="step-desc">
              Our AI analyzes your data and shows matching schemes
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3 className="step-title">Learn & Apply</h3>
            <p className="step-desc">
              Get detailed information and apply directly through the portal
            </p>
          </div>
        </div>

        <button className="cta-btn success" onClick={handleStartRecommendation}>
          Start Your Journey Now →
        </button>
      </section>

      {/* Schemes Section */}
      <section id="schemes" className="schemes">
        <h2 className="section-title">Available Schemes</h2>

        {/* Category Filter */}
        <div className="category-filter">
          <p className="filter-label">Filter by Category:</p>
          <div className="category-list">
            {getCategories().map((category) => (
              <button
                key={category}
                className={`category-btn ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes Display */}
        {loading ? (
          <div className="loading-state">
            <p>Loading schemes...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button
              className="retry-btn"
              onClick={fetchAllSchemes}
            >
              Retry
            </button>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="empty-state">
            <p>No schemes found matching your criteria.</p>
            <button
              className="reset-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="schemes-grid">
              {displayedSchemes.map((scheme) => (
                <div key={scheme.id} className="scheme-card">
                  <button 
                    className={`save-scheme-btn ${savedSchemes.some(s => s.id === scheme.id) ? 'saved' : ''}`}
                    title={savedSchemes.some(s => s.id === scheme.id) ? 'Remove from collection' : 'Add to collection'}
                    onClick={() => handleToggleSaveScheme(scheme)}
                    disabled={savingSchemeId === scheme.id}
                  >
                    {savingSchemeId === scheme.id ? '⟳' : '+'}
                  </button>
                  <div className="scheme-header">
                    <h3 className="scheme-name">{scheme.name}</h3>
                    <span className="scheme-category">{scheme.business_category || "General"}</span>
                  </div>
                  <p className="scheme-description">{scheme.description || "No description available"}</p>
                  <div className="scheme-details">
                    {scheme.benefits && (
                      <div className="scheme-detail-item">
                        <strong>Benefits:</strong>{" "}
                        {typeof scheme.benefits === "object"
                          ? Object.entries(scheme.benefits)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")
                          : scheme.benefits}
                      </div>
                    )}
                    {scheme.eligibility && (
                      <div className="scheme-detail-item">
                        <strong>Eligibility:</strong> {scheme.eligibility}
                      </div>
                    )}
                    {scheme.rules && (
                      <div className="scheme-detail-item">
                        <strong>Requirements:</strong>{" "}
                        {typeof scheme.rules === "object"
                          ? Object.entries(scheme.rules)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")
                          : scheme.rules}
                      </div>
                    )}
                  </div>
                  <button className="learn-more-btn" onClick={() => handleLearnMore(scheme)}>Learn More →</button>
                </div>
              ))}
            </div>

            {/* Show More/Less Toggle */}
            {filteredSchemes.length > 2 && (
              <div className="toggle-container">
                <button
                  className="toggle-btn"
                  onClick={() => setShowMoreSchemes(!showMoreSchemes)}
                >
                  {showMoreSchemes
                    ? "↑ Show Less"
                    : `↓ View More (${filteredSchemes.length - 2} more schemes)`}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* About Section */}
      <section className="about">
        <div className="about-content">
          <h2 className="section-title">About This Portal</h2>
          <p className="section-text">
            The MSME Scheme Portal is your one-stop solution to discover and
            apply for government schemes designed to support Micro, Small, and
            Medium Enterprises. Whether you're looking for financial assistance,
            skill development, or technology upgrades, we help you find the
            perfect scheme for your business growth.
          </p>
          <div className="about-features">
            <div className="feature">
              <span className="feature-icon">✓</span>
              <h4>Comprehensive Database</h4>
              <p>Access 50+ central and state schemes</p>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <h4>Smart Matching</h4>
              <p>AI-powered recommendations based on your business profile</p>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <h4>Easy Application</h4>
              <p>Simplified process to apply for schemes</p>
            </div>
          </div>
        </div>
      </section>

       {/* call to action */}

      <section className="cta-section">
        <h2 className="cta-title">Ready to Grow Your Business?</h2>
        <p className="cta-subtitle">
          Join thousands of MSMEs benefiting from government schemes
        </p>
        <button className="cta-btn primary" onClick={handleStartRecommendation}>
          Start Recommendation Process →
        </button>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3 className="footer-title">MSME Schemes</h3>
            <p className="footer-tagline">
              Empowering Indian businesses through government schemes
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#schemes">Schemes</a>
              </li>
              <li>
                <a href="#how-it-works">How It Works</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Us</h4>
            <div className="contact-item">
              <p>
                <strong>Phone:</strong>{" "}
                <a href="tel:+919876543210">+91 98765 43210</a>
              </p>
            </div>
            <div className="contact-item">
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:support@msme-schemes.gov.in">
                  support@msme-schemes.gov.in
                </a>
              </p>
            </div>
            <div className="contact-item">
              <p>
                <strong>Hours:</strong> Mon - Fri, 9:00 AM - 6:00 PM IST
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © 2026 MSME Scheme Portal. All rights reserved. | Powered by India's
            Leading MSME Platform
          </p>
        </div>
      </footer>

      {/* Scheme Details Modal */}
      {selectedScheme && (
        <div className="scheme-details-modal-overlay" onClick={handleBackFromSchemeDetails}>
          <div className="scheme-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="scheme-details-close-btn" onClick={handleBackFromSchemeDetails}>✕</button>
            <SchemeDetails scheme={selectedScheme} onBack={handleBackFromSchemeDetails} />
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;