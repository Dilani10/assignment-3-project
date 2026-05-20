"""
Shopping database operations module for Shopping Optimiser
Handles CRUD operations for shopping and grocery_items tables
"""

import os
import psycopg2
from dotenv import load_dotenv
from datetime import datetime
import json

# Load environment variables
load_dotenv()

def get_database_url():
    """Get DATABASE_URL from environment variables"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")
    return database_url

def get_db_connection():
    """Get database connection"""
    database_url = get_database_url()
    return psycopg2.connect(database_url)

def create_shopping(user_id, weekly_budget, shopping_duration, location):
    """
    Create a new shopping instance
    
    Args:
        user_id: UUID of the user
        weekly_budget: Weekly budget amount
        shopping_duration: Duration in weeks
        location: Location string
    
    Returns:
        dict: Shopping instance data with id
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = """
            INSERT INTO public.shopping (user_id, weekly_budget, shopping_duration, location)
            VALUES (%s, %s, %s, %s)
            RETURNING id, user_id, weekly_budget, shopping_duration, location, 
                      optimiser_choice, total_basket_cost, estimated_savings, 
                      created_at, updated_at
        """
        
        cur.execute(query, (user_id, weekly_budget, shopping_duration, location))
        result = cur.fetchone()
        
        shopping_data = {
            "id": str(result[0]),
            "user_id": str(result[1]),
            "weekly_budget": float(result[2]) if result[2] else None,
            "shopping_duration": result[3],
            "location": result[4],
            "optimiser_choice": result[5],
            "total_basket_cost": float(result[6]) if result[6] else None,
            "estimated_savings": float(result[7]) if result[7] else None,
            "created_at": result[8].isoformat() if result[8] else None,
            "updated_at": result[9].isoformat() if result[9] else None
        }
        
        conn.commit()
        cur.close()
        conn.close()
        
        return shopping_data
        
    except Exception as e:
        print(f"Error creating shopping: {e}")
        raise

def update_shopping(shopping_id, optimiser_choice=None, total_basket_cost=None, estimated_savings=None):
    """
    Update shopping instance with optimization results
    
    Args:
        shopping_id: UUID of the shopping instance
        optimiser_choice: Optimization type selected
        total_basket_cost: Total basket cost
        estimated_savings: Estimated savings amount
    
    Returns:
        dict: Updated shopping instance data
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Build dynamic update query
        updates = []
        params = []
        
        if optimiser_choice is not None:
            updates.append("optimiser_choice = %s")
            params.append(optimiser_choice)
        
        if total_basket_cost is not None:
            updates.append("total_basket_cost = %s")
            params.append(total_basket_cost)
        
        if estimated_savings is not None:
            updates.append("estimated_savings = %s")
            params.append(estimated_savings)
        
        if not updates:
            raise ValueError("No fields to update")
        
        params.append(shopping_id)
        
        query = f"""
            UPDATE public.shopping
            SET {', '.join(updates)}
            WHERE id = %s
            RETURNING id, user_id, weekly_budget, shopping_duration, location, 
                      optimiser_choice, total_basket_cost, estimated_savings, 
                      created_at, updated_at
        """
        
        cur.execute(query, params)
        result = cur.fetchone()
        
        if not result:
            raise ValueError("Shopping instance not found")
        
        shopping_data = {
            "id": str(result[0]),
            "user_id": str(result[1]),
            "weekly_budget": float(result[2]) if result[2] else None,
            "shopping_duration": result[3],
            "location": result[4],
            "optimiser_choice": result[5],
            "total_basket_cost": float(result[6]) if result[6] else None,
            "estimated_savings": float(result[7]) if result[7] else None,
            "created_at": result[8].isoformat() if result[8] else None,
            "updated_at": result[9].isoformat() if result[9] else None
        }
        
        conn.commit()
        cur.close()
        conn.close()
        
        return shopping_data
        
    except Exception as e:
        print(f"Error updating shopping: {e}")
        raise

def add_grocery_item(shopping_id, item_name, aldi_price=None, coles_price=None, woolworths_price=None, highlighted_store=None):
    """
    Add a grocery item to a shopping instance
    
    Args:
        shopping_id: UUID of the shopping instance
        item_name: Name of the grocery item
        aldi_price: Price at Aldi
        coles_price: Price at Coles
        woolworths_price: Price at Woolworths
        highlighted_store: Which store is highlighted (aldi, coles, woolworths)
    
    Returns:
        dict: Grocery item data
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = """
            INSERT INTO public.grocery_items 
            (grocery_instance_id, item_name, aldi_price, coles_price, woolworths_price, highlighted_store)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, grocery_instance_id, item_name, aldi_price, coles_price, 
                      woolworths_price, highlighted_store, created_at
        """
        
        cur.execute(query, (shopping_id, item_name, aldi_price, coles_price, woolworths_price, highlighted_store))
        result = cur.fetchone()
        
        item_data = {
            "id": str(result[0]),
            "grocery_instance_id": str(result[1]),
            "item_name": result[2],
            "aldi_price": float(result[3]) if result[3] else None,
            "coles_price": float(result[4]) if result[4] else None,
            "woolworths_price": float(result[5]) if result[5] else None,
            "highlighted_store": result[6],
            "created_at": result[7].isoformat() if result[7] else None
        }
        
        conn.commit()
        cur.close()
        conn.close()
        
        return item_data
        
    except Exception as e:
        print(f"Error adding grocery item: {e}")
        raise

