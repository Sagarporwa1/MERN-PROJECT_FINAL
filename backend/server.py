import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional
import requests
import re

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="RecipeCore API", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "recipecore")
YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
recipes_collection = db.recipes

# Pydantic models
class YouTubeVideo(BaseModel):
    video_id: str
    title: str
    thumbnail: str
    channel_title: str
    duration: Optional[str] = None

class Recipe(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    prep_time: int  # in minutes
    cook_time: int  # in minutes
    servings: int
    difficulty: str  # Easy, Medium, Hard
    cuisine: Optional[str] = None
    youtube_videos: List[YouTubeVideo] = []
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RecipeCreate(BaseModel):
    title: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    prep_time: int
    cook_time: int
    servings: int
    difficulty: str
    cuisine: Optional[str] = None
    youtube_videos: List[YouTubeVideo] = []
    image_url: Optional[str] = None

class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[List[str]] = None
    instructions: Optional[List[str]] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    servings: Optional[int] = None
    difficulty: Optional[str] = None
    cuisine: Optional[str] = None
    youtube_videos: Optional[List[YouTubeVideo]] = None
    image_url: Optional[str] = None

class IngredientSuggestionRequest(BaseModel):
    available_ingredients: List[str]
    max_results: Optional[int] = 5

class RecipeSuggestion(BaseModel):
    recipe: Recipe
    match_score: float
    matching_ingredients: List[str]
    missing_ingredients: List[str]

# YouTube API helper functions
def search_youtube_videos(query: str, max_results: int = 10):
    """Search YouTube videos using the YouTube Data API"""
    if not YOUTUBE_API_KEY:
        raise HTTPException(status_code=500, detail="YouTube API key not configured")
    
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        videos = []
        for item in data.get("items", []):
            video = YouTubeVideo(
                video_id=item["id"]["videoId"],
                title=item["snippet"]["title"],
                thumbnail=item["snippet"]["thumbnails"]["medium"]["url"],
                channel_title=item["snippet"]["channelTitle"]
            )
            videos.append(video)
        
        return videos
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"YouTube API error: {str(e)}")

def get_video_details(video_id: str):
    """Get detailed information about a specific YouTube video"""
    if not YOUTUBE_API_KEY:
        raise HTTPException(status_code=500, detail="YouTube API key not configured")
    
    url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "snippet,contentDetails",
        "id": video_id,
        "key": YOUTUBE_API_KEY
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("items"):
            raise HTTPException(status_code=404, detail="Video not found")
        
        item = data["items"][0]
        video = YouTubeVideo(
            video_id=video_id,
            title=item["snippet"]["title"],
            thumbnail=item["snippet"]["thumbnails"]["medium"]["url"],
            channel_title=item["snippet"]["channelTitle"],
            duration=item["contentDetails"]["duration"]
        )
        
        return video
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"YouTube API error: {str(e)}")

# Smart recipe suggestion helper functions
def normalize_ingredient(ingredient: str) -> str:
    """Normalize ingredient name for better matching"""
    # Remove measurements, parentheses, and common modifiers
    ingredient = re.sub(r'\d+(?:\.\d+)?\s*(?:cups?|tbsp|tsp|oz|lbs?|g|kg|ml|l|cloves?|pieces?|slices?)', '', ingredient, flags=re.IGNORECASE)
    ingredient = re.sub(r'\([^)]*\)', '', ingredient)  # Remove parentheses
    ingredient = re.sub(r'\b(?:fresh|dried|chopped|minced|diced|sliced|grated|to taste|optional)\b', '', ingredient, flags=re.IGNORECASE)
    ingredient = re.sub(r'[,.]', '', ingredient)  # Remove commas and periods
    ingredient = ingredient.strip().lower()
    return ingredient

def calculate_recipe_match(recipe_ingredients: List[str], available_ingredients: List[str]) -> tuple:
    """Calculate how well a recipe matches available ingredients"""
    normalized_recipe_ingredients = [normalize_ingredient(ing) for ing in recipe_ingredients]
    normalized_available = [normalize_ingredient(ing) for ing in available_ingredients]
    
    matching_ingredients = []
    missing_ingredients = []
    
    for recipe_ing, original_recipe_ing in zip(normalized_recipe_ingredients, recipe_ingredients):
        found_match = False
        for available_ing in normalized_available:
            # Check if available ingredient contains recipe ingredient or vice versa
            if (recipe_ing in available_ing) or (available_ing in recipe_ing) or (recipe_ing == available_ing):
                matching_ingredients.append(original_recipe_ing)
                found_match = True
                break
        
        if not found_match:
            missing_ingredients.append(original_recipe_ing)
    
    # Calculate match score (percentage of ingredients available)
    if len(normalized_recipe_ingredients) == 0:
        match_score = 0.0
    else:
        match_score = len(matching_ingredients) / len(normalized_recipe_ingredients)
    
    return match_score, matching_ingredients, missing_ingredients

