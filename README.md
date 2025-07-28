# 🍳 RecipeCore - Recipe Sharing Platform

A modern, full-stack recipe sharing platform built with React, FastAPI, and MongoDB. Features real YouTube API integration, Material Design light theme, enhanced custom cursor experience, AI-powered smart suggestions, and social sharing capabilities.



## 🌟 Features

### 🎨 **Beautiful UI & UX**
- **Material Design Light Theme** with stunning gradient backgrounds
- **Glassmorphism Effects** with translucent cards and backdrop blur
- **Custom Animated Cursor** with white glow and green click animations
- **Responsive Design** that works perfectly on all devices
- **Smooth Animations** and transitions throughout the app

### 🍳 **Recipe Management**
- **Full CRUD Operations** - Create, Read, Update, Delete recipes
- **Advanced Search** across recipes, ingredients, cuisines, and descriptions
- **Recipe Cards** with beautiful imagery and metadata display
- **Detailed Recipe Views** with ingredients, instructions, prep time, difficulty
- **Recipe Categories** with cuisine types and difficulty levels

### 🧠 **Smart Recipe Suggestions (AI-Powered)**
- **Ingredient-Based Matching** - Input ingredients you have, get perfect recipe suggestions
- **Match Score Display** - Shows percentage of ingredients you already own
- **Visual Breakdown** - Green tags for ingredients you have, red for missing ones
- **Intelligent Normalization** - Handles variations in ingredient names and measurements
- **Ranked Results** - Recipes sorted by compatibility score

### 📺 **YouTube Integration**
- **Real YouTube API Integration** for cooking video search
- **Video Thumbnails & Details** with channel information
- **Integrated Search** within recipe modals
- **Direct YouTube Links** to watch cooking tutorials
- **Recipe-Video Association** for enhanced learning experience

### 📱 **Social Sharing**
- **Multiple Share Options** - Facebook, Twitter, WhatsApp, Email, Copy Link
- **Native Share API** - Uses device's built-in sharing when available
- **Beautiful Share Modal** with recipe preview
- **Rich Link Previews** when shared on social platforms
- **One-Click Sharing** from recipe cards and detailed views

### ⚡ **Performance & Technical**
- **Real-time Updates** with hot reload for development
- **MongoDB Integration** with UUID-based records
- **RESTful API** with comprehensive endpoints
- **Error Handling** and validation throughout
- **Production-Ready** deployment configuration

## 🚀 Getting Started

### Prerequisites

Before running RecipeCore, make sure you have the following installed on your system:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Check version: `node --version`

2. **Python** (version 3.8 or higher)
   - Download from: https://python.org/
   - Check version: `python --version` or `python3 --version`

3. **MongoDB** (Community Edition)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud version)

4. **Yarn Package Manager**
   - Install: `npm install -g yarn`
   - Check version: `yarn --version`

5. **YouTube API Key**
   - Go to: https://console.developers.google.com/
   - Create a new project or select existing one
   - Enable YouTube Data API v3
   - Create credentials (API Key)
   - Copy your API key for later use

### 📥 Installation Steps

#### Step 1: Clone or Download the Project
```bash
# If you have git installed:
git clone <repository-url>
cd RecipeCore

# Or download and extract the project files to a folder
```

#### Step 2: Set Up Backend Environment
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

#### Step 3: Configure Backend Environment Variables
```bash
# Create .env file in backend directory
# Copy the following content and replace with your values:

MONGO_URL="mongodb://localhost:27017"
DB_NAME="recipecore"
YOUTUBE_API_KEY="your_youtube_api_key_here"
```

**Note:** Replace `your_youtube_api_key_here` with your actual YouTube API key.

#### Step 4: Set Up Frontend
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies using Yarn
npm install
```

#### Step 5: Configure Frontend Environment Variables
```bash
# Create .env file in frontend directory
# Copy the following content:

REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
```

### 🏃‍♂️ Running the Application

#### Method 1: Manual Start (Recommended for Development)

**Terminal 1 - Start MongoDB:**
```bash
# Start MongoDB service
# On Windows (if installed as service):
net start MongoDB

# On macOS (with Homebrew):
brew services start mongodb-community

# On Linux (with systemd):
sudo systemctl start mongod

# Or start manually:
mongod --dbpath /path/to/your/db/directory
```

**Terminal 2 - Start Backend:**
```bash
cd backend

# Activate virtual environment if not already active
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Start FastAPI server
python server.py

# You should see:
# INFO: Started server process
# INFO: Uvicorn running on http://0.0.0.0:8001
```

**Terminal 3 - Start Frontend:**
```bash
cd frontend

# Start React development server
npm start

# Your browser should automatically open to:
# http://localhost:3000
```

#### Method 2: Using Supervisor (Production-like)

If you're running in a containerized environment with supervisor:

```bash
# Restart all services
sudo supervisorctl restart all

# Check status
sudo supervisorctl status

# View logs
sudo supervisorctl tail -f backend
sudo supervisorctl tail -f frontend
```

### 📱 Accessing the Application

1. **Frontend (Main App):** http://localhost:3000
2. **Backend API:** http://localhost:8001
3. **API Documentation:** http://localhost:8001/docs (Swagger UI)

## 🎯 How to Use RecipeCore

### 1. **Browse Recipes**
- Visit the homepage to see featured recipes
- Scroll through beautiful recipe cards with images and metadata
- Click on any recipe card to view full details

### 2. **Search for Recipes**
- Use the search bar in the navigation
- Search by recipe name, ingredients, cuisine, or description
- Results update instantly

### 3. **Get Smart Suggestions**
- Scroll to the "Smart Recipe Suggestions" section
- Enter ingredients you have (e.g., "chicken, tomatoes, garlic, olive oil")
- Click "Get Suggestions" to see recipes ranked by ingredient match
- View what ingredients you have vs. what you need to buy

### 4. **Watch Cooking Videos**
- Click on any recipe to open detailed view
- Scroll to "Related Videos" section
- Search for cooking tutorials using the YouTube search
- Click on video thumbnails to watch on YouTube

### 5. **Share Recipes**
- Click the "Share" button on any recipe card or in recipe details
- Choose from multiple sharing options:
  - Facebook, Twitter, WhatsApp
  - Email, Copy Link, or Native Share
- Share recipes with friends and family instantly

### 6. **Create New Recipes** (via API)
- Use the REST API to add new recipes
- Send POST requests to `/api/recipes`
- Include all recipe details: title, ingredients, instructions, etc.

## 🛠 API Documentation

### Base URL
```
http://localhost:8001/api
```

### Main Endpoints

#### Recipes
- `GET /recipes` - Get all recipes (with optional search)
- `GET /recipes/{recipe_id}` - Get specific recipe
- `POST /recipes` - Create new recipe
- `PUT /recipes/{recipe_id}` - Update recipe
- `DELETE /recipes/{recipe_id}` - Delete recipe
- `GET /recipes/featured` - Get featured recipes
- `POST /recipes/suggestions` - Get smart recipe suggestions

#### YouTube Integration
- `GET /youtube/search?q={query}` - Search YouTube videos
- `GET /youtube/video/{video_id}` - Get video details

#### System
- `GET /health` - Health check

### Example API Usage

**Create a Recipe:**
```bash
curl -X POST "http://localhost:8001/api/recipes" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Amazing Pasta",
    "description": "A delicious pasta recipe",
    "ingredients": ["500g pasta", "2 tomatoes", "1 onion"],
    "instructions": ["Boil pasta", "Cook sauce", "Combine"],
    "prep_time": 15,
    "cook_time": 20,
    "servings": 4,
    "difficulty": "Easy",
    "cuisine": "Italian"
  }'