def add_grocery_items_bulk(shopping_id, items):
    """
    Add multiple grocery items to a shopping instance
    
    Args:
        shopping_id: UUID of the shopping instance
        items: List of item dicts with item_name, aldi_price, coles_price, woolworths_price, highlighted_store
    
    Returns:
        list: List of created grocery items
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        created_items = []
        
        for item in items:
            query = """
                INSERT INTO public.grocery_items 
                (grocery_instance_id, item_name, aldi_price, coles_price, woolworths_price, highlighted_store)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, grocery_instance_id, item_name, aldi_price, coles_price, 
                          woolworths_price, highlighted_store, created_at
            """
            
            cur.execute(query, (
                shopping_id, 
                item.get('item_name'),
                item.get('aldi_price'),
                item.get('coles_price'),
                item.get('woolworths_price'),
                item.get('highlighted_store')
            ))
            result = cur.fetchone()
            
            item_data = {
                "id": str(result[0]),
                "grocery_instance_id": str(result[1]),
                "item_name": result[2],
                "aldi_price": float(result[3]) if result[3] else None,
                "coles_price": float(result[4]) if result[4] else None,
                "woolworths_price": float(result[5]) if result[5] else None,
                "highlighted_store": result[6],
                "created_at": result[7].isoformat() if result[7] else None
            }
            created_items.append(item_data)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return created_items
        
    except Exception as e:
        print(f"Error adding grocery items bulk: {e}")
        raise

def get_user_shoppings(user_id):
    """
    Get all shopping instances for a user
    
    Args:
        user_id: UUID of the user
    
    Returns:
        list: List of shopping instances
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = """
            SELECT id, user_id, weekly_budget, shopping_duration, location, 
                   optimiser_choice, total_basket_cost, estimated_savings, 
                   created_at, updated_at
            FROM public.shopping
            WHERE user_id = %s
            ORDER BY created_at DESC
        """
        
        cur.execute(query, (user_id,))
        results = cur.fetchall()
        
        shoppings = []
        for result in results:
            shopping_data = {
                "id": str(result[0]),
                "user_id": str(result[1]),
                "weekly_budget": float(result[2]) if result[2] else None,
                "shopping_duration": result[3],
                "location": result[4],
                "optimiser_choice": result[5],
                "total_basket_cost": float(result[6]) if result[6] else None,
                "estimated_savings": float(result[7]) if result[7] else None,
                "created_at": result[8].isoformat() if result[8] else None,
                "updated_at": result[9].isoformat() if result[9] else None
            }
            shoppings.append(shopping_data)
        
        cur.close()
        conn.close()
        
        return shoppings
        
    except Exception as e:
        print(f"Error getting user shoppings: {e}")
        raise

def get_shopping_with_items(shopping_id):
    """
    Get a shopping instance with all its grocery items
    
    Args:
        shopping_id: UUID of the shopping instance
    
    Returns:
        dict: Shopping instance with items
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get shopping instance
        shopping_query = """
            SELECT id, user_id, weekly_budget, shopping_duration, location, 
                   optimiser_choice, total_basket_cost, estimated_savings, 
                   created_at, updated_at
            FROM public.shopping
            WHERE id = %s
        """
        
        cur.execute(shopping_query, (shopping_id,))
        shopping_result = cur.fetchone()
        
        if not shopping_result:
            raise ValueError("Shopping instance not found")
        
        shopping_data = {
            "id": str(shopping_result[0]),
            "user_id": str(shopping_result[1]),
            "weekly_budget": float(shopping_result[2]) if shopping_result[2] else None,
            "shopping_duration": shopping_result[3],
            "location": shopping_result[4],
            "optimiser_choice": shopping_result[5],
            "total_basket_cost": float(shopping_result[6]) if shopping_result[6] else None,
            "estimated_savings": float(shopping_result[7]) if shopping_result[7] else None,
            "created_at": shopping_result[8].isoformat() if shopping_result[8] else None,
            "updated_at": shopping_result[9].isoformat() if shopping_result[9] else None,
            "items": []
        }
        
        # Get grocery items
        items_query = """
            SELECT id, grocery_instance_id, item_name, aldi_price, coles_price, 
                   woolworths_price, highlighted_store, created_at
            FROM public.grocery_items
            WHERE grocery_instance_id = %s
            ORDER BY created_at ASC
        """
        
        cur.execute(items_query, (shopping_id,))
        items_results = cur.fetchall()
        
        for item_result in items_results:
            item_data = {
                "id": str(item_result[0]),
                "grocery_instance_id": str(item_result[1]),
                "item_name": item_result[2],
                "aldi_price": float(item_result[3]) if item_result[3] else None,
                "coles_price": float(item_result[4]) if item_result[4] else None,
                "woolworths_price": float(item_result[5]) if item_result[5] else None,
                "highlighted_store": item_result[6],
                "created_at": item_result[7].isoformat() if item_result[7] else None
            }
            shopping_data["items"].append(item_data)
        
        cur.close()
        conn.close()
        
        return shopping_data
        
    except Exception as e:
        print(f"Error getting shopping with items: {e}")
        raise

def delete_shopping(shopping_id):
    """
    Delete a shopping instance and all its items (cascade)
    
    Args:
        shopping_id: UUID of the shopping instance
    
    Returns:
        bool: True if deleted successfully
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = "DELETE FROM public.shopping WHERE id = %s"
        cur.execute(query, (shopping_id,))
        
        deleted_count = cur.rowcount
        
        conn.commit()
        cur.close()
        conn.close()
        
        return deleted_count > 0
        
    except Exception as e:
        print(f"Error deleting shopping: {e}")
        raise