# Shopping Optimiser Backend API

A FastAPI-based backend API for the Shopping Optimiser application, providing authentication and shopping data management with Supabase integration.

## Features

- **User Authentication**: Registration, login, logout, and token refresh via Supabase Auth
- **Shopping Management**: Create, update, and retrieve shopping instances
- **Grocery Items**: Add and manage grocery items with prices from multiple stores
- **Price Optimization**: Store optimization strategies (cheapest item, cheapest single store, cheapest within 10km)
- **Row Level Security**: Secure data access with Supabase RLS policies

## Tech Stack

- **Framework**: FastAPI 0.109.0
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Server**: Uvicorn
- **Language**: Python 3.11+

## Prerequisites

- Python 3.11 or higher
- Supabase account and project
- pip (Python package manager)

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd "Assignment 3 Project"
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   - Windows:
     ```bash
     .\venv\Scripts\Activate.ps1
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_database_connection_string
```

You can copy `.env.example` and fill in your Supabase credentials.

## Database Setup

1. **Run the database setup script** in your Supabase SQL editor:
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `setup_database.sql`
   - Execute the script

2. **Verify tables are created**:
   - `profiles` - User profile information
   - `shopping` - Shopping journey instances
   - `grocery_items` - Individual grocery items with prices

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |

### Shopping

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shopping` | Create a new shopping instance |
| GET | `/api/shopping` | Get user's shopping history |
| GET | `/api/shopping/{id}` | Get specific shopping instance |
| PUT | `/api/shopping/{id}` | Update shopping instance |
| DELETE | `/api/shopping/{id}` | Delete shopping instance |
| POST | `/api/shopping/{id}/items` | Add grocery items to shopping |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |
| GET | `/` | Welcome message |

## Running the Application

1. **Start the server**:
   ```bash
   uvicorn main:app --reload
   ```

2. **Access the API**:
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

3. **Stop the server**:
   Press `Ctrl+C` in the terminal

## Project Structure

```
├── main.py                 # FastAPI application and endpoints
├── auth.py                 # Authentication functions
├── shopping.py             # Shopping database operations
├── database.py             # Database initialization
├── requirements.txt        # Python dependencies
├── setup_database.sql      # Database schema and setup
├── .env                    # Environment variables (not in git)
├── .env.example            # Environment variables template
├── test_database_connection.py  # Database connection test
└── check_tables.py         # Table verification script
```

## Database Schema

### Profiles Table
- `id` (UUID) - Primary key, references auth.users
- `first_name` (TEXT) - User's first name
- `last_name` (TEXT) - User's last name
- `email_address` (TEXT) - User's email
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Shopping Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to profiles
- `weekly_budget` (DECIMAL) - User's weekly budget
- `shopping_duration` (INTEGER) - Duration in weeks
- `location` (TEXT) - User's location
- `optimiser_choice` (TEXT) - Optimization strategy
- `total_basket_cost` (DECIMAL) - Total basket cost
- `estimated_savings` (DECIMAL) - Estimated savings
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Grocery Items Table
- `id` (UUID) - Primary key
- `grocery_instance_id` (UUID) - Foreign key to shopping
- `item_name` (TEXT) - Name of the grocery item
- `aldi_price` (DECIMAL) - Price at Aldi
- `coles_price` (DECIMAL) - Price at Coles
- `woolworths_price` (DECIMAL) - Price at Woolworths
- `highlighted_store` (TEXT) - Best price store
- `created_at` (TIMESTAMP) - Creation timestamp

## Security

- **Row Level Security (RLS)**: Enabled on all tables
- **User Isolation**: Users can only access their own data
- **Token-based Authentication**: JWT tokens via Supabase Auth
- **CORS**: Configured for localhost:5173 (Vite dev server)

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Testing Database Connection
```bash
python test_database_connection.py
```

### Checking Tables
```bash
python check_tables.py
```

## License

This project is for educational purposes.