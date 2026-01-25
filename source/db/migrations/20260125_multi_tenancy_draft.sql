-- Draft Migration: Implement Multi-tenancy

-- 1. Create Organizations Table
CREATE TABLE organizations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    settings TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Teams Table
CREATE TABLE teams (
    id VARCHAR(36) PRIMARY KEY,
    org_id VARCHAR(36) NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    permissions TEXT, -- JSON permissions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Update Accounts Table
ALTER TABLE accounts ADD COLUMN org_id VARCHAR(36) REFERENCES organizations(id);
ALTER TABLE accounts ADD COLUMN role VARCHAR(50) DEFAULT 'member';

-- 4. Update Robots Table
ALTER TABLE robots ADD COLUMN team_id VARCHAR(36) REFERENCES teams(id);

-- Optional: Initial Migration Strategy
-- INSERT INTO organizations (id, name) VALUES ('DEFAULT_ORG', 'Default Organization');
-- UPDATE accounts SET org_id = 'DEFAULT_ORG';
