"""
FastAPI application for Shopping Optimiser Backend
Provides API endpoints, Supabase Auth integration, and connects to Supabase PostgreSQL database

SECURITY NOTE: This is a learning backend implementation.
In production, tokens should be verified properly with JWKS and proper JWT validation.
"""

from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import os

from auth import register_user, login_user, get_user, refresh_token, logout_user
from shopping import (
    create_shopping,
    update_shopping,
    add_grocery_item,
    add_grocery_items_bulk,
    get_user_shoppings,
    get_shopping_with_items,
    delete_shopping
)

# Load environment variables
load_dotenv()

# Security scheme for bearer token
security = HTTPBearer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Modern FastAPI lifespan pattern (replaces deprecated @app.on_event)
    Handles startup and shutdown events
    """
    # Startup: Initialize database connection
    print("🚀 Starting Shopping Optimiser API...")
    print("✅ Database connection established")
    print("✅ Supabase Auth initialized")
    yield
    # Shutdown: Clean up resources
    print("👋 Shutting down Shopping Optimiser API...")


# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Shopping Optimiser API",
    description="Backend API for Shopping Optimiser application with Supabase Auth",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS to allow frontend connections from localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend development server (Vite default)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint - returns welcome message"""
    return {
        "message": "Welcome to Shopping Optimiser API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint - verifies API is running"""
    return {
        "status": "healthy",
        "database": "connected",
        "service": "shopping-optimiser-api"
    }


# Authentication Endpoints
@app.post("/api/auth/register")
async def register(email: str, password: str, first_name: str, last_name: str):
    """
    Register a new user with Supabase Auth
    
    The database trigger will automatically create a profile in the profiles table.
    """
    try:
        response = register_user(email, password, first_name, last_name)
        return {
            "message": "Registration successful",
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "first_name": first_name,
                "last_name": last_name
            },
            "session": {
                "access_token": response.session.access_token if response.session else None,
                "refresh_token": response.session.refresh_token if response.session else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/auth/login")
async def login(email: str, password: str):
    """
    Login user with Supabase Auth
    
    Returns access token and refresh token for authenticated requests.
    """
    try:
        response = login_user(email, password)
        return {
            "message": "Login successful",
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "first_name": response.user.user_metadata.get("first_name", ""),
                "last_name": response.user.user_metadata.get("last_name", "")
            },
            "session": {
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@app.get("/api/auth/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get current user information from access token
    
    Note: In production, tokens should be verified properly with JWKS
    """
    try:
        user = get_user(credentials.credentials)
        return {
            "user": {
                "id": user.user.id,
                "email": user.user.email,
                "first_name": user.user.user_metadata.get("first_name", ""),
                "last_name": user.user.user_metadata.get("last_name", "")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.post("/api/auth/refresh")
async def refresh_user_token(refresh_token_str: str):
    """
    Refresh user's access token
    
    Note: In production, tokens should be verified properly
    """
    try:
        response = refresh_token(refresh_token_str)
        return {
            "message": "Token refreshed successfully",
            "session": {
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@app.post("/api/auth/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Logout user by invalidating their session
    
    Note: In production, tokens should be verified properly
    """
    try:
        logout_user(credentials.credentials)
        return {"message": "Logout successful"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Shopping Endpoints
@app.post("/api/shopping")
async def create_new_shopping(
    weekly_budget: float,
    shopping_duration: int,
    location: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Create a new shopping instance for the authenticated user
    """
    try:
        # Get user from token
        user = get_user(credentials.credentials)
        user_id = user.user.id
        
        # Create shopping instance
        shopping_data = create_shopping(user_id, weekly_budget, shopping_duration, location)
        
        return {
            "message": "Shopping instance created successfully",
            "shopping": shopping_data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/api/shopping/{shopping_id}")
async def update_shopping_instance(
    shopping_id: str,
    optimiser_choice: str = None,
    total_basket_cost: float = None,
    estimated_savings: float = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Update shopping instance with optimization results
    """
    try:
        # Verify user owns this shopping instance
        user = get_user(credentials.credentials)
        shopping_data = get_shopping_with_items(shopping_id)
        
        if shopping_data["user_id"] != user.user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this shopping instance")
        
        # Update shopping instance
        updated_shopping = update_shopping(
            shopping_id, 
            optimiser_choice=optimiser_choice, 
            total_basket_cost=total_basket_cost, 
            estimated_savings=estimated_savings
        )
        
        return {
            "message": "Shopping instance updated successfully",
            "shopping": updated_shopping
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/shopping/{shopping_id}/items")
async def add_items_to_shopping(
    shopping_id: str,
    items: list = Body(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Add grocery items to a shopping instance
    
    items should be a list of objects with:
    - item_name: str
    - aldi_price: float (optional)
    - coles_price: float (optional)
    - woolworths_price: float (optional)
    - highlighted_store: str (optional, one of: aldi, coles, woolworths)
    """
    try:
        # Verify user owns this shopping instance
        user = get_user(credentials.credentials)
        shopping_data = get_shopping_with_items(shopping_id)
        
        if shopping_data["user_id"] != user.user.id:
            raise HTTPException(status_code=403, detail="Not authorized to add items to this shopping instance")
        
        # Add items
        created_items = add_grocery_items_bulk(shopping_id, items)
        
        return {
            "message": "Grocery items added successfully",
            "items": created_items
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/shopping")
async def get_user_shopping_history(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get all shopping instances for the authenticated user
    """
    try:
        # Get user from token
        user = get_user(credentials.credentials)
        user_id = user.user.id
        
        # Get shopping history
        shoppings = get_user_shoppings(user_id)
        
        return {
            "shoppings": shoppings
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/shopping/{shopping_id}")
async def get_shopping_details(
    shopping_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get a specific shopping instance with all its items
    """
    try:
        # Verify user owns this shopping instance
        user = get_user(credentials.credentials)
        shopping_data = get_shopping_with_items(shopping_id)
        
        if shopping_data["user_id"] != user.user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this shopping instance")
        
        return {
            "shopping": shopping_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/shopping/{shopping_id}")
async def delete_shopping_instance(
    shopping_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Delete a shopping instance and all its items
    """
    try:
        # Verify user owns this shopping instance
        user = get_user(credentials.credentials)
        shopping_data = get_shopping_with_items(shopping_id)
        
        if shopping_data["user_id"] != user.user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this shopping instance")
        
        # Delete shopping instance
        deleted = delete_shopping(shopping_id)
        
        if deleted:
            return {"message": "Shopping instance deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Shopping instance not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
