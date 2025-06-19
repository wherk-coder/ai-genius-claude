-- Migration: Add Odds model and update Game schema for sports data integration

-- First, let's add the new Odds table
CREATE TABLE "Odds" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "bookmaker" TEXT NOT NULL,
    "bookmakerTitle" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "point" DOUBLE PRECISION,
    "lastUpdate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Odds_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint for odds
CREATE UNIQUE INDEX "Odds_gameId_bookmaker_market_outcome_key" ON "Odds"("gameId", "bookmaker", "market", "outcome");

-- Add foreign key constraint for odds to games
ALTER TABLE "Odds" ADD CONSTRAINT "Odds_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update Game table structure
-- First, let's add the new columns
ALTER TABLE "Game" ADD COLUMN "league" TEXT;
ALTER TABLE "Game" ADD COLUMN "period" TEXT;
ALTER TABLE "Game" ADD COLUMN "timeRemaining" TEXT;

-- Rename startTime to gameTime
ALTER TABLE "Game" RENAME COLUMN "startTime" TO "gameTime";

-- Add new team name columns (we'll populate these from existing team relations)
ALTER TABLE "Game" ADD COLUMN "homeTeamName" TEXT;
ALTER TABLE "Game" ADD COLUMN "awayTeamName" TEXT;

-- Populate team names from existing relations
UPDATE "Game" 
SET "homeTeamName" = (SELECT "name" FROM "Team" WHERE "Team"."id" = "Game"."homeTeamId"),
    "awayTeamName" = (SELECT "name" FROM "Team" WHERE "Team"."id" = "Game"."awayTeamId");

-- Now drop the old foreign key constraints and team ID columns
ALTER TABLE "Game" DROP CONSTRAINT IF EXISTS "Game_homeTeamId_fkey";
ALTER TABLE "Game" DROP CONSTRAINT IF EXISTS "Game_awayTeamId_fkey";
ALTER TABLE "Game" DROP COLUMN IF EXISTS "homeTeamId";
ALTER TABLE "Game" DROP COLUMN IF EXISTS "awayTeamId";

-- Rename the team name columns to match schema
ALTER TABLE "Game" RENAME COLUMN "homeTeamName" TO "homeTeam";
ALTER TABLE "Game" RENAME COLUMN "awayTeamName" TO "awayTeam";

-- Make the team name columns required
ALTER TABLE "Game" ALTER COLUMN "homeTeam" SET NOT NULL;
ALTER TABLE "Game" ALTER COLUMN "awayTeam" SET NOT NULL;

-- Drop the old JSON columns that are no longer needed
ALTER TABLE "Game" DROP COLUMN IF EXISTS "odds";
ALTER TABLE "Game" DROP COLUMN IF EXISTS "props";

-- Update BetLeg table to add new fields for bet settlement
ALTER TABLE "BetLeg" ADD COLUMN "type" TEXT;
ALTER TABLE "BetLeg" ADD COLUMN "handicap" DOUBLE PRECISION;
ALTER TABLE "BetLeg" ADD COLUMN "total" DOUBLE PRECISION;
ALTER TABLE "BetLeg" ADD COLUMN "result" "BetStatus";

-- Remove the old status column from BetLeg (we'll use result instead)
ALTER TABLE "BetLeg" DROP COLUMN IF EXISTS "status";

-- Update Team table to remove the game relations
-- (This is handled by dropping the foreign keys above)

-- Create indexes for better performance
CREATE INDEX "Odds_gameId_idx" ON "Odds"("gameId");
CREATE INDEX "Odds_market_idx" ON "Odds"("market");
CREATE INDEX "Odds_bookmaker_idx" ON "Odds"("bookmaker");
CREATE INDEX "Odds_lastUpdate_idx" ON "Odds"("lastUpdate");
CREATE INDEX "Game_gameTime_idx" ON "Game"("gameTime");
CREATE INDEX "Game_status_idx" ON "Game"("status");
CREATE INDEX "Game_sport_idx" ON "Game"("sport");