import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Custom cursor component
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      className={`custom-cursor ${isClicking ? 'clicking' : ''}`}
      style={{
        left: position.x,
        top: position.y,
      }}
    />
  );
};

// Smart Suggestions Component
const SmartSuggestions = ({ onSuggestionSelect }) => {
  const [availableIngredients, setAvailableIngredients] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGetSuggestions = async () => {
    if (!availableIngredients.trim()) return;

    setLoading(true);
    try {
      const ingredientsList = availableIngredients
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);

      const response = await axios.post(`${API_BASE_URL}/api/recipes/suggestions`, {
        available_ingredients: ingredientsList,
        max_results: 6
      });
      
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-suggestions-section">
      <div className="container">
        <div className="suggestions-header">
          <h2 className="section-title">🧠 Smart Recipe Suggestions</h2>
          <p className="section-subtitle">
            Tell us what ingredients you have, and we'll suggest perfect recipes for you!
          </p>
        </div>

        <div className="ingredients-input-section glass-effect">
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter ingredients you have (e.g., chicken, tomatoes, basil, pasta)"
              value={availableIngredients}
              onChange={(e) => setAvailableIngredients(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGetSuggestions()}
              className="ingredients-input"
            />
            <button 
              onClick={handleGetSuggestions}
              disabled={loading || !availableIngredients.trim()}
              className="suggestions-btn"
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Finding...
                </>
              ) : (
                <>
                  <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Get Suggestions
                </>
              )}
            </button>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="suggestions-results">
            <div className="suggestions-grid">
              {suggestions.map((suggestion) => (
                <SuggestionCard 
                  key={suggestion.recipe.id} 
                  suggestion={suggestion}
                  onSelect={onSuggestionSelect}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Suggestion card component
const SuggestionCard = ({ suggestion, onSelect }) => {
  const { recipe, match_score, matching_ingredients, missing_ingredients } = suggestion;
  const matchPercentage = Math.round(match_score * 100);

  return (
    <div className="suggestion-card glass-effect" onClick={() => onSelect(recipe)}>
      <div className="suggestion-image">
        <img 
          src={recipe.image_url || "https://images.unsplash.com/photo-1466637574441-749b8f19452f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxjb29raW5nfGVufDB8fHx8MTc1MzcwNjY0M3ww&ixlib=rb-4.1.0&q=85"} 
          alt={recipe.title} 
        />
        <div className="match-score">
          <span className="match-percentage">{matchPercentage}%</span>
          <span className="match-label">Match</span>
        </div>
      </div>
      
      <div className="suggestion-content">
        <h3 className="suggestion-title">{recipe.title}</h3>
        <p className="suggestion-description">{recipe.description}</p>
        
        <div className="ingredients-match">
          <div className="matching-ingredients">
            <h4>✅ You have ({matching_ingredients.length}):</h4>
            <div className="ingredient-tags">
              {matching_ingredients.slice(0, 3).map((ingredient, index) => (
                <span key={index} className="ingredient-tag matching">{ingredient}</span>
              ))}
              {matching_ingredients.length > 3 && (
                <span className="ingredient-tag more">+{matching_ingredients.length - 3} more</span>
              )}
            </div>
          </div>
          
          {missing_ingredients.length > 0 && (
            <div className="missing-ingredients">
              <h4>🛒 You need ({missing_ingredients.length}):</h4>
              <div className="ingredient-tags">
                {missing_ingredients.slice(0, 2).map((ingredient, index) => (
                  <span key={index} className="ingredient-tag missing">{ingredient}</span>
                ))}
                {missing_ingredients.length > 2 && (
                  <span className="ingredient-tag more">+{missing_ingredients.length - 2} more</span>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="recipe-meta">
          <div className="meta-item">
            <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{recipe.prep_time + recipe.cook_time} min</span>
          </div>
          <div className="meta-item">
            <span className="difficulty-badge">{recipe.difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Share component
const ShareRecipe = ({ recipe, isVisible, onClose }) => {
  const [copied, setCopied] = useState(false);
  const recipeUrl = `${window.location.origin}?recipe=${recipe?.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(recipeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${recipe.title} - RecipeCore`,
          text: recipe.description,
          url: recipeUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = `Check out this delicious ${recipe.title} recipe from RecipeCore!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(recipeUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const text = `Check out this amazing ${recipe.title} recipe: ${recipeUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToEmail = () => {
    const subject = `Recipe: ${recipe.title}`;
    const body = `I found this amazing recipe on RecipeCore and thought you'd love it!\n\n${recipe.title}\n${recipe.description}\n\nCheck it out here: ${recipeUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url);
  };

  if (!isVisible || !recipe) return null;

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-modal glass-effect" onClick={(e) => e.stopPropagation()}>
        <div className="share-header">
          <h3>Share Recipe</h3>
          <button className="modal-close" onClick={onClose}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="share-content">
          <div className="recipe-preview">
            <img src={recipe.image_url || "https://images.unsplash.com/photo-1466637574441-749b8f19452f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxjb29raW5nfGVufDB8fHx8MTc1MzcwNjY0M3ww&ixlib=rb-4.1.0&q=85"} alt={recipe.title} />
            <div>
              <h4>{recipe.title}</h4>
              <p>{recipe.description}</p>
            </div>
          </div>
          
          <div className="share-options">
            {navigator.share && (
              <button className="share-btn native" onClick={handleNativeShare}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
            )}
            
            <button className="share-btn facebook" onClick={shareToFacebook}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            
            <button className="share-btn twitter" onClick={shareToTwitter}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </button>
            
            <button className="share-btn whatsapp" onClick={shareToWhatsApp}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              WhatsApp
            </button>
            
            <button className="share-btn email" onClick={shareToEmail}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </button>
            
            <button className="share-btn copy" onClick={handleCopyLink}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hero section component
const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            Discover & Share
            <span className="gradient-text"> Amazing Recipes</span>
          </h1>
          <p className="hero-subtitle">
            Connect with fellow food lovers, share your culinary creations, and discover 
            delicious recipes with integrated YouTube cooking tutorials.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => document.querySelector('.recipes-section').scrollIntoView({ behavior: 'smooth' })}>
              <span>Explore Recipes</span>
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="btn-secondary" onClick={() => document.querySelector('.smart-suggestions-section').scrollIntoView({ behavior: 'smooth' })}>
              <span>Smart Suggestions</span>
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1528712306091-ed0763094c98?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxjb29raW5nfGVufDB8fHx8MTc1MzcwNjY0M3ww&ixlib=rb-4.1.0&q=85"
            alt="Cooking"
            className="hero-img"
          />
        </div>
      </div>
    </div>
  );
};

// Recipe card component
const RecipeCard = ({ recipe, onView, onShare }) => {
  const totalTime = recipe.prep_time + recipe.cook_time;
  
  return (
    <div className="recipe-card glass-effect">
      <div className="recipe-image" onClick={() => onView(recipe)}>
        <img 
          src={recipe.image_url || "https://images.unsplash.com/photo-1466637574441-749b8f19452f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxjb29raW5nfGVufDB8fHx8MTc1MzcwNjY0M3ww&ixlib=rb-4.1.0&q=85"} 
          alt={recipe.title} 
        />
        <div className="recipe-overlay">
          <span className="difficulty-badge">{recipe.difficulty}</span>
        </div>
      </div>
      <div className="recipe-content">
        <h3 className="recipe-title" onClick={() => onView(recipe)}>{recipe.title}</h3>
        <p className="recipe-description">{recipe.description}</p>
        <div className="recipe-meta">
          <div className="meta-item">
            <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{totalTime} min</span>
          </div>
          <div className="meta-item">
            <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{recipe.servings} servings</span>
          </div>
        </div>
        {recipe.youtube_videos && recipe.youtube_videos.length > 0 && (
          <div className="youtube-indicator">
            <svg className="youtube-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>{recipe.youtube_videos.length} video{recipe.youtube_videos.length > 1 ? 's' : ''}</span>
          </div>
        )}
        <div className="recipe-actions">
          <button className="action-btn share-btn" onClick={(e) => { e.stopPropagation(); onShare(recipe); }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

// Recipe modal component
const RecipeModal = ({ recipe, isOpen, onClose, youtubeVideos, onSearchYoutube, onShare }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleYouTubeSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      await onSearchYoutube(searchQuery);
    } catch (error) {
      console.error('YouTube search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen || !recipe) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-effect" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{recipe.title}</h2>
          <div className="modal-actions">
            <button className="action-btn share-btn" onClick={() => onShare(recipe)}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>
            <button className="modal-close" onClick={onClose}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="modal-body">
          <div className="recipe-image-large">
            <img 
              src={recipe.image_url || "https://images.unsplash.com/photo-1466637574441-749b8f19452f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxjb29raW5nfGVufDB8fHx8MTc1MzcwNjY0M3ww&ixlib=rb-4.1.0&q=85"} 
              alt={recipe.title} 
            />
          </div>
          
          <div className="recipe-details">
            <p className="recipe-description-full">{recipe.description}</p>
            
            <div className="recipe-stats">
              <div className="stat">
                <span className="stat-label">Prep Time:</span>
                <span className="stat-value">{recipe.prep_time} min</span>
              </div>
              <div className="stat">
                <span className="stat-label">Cook Time:</span>
                <span className="stat-value">{recipe.cook_time} min</span>
              </div>
              <div className="stat">
                <span className="stat-label">Servings:</span>
                <span className="stat-value">{recipe.servings}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Difficulty:</span>
                <span className="stat-value">{recipe.difficulty}</span>
              </div>
            </div>

            <div className="ingredients-section">
              <h3>Ingredients</h3>
              <ul className="ingredients-list">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <div className="instructions-section">
              <h3>Instructions</h3>
              <ol className="instructions-list">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            <div className="youtube-section">
              <h3>Related Videos</h3>
              
              <div className="youtube-search">
                <input
                  type="text"
                  placeholder="Search YouTube for cooking videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleYouTubeSearch()}
                />
                <button 
                  onClick={handleYouTubeSearch}
                  disabled={isSearching}
                  className="search-btn"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              <div className="youtube-videos">
                {youtubeVideos.map((video) => (
                  <div key={video.video_id} className="youtube-video">
                    <img src={video.thumbnail} alt={video.title} />
                    <div className="video-info">
                      <h4>{video.title}</h4>
                      <p>{video.channel_title}</p>
                      <a 
                        href={`https://www.youtube.com/watch?v=${video.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="watch-btn"
                      >
                        Watch on YouTube
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Recipe Form Component
const RecipeForm = ({ onRecipeAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    prep_time: '',
    cook_time: '',
    servings: '',
    difficulty: 'Easy',
    cuisine: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (index, value, field) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        prep_time: parseInt(formData.prep_time),
        cook_time: parseInt(formData.cook_time),
        servings: parseInt(formData.servings),
        ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
        instructions: formData.instructions.filter(inst => inst.trim() !== '')
      };

      const response = await axios.post(`${API_BASE_URL}/api/recipes`, submitData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        ingredients: [''],
        instructions: [''],
        prep_time: '',
        cook_time: '',
        servings: '',
        difficulty: 'Easy',
        cuisine: '',
        image_url: ''
      });
      
      setShowForm(false);
      onRecipeAdded(response.data);
      alert('Recipe added successfully!');
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert('Error adding recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="add-recipe-section">
      <div className="container">
        {!showForm ? (
          <div className="add-recipe-prompt">
            <h2 className="section-title">🍳 Share Your Recipe</h2>
            <p className="section-subtitle">Have a delicious recipe to share? Add it to our community!</p>
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Recipe
            </button>
          </div>
        ) : (
          <div className="recipe-form-container glass-effect">
            <div className="form-header">
              <h2>Add New Recipe</h2>
              <button 
                className="modal-close"
                onClick={() => setShowForm(false)}
                type="button"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="recipe-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Recipe Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Classic Chocolate Chip Cookies"
                  />
                </div>

                <div className="form-group">
                  <label>Cuisine Type</label>
                  <input
                    type="text"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleInputChange}
                    placeholder="e.g., Italian, Mexican, Asian"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    placeholder="Describe your recipe..."
                  />
                </div>

                <div className="form-group">
                  <label>Prep Time (minutes) *</label>
                  <input
                    type="number"
                    name="prep_time"
                    value={formData.prep_time}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Cook Time (minutes) *</label>
                  <input
                    type="number"
                    name="cook_time"
                    value={formData.cook_time}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Servings *</label>
                  <input
                    type="number"
                    name="servings"
                    value={formData.servings}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Difficulty *</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Image URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="ingredients-section">
                <label>Ingredients *</label>
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="array-input-group">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'ingredients')}
                      placeholder={`Ingredient ${index + 1}`}
                      required={index === 0}
                    />
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'ingredients')}
                        className="remove-btn"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('ingredients')}
                  className="add-item-btn"
                >
                  + Add Ingredient
                </button>
              </div>

              <div className="instructions-section">
                <label>Instructions *</label>
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="array-input-group">
                    <div className="step-number">{index + 1}</div>
                    <textarea
                      value={instruction}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'instructions')}
                      placeholder={`Step ${index + 1}`}
                      rows="2"
                      required={index === 0}
                    />
                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'instructions')}
                        className="remove-btn"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('instructions')}
                  className="add-item-btn"
                >
                  + Add Step
                </button>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      Adding Recipe...
                    </>
                  ) : (
                    'Add Recipe'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

// YouTube Search Component
const YouTubeSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/youtube/search`, {
        params: { q: searchQuery, max_results: 12 }
      });
      setVideos(response.data.videos);
    } catch (error) {
      console.error('Error searching YouTube:', error);
      alert('Error searching videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="youtube-search-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">📺 Cooking Video Library</h2>
          <p className="section-subtitle">
            Search for cooking tutorials, techniques, and recipe videos from YouTube
          </p>
        </div>

        <form onSubmit={handleSearch} className="youtube-search-form glass-effect">
          <div className="search-input-group">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for cooking videos... (e.g., pasta recipes, baking tips)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="youtube-search-input"
            />
            <button 
              type="submit" 
              disabled={loading || !searchQuery.trim()}
              className="youtube-search-btn"
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Search Videos
                </>
              )}
            </button>
          </div>
        </form>

        {videos.length > 0 && (
          <div className="youtube-results">
            <h3>Search Results ({videos.length} videos)</h3>
            <div className="youtube-videos-grid">
              {videos.map((video) => (
                <div key={video.video_id} className="youtube-video-card glass-effect">
                  <div className="video-thumbnail">
                    <img src={video.thumbnail} alt={video.title} />
                    <div className="play-overlay">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="video-info">
                    <h4 className="video-title">{video.title}</h4>
                    <p className="video-channel">{video.channel_title}</p>
                    <a 
                      href={`https://www.youtube.com/watch?v=${video.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="watch-btn"
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Main App component
const App = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [recipeToShare, setRecipeToShare] = useState(null);

  // Fetch recipes
  const fetchRecipes = async (search = '') => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/recipes`, {
        params: search ? { search } : {}
      });
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search YouTube videos
  const searchYouTube = async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/youtube/search`, {
        params: { q: query, max_results: 6 }
      });
      setYoutubeVideos(response.data.videos);
    } catch (error) {
      console.error('Error searching YouTube:', error);
    }
  };

  // Handle recipe view
  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setYoutubeVideos(recipe.youtube_videos || []);
    setShowModal(true);
  };

  // Handle recipe share
  const handleShareRecipe = (recipe) => {
    setRecipeToShare(recipe);
    setShowShareModal(true);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes(searchQuery);
  };

  // Initial load
  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <div className="App">
      <CustomCursor />
      
      {/* Navigation */}
      <nav className="navbar glass-effect">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>RecipeCore</h1>
            <span className="brand-tagline">Share • Discover • Cook</span>
          </div>
          
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-container">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search recipes, ingredients, or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Smart Suggestions Section */}
      <SmartSuggestions onSuggestionSelect={handleViewRecipe} />

      {/* Featured Recipes Section */}
      <section className="recipes-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Recipes'}
            </h2>
            <p className="section-subtitle">
              Discover amazing recipes from our community of passionate cooks
            </p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading delicious recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3>No recipes found</h3>
              <p>Try adjusting your search or check back later for new recipes!</p>
            </div>
          ) : (
            <div className="recipes-grid">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onView={handleViewRecipe}
                  onShare={handleShareRecipe}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recipe Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        youtubeVideos={youtubeVideos}
        onSearchYoutube={searchYouTube}
        onShare={handleShareRecipe}
      />

      {/* Share Modal */}
      <ShareRecipe
        recipe={recipeToShare}
        isVisible={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>RecipeCore</h3>
              <p>Bringing food lovers together through shared recipes and cooking experiences.</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Discover</h4>
                <a href="#recipes">Browse Recipes</a>
                <a href="#cuisines">Cuisines</a>
                <a href="#trending">Trending</a>
              </div>
              <div className="link-group">
                <h4>Community</h4>
                <a href="#share">Share Recipe</a>
                <a href="#videos">Video Tutorials</a>
                <a href="#tips">Cooking Tips</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 RecipeCore. Made with ❤️ for food lovers everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;