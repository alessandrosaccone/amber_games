-- init.sql

-- Tabella per i nomi predefiniti
CREATE TABLE predefined_names (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Tabella per i tipi di evento (con punti hardcoded)
CREATE TABLE event_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    points INTEGER NOT NULL
);

-- Tabella eventi
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    person_name VARCHAR(100) NOT NULL,
    event_type_id INTEGER REFERENCES event_types(id),
    declarer_name VARCHAR(100) NOT NULL,
    description TEXT,
    media_path VARCHAR(255),
    media_type VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, rejected
    confirmations INTEGER DEFAULT 0,
    rejections INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella verifiche
CREATE TABLE verifications (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    verifier_name VARCHAR(100),
    verification_type VARCHAR(20), -- confirm o reject
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, verifier_name)
);

-- Tabella punteggi
CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) UNIQUE NOT NULL,
    total_points INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserisci alcuni nomi predefiniti di esempio
INSERT INTO predefined_names (name) VALUES 
    ('Mario Rossi'),
    ('Luigi Bianchi'),
    ('Anna Verdi'),
    ('Marco Neri'),
    ('Giulia Gialli');

-- Inserisci tipi di evento con punti
INSERT INTO event_types (name, points) VALUES 
    ('Compleanno', 10),
    ('Laurea', 50),
    ('Matrimonio', 100),
    ('Promozione', 30),
    ('Vittoria Sportiva', 20);

-- Inizializza i punteggi per tutti i nomi
INSERT INTO scores (user_name, total_points)
SELECT name, 0 FROM predefined_names;