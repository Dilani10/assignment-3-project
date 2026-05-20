-- Shopping Optimiser Database Setup
-- This file contains all SQL queries for creating tables and triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: profiles
-- Stores user profile information, linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: shopping
-- Stores each shopping journey instance
CREATE TABLE IF NOT EXISTS public.shopping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    weekly_budget DECIMAL(10,2),
    shopping_duration INTEGER,
    location TEXT,
    optimiser_choice TEXT CHECK (optimiser_choice IN ('cheapest_item', 'cheapest_single_store', 'cheapest_within_10km')),
    total_basket_cost DECIMAL(10,2),
    estimated_savings DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: grocery_items
-- Stores individual grocery items for each shopping instance
CREATE TABLE IF NOT EXISTS public.grocery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grocery_instance_id UUID NOT NULL REFERENCES public.shopping(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    aldi_price DECIMAL(10,2),
    coles_price DECIMAL(10,2),
    woolworths_price DECIMAL(10,2),
    highlighted_store TEXT CHECK (highlighted_store IN ('aldi', 'coles', 'woolworths')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_shopping_user_id ON public.shopping(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_items_instance_id ON public.grocery_items(grocery_instance_id);

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at on shopping table
DROP TRIGGER IF EXISTS update_shopping_updated_at ON public.shopping;
CREATE TRIGGER update_shopping_updated_at
    BEFORE UPDATE ON public.shopping
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function: Handle new user signup
-- Automatically creates a profile when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email_address)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.email, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for shopping table
CREATE POLICY "Users can view own shopping instances"
    ON public.shopping FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping instances"
    ON public.shopping FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping instances"
    ON public.shopping FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping instances"
    ON public.shopping FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for grocery_items table
CREATE POLICY "Users can view own grocery items"
    ON public.grocery_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.shopping
            WHERE shopping.id = grocery_items.grocery_instance_id
            AND shopping.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own grocery items"
    ON public.grocery_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.shopping
            WHERE shopping.id = grocery_items.grocery_instance_id
            AND shopping.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own grocery items"
    ON public.grocery_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.shopping
            WHERE shopping.id = grocery_items.grocery_instance_id
            AND shopping.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own grocery items"
    ON public.grocery_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.shopping
            WHERE shopping.id = grocery_items.grocery_instance_id
            AND shopping.user_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.shopping TO anon, authenticated;
GRANT ALL ON public.grocery_items TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;