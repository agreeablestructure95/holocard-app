-- HoloCard Database Migration
-- PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture TEXT,
    google_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    public_id VARCHAR(255) UNIQUE NOT NULL,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_public_id ON cards(public_id);
CREATE INDEX IF NOT EXISTS idx_cards_metadata ON cards USING GIN(metadata);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - remove in production)
-- INSERT INTO users (id, email, name, picture) VALUES
-- (uuid_generate_v4(), 'demo@holocard.app', 'Demo User', 'https://via.placeholder.com/150');

-- Print completion message
DO $$
BEGIN
    RAISE NOTICE 'HoloCard database migration completed successfully!';
    RAISE NOTICE 'Tables created: users, cards';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Triggers created for automatic timestamp updates';
END $$;
