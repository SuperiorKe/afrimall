-- =====================================================
-- MISSING PAYLOAD TABLES FOR AUTHENTICATION
-- These tables are required by Payload CMS for user sessions
-- =====================================================

-- Users sessions table (required by Payload for authentication)
CREATE TABLE users_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    _parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    _order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    data JSONB
);

-- Customers sessions table (required by Payload for customer authentication)
CREATE TABLE customers_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    _parent_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    _order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    data JSONB
);

-- Payload preferences table (for admin UI preferences)
CREATE TABLE payload_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL,
    value JSONB,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_collection VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_sessions_parent_id ON users_sessions(_parent_id);
CREATE INDEX idx_users_sessions_expires_at ON users_sessions(expires_at);
CREATE INDEX idx_customers_sessions_parent_id ON customers_sessions(_parent_id);
CREATE INDEX idx_customers_sessions_expires_at ON customers_sessions(expires_at);
CREATE INDEX idx_payload_preferences_key ON payload_preferences(key);
CREATE INDEX idx_payload_preferences_user_id ON payload_preferences(user_id);

-- Clean up expired sessions (optional trigger)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM users_sessions WHERE expires_at < NOW();
    DELETE FROM customers_sessions WHERE expires_at < NOW();
END;
$$ language 'plpgsql';