# API Routes

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "RecipeCore API is running"}

# YouTube endpoints
@app.get("/api/youtube/search")
async def search_youtube(q: str, max_results: int = 10):
    """Search YouTube videos for cooking content"""
    videos = search_youtube_videos(q, max_results)
    return {"videos": videos}

@app.get("/api/youtube/video/{video_id}")
async def get_youtube_video(video_id: str):
    """Get details for a specific YouTube video"""
    video = get_video_details(video_id)
    return {"video": video}

# Recipe CRUD endpoints
@app.post("/api/recipes", response_model=Recipe)
async def create_recipe(recipe: RecipeCreate):
    """Create a new recipe"""
    recipe_data = Recipe(**recipe.dict()).dict()
    result = await recipes_collection.insert_one(recipe_data)
    
    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Failed to create recipe")
    
    created_recipe = await recipes_collection.find_one({"id": recipe_data["id"]})
    return Recipe(**created_recipe)

@app.get("/api/recipes")
async def get_recipes(skip: int = 0, limit: int = 20, search: Optional[str] = None):
    """Get all recipes with optional search"""
    filter_query = {}
    
    if search:
        filter_query = {
            "$or": [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"cuisine": {"$regex": search, "$options": "i"}},
                {"ingredients": {"$elemMatch": {"$regex": search, "$options": "i"}}}
            ]
        }
    
    cursor = recipes_collection.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
    recipes = await cursor.to_list(length=limit)
    
    return {"recipes": [Recipe(**recipe) for recipe in recipes]}

# Featured/trending recipes (must come before parameterized routes)
@app.get("/api/recipes/featured")
async def get_featured_recipes():
    """Get featured recipes (most recent for now)"""
    cursor = recipes_collection.find({}).sort("created_at", -1).limit(6)
    recipes = await cursor.to_list(length=6)
    
    return {"recipes": [Recipe(**recipe) for recipe in recipes]}

# Smart recipe suggestions endpoint (must come before parameterized routes)
@app.post("/api/recipes/suggestions")
async def get_recipe_suggestions(request: IngredientSuggestionRequest):
    """Get recipe suggestions based on available ingredients"""
    if not request.available_ingredients:
        raise HTTPException(status_code=400, detail="Please provide at least one ingredient")
    
    # Get all recipes from database
    cursor = recipes_collection.find({})
    all_recipes = await cursor.to_list(length=None)
    
    suggestions = []
    
    for recipe_data in all_recipes:
        recipe = Recipe(**recipe_data)
        match_score, matching_ingredients, missing_ingredients = calculate_recipe_match(
            recipe.ingredients, request.available_ingredients
        )
        
        # Only include recipes with at least 20% ingredient match
        if match_score >= 0.2:
            suggestion = RecipeSuggestion(
                recipe=recipe,
                match_score=match_score,
                matching_ingredients=matching_ingredients,
                missing_ingredients=missing_ingredients
            )
            suggestions.append(suggestion)
    
    # Sort by match score (highest first)
    suggestions.sort(key=lambda x: x.match_score, reverse=True)
    
    # Limit results
    suggestions = suggestions[:request.max_results]
    
    return {"suggestions": suggestions}

@app.get("/api/recipes/{recipe_id}", response_model=Recipe)
async def get_recipe(recipe_id: str):
    """Get a specific recipe by ID"""
    recipe = await recipes_collection.find_one({"id": recipe_id})
    
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    return Recipe(**recipe)

@app.put("/api/recipes/{recipe_id}", response_model=Recipe)
async def update_recipe(recipe_id: str, recipe_update: RecipeUpdate):
    """Update a recipe"""
    update_data = {k: v for k, v in recipe_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await recipes_collection.update_one(
        {"id": recipe_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    updated_recipe = await recipes_collection.find_one({"id": recipe_id})
    return Recipe(**updated_recipe)

@app.delete("/api/recipes/{recipe_id}")
async def delete_recipe(recipe_id: str):
    """Delete a recipe"""
    result = await recipes_collection.delete_one({"id": recipe_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    return {"message": "Recipe deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)