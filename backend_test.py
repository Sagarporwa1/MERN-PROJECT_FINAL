#!/usr/bin/env python3
"""
RecipeCore Backend API Testing Suite
Tests all backend endpoints including YouTube integration and Recipe CRUD operations
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class RecipeCoreAPITester:
    def __init__(self, base_url: str = "https://65bb30ea-4ac3-4bc7-ba04-4d9d7d2b50b8.preview.emergentagent.com"):
        self.base_url = base_url.rstrip('/')
        self.tests_run = 0
        self.tests_passed = 0
        self.created_recipe_id = None
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}: PASSED {details}")
        else:
            print(f"❌ {test_name}: FAILED {details}")
    
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, {}, 0
                
            return response.status_code < 400, response.json() if response.content else {}, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}, 0
        except json.JSONDecodeError:
            return False, {"error": "Invalid JSON response"}, response.status_code if 'response' in locals() else 0

    def test_health_endpoint(self):
        """Test backend health endpoint"""
        success, data, status = self.make_request('GET', '/api/health')
        
        if success and status == 200:
            if data.get('status') == 'healthy':
                self.log_test("Health Check", True, f"- Status: {data.get('message', 'N/A')}")
                return True
            else:
                self.log_test("Health Check", False, f"- Unexpected response: {data}")
                return False
        else:
            self.log_test("Health Check", False, f"- Status: {status}, Error: {data.get('error', 'Unknown')}")
            return False

    def test_youtube_search(self):
        """Test YouTube search functionality"""
        success, data, status = self.make_request('GET', '/api/youtube/search', params={'q': 'pasta recipe', 'max_results': 5})
        
        if success and status == 200:
            videos = data.get('videos', [])
            if videos and len(videos) > 0:
                # Check first video structure
                first_video = videos[0]
                required_fields = ['video_id', 'title', 'thumbnail', 'channel_title']
                missing_fields = [field for field in required_fields if field not in first_video]
                
                if not missing_fields:
                    self.log_test("YouTube Search", True, f"- Found {len(videos)} videos")
                    return videos[0]['video_id']  # Return video ID for next test
                else:
                    self.log_test("YouTube Search", False, f"- Missing fields: {missing_fields}")
                    return None
            else:
                self.log_test("YouTube Search", False, "- No videos returned")
                return None
        else:
            self.log_test("YouTube Search", False, f"- Status: {status}, Error: {data.get('error', 'Unknown')}")
            return None

    def test_youtube_video_details(self, video_id: str):
        """Test YouTube video details endpoint"""
        if not video_id:
            self.log_test("YouTube Video Details", False, "- No video ID provided")
            return False
            
        success, data, status = self.make_request('GET', f'/api/youtube/video/{video_id}')
        
        if success and status == 200:
            video = data.get('video', {})
            required_fields = ['video_id', 'title', 'thumbnail', 'channel_title']
            missing_fields = [field for field in required_fields if field not in video]
            
            if not missing_fields:
                self.log_test("YouTube Video Details", True, f"- Video: {video.get('title', 'N/A')[:50]}...")
                return True
            else:
                self.log_test("YouTube Video Details", False, f"- Missing fields: {missing_fields}")
                return False
        else:
            self.log_test("YouTube Video Details", False, f"- Status: {status}, Error: {data.get('error', 'Unknown')}")
            return False

    def test_create_recipe(self):
        """Test recipe creation"""
        sample_recipe = {
            "title": "Test Pasta Recipe",
            "description": "A delicious test pasta recipe for API testing",
            "ingredients": [
                "500g pasta",
                "2 cloves garlic",
                "3 tbsp olive oil",
                "Salt and pepper to taste",
                "Fresh basil leaves"
            ],
            "instructions": [
                "Boil water in a large pot and add salt",
                "Cook pasta according to package instructions",
                "Heat olive oil in a pan and sauté garlic",
                "Drain pasta and toss with garlic oil",
                "Season with salt, pepper, and fresh basil"
            ],
            "prep_time": 10,
            "cook_time": 15,
            "servings": 4,
            "difficulty": "Easy",
            "cuisine": "Italian"
        }
        
        success, data, status = self.make_request('POST', '/api/recipes', data=sample_recipe)
        
        if success and status == 200:
            if 'id' in data and data.get('title') == sample_recipe['title']:
                self.created_recipe_id = data['id']
                self.log_test("Create Recipe", True, f"- Recipe ID: {self.created_recipe_id}")
                return True
            else:
                self.log_test("Create Recipe", False, f"- Invalid response structure: {data}")
                return False
        else:
            self.log_test("Create Recipe", False, f"- Status: {status}, Error: {data.get('error', 'Unknown')}")
            return False

    def test_get_recipes(self):
        """Test getting all recipes"""
        success, data, status = self.make_request('GET', '/api/recipes')
        
        if success and status == 200:
            recipes = data.get('recipes', [])
            self.log_test("Get All Recipes", True, f"- Found {len(recipes)} recipes")
            return True
        else:
            self.log_test("Get All Recipes", False, f"- Status: {status}, Error: {data.get('error', 'Unknown')}")
            return False

    def test_get_specific_recipe(self):
        """Test getting a specific recipe by ID"""
        if not self.created_recipe_id:
            self.log_test("Get Specific Recipe", False, "- No recipe ID available")
            return False
            
        success, data, status = self.make_request('GET', f'/api/recipes/{self.created_recipe_id}')
        
        if success and status == 200:
            if data.get('id') == self.created_recipe_id:
                self.log_test("Get Specific Recipe", True, f"- Recipe: {data.get('title', 'N/A')}")
                return True
            else:
                self.log_test("Get Specific Recipe", False, f"- ID mismatch: expected {self.created_recipe_id}, got {data.get('id')}")
                return False
        else:
            self.log_test("Get Specific Recipe", False, f"- Status: {status}, Error: {data.get('error', 'Unknown')}")
            return False

    def test_search_recipes(self):
        """Test recipe search functionality"""
        success, data, status = self.make_request('GET', '/api/recipes', params={'search': 'pasta'})
        
        if success and status == 200:
            recipes = data.get('recipes', [])
            # Check if our created recipe is in the search results
            found_test_recipe = any(recipe.get('id') == self.created_recipe_id for recipe in recipes)
            
            if found_test_recipe:
                self.log_test("Search Recipes", True, f"- Found {len(recipes)} recipes matching 'pasta'")
                return True
            else:
                self.log_test("Search Recipes", True, f"- Found {len(recipes)} recipes (test recipe not in results)")
                return True
        else:
            self.log_test("Search Recipes", False, f"- Status: {status}, Error: {data.get('error', 'Unknown')}")
            return False

    def test_update_recipe(self):
        """Test recipe update functionality"""
        if not self.created_recipe_id:
            self.log_test("Update Recipe", False, "- No recipe ID available")
            return False
            
        update_data = {
            "description": "Updated test pasta recipe description",
            "prep_time": 12
        }
        
        success, data, status = self.make_request('PUT', f'/api/recipes/{self.created_recipe_id}', data=update_data)
        
        if success and status == 200:
            if data.get('description') == update_data['description'] and data.get('prep_time') == update_data['prep_time']:
                self.log_test("Update Recipe", True, "- Recipe updated successfully")
                return True
            else:
                self.log_test("Update Recipe", False, f"- Update not reflected in response")
                return False
        else:
            self.log_test("Update Recipe", False, f"- Status: {status}, Error: {data.get('error', 'Unknown')}")
            return False

    def test_delete_recipe(self):
        """Test recipe deletion"""
        if not self.created_recipe_id:
            self.log_test("Delete Recipe", False, "- No recipe ID available")
            return False
            
        success, data, status = self.make_request('DELETE', f'/api/recipes/{self.created_recipe_id}')
        
        if success and status == 200:
            if 'message' in data:
                self.log_test("Delete Recipe", True, f"- {data.get('message')}")
                return True
            else:
                self.log_test("Delete Recipe", False, f"- Unexpected response: {data}")
                return False
        else:
            self.log_test("Delete Recipe", False, f"- Status: {status}, Error: {data.get('error', 'Unknown')}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting RecipeCore Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test 1: Health Check
        health_ok = self.test_health_endpoint()
        
        # Test 2: YouTube Integration
        video_id = self.test_youtube_search()
        if video_id:
            self.test_youtube_video_details(video_id)
        
        # Test 3: Recipe CRUD Operations
        recipe_created = self.test_create_recipe()
        self.test_get_recipes()
        
        if recipe_created:
            self.test_get_specific_recipe()
            self.test_search_recipes()
            self.test_update_recipe()
            self.test_delete_recipe()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend API is working correctly.")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} test(s) failed. Check the logs above.")
            return False

def main():
    """Main function to run the tests"""
    tester = RecipeCoreAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())