```

**Get Smart Suggestions:**
```bash
curl -X POST "http://localhost:8001/api/recipes/suggestions" \
  -H "Content-Type: application/json" \
  -d '{
    "available_ingredients": ["pasta", "tomatoes", "garlic"],
    "max_results": 5
  }'
```

## 📁 Project Structure

```
RecipeCore/
├── backend/                 # FastAPI backend
│   ├── server.py           # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling with glassmorphism
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   ├── package.json       # Node.js dependencies
│   └── .env              # Frontend environment variables
├── tests/                 # Test files
├── scripts/               # Utility scripts
└── README.md             # This file
```

## 🔧 Technologies Used

### Frontend
- **React 19** - Modern JavaScript framework
- **Axios** - HTTP client for API calls
- **CSS3** - Advanced styling with glassmorphism effects
- **Material Design** - Design system principles
- **Responsive Design** - Mobile-first approach

### Backend
- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation and serialization
- **Python Requests** - HTTP library for YouTube API
- **UUID** - Unique identifier generation

### Database
- **MongoDB** - NoSQL document database
- **Motor** - Async MongoDB driver for Python

### External APIs
- **YouTube Data API v3** - Video search and details
- **Web Share API** - Native device sharing

## 🚨 Troubleshooting

### Common Issues

**1. "Port already in use" error:**
```bash
# Kill processes on specific ports
# Kill backend (port 8001):
lsof -ti:8001 | xargs kill -9

# Kill frontend (port 3000):
lsof -ti:3000 | xargs kill -9
```

**2. MongoDB connection error:**
```bash
# Make sure MongoDB is running
# Check if MongoDB service is active:
sudo systemctl status mongod

# Or start it:
sudo systemctl start mongod
```

**3. YouTube API not working:**
- Verify your API key is correct in `backend/.env`
- Check if YouTube Data API v3 is enabled in Google Cloud Console
- Ensure you have sufficient API quota

**4. Package installation issues:**
```bash
# Clear npm/yarn cache
yarn cache clean
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
yarn install
```

**5. Python virtual environment issues:**
```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Performance Tips

1. **For Development:**
   - Use `yarn start` for hot reload
   - Enable browser dev tools for debugging
   - Check browser console for errors

2. **For Production:**
   - Build optimized frontend: `yarn build`
   - Use production MongoDB instance
   - Set appropriate environment variables

## 🎨 Customization

### Adding New Recipes
You can add sample recipes using the API or directly through the database. Here's a script to add sample data:

```bash
# Sample recipe creation
curl -X POST "http://localhost:8001/api/recipes" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Classic Margherita Pizza",
    "description": "Traditional Italian pizza with fresh mozzarella, tomatoes, and basil",
    "ingredients": [
      "Pizza dough",
      "200g mozzarella cheese",
      "3 large tomatoes",
      "Fresh basil leaves",
      "Olive oil",
      "Salt and pepper"
    ],
    "instructions": [
      "Preheat oven to 250°C",
      "Roll out pizza dough",
      "Spread tomato sauce",
      "Add mozzarella and tomatoes",
      "Bake for 10-12 minutes",
      "Add fresh basil before serving"
    ],
    "prep_time": 20,
    "cook_time": 12,
    "servings": 2,
    "difficulty": "Medium",
    "cuisine": "Italian"
  }'
```

### Customizing Styles
- Edit `frontend/src/App.css` for styling changes
- Modify color schemes by updating CSS variables
- Add new glassmorphism effects by adjusting backdrop-filter values

### Adding New Features
- Backend: Add new endpoints in `backend/server.py`
- Frontend: Create new components in `frontend/src/`
- Database: Add new collections or fields as needed

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Ensure environment variables are set properly
4. Check application logs for error messages

## 🎉 Enjoy Cooking!

RecipeCore is designed to make recipe sharing and discovery a delightful experience. Whether you're a home cook looking for inspiration or a food enthusiast wanting to share your creations, RecipeCore has everything you need!

Happy cooking! 👨‍🍳👩‍🍳
