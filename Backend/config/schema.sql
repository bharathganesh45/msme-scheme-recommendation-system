

--Enable UUID extension 
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS schemes;
CREATE TABLE schemes (
 id SERIAL PRIMARY KEY,
 name TEXT NOT NULL UNIQUE,
 description TEXT,

 -- core filters (fast queries)
 business_category TEXT,
 max_investment INT,
 location TEXT,

 -- flexible rules
 rules JSONB,

 -- benefits
 benefits JSONB,

 -- beneficiary categories
 beneficiary_categories JSONB,

 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user saved schemes table
CREATE TABLE IF NOT EXISTS user_saved_schemes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheme_id INT NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, scheme_id)
);

