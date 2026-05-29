import React, { useState } from 'react';
import SchemeDetails from './SchemeDetails';
import '../styles/RecommendedSchemes.css';

const RecommendedSchemes = ({ schemes, isLoading }) => {
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [expandedSchemes, setExpandedSchemes] = useState({});

  const toggleExpand = (schemeId) => {
    setExpandedSchemes((prev) => ({
      ...prev,
      [schemeId]: !prev[schemeId],
    }));
  };

  const simplifyDescription = (description) => {
    if (!description) return '';
    return description
      .replace(/MSME|msme/g, 'business')
      .replace(/subsidy|Subsidy/g, 'financial support')
      .replace(/entrepreneur|Entrepreneur/g, 'business owner')
      .replace(/beneficiary|Beneficiary/g, 'applicant')
      .replace(/eligible|Eligible/g, 'qualified');
  };

  const truncateText = (text, limit = 150) => {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit).trim() + '...' : text;
  };

  if (isLoading) {
    return (
      <div className="schemes-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Finding eligible schemes for you...</p>
        </div>
      </div>
    );
  }

  if (!schemes || schemes.length === 0) {
    return (
      <div className="schemes-container">
        <div className="no-results">
          <p> No schemes found for your criteria. Try adjusting your inputs.</p>
        </div>
      </div>
    );
  }

  if (selectedScheme) {
    return (
      <SchemeDetails
        scheme={selectedScheme}
        onBack={() => setSelectedScheme(null)}
      />
    );
  }

  return (
    <div className="schemes-container">
      <div className="schemes-header">
        <h2> Available Schemes for You</h2>
        <p className="result-count">Found <strong>{schemes.length}</strong> eligible scheme(s) that match your profile</p>
      </div>

      <div className="schemes-grid">
        {schemes.map((scheme) => {
          const isExpanded = expandedSchemes[scheme.id] || false;
          const simplifiedDesc = simplifyDescription(scheme.description);
          const truncatedDesc = truncateText(simplifiedDesc, 150);
          const shouldShowMore = simplifiedDesc.length > 150;

          return (
            <div key={scheme.id} className="scheme-card">
              {/* Badge */}
              <div className="card-badge">
                <span className="badge-eligible"> Perfect Match</span>
              </div>

              {/* Title */}
              <h3 className="scheme-title">{scheme.name}</h3>

              {/* Description */}
              <div className="description-box">
                <p className="scheme-description">
                  {isExpanded ? simplifiedDesc : truncatedDesc}
                </p>
                {shouldShowMore && (
                  <button
                    className="btn-expand"
                    onClick={() => toggleExpand(scheme.id)}
                    type="button"
                  >
                    {isExpanded ? (
                      <>
                        <span> Show Less</span>
                      </>
                    ) : (
                      <>
                        <span> View More</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Key Benefits Highlights */}
              <div className="benefits-highlight">
                {scheme.benefits && scheme.benefits.subsidy_percent && (
                  <div className="highlight-box">
                    <div className="highlight-number">{scheme.benefits.subsidy_percent}%</div>
                    <div className="highlight-label">Financial Support</div>
                  </div>
                )}
                {scheme.benefits && scheme.benefits.max_subsidy && (
                  <div className="highlight-box highlight-box-primary">
                    <div className="highlight-number">₹{(scheme.benefits.max_subsidy / 100000).toFixed(1)}L</div>
                    <div className="highlight-label">Max Support</div>
                  </div>
                )}
              </div>

              {/* Quick Info Cards */}
              <div className="info-grid">
                {scheme.max_investment && (
                  <div className="info-card">
                    <span className="info-icon"></span>
                    <div className="info-content">
                      <div className="info-label">Investment</div>
                      <div className="info-value">₹{(scheme.max_investment / 100000).toFixed(1)}L</div>
                    </div>
                  </div>
                )}

                {scheme.location && scheme.location !== 'any' && (
                  <div className="info-card">
                    <span className="info-icon"></span>
                    <div className="info-content">
                      <div className="info-label">Available In</div>
                      <div className="info-value">{scheme.location.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                )}

                {scheme.business_category && scheme.business_category !== 'any' && (
                  <div className="info-card">
                    <span className="info-icon"></span>
                    <div className="info-content">
                      <div className="info-label">Business Type</div>
                      <div className="info-value">{scheme.business_category}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Special Categories Badge */}
              {scheme.beneficiary_categories && scheme.beneficiary_categories.length > 0 && (
                <div className="categories-section">
                  <p className="categories-label"> Special Priority For:</p>
                  <div className="categories-tags">
                    {scheme.beneficiary_categories.slice(0, 3).map((category, index) => {
                      const categoryLabels = {
                        'sc_st': 'SC/ST',
                        'transgender': 'Transgender',
                        'pwd': 'PWD',
                        'widow': 'Widows',
                        'bpl_women': 'BPL Women'
                      };
                      return (
                        <span key={index} className="category-tag">
                          {categoryLabels[category] || category}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                className="btn btn-details"
                onClick={() => setSelectedScheme(scheme)}
              >
                 View Full Details & Apply
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedSchemes;
