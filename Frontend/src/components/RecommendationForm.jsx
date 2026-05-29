import React, { useState, useEffect } from 'react';
import { schemeAPI } from '../services/api';
import '../styles/Recommentationform.css';

const SchemeRecommendationForm = ({ onRecommendations, onLoading }) => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    business_category: '',
    investment: '',
    location: '',
    social_category: '',
    beneficiary_category: '',
    income: '',
    education: '',
    experience: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = ['age', 'gender', 'business_category', 'investment', 'location'];
    const filledRequired = requiredFields.filter(field => formData[field] !== '').length;
    setFormProgress((filledRequired / requiredFields.length) * 100);
  }, [formData]);

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.age || formData.age < 18 || formData.age > 100) {
      newErrors.age = 'Please enter a valid age';
    }
    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
    }
    if (!formData.business_category) {
      newErrors.business_category = 'Please select a business category';
    }
    if (!formData.investment || formData.investment < 0) {
      newErrors.investment = 'Please enter a valid investment amount';
    }
    if (!formData.location) {
      newErrors.location = 'Please select a location';
    }
    if (formData.experience && (formData.experience < 0 || formData.experience > 100)) {
      newErrors.experience = 'Please enter a valid experience';
    }
    if (formData.income && formData.income < 0) {
      newErrors.income = 'Please enter a valid income amount';
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
    onLoading(true);

    try {
      // Convert string values to numbers
      const userDataForAPI = {
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        business_category: formData.business_category,
        investment: parseInt(formData.investment, 10),
        location: formData.location,
        social_category: formData.social_category || null,
        beneficiary_category: formData.beneficiary_category || null,
        income: formData.income ? parseInt(formData.income, 10) : null,
        education: formData.education || null,
        experience: formData.experience ? parseInt(formData.experience, 10) : 0,
      };

      const response = await schemeAPI.recommendSchemes(userDataForAPI);
      onRecommendations(response.data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setErrors({ submit: 'Failed to fetch recommendations. Please try again.' });
      onRecommendations([]);
    } finally {
      setIsSubmitting(false);
      onLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      age: '',
      gender: '',
      business_category: '',
      investment: '',
      location: '',
      beneficiary_category: '',
      social_category: '',
      income: '',
      education: '',
      experience: '',
    });
    setErrors({});
    onRecommendations([]);
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="recommendation-form">
        <div className="form-header">
          <h2>MSME Scheme Eligibility Check</h2>
          <p className="form-description">
            Enter your details to get personalized scheme recommendations tailored for you
          </p>
          <div className="form-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${formProgress}%` }}></div>
            </div>
            <span className="progress-text">{Math.round(formProgress)}% Complete</span>
          </div>
        </div>

        {errors.submit && (
          <div className="error-message error-message-alert">
            <strong>⚠️ Error:</strong> {errors.submit}
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="form-errors-summary">
            <strong>Please fix the following:</strong>
            <ul>
              {Object.entries(errors)
                .filter(([key]) => key !== 'submit')
                .map(([key, message]) => (
                  <li key={key}>{message}</li>
                ))}
            </ul>
          </div>
        )}

        {/* Personal Information Section */}
        <fieldset className="form-section">
          <legend className="section-title">
            <span className="section-icon"></span>
            Personal Information
          </legend>
          <div className="form-grid">
            {/* Age */}
            <div className="form-group">
              <label htmlFor="age">
                Age <span className="required">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="18"
                max="100"
                required
                className={errors.age ? 'input-error' : ''}
                placeholder="18-100 years"
              />
              {errors.age && <span className="error-text">{errors.age}</span>}
              <span className="field-hint">Must be between 18-100 years old</span>
            </div>

            {/* Gender */}
            <div className="form-group">
              <label htmlFor="gender">
                Gender <span className="required">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className={errors.gender ? 'input-error' : ''}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="transgender">Transgender</option>
              </select>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>

            {/* Social Category */}
            <div className="form-group">
              <label htmlFor="social_category">
                Social Category <span className="optional">(optional)</span>
              </label>
              <select
                id="social_category"
                name="social_category"
                value={formData.social_category}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                <option value="sc">SC (Scheduled Caste)</option>
                <option value="st">ST (Scheduled Tribe)</option>
                <option value="obc">OBC (Other Backward Class)</option>
                <option value="general">General</option>
              </select>
              <span className="field-hint">Helps identify special priority schemes</span>
            </div>

            {/* Beneficiary Category */}
            <div className="form-group">
              <label htmlFor="beneficiary_category">
                Special Category <span className="optional">(optional)</span>
              </label>
              <select
                id="beneficiary_category"
                name="beneficiary_category"
                value={formData.beneficiary_category}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                <option value="sc_st">SC/ST</option>
                <option value="transgender">Transgender Persons</option>
                <option value="pwd">Persons with Disabilities (PWD)</option>
                <option value="widow">Widows/Destitute Widows</option>
                <option value="bpl_women">Women from BPL Families</option>
              </select>
              <span className="field-hint">Schemes may have special benefits for your category</span>
            </div>
          </div>
        </fieldset>

        {/* Business Information Section */}
        <fieldset className="form-section">
          <legend className="section-title">
            <span className="section-icon"></span>
            Business Information
          </legend>
          <div className="form-grid">
            {/* Business Category */}
            <div className="form-group">
              <label htmlFor="business_category">
                Business Category <span className="required">*</span>
              </label>
              <select
                id="business_category"
                name="business_category"
                value={formData.business_category}
                onChange={handleInputChange}
                required
                className={errors.business_category ? 'input-error' : ''}
              >
                <option value="">Select Category</option>
                <option value="any">Any</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="service">Service</option>
                <option value="trading">Trading</option>
                <option value="agriculture">Agriculture</option>
                <option value="retail">Retail</option>
              </select>
              {errors.business_category && (
                <span className="error-text">{errors.business_category}</span>
              )}
              <span className="field-hint">Select the primary business type</span>
            </div>

            {/* Experience */}
            <div className="form-group">
              <label htmlFor="experience">
                Business Experience <span className="optional">(optional)</span>
              </label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="0"
                  className={errors.experience ? 'input-error' : ''}
                />
                <span className="unit">years</span>
              </div>
              {errors.experience && <span className="error-text">{errors.experience}</span>}
              <span className="field-hint">Leave as 0 if you're a new entrepreneur</span>
            </div>

            {/* Investment */}
            <div className="form-group">
              <label htmlFor="investment">
                Investment Amount <span className="required">*</span>
              </label>
              <div className="input-with-unit">
                <span className="currency">₹</span>
                <input
                  type="number"
                  id="investment"
                  name="investment"
                  value={formData.investment}
                  onChange={handleInputChange}
                  min="0"
                  required
                  placeholder="0"
                  className={errors.investment ? 'input-error' : ''}
                />
              </div>
              {errors.investment && <span className="error-text">{errors.investment}</span>}
              <span className="field-hint">Total project/investment cost in rupees</span>
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location">
                Location/State <span className="required">*</span>
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className={errors.location ? 'input-error' : ''}
              >
                <option value="">Select Location</option>
                <option value="tamil_nadu">Tamil Nadu</option>
                <option value="karnataka">Karnataka</option>
                <option value="maharashtra">Maharashtra</option>
                <option value="delhi">Delhi</option>
                <option value="uttar_pradesh">Uttar Pradesh</option>
                <option value="other">Other</option>
              </select>
              {errors.location && <span className="error-text">{errors.location}</span>}
              <span className="field-hint">Many schemes are state-specific</span>
            </div>
          </div>
        </fieldset>

        {/* Financial Information Section */}
        <fieldset className="form-section">
          <legend className="section-title">
            <span className="section-icon"></span>
            Financial Information <span className="optional">(optional)</span>
          </legend>
          <div className="form-grid">
            {/* Income */}
            <div className="form-group">
              <label htmlFor="income">Annual Income</label>
              <div className="input-with-unit">
                <span className="currency">₹</span>
                <input
                  type="number"
                  id="income"
                  name="income"
                  value={formData.income}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                  className={errors.income ? 'input-error' : ''}
                />
              </div>
              {errors.income && <span className="error-text">{errors.income}</span>}
              <span className="field-hint">Personal/household annual income</span>
            </div>

            {/* Education */}
            <div className="form-group">
              <label htmlFor="education">Education Level</label>
              <select
                id="education"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
              >
                <option value="">Select Level</option>
                <option value="10th">10th Grade</option>
                <option value="12th">12th Grade</option>
                <option value="diploma">Diploma</option>
                <option value="graduation">Graduation (Bachelor's)</option>
                <option value="postgraduation">Post Graduation (Master's)</option>
              </select>
              <span className="field-hint">Highest educational qualification</span>
            </div>
          </div>
        </fieldset>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-small"></span>
                Checking Eligibility...
              </>
            ) : (
              ' Find Eligible Schemes'
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
          >
             Reset Form
          </button>
        </div>

        <div className="form-footer">
          <p className="disclaimer">
            <span className="required">*</span> Required fields. Your information is kept confidential.
          </p>
        </div>
      </form>
    </div>
  );
};

export default SchemeRecommendationForm;
