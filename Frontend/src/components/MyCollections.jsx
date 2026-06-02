import React, { useState, useEffect } from 'react';
import SchemeDetails from './SchemeDetails';
import '../styles/MyCollections.css';
import { collectionAPI } from '../services/api';

const MyCollections = ({ onClose, savedSchemes = [] }) => {
  const [schemes, setSchemes] = useState(savedSchemes);
  const [filteredSchemes, setFilteredSchemes] = useState(savedSchemes);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Fetch saved schemes on mount
  useEffect(() => {
    fetchSavedSchemes();
  }, []);

  const fetchSavedSchemes = async () => {
    try {
      setLoading(true);
      const response = await collectionAPI.getSavedSchemes();
      if (response.success) {
        setSchemes(response.data.schemes || []);
        setFilteredSchemes(response.data.schemes || []);
      }
    } catch (err) {
      console.error('Error fetching saved schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = schemes.filter((scheme) =>
        scheme.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSchemes(filtered);
    } else {
      setFilteredSchemes(schemes);
    }
  }, [searchQuery, schemes]);

  const handleRemoveFromCollection = async (schemeId) => {
    try {
      setRemovingId(schemeId);
      const response = await collectionAPI.unsaveScheme(schemeId);
      if (response.success) {
        setSchemes(schemes.filter(s => s.id !== schemeId));
      }
    } catch (err) {
      console.error('Error removing from collection:', err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      {selectedScheme ? (
        <SchemeDetails
          scheme={selectedScheme}
          onBack={() => setSelectedScheme(null)}
        />
      ) : (
        <div className="my-collections-modal-overlay" onClick={onClose}>
          <div className="my-collections-modal" onClick={(e) => e.stopPropagation()}>
            <div className="collections-header">
              <h2>My Saved Schemes</h2>
              <button className="collections-close-btn" onClick={onClose}>✕</button>
            </div>

            {loading ? (
              <div className="collections-loading">
                <p>Loading your saved schemes...</p>
              </div>
            ) : schemes.length > 0 ? (
              <>
                <div className="collections-search">
                  <input
                    type="text"
                    placeholder="Search in saved schemes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="collections-content">
                  {filteredSchemes.length > 0 ? (
                    <div className="saved-schemes-list">
                      {filteredSchemes.map((scheme) => (
                        <div key={scheme.id} className="saved-scheme-item">
                          <div className="scheme-item-content">
                            <h3 className="scheme-item-name">{scheme.name}</h3>
                            <p className="scheme-item-category">{scheme.business_category || 'General'}</p>
                            <p className="scheme-item-desc">{scheme.description || 'No description available'}</p>
                          </div>
                          <div className="scheme-item-actions">
                            <button 
                              className="view-btn"
                              onClick={() => setSelectedScheme(scheme)}
                            >
                              View Details
                            </button>
                            <button 
                              className="remove-btn"
                              onClick={() => handleRemoveFromCollection(scheme.id)}
                              disabled={removingId === scheme.id}
                            >
                              {removingId === scheme.id ? '⟳ Removing...' : '✕ Remove'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-search">
                      <p>No schemes found matching your search.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-collections">
                <div className="empty-icon">📋</div>
                <h3>No Saved Schemes Yet</h3>
                <p>Start exploring schemes and save the ones you're interested in!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MyCollections;
