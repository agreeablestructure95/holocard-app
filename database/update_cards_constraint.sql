-- Database Update Script
-- Add unique constraint to user_id in cards table

-- First, remove any duplicate cards (keep the most recent one for each user)
DELETE FROM cards 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM cards 
    ORDER BY user_id, created_at DESC
);

-- Add unique constraint to user_id
ALTER TABLE cards 
ADD CONSTRAINT cards_user_id_unique UNIQUE (user_id);
