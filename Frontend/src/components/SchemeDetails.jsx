import React from 'react';
import '../styles/SchemeDetails.css';

const SchemeDetails = ({ scheme, onBack }) => {
  const categoryLabels = {
    'sc_st': 'SC/ST',
    'transgender': 'Transgender Persons',
    'pwd': 'Persons with Disabilities',
    'widow': 'Widows/Destitute Widows',
    'bpl_women': 'Women from BPL Families'
  };

  const simplifyDescription = (description) => {
    if (!description) return '';
    // Replace technical terms with simpler ones
    return description
      .replace(/MSME|msme/g, 'business')
      .replace(/subsidy|Subsidy/g, 'financial support')
      .replace(/entrepreneur|Entrepreneur/g, 'business owner')
      .replace(/beneficiary|Beneficiary/g, 'applicant')
      .replace(/eligible|Eligible/g, 'qualified')
      .replace(/scheme|Scheme/g, 'program');
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    if (amount >= 1000000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatRule = (key, value) => {
    const ruleLabels = {
      'min_age': 'Minimum Age',
      'max_age': 'Maximum Age',
      'max_age_general': 'Max Age (General)',
      'max_age_special': 'Max Age (Special)',
      'gender': 'Gender',
      'state': 'State',
      'domicile': 'Domicile',
      'min_project_cost': 'Min Project Cost',
      'max_project_cost': 'Max Project Cost',
      'max_investment': 'Max Investment',
      'max_income': 'Max Income',
      'max_family_income': 'Max Family Income',
      'min_experience': 'Min Experience',
      'min_experience_years': 'Min Experience (Years)',
      'max_previous_subsidy': 'Max Previous Support',
      'prior_subsidy_limit': 'Prior Support Limit'
    };
    return ruleLabels[key] || key;
  };

  const formatValue = (key, value) => {
    if (Array.isArray(value)) {
      return value.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ');
    }
    if (key.includes('income') || key.includes('subsidy') || key.includes('cost') || key.includes('investment')) {
      return formatCurrency(value);
    }
    if (key.includes('age') || key.includes('experience')) {
      return `${value} years`;
    }
    return value.toString().charAt(0).toUpperCase() + value.toString().slice(1);
  };

  return (
    <div className="scheme-details-container">
      <button className="btn btn-back" onClick={onBack}>
        ← Back to Schemes
      </button>

      <div className="scheme-details-card">
        {/* Header Section */}
        <div className="details-header">
          <div className="header-content">
            <h1>{scheme.name}</h1>
            <span className="eligible-badge">✓ Eligible for you</span>
          </div>
        </div>

        {/* Description - Simplified */}
        {scheme.description && (
          <p className="scheme-summary">{simplifyDescription(scheme.description)}</p>
        )}

        {/* Key Highlights */}
        {scheme.benefits && scheme.benefits.max_subsidy && (
          <div className="highlights-box">
            <div className="highlight-item">
              <span className="highlight-icon">💰</span>
              <div className="highlight-content">
                <p className="highlight-label">Maximum Financial Support You Can Get</p>
                <p className="highlight-value">{formatCurrency(scheme.benefits.max_subsidy)}</p>
              </div>
            </div>
            {scheme.benefits.subsidy_percent && (
              <div className="highlight-item">
                <span className="highlight-icon">📊</span>
                <div className="highlight-content">
                  <p className="highlight-label">Support Rate</p>
                  <p className="highlight-value">{scheme.benefits.subsidy_percent}%</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Eligibility Criteria Section */}
        <section className="details-section">
          <div className="section-header">
            <span className="section-icon">📋</span>
            <h2>Who Can Apply?</h2>
          </div>
          {scheme.rules && Object.keys(scheme.rules).length > 0 ? (
            <div className="criteria-grid">
              {Object.entries(scheme.rules).map(([key, value]) => {
                if (!value) return null;
                return (
                  <div key={key} className="criteria-card">
                    <div className="criteria-header">
                      <span className="criteria-label">{formatRule(key, value)}</span>
                    </div>
                    <div className="criteria-value-box">
                      {key.includes('age') || key.includes('experience') ? '🎯' : '✓'}
                      <span className="criteria-value">{formatValue(key, value)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-data-message">
              <p>📌 No specific requirements. Contact the program office for details.</p>
            </div>
          )}
        </section>

        {/* Beneficiary Categories Section */}
        {scheme.beneficiary_categories && scheme.beneficiary_categories.length > 0 && (
          <section className="details-section">
            <div className="section-header">
              <span className="section-icon">👥</span>
              <h2>Special Priority Groups</h2>
            </div>
            <div className="beneficiary-grid">
              {scheme.beneficiary_categories.map((category, index) => (
                <div key={index} className="beneficiary-card">
                  <span className="beneficiary-checkmark">✓</span>
                  <span className="beneficiary-text">{categoryLabels[category] || category}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Financial Benefits Section */}
        <section className="details-section">
          <div className="section-header">
            <span className="section-icon">💵</span>
            <h2>What You'll Get</h2>
          </div>
          {scheme.benefits && Object.keys(scheme.benefits).length > 0 ? (
            <div className="benefits-grid">
              {scheme.benefits.subsidy_percent && (
                <div className="benefit-card">
                  <p className="benefit-label">Support Percentage</p>
                  <p className="benefit-highlight">{scheme.benefits.subsidy_percent}%</p>
                  <p className="benefit-note">of your project cost</p>
                </div>
              )}
              {scheme.benefits.max_subsidy && (
                <div className="benefit-card benefit-card-primary">
                  <p className="benefit-label">Maximum Amount You Can Get</p>
                  <p className="benefit-highlight-large">{formatCurrency(scheme.benefits.max_subsidy)}</p>
                  <p className="benefit-note-primary">as direct financial support</p>
                </div>
              )}
              {scheme.benefits.loan_amount && (
                <div className="benefit-card">
                  <p className="benefit-label">Loan Available</p>
                  <p className="benefit-highlight">{formatCurrency(scheme.benefits.loan_amount)}</p>
                  <p className="benefit-note">for your project needs</p>
                </div>
              )}
            </div>
          ) : (
            <div className="no-data-message">
              <p>📌 Benefit details not available. Contact the program office.</p>
            </div>
          )}
        </section>

        {/* Program Details Section */}
        <section className="details-section">
          <div className="section-header">
            <span className="section-icon">ℹ️</span>
            <h2>Program Details</h2>
          </div>
          <div className="details-grid">
            {scheme.business_category && scheme.business_category !== 'any' && (
              <div className="detail-item">
                <span className="detail-icon">🏢</span>
                <div className="detail-content">
                  <p className="detail-label">Business Type</p>
                  <p className="detail-value">{scheme.business_category.charAt(0).toUpperCase() + scheme.business_category.slice(1)}</p>
                </div>
              </div>
            )}
            {scheme.location && scheme.location !== 'any' && (
              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <div className="detail-content">
                  <p className="detail-label">Available In State</p>
                  <p className="detail-value">{scheme.location.replace(/_/g, ' ').toUpperCase()}</p>
                </div>
              </div>
            )}
            {scheme.max_investment && (
              <div className="detail-item">
                <span className="detail-icon">💼</span>
                <div className="detail-content">
                  <p className="detail-label">Project Cost Limit</p>
                  <p className="detail-value">{formatCurrency(scheme.max_investment)}</p>
                </div>
              </div>
            )}
            {scheme.created_at && (
              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <div className="detail-content">
                  <p className="detail-label">Program Started</p>
                  <p className="detail-value">{new Date(scheme.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* How to Apply Section */}
        <section className="details-section">
          <div className="section-header">
            <span className="section-icon">🚀</span>
            <h2>How to Apply - Simple Steps</h2>
          </div>
          <ol className="steps-list">
            <li>
              <span className="step-number">1</span>
              <div className="step-content">
                <p className="step-title">Check If You Qualify</p>
                <p className="step-desc">Review the "Who Can Apply?" section above to confirm you meet the requirements</p>
              </div>
            </li>
            <li>
              <span className="step-number">2</span>
              <div className="step-content">
                <p className="step-title">Get Your Documents Ready</p>
                <p className="step-desc">Prepare your ID proof, business plan, financial statements, and other required documents</p>
              </div>
            </li>
            <li>
              <span className="step-number">3</span>
              <div className="step-content">
                <p className="step-title">Visit the Official Website</p>
                <p className="step-desc">Go to the government program website and create your account</p>
              </div>
            </li>
            <li>
              <span className="step-number">4</span>
              <div className="step-content">
                <p className="step-title">Fill Out the Application</p>
                <p className="step-desc">Complete all required fields with accurate information about your business</p>
              </div>
            </li>
            <li>
              <span className="step-number">5</span>
              <div className="step-content">
                <p className="step-title">Submit & Track Progress</p>
                <p className="step-desc">Submit your application and use the reference number to check status</p>
              </div>
            </li>
          </ol>
        </section>

        {/* CTA Section */}
        <div className="cta-section">
          <h3>Ready to Apply?</h3>
          <p>This program is perfectly suited for your business. Start your application today and get the financial support you need!</p>
          <button className="btn btn-apply">
            📝 Apply for This Program
          </button>
          <p className="cta-note">ℹ️ You'll be redirected to the official government website to complete your application</p>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetails;
