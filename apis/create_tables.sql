-- Script SQL pour créer les tables nécessaires de la base de données PostgreSQL
-- Base de données: football
-- Plateforme: Mazelet Blasa - Football Match Organizer

-- ============================================
-- Table: users
-- Description: Stocke les informations des utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    image_url VARCHAR(500),
    age INTEGER,
    CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- Table: teams
-- Description: Stocke les informations des équipes
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    captain_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_teams_captain FOREIGN KEY (captain_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_teams_id ON teams(id);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);

-- ============================================
-- Table: team_members
-- Description: Stocke les membres d'une équipe
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams(id),
    CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_id ON team_members(id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- ============================================
-- Table: matches
-- Description: Stocke les informations des matchs
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type_match VARCHAR(50),
    city VARCHAR(255),
    stadium VARCHAR(255),
    date VARCHAR(50),
    start_time VARCHAR(50),
    end_time VARCHAR(50),
    nb_players INTEGER,
    price_per_player DECIMAL(10, 2),
    organizer_phone VARCHAR(50),
    min_age INTEGER DEFAULT 0,
    max_age INTEGER DEFAULT 100,
    organizer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_team_match BOOLEAN DEFAULT FALSE,
    team_a_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    team_b_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    CONSTRAINT fk_matches_organizer FOREIGN KEY (organizer_id) REFERENCES users(id),
    CONSTRAINT fk_matches_team_a FOREIGN KEY (team_a_id) REFERENCES teams(id),
    CONSTRAINT fk_matches_team_b FOREIGN KEY (team_b_id) REFERENCES teams(id)
);

CREATE INDEX IF NOT EXISTS idx_matches_id ON matches(id);
CREATE INDEX IF NOT EXISTS idx_matches_title ON matches(title);
CREATE INDEX IF NOT EXISTS idx_matches_organizer_id ON matches(organizer_id);

-- ============================================
-- Table: match_participants
-- Description: Table d'association Many-to-Many entre users et matches
-- ============================================
CREATE TABLE IF NOT EXISTS match_participants (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, match_id),
    CONSTRAINT fk_match_participants_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_match_participants_match FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE INDEX IF NOT EXISTS idx_match_participants_user_id ON match_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_match_id ON match_participants(match_id);

-- ============================================
-- Table: feedbacks
-- Description: Stocke les feedbacks des utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    match_id INTEGER REFERENCES matches(id) ON DELETE SET NULL,
    CONSTRAINT fk_feedbacks_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_feedbacks_match FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_id ON feedbacks(id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_match_id ON feedbacks(match_id);

-- ============================================
-- Fin du script
-- ============================================
