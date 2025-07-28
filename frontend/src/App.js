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
            <button className="btn-primary">
              <span>Explore Recipes</span>
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="btn-secondary">
              <span>Watch Tutorials</span>
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1M9 10v3a2 2 0 002 2h2a2 2 0 002-2v-3" />
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
const RecipeCard = ({ recipe, onView }) => {
  const totalTime = recipe.prep_time + recipe.cook_time;
  
  return (
    <div className="recipe-card glass-effect" onClick={() => onView(recipe)}>
      <div className="recipe-image">
        <img 
          src={recipe.image_url || "https://images.unsplash.com/photo-1466637574441-749b8f19452f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxjb29raW5nfGVufDB8fHx8MTc1MzcwNjY0M3ww&ixlib=rb-4.1.0&q=85"} 
          alt={recipe.title} 
        />
        <div className="recipe-overlay">
          <span className="difficulty-badge">{recipe.difficulty}</span>
        </div>
      </div>
      <div className="recipe-content">
        <h3 className="recipe-title">{recipe.title}</h3>
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
      </div>
    </div>
  );
};

// Recipe modal component
const RecipeModal = ({ recipe, isOpen, onClose, youtubeVideos, onSearchYoutube }) => {
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
          <button className="modal-close" onClick={onClose}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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

// Main App component
const App = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [youtubeVideos, setYoutubeVideos] = useState([]);

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